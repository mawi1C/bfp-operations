import multer from 'multer'
import cloudinary from '../cloudinary.js'
import supabase from '../supabase.js'
import { Readable } from 'stream'
import { parseFile } from '../parsers/incidentParser.js'

const storage = multer.memoryStorage()
export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ]
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('File type not allowed'))
  },
})

const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'bfp-incidents',
        resource_type: 'raw',
        public_id: `${Date.now()}_${filename}`,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' })

    const { originalname, mimetype, size, buffer } = req.file

    // Upload to Cloudinary
    const cloudResult = await uploadToCloudinary(buffer, originalname)

    const ext = originalname.split('.').pop().toLowerCase()
    let fileType = 'other'
    if (ext === 'pdf') fileType = 'pdf'
    else if (['xlsx', 'xls'].includes(ext)) fileType = 'excel'
    else if (ext === 'csv') fileType = 'csv'
    else if (['docx', 'doc'].includes(ext)) fileType = 'docx'

    // Save file record to Supabase
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert([{
        uploaded_by: req.user.id,
        original_filename: originalname,
        cloudinary_url: cloudResult.secure_url,
        file_type: fileType,
        file_size_mb: parseFloat((size / (1024 * 1024)).toFixed(2)),
        status: 'processed',
      }])
      .select()
      .single()

    if (fileError) throw fileError

    // Parse incident data from file.
    // parseFile now returns { incidents, summary }:
    //  - incidents: real per-incident rows -> safe to insert into `incidents`
    //  - summary:   monthly/city roll-up rows (from recap-style reports) ->
    //               NOT individual incidents. Inserting these as if they
    //               were incidents is what previously corrupted the
    //               dashboard totals (double/triple counting the same
    //               events at different levels of aggregation). We keep
    //               them out of the incidents table and just record how
    //               many we found, for traceability / manual reconciliation.
    let parsedCount = 0
    let summaryCount = 0
    try {
      const { incidents, summary } = await parseFile(buffer, fileType)
      summaryCount = summary.length

      if (incidents.length > 0) {
        const toInsert = incidents.map(inc => ({
          ...inc,
          uploaded_by: req.user.id,
          file_id: fileRecord.id,
          region: inc.region || req.user.region,
        }))
        const { error: incError } = await supabase
          .from('incidents')
          .insert(toInsert)
        if (!incError) parsedCount = incidents.length
      }
    } catch (parseErr) {
      console.error('Parse error:', parseErr.message)
    }

    // Audit log
    await supabase.from('audit_logs').insert([{
      user_id: req.user.id,
      action: 'FILE_UPLOAD',
      target_table: 'files',
      target_id: fileRecord.id,
      metadata: {
        filename: originalname,
        file_type: fileType,
        incidents_extracted: parsedCount,
        summary_rows_found: summaryCount,
      },
    }])

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileRecord,
      incidents_extracted: parsedCount,
      summary_rows_found: summaryCount,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getFiles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*, users(full_name)')
      .order('uploaded_at', { ascending: false })
    if (error) throw error
    res.json({ files: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError

    const publicId = file.cloudinary_url.split('/').pop().split('.')[0]
    await cloudinary.uploader.destroy(`bfp-incidents/${publicId}`, { resource_type: 'raw' })

    const { error } = await supabase.from('files').delete().eq('id', id)
    if (error) throw error

    res.json({ message: 'File deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}