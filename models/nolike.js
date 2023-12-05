const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');

const NoLikeSchema = Schema ({
    user:{
        type:Schema.ObjectId,
        ref:"User"
    },
    noliked:{
        type:Schema.ObjectId,
        ref:"publication"
    },
    create_at:{
        type:Date,
        default:Date.now
    }

})

NoLikeSchema.plugin(mongoosePaginate);


module.exports = model("NoLike", NoLikeSchema, "nolikes");