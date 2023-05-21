const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');

const PublicationSchema = Schema({
    user:{
        type:Schema.ObjectId,
        ref:"User"
    },
    text:{
        type:String,
        required:true

    },
    file:String,
    create_at:{
        type:Date,
        default:Date.now
    },
    megusta:{
        type:String,
        default:0
    },
    nomegusta:{
        type:String,
        default:0
    }


})

PublicationSchema.plugin(mongoosePaginate);

module.exports = model("Publication", PublicationSchema, "publications")