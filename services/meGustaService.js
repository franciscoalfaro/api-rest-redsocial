const Publication = require("../models/publication");


const publicionesUserIds = async (identityUserId) => {

    try {

        //obetner informacion de quienes sigo 
        let megusta = await publication.find({ "megusta": identityUserId })
            .select({ "user": 1, "_id": 0 })
            .exec()

        //obetner informacion de quienes me siguen 
        let nomegusta = await publication.find({ "nomegusta": identityUserId })
            .select({ "user": 1, "_id": 0 })
            .exec()

        //usuarios que sigo
        let megustaClean = [];

        megusta.forEach(publication => {
            megustaClean.push(publication.megusta)
        });
        //console.log(megustaClean)

        //usuarios que me siguen
        let nomegustaClean = [];

        nomegusta.forEach(publication => {
            nomegustaClean.push(publication.nomegusta)
        });
        //console.log(nomegustaClean)

        return {
            megusta: megustaClean,
            nomegusta: nomegustaClean
        }

    } catch (error) {
        return false

    }

}

const meGustaThisUser = async (identityUserId, profileUserId) => {

    //obetner informacion de quienes sigo 
    let megusta = await Publication.findOne({ "user": identityUserId, "megusta": profileUserId })


    //obetner informacion de quienes me siguen 
    let nomegusta = await Publication.findOne({ "user": profileUserId, "nomegusta": identityUserId })



    return {
        megusta,
        nomegusta
    }
}

module.exports = {
    publicionesUserIds,
    meGustaThisUser

}