import { APIerror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler( async(req,resizeBy,next) => {
   try {
     const token = req.cookies?.accessToken || req.header("Autherisation")?.replace("Bearer ","")
 
     if(!token){
         throw new APIerror(401,"Unauthorised request")
     }
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!user){
         throw new APIerror(401,"INVALID ACCESS TOKEN !!")
     }
 
     req.user = user;
     next()
   } catch (error) {
        throw new APIerror(404,error)
   }
})