import categoryModel from "../models/categoryModel.js";
import foodModel from "../models/foodModel.js";
import fs from 'fs';

// Get all categories with images
const getCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({}).sort({ name: 1 });
        res.json({ success: true, data: categories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching categories" });
    }
}

// Add new category with optional image
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || !name.trim()) {
            return res.json({ success: false, message: "Category name is required" });
        }

        // Check if category already exists
        const existingCategory = await categoryModel.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.json({ success: false, message: "Category already exists" });
        }

        const categoryData = {
            name: name.trim(),
        };

        // Add image if uploaded
        if (req.file) {
            categoryData.image = req.file.filename;
        }

        const category = new categoryModel(categoryData);
        await category.save();

        res.json({ success: true, message: "Category added successfully", data: category });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding category" });
    }
}

// Update category image
const updateCategoryImage = async (req, res) => {
    try {
        const { categoryId } = req.body;

        if (!req.file) {
            return res.json({ success: false, message: "Image is required" });
        }

        const category = await categoryModel.findById(categoryId);
        if (!category) {
            // Delete uploaded file if category doesn't exist
            fs.unlink(`uploads/${req.file.filename}`, () => {});
            return res.json({ success: false, message: "Category not found" });
        }

        // Delete old image if exists
        if (category.image) {
            fs.unlink(`uploads/${category.image}`, () => {});
        }

        category.image = req.file.filename;
        await category.save();

        res.json({ success: true, message: "Category image updated", data: category });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating category image" });
    }
}

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;

        if (!categoryId) {
            return res.json({ success: false, message: "Category ID is required" });
        }

        const category = await categoryModel.findById(categoryId);
        if (!category) {
            return res.json({ success: false, message: "Category not found" });
        }

        // Check if any food items use this category
        const foodsWithCategory = await foodModel.countDocuments({ category: category.name });
        if (foodsWithCategory > 0) {
            return res.json({ 
                success: false, 
                message: `Cannot delete category. ${foodsWithCategory} food item(s) are using this category. Please reassign or delete those items first.` 
            });
        }

        // Delete category image if exists
        if (category.image) {
            fs.unlink(`uploads/${category.image}`, () => {});
        }

        await categoryModel.findByIdAndDelete(categoryId);
        res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting category" });
    }
}

export { getCategories, addCategory, updateCategoryImage, deleteCategory };

