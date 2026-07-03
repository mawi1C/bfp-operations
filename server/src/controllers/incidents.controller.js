import supabase from '../supabase.js'

export const getIncidents = async (req, res) => {
  try {
    const { region, city, province, cause, status, from, to, search } = req.query

    let query = supabase
      .from('incidents')
      .select('*, files(original_filename)', { count: 'exact' })
      .order('incident_datetime', { ascending: false })

    if (req.user.role === 'regional_officer') query = query.eq('region', req.user.region)
    if (req.user.role === 'station_personnel') query = query.eq('station_responded', req.user.station)
    if (region)   query = query.eq('region', region)
    if (city)     query = query.eq('city', city)
    if (province) query = query.eq('province', province)
    if (cause)    query = query.eq('cause_of_fire', cause)
    if (status)   query = query.eq('case_status', status)
    if (from)     query = query.gte('incident_datetime', from)
    if (to)       query = query.lte('incident_datetime', to)
    if (search)   query = query.or(
      `city.ilike.%${search}%,barangay.ilike.%${search}%,cause_of_fire.ilike.%${search}%,incident_number.ilike.%${search}%`
    )

    const { data, error, count } = await query
    if (error) throw error
    res.json({ incidents: data, total: count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getIncidentStats = async (req, res) => {
  try {
    let query = supabase.from('incidents').select(
      'id, estimated_damage, fatalities, injuries, rescued, response_time_min, case_status, incident_datetime, cause_of_fire, city, barangay, province, region, structure_type'
    )

    if (req.user.role === 'regional_officer') query = query.eq('region', req.user.region)
    if (req.user.role === 'station_personnel') query = query.eq('station_responded', req.user.station)

    const { data, error } = await query
    if (error) throw error

    const now = new Date()
    const thisMonth = data.filter(d => {
      const date = new Date(d.incident_datetime)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })

    const totalDamage = data.reduce((a, b) => a + (b.estimated_damage || 0), 0)
    const totalFatalities = data.reduce((a, b) => a + (b.fatalities || 0), 0)
    const totalInjuries = data.reduce((a, b) => a + (b.injuries || 0), 0)
    const avgResponse = data.filter(d => d.response_time_min).reduce((a, b, _, arr) =>
      a + b.response_time_min / arr.length, 0)

    // Monthly breakdown for chart
    const monthly = {}
    data.forEach(d => {
      if (!d.incident_datetime) return
      const key = new Date(d.incident_datetime).toLocaleString('en-PH', { month: 'short', year: 'numeric' })
      monthly[key] = (monthly[key] || 0) + 1
    })

    // Top causes
    const causes = {}
    data.forEach(d => {
      if (!d.cause_of_fire) return
      causes[d.cause_of_fire] = (causes[d.cause_of_fire] || 0) + 1
    })
    const topCauses = Object.entries(causes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cause, count]) => ({ cause, count }))

    res.json({
      total: data.length,
      thisMonth: thisMonth.length,
      totalDamage,
      totalFatalities,
      totalInjuries,
      avgResponse: parseFloat(avgResponse.toFixed(1)),
      monthly,
      topCauses,
      recent: data.slice(0, 5),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const addIncident = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .insert([{ ...req.body, uploaded_by: req.user.id }])
      .select()
      .single()
    if (error) throw error

    await supabase.from('audit_logs').insert([{
      user_id: req.user.id,
      action: 'INCIDENT_ADD',
      target_table: 'incidents',
      target_id: data.id,
    }])

    res.status(201).json({ incident: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateIncident = async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('incidents')
      .update(req.body)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    await supabase.from('audit_logs').insert([{
      user_id: req.user.id,
      action: 'INCIDENT_EDIT',
      target_table: 'incidents',
      target_id: id,
    }])

    res.json({ incident: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from('incidents').delete().eq('id', id)
    if (error) throw error

    await supabase.from('audit_logs').insert([{
      user_id: req.user.id,
      action: 'INCIDENT_DELETE',
      target_table: 'incidents',
      target_id: id,
    }])

    res.json({ message: 'Incident deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}