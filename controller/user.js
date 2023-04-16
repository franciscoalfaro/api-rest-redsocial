const bcrypt = require('bcrypt')
const User = require("../models/user")

// acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde controller user"
    })
}


//registro usuarios

const register = (req, res) => {

    //recoger datos de la peticion
    let params = req.body;


    //comprobar datos + validacion
    if (!params.name || !params.nick || !params.email || !params.password) {
        return res.status(400).json({
            status: "Error",
            message: "faltan datos por enviar"
        })
    }
    //crear el obj usuario
    let user_to_save = new User(params);
    console.log(user_to_save)

    //consultar si usuario existe en la BD para ser guardado, en el caso de existir indicara que el nick y correo ya existen 

    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() },
        ],
    }).then(async (users) => {
        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe",
            });
        }

        //Cifrar la contraseña con bcrypt
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        //Crear objeto  de usuario para guardar en la BD
        let user_to_save = new User(params);

        //Guardar usuario en la bdd
        user_to_save.save().then((error, userStored) => {
            if (error || !userStored) return res.status(500).send({ status: "error", message: "error al guardar el usuario" })

            //Devolver el resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userStored,
            });
        })
    })
}


//
module.exports = {
    pruebaUser,
    register
}