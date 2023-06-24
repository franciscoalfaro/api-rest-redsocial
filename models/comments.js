const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');


const CommentsSchema =  Schema({
    user:{
        type:Schema.ObjectId,
        ref:"User"
    },
    publication:{
        type:Schema.ObjectId,
        ref:"Publication"
    },
    comentario:{
        type:String,
    },
    create_at:{
        type:Date,
        default:Date.now
    }

})

CommentsSchema.plugin(mongoosePaginate);

module.exports = model("Comments", CommentsSchema, "comments");
