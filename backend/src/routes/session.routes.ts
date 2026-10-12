import { Router } from 'express'
import { createSession, getSessions } from '../controllers/session.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createBooking } from '../controllers/booking.controller.js';

const router = Router();
router.use(authMiddleware)
router.post('/', createSession);
router.get('/', getSessions)
router.post('/:id', createBooking);

export default router;