import {Router} from 'express'
import {createSession} from '../controllers/session.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, createSession);


export default router;