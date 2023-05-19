const express = require("express")
const router = express.Router()
const multer = require("multer")
const PublicationController = require("../controller/publication")
const check = require("../middlewares/auth")

//configuracion de subida
const storage = multer.diskStorage({
    destination:(req,file, cb) =>{
        cb(null,"./uploads/publications")

    },

    filename:(req,file, cb) =>{
        cb(null,"pub-"+Date.now()+"-"+file.originalname)
        
    }
})

const uploads = multer({storage})


//definir rutas
router.get("/pruebas-publication",check.auth, PublicationController.pruebaPublication)
router.post("/save",check.auth, PublicationController.save )
router.get("/detail/:id", check.auth, PublicationController.detail)
router.delete("/delete/:id", check.auth, PublicationController.remove)
router.get("/user/:id/:page?",check.auth, PublicationController.user)
router.post("/upload/:id",[check.auth, uploads.single("file0")], PublicationController.upload)
router.get("/media/:file", check.auth, PublicationController.media)
router.get("/feed/:page?", check.auth, PublicationController.feed)

//exportar router
module.exports=router
