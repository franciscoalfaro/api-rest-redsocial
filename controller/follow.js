const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message:"mensaje enviado desde controller pruebaFollow"
    })
}

//
module.exports = {
    pruebaFollow
}