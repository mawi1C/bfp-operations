import supabase from '../supabase.js'
import bcrypt from 'bcryptjs'

export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, region, station, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ users: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { full_name, email, role, region, station, password } = req.body
    const updates = { full_name, email, role, region, station }
    if (password) updates.password_hash = await bcrypt.hash(password, 12)
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, full_name, email, role, region, station, created_at')
      .single()
    if (error) throw error
    res.json({ user: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error
    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}