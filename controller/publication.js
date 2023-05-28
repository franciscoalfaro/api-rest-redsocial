//importar modulos
const fs = require("fs")
const path = require("path")

//impotar modelo
const Publication = require("../models/publication")
const mongoosePagination = require('mongoose-paginate-v2')

//importar servicios
const followService = require("../services/followService")


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

    newPublication.save().then((publicationStored) => {
        //Devolver el resultado
        return res.status(200).json({
            status: "success",
            message: "publicacion guardada de forma correcta",
            publicationStored,
        });
    }).catch((error) => {
        if (error || !publicationStored) return res.status(500).send({ status: "error", message: "error al guardar la publicacion" })
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

//listar publicaciones de un usuario
const user = async (req, res) => {

    //sacar el id del usuario
    const userId = req.params.id

    //find, populate, ordenar
    let page = 1
    if (req.params.page) {
        page = req.params.page

    }

    const itemsPerPage = 3;

    //find a follow, popular datos de los usuarios y paginar 
    const opciones = {
        page: page,
        limit: itemsPerPage,
        sort: { "-create_at": -1 },
        populate: { path: 'user', select: '-password -role -__v -email' }
    };


    //listar publicaciones de un usuario
    Publication.paginate({ "user": userId }, opciones).then((publications) => {
        if (!publications.docs || publications.docs <= 0) {
            return res.status(500).send({ status: "error", message: "no existen publicaciones" })

        }

        //devolver respuesta.   
        return res.status(200).json({
            status: "success",
            message: "publicaciones del perfil de un usuario",
            page: publications.page,
            total: publications.totalDocs,
            publications:publications.docs
        });

    }).catch((error) => {
        if (error) return res.status(500).send({ status: "error", message: "error al obtener informacion del servidor" })

    });

}

//subir ficheros
const upload = async (req, res) => {
    //sacar publication id
    const publicationId = req.params.id

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
        const ImaUpdate = await Publication.findOneAndUpdate({ "user": req.user.id, "_id": publicationId }, { file: req.file.filename }, { new: true })


        if (!ImaUpdate) {
            return res.status(400).json({ status: "error", message: "error al actualizar" })
        }
        //entrega respuesta corrrecta de image subida
        return res.status(200).json({
            status: "success",
            message: "publicacion actualizada",
            file: req.file,
            publicationUpdate: ImaUpdate
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


//devolver archivos multimedia

const media = (req, res) => {

    //obtener parametro de la url
    const file = req.params.file

    //montar el path real de la image
    const filePath = "./uploads/publications/" + file

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



//listar todas la publicaciones feed

const feed = async (req, res) => {
    //obtener pagina actual
    let page = 1
    if (req.params.page) {
        page = req.params.page
    }

    //establecer numero de elementos por pagina
    let itemsPerPage = 5

    const opciones = {
        page: page,
        limit: itemsPerPage,
        sort: { "create_at": 1 },
        populate: { path: 'user', select: '-password -role -__v -email' }
    };

    //obtener array de identificadores que sigo como usuario identificado
    const myFollows = await followService.followUserIds(req.user.id);

    //Find a publicaciones utilizando operador [in], ordenar pagina y popular
    try {
        Publication.paginate({ "user": { "$in": myFollows.following } }, opciones).then((publications) => {
            if (!publications.docs || publications.docs <= 0) {
                return res.status(500).send({ status: "error", message: "no existen publicaciones" })
            }
            return res.status(200).json({
                status: "success",
                message: "publicaciones feed",
                following: myFollows.following,
                page: publications.page,
                total: publications.totalDocs,
                publications:publications.docs
            });
        })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "error al obtener la informacion en servidor",
        })

    }

}



//exportar modulos
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}