const Publication = require("../models/publication")


const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message:"mensaje enviado desde controller pruebaPublication"
    })
}

//guardar publicaciones

//obtener una publicacion

//eliminar publicaciones

//listar publicaciones


//listar publicaciones de un usuario

//subir ficheros

//devolver archivos multimedia

//
module.exports = {
    pruebaPublication
}