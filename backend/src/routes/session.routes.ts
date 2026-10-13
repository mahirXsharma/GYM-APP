import { Router } from 'express'
import { createSession, getLiveSessions, getSessions, oneLiveSession } from '../controllers/session.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createBooking } from '../controllers/booking.controller.js';

const router = Router();
router.use(authMiddleware)
router.post('/', createSession);
router.get('/', getSessions)
router.post('/:id', createBooking);
router.get('/live', getLiveSessions)
router.get('/live/:id', oneLiveSession)

export default router;