import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file only if it exists (for local development)
// In production (Render), environment variables are set directly in the platform
const envPath = path.join(__dirname, '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Loaded .env file for local development');
} else {
  // In production, rely on environment variables set by the platform
  dotenv.config(); // This will use environment variables already set by Render
}

// Validate required environment variables
const requiredEnvVars = ['MONGO_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('💡 For local development: Create a .env file in the backend directory');
  console.error('💡 For Render deployment: Set environment variables in Render dashboard');
  console.error('   Go to: Your Service → Environment → Add Environment Variable');
  process.exit(1);
}
import express  from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import categoryRouter from "./routes/categoryRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000;


// middlewares
app.use(express.json())
app.use(cors())

// db connection
connectDB()

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/api/category", categoryRouter)
app.use("/images",express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order",orderRouter)

app.get("/", (req, res) => {
    res.send("API Working")
  });

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))
