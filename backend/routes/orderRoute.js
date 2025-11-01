import express from 'express';
import authMiddleware, { restrictTo } from '../middleware/auth.js';
import { listOrders, placeOrder,updateStatus,userOrders, verifyOrder, placeOrderCod } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.get("/list",authMiddleware, restrictTo('admin'),listOrders);
orderRouter.post("/userorders",authMiddleware,userOrders);
orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/status",authMiddleware, restrictTo('admin'),updateStatus);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/placecod",authMiddleware,placeOrderCod);

export default orderRouter;