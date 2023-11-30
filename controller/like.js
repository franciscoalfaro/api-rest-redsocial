const Like = require("../models/like")


const pruebaLike = (req, res)=>{
    console.log("holaa")
    return res.status(200).send({
        status: "success",
        message: "mensaje enviado desde controller LikeController",

    })


}


module.exports={
    pruebaLike,
}