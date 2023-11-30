const Like = require("../models/like")

const likePublicationIds = async (identityPublicationId) => {

    try {
        //obtener informacion de quienes les gusto publicacion
        let liked = await Like.find({ "user": identityPublicationId })
            .select({ "liked": 1, "_id": 0 })
            .exec()

        let likeds = await Like.find({ "liked": identityPublicationId })
            .select({ "user": 1, "_id": 0 })
            .exec()

        let likeClean = [];

        liked.forEach(likes => {
            likeClean.push(likes.liked)

        });

        

        //obtener informacion de quienes les dio no me gusta
        let unliked = await Like.find({ "user": identityPublicationId })
            .select({ "unlike": 1, "_id": 0 })
            .exec()

        let likedClean = [];

        liked.forEach(likes => {
            likeClean.push(likes.unliked)

        });




    } catch (error) {

    }





}