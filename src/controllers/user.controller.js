import {asyncHandler} from "../utils/asyncHandler.js"; 
import {APIerror} from "../utils/APIerror.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {APIResponse} from "../utils/APIResponse.js"
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
    console.log(email);

    if([fullName,email,username,password].some((feilds) => feilds?.trim() === "")){
        throw new APIerror(400,"All is required")
    }

    const existedUser = User.findOne({
        $or: [{username},{email}],
    })
    if(existedUser){
        throw new APIerror(409,"User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path 
    if(!avatarLocalPath){
        throw new APIerror(400,"avatar file is req")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

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

export {registerUser};