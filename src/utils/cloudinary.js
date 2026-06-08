import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (LocalFilePath)=>{
    try{
        if(!LocalFilePath) return null;
         
        const response = await cloudinary.uploader.upload(LocalFilePath,{
            resource_type : "auto",
        })
        console.log("file uploaded!",response.url);
        return response;
    }
    catch(err){
        fs.unlinkSync(LocalFilePath)//remove the localy saved file as it is corrupted
        
    }
}

cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {public_id: 'shoes',},
           function(error,result){console.log(result);})
       
export {uploadOnCloudinary};