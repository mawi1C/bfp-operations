import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import supabase from '../supabase.js'

export const register = async (req, res) => {
  try {
    const { full_name, email, password, role, region, station } = req.body

    // Check if email exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ full_name, email, password_hash, role, region, station }])
      .select()
      .single()

    if (error) throw error

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, region: user.region },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        region: user.region,
        station: user.station,
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, region: user.region },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        region: user.region,
        station: user.station,
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, region, station, created_at')
      .eq('id', req.user.id)
      .single()

    if (error) throw error
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}