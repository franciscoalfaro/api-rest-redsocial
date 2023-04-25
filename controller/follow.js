const Follow = require("../models/follow")
const User = require("../models/user")

const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message:"mensaje enviado desde controller pruebaFollow"
    })
}


//accion de seguir 


//accion dejar de seguir 


//accion de listado de usuarios que sigo 


//accion de listado de usuarios que me siguen 



//exportar modulo
module.exports = {
    pruebaFollow
}