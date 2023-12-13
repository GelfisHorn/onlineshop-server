import express from 'express'
import { getOrders, create, success, cancel } from '../controllers/orderController.js'
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router()

// Authentication, registration and confirmation of Users
router.route('/')
    .get(checkAuth, getOrders)
    .post(create);
router.route('/:id')
    .patch(success)
    .delete(cancel);

export default router;