import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

//create token
const createToken = (id, role) => {
    return jwt.sign({id, role}, process.env.JWT_SECRET);
}

//login user
const loginUser = async (req,res) => {
    const {email, password} = req.body;
    try{
        // Normalize email to lowercase for case-insensitive search
        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({email: normalizedEmail})

        if(!user){
            return res.json({success:false,message: "User does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.json({success:false,message: "Invalid credentials"})
        }

        const token = createToken(user._id, user.role)
        res.json({success:true,token, role: user.role})
    } catch (error) {
        console.log("Login error:", error);
        res.json({success:false,message:"Error"})
    }
}

//register user
const registerUser = async (req,res) => {
    const {name, email, password} = req.body;
    try{
        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();
        
        //check if user already exists
        const exists = await userModel.findOne({email: normalizedEmail})
        if(exists){
            return res.json({success:false,message: "User already exists"})
        }

        // validating email format & strong password
        if(!validator.isEmail(normalizedEmail)){
            return res.json({success:false,message: "Please enter a valid email"})
        }
        if(password.length<8){
            return res.json({success:false,message: "Please enter a strong password"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({name, email: normalizedEmail, password: hashedPassword})
        const user = await newUser.save()
        const token = createToken(user._id, user.role)
        res.json({success:true,token, role: user.role})

    } catch(error){
        console.log("Registration error:", error);
        res.json({success:false,message:"Error"})
    }
}

// get user details
const getUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select('-password');
        if (!user) {
            return res.json({success:false, message: "User not found"})
        }
        res.json({success:true, data: user})
    } catch (error) {
        console.log("Get user error:", error);
        res.json({success:false, message:"Error"})
    }
}

// Create or update user to admin role (for initial setup)
const createAdmin = async (req, res) => {
    const {email, password, name} = req.body;
    try {
        const normalizedEmail = email.toLowerCase().trim();
        
        // Validate email format
        if(!validator.isEmail(normalizedEmail)){
            return res.json({success:false, message: "Please enter a valid email"})
        }
        
        if(password && password.length<8){
            return res.json({success:false, message: "Please enter a strong password (min 8 characters)"})
        }

        let user = await userModel.findOne({email: normalizedEmail});
        
        if(user){
            // Update existing user to admin
            if(password){
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }
            user.role = 'admin';
            await user.save();
            return res.json({success:true, message: "User updated to admin successfully"})
        } else {
            // Create new admin user
            if(!password || !name){
                return res.json({success:false, message: "Name and password are required to create new admin"})
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newAdmin = new userModel({
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role: 'admin'
            });
            await newAdmin.save();
            return res.json({success:true, message: "Admin user created successfully"})
        }
    } catch (error) {
        console.log("Create admin error:", error);
        res.json({success:false, message:"Error creating admin"})
    }
}

export {loginUser, registerUser, getUser, createAdmin}