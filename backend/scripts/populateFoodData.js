import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import foodModel from '../models/foodModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const categories = ["salad", "Main Course", "Dessert", "sandwitch"];

// Food names mapping based on food image numbers
const foodNamesMap = {
  1: "Greek salad",
  2: "Veg salad",
  3: "Clover Salad",
  4: "Chicken Salad",
  5: "Lasagna Rolls",
  6: "Peri Peri Rolls",
  7: "Chicken Rolls",
  8: "Veg Rolls",
  9: "Ripple Ice Cream",
  10: "Fruit Ice Cream",
  11: "Jar Ice Cream",
  12: "Vanilla Ice Cream",
  13: "Chicken Sandwich",
  14: "Vegan Sandwich",
  15: "Grilled Sandwich",
  16: "Bread Sandwich",
  17: "Cup Cake",
  18: "Vegan Cake",
  19: "Butterscotch Cake",
  20: "Sliced Cake",
  21: "Garlic Mushroom",
  22: "Fried Cauliflower",
  23: "Mix Veg Pulao",
  24: "Rice Zucchini",
  25: "Cheese Pasta",
  26: "Tomato Pasta",
  27: "Creamy Pasta",
  28: "Chicken Pasta",
  29: "Buttter Noodles",
  30: "Veg Noodles",
  31: "Somen Noodles",
  32: "Cooked Noodles"
};

// Category mapping based on original categories
const categoryMap = {
  1: "salad", 2: "salad", 3: "salad", 4: "salad",
  5: "Main Course", 6: "Main Course", 7: "Main Course", 8: "Main Course",
  9: "Dessert", 10: "Dessert", 11: "Dessert", 12: "Dessert",
  13: "sandwitch", 14: "sandwitch", 15: "sandwitch", 16: "sandwitch",
  17: "Dessert", 18: "Dessert", 19: "Dessert", 20: "Dessert",
  21: "salad", 22: "salad", 23: "Main Course", 24: "Main Course",
  25: "Main Course", 26: "Main Course", 27: "Main Course", 28: "Main Course",
  29: "Main Course", 30: "Main Course", 31: "Main Course", 32: "Main Course"
};

// Function to get category for a food number
const getCategoryForFood = (foodNumber) => {
  return categoryMap[foodNumber] || categories[Math.floor(Math.random() * categories.length)];
};

// Function to generate a random price between 100 and 500
const getRandomPrice = () => {
  return Math.floor(Math.random() * (500 - 100 + 1)) + 100;
};

// Function to get food number from filename (e.g., "food_1.png" -> 1)
const getFoodNumberFromFilename = (filename) => {
  const match = filename.match(/food[_-]?(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

// Function to get name from filename
const getNameFromFilename = (filename) => {
  const foodNumber = getFoodNumberFromFilename(filename);
  if (foodNumber && foodNamesMap[foodNumber]) {
    return foodNamesMap[foodNumber];
  }
  // Fallback: remove extension and convert to title case
  const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg)$/i, '');
  const formatted = nameWithoutExt
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return formatted;
};

// Function to get category from filename
const getCategoryFromFilename = (filename) => {
  const foodNumber = getFoodNumberFromFilename(filename);
  if (foodNumber && categoryMap[foodNumber]) {
    return categoryMap[foodNumber];
  }
  return categories[Math.floor(Math.random() * categories.length)];
};

// Function to copy file from source to destination
const copyFile = (src, dest) => {
  try {
    fs.copyFileSync(src, dest);
    return true;
  } catch (error) {
    console.error(`Error copying file ${src}:`, error.message);
    return false;
  }
};

const populateFoodData = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Paths
    const assetsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'assets');
    const uploadsPath = path.join(__dirname, '..', 'uploads');

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('✅ Created uploads directory');
    }

    // Read all files from assets directory
    const files = fs.readdirSync(assetsPath);
    
    // Filter food images (food_*.png or any image files that match food pattern)
    const foodImages = files.filter(file => {
      const lowerFile = file.toLowerCase();
      return (
        (lowerFile.startsWith('food_') && (lowerFile.endsWith('.png') || lowerFile.endsWith('.jpg') || lowerFile.endsWith('.jpeg'))) ||
        // Also match other common food image patterns
        (lowerFile.match(/^(pizza|burger|pasta|salad|sandwich|dessert|cake|soup|rice|noodles).*\.(png|jpg|jpeg)$/i))
      );
    });

    if (foodImages.length === 0) {
      console.log('❌ No food images found in assets folder');
      return;
    }

    console.log(`📸 Found ${foodImages.length} food image(s)`);

    const foodsToInsert = [];
    const foodsToUpdate = [];
    const skipped = [];

    for (const imageFile of foodImages) {
      const sourcePath = path.join(assetsPath, imageFile);
      const destPath = path.join(uploadsPath, imageFile);

      // Check if food already exists in database
      const existingFood = await foodModel.findOne({ image: imageFile });
      const expectedName = getNameFromFilename(imageFile);
      const expectedCategory = getCategoryFromFilename(imageFile);
      
      if (existingFood) {
        // Check if name or category needs updating (e.g., "Food 1" -> proper name)
        if (existingFood.name !== expectedName || existingFood.category !== expectedCategory) {
          console.log(`🔄 Updating ${imageFile}: "${existingFood.name}" -> "${expectedName}"`);
          foodsToUpdate.push({
            id: existingFood._id,
            update: {
              name: expectedName,
              category: expectedCategory
            }
          });
        } else {
          console.log(`⏭️  Skipping ${imageFile} - already exists with correct data`);
          skipped.push(imageFile);
        }
        // Ensure image file exists in uploads folder
        if (!fs.existsSync(destPath)) {
          if (!copyFile(sourcePath, destPath)) {
            console.log(`❌ Failed to copy ${imageFile}`);
          } else {
            console.log(`📁 Copied missing image: ${imageFile}`);
          }
        }
        continue;
      }

      // Verify source file exists
      if (!fs.existsSync(sourcePath)) {
        console.log(`❌ Source file not found: ${sourcePath}`);
        continue;
      }

      // Copy image to uploads folder
      if (!copyFile(sourcePath, destPath)) {
        console.log(`❌ Failed to copy ${imageFile}`);
        continue;
      }

      // Verify the copy was successful
      if (!fs.existsSync(destPath)) {
        console.log(`❌ Failed to verify copied file: ${destPath}`);
        continue;
      }

      // Generate food data
      const foodData = {
        name: expectedName,
        description: 'Delicious and freshly prepared.',
        price: getRandomPrice(),
        image: imageFile,
        category: expectedCategory
      };

      foodsToInsert.push(foodData);
      console.log(`✅ Prepared: ${foodData.name} - ${foodData.category} - ${foodData.price}`);
    }

    // Update existing foods with correct names and categories
    if (foodsToUpdate.length > 0) {
      console.log(`\n🔄 Updating ${foodsToUpdate.length} food item(s)...`);
      for (const { id, update } of foodsToUpdate) {
        await foodModel.findByIdAndUpdate(id, update);
      }
      console.log(`✅ Successfully updated ${foodsToUpdate.length} food item(s)!`);
    }

    if (foodsToInsert.length === 0 && foodsToUpdate.length === 0) {
      console.log('\n⚠️  No new foods to insert or update');
      if (skipped.length > 0) {
        console.log(`   Skipped ${skipped.length} existing item(s) with correct data`);
      }
      process.exit(0);
    }

    // Insert all new foods into database
    let insertResult = [];
    if (foodsToInsert.length > 0) {
      console.log(`\n📝 Inserting ${foodsToInsert.length} food item(s) into database...`);
      insertResult = await foodModel.insertMany(foodsToInsert);
      console.log(`✅ Successfully inserted ${insertResult.length} food item(s)!`);
    }

    // Display summary
    console.log('\n📊 Summary:');
    if (insertResult.length > 0) {
      console.log(`   - Inserted: ${insertResult.length}`);
    }
    if (foodsToUpdate.length > 0) {
      console.log(`   - Updated: ${foodsToUpdate.length}`);
    }
    if (skipped.length > 0) {
      console.log(`   - Skipped (already exists): ${skipped.length}`);
    }

    // Show categories distribution
    const categoryCount = {};
    [...insertResult, ...foodsToUpdate.map(f => ({ category: f.update.category }))].forEach(food => {
      categoryCount[food.category] = (categoryCount[food.category] || 0) + 1;
    });
    if (Object.keys(categoryCount).length > 0) {
      console.log('\n📈 Category distribution:');
      Object.entries(categoryCount).forEach(([cat, count]) => {
        console.log(`   - ${cat}: ${count}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating food data:', error);
    process.exit(1);
  }
};

// Run the script
populateFoodData();

