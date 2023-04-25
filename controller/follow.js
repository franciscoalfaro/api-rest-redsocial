const Follow = require("../models/follow")
const User = require("../models/user")


const pruebaFollow = (req, res) => {
    return res.status(200).send({
        status:"success",
        message:"mensaje enviado desde controller pruebaFollow",

    })
}


//accion de seguir 

const save = (req, res)=>{
    //consegir datos del body
    const params = req.body

    //obtener id del usuario identificad
    const identity = req.user

    //crear objeto de modelo follow
    let userToFollow = new Follow({
        user : identity.id,
        followed :  params.followed

    })
    // validar que el usuario ya lo sigues con Userfind si el id del usuario a seguir ya esta en la bd de estar indicar que ya lo sigues de lo contrario seguir

    //guardar objeto en la bd
    userToFollow.save().then((followStored) => {
        
        //Devolver el resultado
        return res.status(200).json({
            status: "success",
            message: "sigues al usuario de forma correcta",
            follow: followStored,
        });
    }).catch((error) => {
        if (error || !followStored) return res.status(500).send({ status: "error", message: "error al seguir" })
    })

}


//accion dejar de seguir 


//accion de listado de usuarios que sigo 


//accion de listado de usuarios que me siguen 



//exportar modulo
module.exports = {
    pruebaFollow,
    save
}