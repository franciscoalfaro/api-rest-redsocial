const Follow = require("../models/follow")

const followUserIds = async (identityUserId) => {

    try {

        //obetner informacion de quienes sigo 
        let following = await Follow.find({ "user": identityUserId })
            .select({ "followed": 1, "_id": 0 })
            .exec()

        //obetner informacion de quienes me siguen 
        let followers = await Follow.find({ "followed": identityUserId })
            .select({ "user": 1, "_id": 0 })
            .exec()

        //usuarios que sigo
        let followingClean = [];

        following.forEach(follow => {
            followingClean.push(follow.followed)
        });
        console.log(followingClean)

        //usuarios que me siguen
        let followerClean = [];

        followers.forEach(follow => {
            followerClean.push(follow.user)
        });
        console.log(followerClean)

        return {
            following: followingClean,
            followers: followerClean
        }

    } catch (error) {
        return false

    }

}

const followThisUser = async (identityUserId, profileUserId) => {

    //obetner informacion de quienes sigo 
    let following = await Follow.findOne({ "user": identityUserId, "followed": profileUserId })


    //obetner informacion de quienes me siguen 
    let followers = await Follow.findOne({ "user": profileUserId, "followed": identityUserId })



    return {
        following,
        followers
    }
}

module.exports = {
    followUserIds,
    followThisUser

}