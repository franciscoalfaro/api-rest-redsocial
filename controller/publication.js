const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message:"mensaje enviado desde controller pruebaPublication"
    })
}

//
module.exports = {
    pruebaPublication
}