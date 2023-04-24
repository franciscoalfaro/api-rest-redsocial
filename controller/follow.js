const Follow = require("../models/follow")
const User = require("../models/user")

const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message:"mensaje enviado desde controller pruebaFollow"
    })
}

//
module.exports = {
    pruebaFollow
}