import express from 'express';
import { getCategories, addCategory, updateCategoryImage, deleteCategory } from '../controllers/categoryController.js';
import multer from 'multer';
import authMiddleware, { restrictTo } from '../middleware/auth.js';

const categoryRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Get all categories (public)
categoryRouter.get("/", getCategories);

// Add category with optional image (admin only)
categoryRouter.post("/add", authMiddleware, restrictTo('admin'), upload.single('image'), addCategory);

// Update category image (admin only)
categoryRouter.post("/update-image", authMiddleware, restrictTo('admin'), upload.single('image'), updateCategoryImage);

// Delete category (admin only)
categoryRouter.post("/delete", authMiddleware, restrictTo('admin'), deleteCategory);

export default categoryRouter;

