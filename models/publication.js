const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const PublicationSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        required: true
    },
    file: String,
    likes: [
        {
            type: Schema.ObjectId,
            ref: "User" // Hace referencia al modelo de usuarios para almacenar los IDs de los usuarios que dieron "me gusta"
        }
    ],
    create_at: {
        type: Date,
        default: Date.now
    }
});

PublicationSchema.plugin(mongoosePaginate);

module.exports = model("Publication", PublicationSchema, "publications");
