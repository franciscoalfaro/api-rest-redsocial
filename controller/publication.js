const Publication = require("../models/publication")
const mongoosePagination = require('mongoose-paginate-v2')


const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde controller pruebaPublication"
    })
}

//guardar publicaciones

const save = (req, res) => {
    const params = req.body

    if (!params.text)
        return res.status(400).send({
            status: "error",
            message: "debes de enviar el text de la publicacion"
        })

    let newPublication = new Publication(params)
    newPublication.user = req.user.id

    newPublication.save().then((publicacionStored) => {
        //Devolver el resultado
        return res.status(200).json({
            status: "success",
            message: "publicacion guardada de forma correcta",
            publicacionStored,
        });
    }).catch((error) => {
        if (error || !publicacionStored) return res.status(500).send({ status: "error", message: "error al guardar la publicacion" })
    })

}

//obtener una publicacion
const detail = (req, res) => {

    //obtejer id de publicacion de la url
    const publicationId = req.params.id;

    //buscar publicacion con el id
    Publication.findById(publicationId).then((publicationStored) => {
        if (!publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "no existe publicacion"

            })
        }
        //devolver respuesta
        return res.status(200).json({
            status: "success",
            message: "publicacion mostrada",
            publications: publicationStored

        });
    }).catch((error) => {
        if (error) return res.status(500).send({ status: "error", message: "error al consultar en el servidor" })
    })

}

//eliminar publicaciones
const remove = async (req, res) => {
    //obtener id de la publicacion
    const publicationId = req.params.id;

    //buscar la publicacion comparando el id del usuario con el id de la publicacion y borrarlo

    try {
        const publicaDelete = await Publication.findOneAndRemove({ "user": req.user.id, "_id": publicationId }).then((publicationId) => {
            return res.status(200).json({
                status: "success",
                message: "La publicacion ha sido borrada..",
                publications: publicationId
            });
        })
    } catch (error) {
        if (error || !publicationId) return res.status(500).send({ status: "error", message: "error al eliminar publicacion o no existen publicaciones" })

    }
}

//listar publicaciones

const user = async (req, res) => {

    //sacar el id del usuario
    const userId = req.params.id

    //find, populate, ordenar
    let page = 1
    if (req.params.page) {
        page = req.params.page

    }

    const itemsPerPage = 3;

    //find a follow, popular datos de los usuarios y paginar con mongoose
    const opciones = {
        page: page,
        limit: itemsPerPage,
        sort: { "-create_at": -1 },
        populate: { path: 'user', select: '-password -role -__v' }
    };


    Publication.paginate({ "user": userId }, opciones).then((publications) => {
        if( !publications.docs||publications.docs <=0){
            return res.status(500).send({ status: "error", message: "no existen publicaciones" })

        }

        //devolver respuesta.   
        return res.status(200).json({
            status: "success",
            message: "publicaciones del perfil de un usuario",
            page: publications.page,
            total: publications.totalDocs,
            publications
        });

    }).catch((error) => {
        if (error) return res.status(500).send({ status: "error", message: "error al obtener informacion del servidor" })
        console.log(error);
    });

}


//listar publicaciones de un usuario

//subir ficheros

//devolver archivos multimedia

//
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user
}