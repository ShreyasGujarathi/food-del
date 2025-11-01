import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import path from 'path';
import { connectDB } from '../config/db.js';
import foodModel from '../models/foodModel.js';
import categoryModel from '../models/categoryModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const migrateCategories = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Get all unique categories from food items
    const foodCategories = await foodModel.distinct("category");
    console.log(`📊 Found ${foodCategories.length} categories in food items\n`);

    let created = 0;
    let skipped = 0;

    for (const categoryName of foodCategories) {
      if (!categoryName) continue;

      // Check if category already exists
      const existingCategory = await categoryModel.findOne({ name: categoryName });
      if (existingCategory) {
        console.log(`⏭️  Skipping "${categoryName}" - already exists`);
        skipped++;
      } else {
        const newCategory = new categoryModel({
          name: categoryName,
          image: null
        });
        await newCategory.save();
        console.log(`✅ Created category: "${categoryName}"`);
        created++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`\n✅ Migration complete!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

migrateCategories();

