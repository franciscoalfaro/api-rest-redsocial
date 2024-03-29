//importar dependencias y modulos
const fs = require("fs")
const bcrypt = require('bcrypt')
const mongoosePagination = require('mongoose-paginate-v2')
const path = require("path")

//importar modelo
const User = require("../models/user")
const Follow = require("../models/follow");
const Publication = require("../models/publication")

//importar servicio
const jwt = require("../services/jwt")
const followService = require("../services/followService")
const validate = require("../helpers/validate")



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

    try {
        validate.validate(params)

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Validacion no superada",
        })


    }




    //consultar si usuario existe en la BD para ser guardado, en el caso de existir indicara que el nick y correo ya existen 
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() },
        ],
    }).then(async (users) => {
        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "warning",
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

//Login de usuario
const login = (req, res) => {

    let params = req.body;
    console.log(params)

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error_404",
            message: "faltan datos por enviar"
        })
    }
    //buscar a ususario en la BD  .select({"password":0}) oculta la pass del resultado
    User.findOne({ email: params.email })
        .then((user) => {
            if (!user) return res.status(404).json({ status: "Not Found", message: "Usuario no registrado" })

            //comprobar password que llega por el body y con la password del usuario de la BD
            const pwd = bcrypt.compareSync(params.password, user.password)

            if (!pwd) {
                return res.status(400).send({
                    error: "Error_pass",
                    message: "No te has identificado de forma correcta. "

                })
            }

            //si usuario con cuenta desactivada se loguea nuevamente se cambia estado de cuenta desactivada=true a cuenta desactivada=false
            user.eliminado = false;
            // guardar el usuario actualizado en la BD
            user.save();


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
                    nick: user.nick,
                },
                token,

            });


        }).catch((error) => {
            if (error) return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" })
            console.log(error);
        });

}

// perfil de usuario
const profile = async (req, res) => {
    //recibir parametro id por url
    const id = req.params.id

    try {
        //consulta para obtener datos del usuario
        const userProfile = await User.findById(id)
        User.findById(userProfile)
            .select({ "password": 0, "role": 0, "create_at": 0 })
            .then(async (userProfile) => {
                if (!userProfile) return res.status(404).json({ status: "Error", message: "NO SE HA ENCONTRADO EL USUARIO" })
                //console.log(userProfile)


                //info de seguimiento

                const followInfo = await followService.followThisUser(req.user.id, id)


                return res.status(200).json({
                    status: "success",
                    message: "profile found successfully",
                    user: userProfile,
                    following: followInfo.following,
                    follower: followInfo.followers

                });

            })

    } catch (error) {
        if (error) return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" })
        console.log(error);

    }



}

//listar usuario
const list = (req, res) => {
    let page = 1

    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    let itemPerPage = 6

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { _id: -1 },
        select: ("-password -email -role -__v")
    };

    User.paginate({}, opciones, async (error, users, total) => {

        if (error || !users) return res.status(404).json({ status: "Error", message: "NO SE HA ENCONTRADO EL USUARIO" })


        let followUserIds = await followService.followUserIds(req.user.id)
        //se cambia total por pages total:users.totalPages,

        return res.status(200).send({
            status: "success",
            message: "listado de usuarios",
            users: users.docs,
            pages: users.totalPages,
            totalDocs: users.totalDocs,
            itempage: users.limit,
            page: users.page,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers

        })

    }).catch((error) => {
        if (error) return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" })
        console.log(error);
    });
}

//actualizar datos del usuario


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
                status: "warning",
                message: "El usuario ya existe"
            });

        }

        //si pass cifrarla. 
        if (userToUpdate.password) {
            //Cifrar la contraseña con bcrypt
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        } else {
            delete userToUpdate.password
        }

        //se busca el usuario y se actualiza, en el caso de que exista error en el usuario a actualizar lanzara error  caso contrario actualizara

        try {
            let userUpdate = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true })

            if (!userUpdate) {
                return res.status(400).json({ status: "error", message: "error al actualizar" })
            }

            return res.status(200).json({
                status: "success",
                message: "profile update success",
                user: userToUpdate


            });

        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "error al obtener la informacion en servidor"
            })
        }

    })

}

//subida de image
const upload = async (req, res) => {
    //recoger el fichero de image
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "image no seleccionada"
        })
    }

    //conseguir nombre del archivo
    let image = req.file.originalname

    //obtener extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1].toLowerCase();

    //comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        //borrar archivo y devolver respuesta en caso de que archivo no sea de extension valida.
        const filePath = req.file.path
        const fileDelete = fs.unlinkSync(filePath)

        //devolver respuesta.        
        return res.status(400).json({
            status: "error",
            mensaje: "Extension no invalida"
        })

    }

    try {
        const ImaUpdate = await User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })

        if (!ImaUpdate) {
            return res.status(400).json({ status: "error", message: "error al actualizar" })
        }
        //entrega respuesta corrrecta de image subida
        return res.status(200).json({
            status: "success",
            message: "avatar actualizado",
            user: req.user,
            file: req.file,
            image
        });
    } catch (error) {
        if (error) {
            const filePath = req.file.path
            const fileDelete = fs.unlinkSync(filePath)
            return res.status(500).send({
                status: "error",
                message: "error al obtener la informacion en servidor",
            })
        }

    }

}


// mostrar avatar

const avatar = (req, res) => {

    //obtener parametro de la url
    const file = req.params.file

    //montar el path real de la image
    const filePath = "./uploads/avatars/" + file

    try {
        //comprobar si archivo existe
        fs.stat(filePath, (error, exist) => {
            if (!exist) {
                return res.status(404).send({
                    status: "error",
                    message: "la image no existe"
                })
            }
            //devolver archivo en el caso de existir  
            return res.sendFile(path.resolve(filePath));
        })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "error al obtener la informacion en servidor"
        })
    }
}


//counter

const counters = async (req, res) => {

    let userId = req.user.id;

    if (req.params.id) {
        userId = req.params.id;
    }

    try {
        const following = await Follow.count({ "user": userId });

        const followed = await Follow.count({ "followed": userId });

        const publications = await Publication.count({ "user": userId });

        return res.status(200).send({
            userId,
            following: following,
            followed: followed,
            publications: publications
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en los contadores",
            error
        });
    }
}


//eliminar usuario/cuenta
const remove = async (req, res) => {
    try {
        // Obtener el ID del usuario
        const userId = req.params.id;

        // Eliminacion del usuario de forma logica - se modifica el modelo para agregar el campo eliminado por defecto en false
        const userDelete = await User.findByIdAndUpdate(userId, { eliminado: true });


        if (userDelete) {
            return res.status(200).json({
                status: "success",
                message: "Usuario eliminado",
                user: userDelete
            });
        } else {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al eliminar usuario",
            error: error.message
        });
    }
};


//end-point para buscar persona
const searchPeople = (req, res) => {
    let busqueda = req.params.searchpeople;
    let page = req.params.page || 1;
    let limit = 10;

    const inputString = busqueda;
    const spaceIndex = inputString.indexOf(' ');
    
    let result = '';
    
    if (spaceIndex !== -1) {
      result = inputString.substring(0, spaceIndex);
    } else {
      result = inputString;
    }

    try {
        const opciones = {
            page: page,
            limit: limit,
            sort: { create_at: -1 },
            select: ("-password -email -role -__v")
        };

        // Find OR
        User.paginate(
            {
                "$or": [
                    { "name": { "$regex": result, "$options": "i" } },
                    { "surname": { "$regex": result, "$options": "i" } }
                ]
            },
            opciones
        )
            .then((result) => {
                if (result.docs.length === 0) {
                    return res.status(404).json({
                        status: "error",
                        mensaje: "No se han encontrado personas"
                    });
                }

                return res.status(200).json({
                    status: "success",
                    total: result.totalDocs,
                    currentPage: result.page,
                    totalPages: result.totalPages,
                    person: result.docs
                });
            });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: "error",
            mensaje: "Error en conexión con el servidor"
        });
    }
};


//
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters,
    remove,
    searchPeople

}