import { Schema,Types } from "mongoose";

export const ProfileSchema=new Schema(
    { 
        userId:{
            type:Types.ObjectId, //userId stores the SAME _id value of a document from the users collection.
            ref:"User",
            required:true,
            unique:true,
            index:true,
        },
        
        fullName:{
            type:String,
            required:true,
            trim:true
        },
         username:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            index:true
        },
            bio:{
            type:String,
            default:null,
            maxlength:500
        },
            country:{
            type:String,
            default:null,
        },
            languages:{
            type:[String],
            default:null,
        },
        profileImage:{
            type:String,
            default:null,
        },
    },
    {
        timestamps:true,
        //Keeping track of how many times a MongoDB document has been changed, so MongoDB can detect conflicting updates.
        versionKey:false
    }
)
