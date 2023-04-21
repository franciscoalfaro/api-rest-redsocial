//importar dependencias y modulos
const bcrypt = require('bcrypt')
const mongoosePagination = require('mongoose-paginate')
//importar modelo
const User = require("../models/user")

//importar servicio
const jwt = require("../services/jwt")


// acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde controller user",
        usuario: req.user
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
        user_to_save.save().then((userStored) => {
            //Devolver el resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userStored,
            });
        }).catch((error) => {
            if (error || !userStored) return res.status(500).send({ status: "error", message: "error al guardar el usuario" })
        })

    })
}

const login = (req, res) => {

    let params = req.body;
    console.log(params)

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "faltan datos por enviar"
        })
    }

    //buscar a ususario en la BD  .select({"password":0}) oculta la pass del resultado
    User.findOne({ email: params.email })
        //.select({"create_at":0})
        .then((user) => {
            if (!user) return res.status(404).json({ status: "Error", message: "NO SE HA ENCONTRADO EL USUARIO" })
            console.log(user)


            //comprobar password que llega por el body y con la password del usuario de la BD
            const pwd = bcrypt.compareSync(params.password, user.password)

            if (!pwd) {
                return res.status(400).send({
                    error: "error",
                    message: "No te has identificado de forma correcta. "

                })
            }

            //devolver token
            const token = jwt.createToken(user)

            // eliminar pass del obj

            //devolver datos del usuario

            return res.status(200).json({
                status: "success",
                message: "Te has identificado de forma correcta.",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token

            });

        }).catch((error) => {
            if (error) return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" })
            console.log(error);
        });

}


const profile = async (req, res) => {
    //recibir parametro id por url
    const id = req.params.id

    //consulta para obtener datos del usuario
    const userProfile = await User.findById(id)
    User.findById(userProfile)
        .select({ "password": 0, "role": 0, "create_at": 0 })
        .then((userProfile) => {
            if (!userProfile) return res.status(404).json({ status: "Error", message: "NO SE HA ENCONTRADO EL USUARIO" })
            //console.log(userProfile)

            return res.status(200).json({
                status: "success",
                message: "profile found successfully",
                user: userProfile

            });

        }).catch((error) => {
            if (error) return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" })
            console.log(error);
        });

}


const list = (req, res) => {
    let page = 1

    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    let itemPerPage = 1

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { _id: -1 }
    };

    User.paginate({}, opciones, (error, users, total) => {
        users.total = total
        if (error || !users) return res.status(404).json({ status: "Error", message: "NO SE HA ENCONTRADO EL USUARIO" })


        return res.status(200).send({
            status: "success",
            message: "listado de usuarios",
            total,
            pages: Math.ceil(total / itemPerPage)
        })

    })
    //devolver resultado 

}

const update = (req, res) => {
    //recoger datos del usuario que se actualizara
    const userIdentity = req.user

    let userToUpdate = req.body

    //eliminar campos sobrantes. 
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;


    //comprobar si usuario ya existe

    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() },
        ],
    }).then(async (users) => {
        if (!users) return res.status(500).send({ status: "error", message: "no existe el usuario a actualizar" })

        let userIsset = false
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true
        })

        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });

        }

        //si pass cifrarla. 

        if (userToUpdate.password) {
            //Cifrar la contraseña con bcrypt
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }

        User.findByIdAndUpdate(userIdentity.id, userToUpdate,{new:true}).then(async(userUpdate)=>{
            if(!userUpdate)return res.status(500).send({status: "error",message: "error al guardar"})

            return res.status(200).send({
                status: "success",
                message: "metodo de actualizar usuario",
                userToUpdate
            })


        })

    }).catch((error) => {
        if (error) return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" })
        console.log(error);
    });

}



//
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update

}