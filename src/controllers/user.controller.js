import {asyncHandler} from "../utils/asyncHandler.js"; 
import {APIerror} from "../utils/APIerror.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {APIResponse} from "../utils/APIResponse.js"
import fs from "fs";

const generateAccessAndRefreshToken = async(userId){
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        
        return {accessToken,refreshToken}

    }catch(err){
        throw new APIerror(500,"something went wrong while generating refresh tokes")
    }
}


const registerUser = asyncHandler( async(req,res)=>{
    //get user details from frontend 
    //validation
    //check if user already exists
    //check for images and avvatar
    // upload them to cloudinary
    //create user object - create entry in db
    //remove password and refresh token feild from response
    //check for user creation
    //return res
    const {fullName,email,username,password} = req.body;
    if([fullName,email,username,password].some((feilds) => feilds?.trim() === "")){
        throw new APIerror(400,"All is required")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}],
    })
    if(existedUser){
        throw new APIerror(409,"User already exists")
    }
    // console.log(req.files)
    const avatarLocalPath = req.files?.avvatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path 
    if(!avatarLocalPath){
        throw new APIerror(400,"avatar file is req")
    }
    // console.log("path : ",coverImageLocalPath)
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage =  await uploadOnCloudinary(coverImageLocalPath)
    // console.log(coverImage)
    const user = await User.create({
        fullName,
        avvatar: avatar.url,
        coverImage: coverImage?.url || "",
        email ,
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new APIerror(500,"something went wrong while registering the user")
    }

    return res.status(201).json(
        new APIResponse(200,createdUser,"User registered !!")
    )
})

const loginUser = asyncHandler( async(req,res)=>{
    //req.body -> data
    //username or email
    //find user
    //password check
    //access and referesh token
    //send cookie

    const {email,username,password} = req.body

    if(!(username || email)){
        throw new APIerror(400,"username or email is required")
    }
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user){
        throw new APIerror(404, "user not found")
    }
    const isPasswordValid = await user.isPasswordValid(password);
    if(!isPasswordValid){
        throw new APIerror("401","invalid credentials!")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    res.status(200)
    .cookie("accessToken : ",accessToken,options)
    .cookie("refreshToken : ",refreshToken,options)
    .json(
        new APIResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "user logged in !"
        )
    )

})

const logoutUser = asyncHandler ( async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new APIResponse(200,{},"User Logged Out"))
    


})
export {registerUser,loginUser};