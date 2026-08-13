import { Profile } from "../models/profile.model.js";
import User from "../models/user.model.js";
import ConnectionRequest from "../models/connections.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { request } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");



const convertUserDataTOPDF = async (userData) => {
    const docs = new PDFDocument();

const fileName = crypto.randomBytes(16).toString("hex") + ".pdf";
    const outputPath = path.join(uploadsDir, fileName);
    const stream = fs.createWriteStream(outputPath);
    docs.pipe(stream);

    const profilePicture = userData.userId.profilePicture || "default.jpg";
    let imagePath = path.join(uploadsDir, profilePicture);

    if (!fs.existsSync(imagePath)) {
        imagePath = path.join(uploadsDir, "default.jpg");
    }

    const supportedImageExts = [".jpg", ".jpeg", ".png"];
    const imageExt = path.extname(imagePath).toLowerCase();

    if (fs.existsSync(imagePath) && supportedImageExts.includes(imageExt)) {
        docs.image(imagePath, { align: "center", width: 100 });
    } else if (fs.existsSync(imagePath)) {
        console.warn(`Skipping unsupported resume image format: ${imagePath}`);
    }

    docs.fontSize(14).text(`Name : ${userData.userId.name}`);
    docs.fontSize(14).text(`Username : ${userData.userId.username}`);
    docs.fontSize(14).text(`Email : ${userData.userId.email}`);
    docs.fontSize(14).text(`Bio : ${userData.bio || userData.userId.bio || ""}`);
    docs.fontSize(14).text(`Current Position : ${userData.currentPost || ""}`);

    const pastWorkEntries = userData.pastwork || userData.pastWork || [];
    if (pastWorkEntries.length > 0) {
        docs.fontSize(14).text("Past Work : ");
        pastWorkEntries.forEach((work) => {
            docs.fontSize(14).text(`Company Name : ${work.company || work.compenyName || ""}`);
            docs.fontSize(14).text(`Position : ${work.position || ""}`);
            docs.fontSize(14).text(`Years of Experience: ${work.years || ""}`);
        });
    }

    const educationEntries = userData.education || [];
    if (educationEntries.length > 0) {
        docs.fontSize(14).text("Education : ");
        educationEntries.forEach((edu) => {
            docs.fontSize(14).text(`School : ${edu.school || ""}`);
            docs.fontSize(14).text(`Degree : ${edu.degree || ""}`);
            docs.fontSize(14).text(`Field Of Study : ${edu.fieldOfStudy || ""}`);
        });
    }

        docs.end();

    return fileName;
}

//signup
export const register = async(req, res)=>{
    console.log("Register body:", req.body);
    try{
        const {name, username, email, password} = req.body || {};

        if(!name || !username || !email || !password){
            return res.status(400).json({message : "Please fill all the fields"});
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if(existingUser){
            return res.status(400).json({message : "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            email,
            password : hashedPassword
        });

        await newUser.save();

        const userProfile = new Profile({
            userId : newUser._id
        });

        try {
            await userProfile.save();
        } catch (profileErr) {
            await User.deleteOne({ _id: newUser._id }).catch(() => null);
            return res.status(500).json({ message: "Failed to create user profile. Registration rolled back." });
        }

        return res.json({message : "User registered successfully"});
    }catch(err){
        console.error("Registration error:", err);

        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }

        return res.status(500).json({message : "Internal server error"});
    }
}

//login
export const login = async (req, res) =>{
    try{
        const {email, password} = req.body;

        if(!email || !password){
           return res.status(400).json( {message : "please fill all the fields"});
        }
       const user = await User.findOne({email});

       if(!user){
        return res.status(404).json({message : "User not found in the Database"});
       }

       const isMatchPass = await bcrypt.compare(password, user.password);
       if(!isMatchPass){
        return res.status(400).json({message : "username or password is unvalid"});
       }

       const token = crypto.randomBytes(32).toString("hex");

       await User.updateOne({ _id: user._id }, { token });
        
       return res.json({ token });


    }
    catch(err){
        return res.status(500).json({message : "There is some problem to login"})
    }
}


export const uploadProfilePicture = async (req, res) =>{
    const {token} = req.body;
    try{
        const user = await User.findOne({token : token});

        if(!user){
            return res.status(404).json({message : "User not found in the Database"});
        }

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded. Send multipart/form-data with field name 'profile_picture'."
            });
        }

        user.profilePicture = req.file.filename;

        await user.save();
        
        return res.json({message : "Profile picture uploaded successfully"});

    }
    catch(err){
        return res.status(500).json({message : "There is some problem to upload profile picture"})
    }
}

export const updateUserProfile = async (req, res) => {
    try{
        const {token, ...updateData} = req.body;
        const user = await User.findOne({token : token});

        if(!user){
            return res.status(404).json({message : "User not found in the Database"});
        }

        const {username, email} = updateData;

        const existUser = await User.findOne({$or: [{username}, {email}]}); 

        if(existUser && existUser._id.toString() !== user._id.toString()){
            return res.status(400).json({message : "Username or email already exists"});
        }

        Object.assign(user, updateData);
        
        await user.save();

        return res.json({message : "User profile updated successfully"});
    }
    catch(err){
        return res.status(500).json({message : "There is some problem to update user profile"})
    }
}


export const getUserAndProfile = async (req, res) => {
    try{
        const token = req.query.token || req.body.token || req.headers.authorization?.split(" ")[1];
        
        if(!token){
            return res.status(400).json({message : "token is required"});
        }
        
        const user = await User.findOne({ token });

        if(!user){
            return res.status(404).json({message : "User not found in the Database"});
        }

        if (!user.profilePicture || user.profilePicture === '') {
            user.profilePicture = 'default.jpg';
        }

        let userProfile = await Profile.findOne({userId : user._id}).populate("userId", "name username email profilePicture");

        return res.json({user, profile : userProfile});

    }
    catch(err){
        console.error("Error in getUserAndProfile:", err);
        return res.status(500).json({message : "There is some problem to get user and profile"})
    }
}

export const updateProfileData = async (req, res) =>{
    try{
        const {token, ...updateData} = req.body;
        const userProfile = await User.findOne({token : token});

        if(!userProfile){
            return res.status(404).json({message : "User profile not found in the Database"});
        }

        // Prevent updating ownership fields
        delete updateData._id;
        delete updateData.userId;

        // Normalize front-end key to schema key
        if (updateData.pastWork) {
            updateData.pastwork = updateData.pastWork;
            delete updateData.pastWork;
        }

        // Remove undefined values to avoid accidentally overwriting fields
        Object.keys(updateData).forEach((k) => {
            if (typeof updateData[k] === "undefined") delete updateData[k];
        });

        const updated = await Profile.findOneAndUpdate(
            { userId: userProfile._id },
            { $set: updateData },
            { new: true },
        );

        if (!updated) {
            return res.status(404).json({ message: "Profile not found in the Database" });
        }

        return res.json({ message: "your profile updated successfully", profile: updated });


    }catch(err){
        return res.status(500).json({message : "There is some problem to update user profile"})
    }
}

export const getAllUserProfile = async (req, res) =>{
    
    try{
        const allProfiles = await Profile.find().populate("userId", "name username email profilePicture");

        return res.json({profiles : allProfiles});
    }
    catch(err){
        return res.status(500).json({message : "There is some problem to get all user profile"})
    }
}

export const downloadResume = async (req, res) => {
    const user_id = req.query.user_id || req.query.id;

    if (!user_id) {
        return res.status(400).json({ message: "user_id or id query parameter is required" });
    }

    try {
        const userProfile = await Profile.findOne({ userId: user_id }).populate("userId", "name username email profilePicture");

        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found in the Database" });
        }

        let outputPath = await convertUserDataTOPDF(userProfile);

        return res.json({ message: "Resume downloaded successfully", data: outputPath });
    }
    catch (err) {
        console.error("Error downloading resume:", err);
        return res.status(500).json({ message: "There is some problem to download resume" });
    }

}


export const sendConnectionRequest = async (req, res) =>{
    const token = req.body.token || req.query.token;
    const connectionId = req.body.connectionId || req.body.user_id || req.body.connectionUserId;

    if (!token || !connectionId) {
        return res.status(400).json({ message: "Token and connection user are required" });
    }

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        const connectionUser = await User.findOne({ _id: connectionId });

        if (!connectionUser) {
            return res.status(404).json({ message: "Connection user not found" });
        }

        if (user._id.toString() === connectionUser._id.toString()) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const existingRequest = await ConnectionRequest.findOne({
            userId: user._id,
            connectionId: connectionUser._id,
        });

        if (existingRequest) {
            return res.status(200).json({ message: "Request already sent" });
        }

        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id,
        });

        await request.save();

        return res.status(200).json({ message: "Request sent successfully" });
    } catch (error) {
        console.error("sendConnectionRequest error:", error);
        return res.status(500).json({ message: "Failed to send connection request", error: error.message });
    }
}


export const getMyConnectionRequest = async (req, res) =>{
    const token = req.query.token || req.body.token;

    try{
        const user = await User.findOne({ token });

        if(!user){
            return res.status(404).json({message : "user not found"});
        }

        const connections = await ConnectionRequest.find({ userId : user._id }).populate("connectionId", "name username email profilePicture");

        return res.json({ connections });
    }
    catch(err){
        return res.status(500).json({message : "Failed to fetch connection requests", err: err.message});
    }
}


export const whatAreMyConnections = async (req, res)=>{
    const token = req.query.token || req.body.token;

    try{
        const user = await User.findOne({ token });

        if(!user){
            return res.status(404).json({message : "user not found"});
        }

const connections = await ConnectionRequest.find({ connectionId : user._id }).populate("userId", "name username email profilePicture");

        return res.json({ connections });
    }
    catch(err){
        return res.status(500).json({message : "Failed to fetch user connections", err: err.message});
    }
}


export const acceptConnectionRequest = async (req, res)=>{
    
    const token = req.body.token || req.query.token;
    const requestId = req.body.requestId || req.body.connectionId || req.query.requestId;
    const action_type = req.body.action_type || req.body.action;

    if (!token || !requestId) {
        return res.status(400).json({ message: "Token and requestId are required" });
    }

    try{
        const user = await User.findOne({token});
        if(!user){
            return res.status(404).json({message : "user not found"});
        }

        const connection = await ConnectionRequest.findOne({_id : requestId});

        if(!connection){
            return res.status(404).json({message : "connection not found"});
        }

        connection.status_accepted = action_type === "accept" || action_type === "accepted";

        await connection.save();

        return res.json({message : "Request updated"});

    }
    catch(err){
         return res.status(500).json({message : err.message});
    }
}

export const getUserProfileAndUserBasedOnUsername = async(req, res) => {
    const username = req.query.username || req.body.username || req.params.username;

    if (!username) {
        return res.status(400).json({ message: "username is required" });
    }

    try{
        const user = await User.findOne({ username });
        if(!user){
            return res.status(404).json({ message : "user not found" });
        }

        const userProfile = await Profile.findOne({ userId : user._id }).populate("userId", "name username email profilePicture");
        if(!userProfile){
            return res.status(404).json({ message : "user profile not found" });
        }

        return res.json({ user, profile : userProfile });
    }
    catch(err){
        console.error("getUserProfileAndUserBasedOnUsername error:", err);
        return res.status(500).json({ message : err.message });
    }
}
