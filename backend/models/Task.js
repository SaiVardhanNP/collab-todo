const mongoose=require("mongoose");


const TaskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        default:""
    },
    status:{
        type:String,
        enum:["Todo","In Progress","Done"],
        default:"Todo"

    },
    priority:{
        type:String,
        enum:["Low","Medium","High"],
        default:"Medium"
    },
    assignedUser:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        default:null
    },
},
{
    timestamps:true,
    versionKey:"version"
}
);

const TaskModel=mongoose.model("Task",TaskSchema);

module.exports={
    TaskModel:TaskModel
}