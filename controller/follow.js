const Follow = require("../models/follow")
const User = require("../models/user")

const mongoosePagination = require('mongoose-paginate-v2')


//importar servicio
const followService = require("../services/followService")


const pruebaFollow = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "mensaje enviado desde controller pruebaFollow",

    })
}


//accion de seguir 

const save = (req, res) => {
    //consegir datos del body
    const params = req.body

    //obtener id del usuario identificad
    const identity = req.user

    //crear objeto de modelo follow
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed

    })
    //Feature validar que el usuario ya lo sigues con Userfind si el id del usuario a seguir ya esta en la bd de estar indicar que ya lo sigues de lo contrario seguir

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

const unfollow = async (req, res) => {
    try {
        // Recoger id del usuario identificado
        const userId = req.user.id;
        
        // Recoger el id del usuario que quiero dejar de seguir
        const followedId = req.params.id;
       
        // Buscar y eliminar el seguimiento
        const follow = await Follow.findOneAndRemove({ user: userId, followed: followedId });

        if (follow) {
            return res.status(200).json({
                status: "success",
                message: "Has dejado de seguir al usuario",
                follow,
                identity: req.user
            });
        } else {
            return res.status(404).json({
                status: "error",
                message: "No se encontró el seguimiento para dejar de seguir"
            });
        }
    } catch (error) {
        console.error('Error al dejar de seguir:', error);
        return res.status(500).json({
            status: "error",
            message: "Error al dejar de seguir al usuario"
        });
    }
};

//accion de listado que cualquier usuarios esta siguiendo(siguiendo)
const following = async (req, res) => {
    //sacar el id del usuario identificado
    let userId = req.user.id;

    //comprobar si llega por parametro la id en la url
    if (req.params.id) userId = req.params.id;

    //comprobar si llega la pagina si no mostrar pagina 1
    let page = 1
    if (req.params.page) page = req.params.page

    //cuantos usuarios a mostrar por pagina
    const itemsPerPage = 5;

    //find a follow, popular datos de los usuarios y paginar con mongoose
    const opciones = {
        page: page,
        limit: itemsPerPage,
        sort: { _id: -1 },
        populate: { path: 'user followed', select: '-password -role -__v -email' }

    };

    //se crea una constante para obtener los datos del objeto(modelo) y paginando la informacion obtenida
    //const consultaPaginada = await Follow.paginate({user: userId}, opciones)

    Follow.paginate({ user: userId }, opciones, async (error, follows, total) => {

        let followUserIds = await followService.followUserIds(req.user.id)

        return res.status(200).send({
            status: "success",
            message: "listado de quienes sigo",
            follow:follows.docs,
            pages:follows.totalPages,
            totalDocs:follows.totalDocs,
            itempage:follows.limit,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers


        })

    }).catch((error) => {
        if (error) return res.status(500).send({ status: "error", message: "error al obtener informacion del servidor" })
        console.log(error);
    });
}


//accion de listado de usuarios que siguen cualquier otro usuario(quienes me siguen)

const followers = (req, res) => {

    //sacar el id del usuario identificado
    let userId = req.user.id;

    //comprobar si llega por parametro la id en la url
    if (req.params.id) userId = req.params.id;

    //comprobar si llega la pagina si no mostrar pagina 1
    let page = 1
    if (req.params.page) page = req.params.page

    //cuantos usuarios a mostrar por pagina
    const itemsPerPage = 5;

    //find a follow, popular datos de los usuarios y paginar con mongoose
    const opciones = {
        page: page,
        limit: itemsPerPage,
        sort: { _id: -1 },
        populate: { path: 'user followed', select: '-password -role -__v -email' }
    
    };
    
    Follow.paginate({ followed: userId }, opciones, async (error, follows, total) => {

        let followUserIds = await followService.followUserIds(req.user.id)

        return res.status(200).send({
            status: "success",
            message: "listado de usuarios que me siguen",
            follow:follows.docs,
            pages:follows.totalPages,
            totalDocs:follows.totalDocs,
            itempage:follows.limit,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers

        })

    }).catch((error) => {
        if (error) return res.status(500).send({ status: "error", message: "error al obtener informacion del servidor" })
        console.log(error);
    });

}



//exportar modulo
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}