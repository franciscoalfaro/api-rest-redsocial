const Follow = require("../models/follow")

const followUserIds = async(identityUserId) =>{

    try{

        //obetner informacion de seguimiento 
        let following = await Follow.find({"user":identityUserId})
        .select({"followed":1, "_id":0})
        .exec()

        let followers = await Follow.find({"followed":identityUserId})
        .select({"user":1, "_id":0})
        .exec() 

  


        //procesar array de identificadores de usuarios que sigo y los que me siguen
        let followingClean = [];

        following.forEach(follow =>{
            followingClean.push(follow.followed)});
        console.log(followingClean)


        let followerClean = [];

        followers.forEach(follow =>{
            followerClean.push(follow.user)});
        console.log(followerClean)      

        return {
            following:followingClean,
            followers:followerClean
        }

    }catch(error){
        return false

    }

}

const followThisUser = async(identityUserId, profileUserId)=>{

}

module.exports={
    followUserIds,
    followThisUser

}