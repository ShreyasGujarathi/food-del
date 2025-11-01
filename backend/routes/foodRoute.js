import express from 'express';
import { addFood, listFood, removeFood, getCategories } from '../controllers/foodController.js';
import multer from 'multer';
import authMiddleware, { restrictTo } from '../middleware/auth.js';

const foodRouter = express.Router();

//Image Storage Engine (Saving Image to uploads folder & rename it)

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null,`${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage})

foodRouter.get("/list",listFood);
foodRouter.get("/categories",getCategories);
foodRouter.post("/add",authMiddleware, restrictTo('admin'), upload.single('image'),addFood);
foodRouter.post("/remove",authMiddleware, restrictTo('admin'),removeFood);

export default foodRouter;