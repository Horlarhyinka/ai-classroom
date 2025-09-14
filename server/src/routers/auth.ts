import { Router } from 'express';
import { authCallback, getSession, googleAuth, logout } from '../controllers/auth';

const router = Router()


router.get('/google', googleAuth)
router.get('/google/callback', authCallback)
router.get('/session', getSession)
router.get('/logout', logout)

export default router