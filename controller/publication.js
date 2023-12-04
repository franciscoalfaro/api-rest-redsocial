//importar modulos
const fs = require("fs")
const path = require("path")
const mongoosePagination = require('mongoose-paginate-v2')

//impotar modelo
const Publication = require("../models/publication")
const Comments = require("../models/comments")
const Like = require("../models/like")
const NoLike = require("../models/nolike")


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
        sort: { create_at: -1 },
        populate: { path: 'user', select: '-password -role -__v -email' }
    };


    //listar publicaciones de un usuario
    Publication.paginate({ "user": userId }, opciones).then((publications) => {
        if (!publications.docs || publications.docs <= 0) {
            return res.status(404).send({ status: "error_publi", message: "no existen publicaciones" })

        }

        //devolver respuesta.   
        return res.status(200).json({
            status: "success",
            message: "publicaciones del perfil de un usuario",
            page: publications.page,
            total: publications.totalDocs,
            publications: publications.docs
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
        sort: { create_at: -1 },
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
                publications: publications.docs
            });
        })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "error al obtener la informacion en servidor",
        })

    }

}

// publicar comentario

const comment = async (req, res) => {
    try {
        const params = req.body;
        const publicationId = req.params.id
        console.log(publicationId)


        if (!params.text) {
            return res.status(400).send({
                status: "error",
                message: "Debes enviar el texto del comentario"
            });
        }

        //se crea el nuevo objeto para ser guardado en la BD el cual tiene el id de la publicacion el usuario que comento y el comentario

        const newComment = new Comments({
            comentario: params.text,
            publication: publicationId,
            user: req.user.id
        });
        console.log(newComment)

        //guardar comentario 
        const commentStored = await newComment.save();

        // Devolver el resultado
        return res.status(200).json({
            status: "success",
            message: "Comentario guardado de forma correcta",
            commentStored
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: "error", message: "Error al guardar el comentario" });
    }
}

//eliminar comentario comentDelete comentario: comentDelete
const removeComment = async (req, res) => {
    try {
        //obtener id de la publicacion
        const commentsId = req.params.id;

        //buscar la publicacion comparando el id del usuario con el id de la publicacion y borrarlo
        //otra forma de buscar y elminar comentario
        //const comment = await Comments.findByIdAndRemove(commentId);

        const comment = await Comments.findOneAndRemove({ "_id": commentsId })
        //si no existe el comentario se responde un 404
        if (!comment) {
            return res.status(404).json({
                status: "error",
                message: "el comentario no existe para eliminar",
            });

        }
        //si comentario existe se elimina. 
        return res.status(200).json({
            status: "success",
            message: "el comentario ha sido eliminado",
            comment: commentsId
        });


    } catch (error) {
        return res.status(500).send({ status: "error", message: "error al eliminar comentario  o no existe" })
    }


}

//listar comentarios

const listCommen = (req, res) => {
    const publicationId = req.params.id;
  
    let page = 1;
    if (req.params.page) {
      page = req.params.page;
    }
    const itemsPerPage = 3;
  
    const options = {
      page: page,
      limit: itemsPerPage,
      sort: { create_at: -1 },
      populate: { path: 'user', select: '-password -role -__v -email -create_at' }
    };
    
    Comments.paginate({ 'publication': publicationId }, options).then((comments) => {
        if (!comments.docs || comments.docs <= 0) {
            return res.status(404).send({ status: "error", message: "no existen comentarios" })
        }
        
        return res.status(200).json({
          status: "success",
          message: "Listado de comentarios",
          comments:comments.docs,
          totalDocs:comments.totalDocs,
          totalPages: comments.totalPages,
          page:comments.page
        });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).send({ status: "error", message: "Error al obtener información del servidor" });
      });

}


//isui modificar estos end-point para dar like los comentarios 
const likePublication = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const userId = req.user.id; // Suponiendo que recibes el ID del usuario que da like

        // Verificar si el usuario ya dio like a la publicación
        const existingLike = await Like.findOne({user: userId, liked:publicationId });
        if (existingLike) {
            return res.status(400).json({ status: "error", message: "El usuario ya dio me gusta a esta publicación" });
        }

        // Crear nuevo like
        const newLike = new Like({ liked: publicationId, user: userId });
        await newLike.save();

        return res.status(200).json({ status: "success", message: "Me gusta agregado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al agregar el me gusta" });
    }
}

//este end-poit guarda los no me gusta o nolike del modelo nolike
const unlike = async(req, res)=>{
    try {
        const publicationId = req.params.id;
        const userId = req.user.id; // Suponiendo que recibes el ID del usuario que da like

        // Verificar si el usuario ya dio like a la publicación
        const existingLike = await NoLike.findOne({user: userId, liked:publicationId });
        if (existingLike) {
            return res.status(400).json({ status: "error", message: "El usuario ya dio no me gusta a esta publicación" });
        }

        // Crear nuevo no me gusta
        const newLike = new NoLike({ liked: publicationId, user: userId });
        await newLike.save();

        return res.status(200).json({ status: "success", message: "no me gusta agregado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al agregar no me gusta" });
    }

}


// Eliminar like de una publicación
const deleteLike = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const userId = req.user.id;

        // Buscar y eliminar el like correspondiente al usuario y la publicación, primero en el modelo Like
        let like = await Like.findOneAndDelete({ liked: publicationId, user: userId });

        // Si no se encontró en Like, buscar y eliminar en el modelo NoLike
        if (!like) {
            like = await NoLike.findOneAndDelete({ liked: publicationId, user: userId });
            if (!like) {
                return res.status(400).json({ status: "error", message: "El usuario no dio like o no me gusta a esta publicación" });
            }
        }

        return res.status(200).json({ status: "success", message: "Like eliminado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al eliminar el like o no me gusta" });
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
    feed,
    comment,
    removeComment,
    listCommen,
    likePublication, 
    deleteLike,
    unlike
}