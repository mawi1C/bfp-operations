import { Router } from 'express'
import { uploadFile, getFiles, deleteFile, upload } from '../controllers/files.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)
router.post('/upload', upload.single('file'), uploadFile)
router.get('/', getFiles)
router.delete('/:id', deleteFile)

export default router