import { Router } from 'express'
import {
  getIncidents,
  getIncidentStats,
  addIncident,
  updateIncident,
  deleteIncident,
} from '../controllers/incidents.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)
router.get('/stats', getIncidentStats)
router.get('/', getIncidents)
router.post('/', addIncident)
router.put('/:id', updateIncident)
router.delete('/:id', deleteIncident)

export default router