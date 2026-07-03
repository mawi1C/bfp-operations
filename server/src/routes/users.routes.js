import { Router } from 'express'
import { getUsers, updateUser, deleteUser } from '../controllers/users.controller.js'
import { protect, restrictTo } from '../middleware/auth.middleware.js'
import supabase from '../supabase.js'

const router = Router()

router.use(protect)
router.get('/', restrictTo('super_admin'), getUsers)
router.put('/:id', restrictTo('super_admin'), updateUser)
router.delete('/:id', restrictTo('super_admin'), deleteUser)

router.get('/audit-logs', restrictTo('super_admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, users(full_name)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    res.json({ logs: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router