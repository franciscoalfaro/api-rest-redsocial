const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');

const LikeSchema = Schema ({
    user:{
        type:Schema.ObjectId,
        ref:"User"
    },
    liked:{
        type:Schema.ObjectId,
        ref:"publication"
    },
    unlike:{
        type:Schema.ObjectId,
        ref:"publication"
    },
    create_at:{
        type:Date,
        default:Date.now
    }

})

LikeSchema.plugin(mongoosePaginate);


module.exports = model("Like", LikeSchema, "likes");