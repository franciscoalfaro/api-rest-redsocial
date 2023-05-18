const express = require("express")
const router = express.Router()
const PublicationController = require("../controller/publication")
const check = require("../middlewares/auth")

//definir rutas
router.get("/pruebas-publication",check.auth, PublicationController.pruebaPublication)
router.post("/save",check.auth, PublicationController.save )
router.get("/detail/:id", check.auth, PublicationController.detail)
router.delete("/delete/:id", check.auth, PublicationController.remove)
router.get("/user/:id/:page?",check.auth, PublicationController.user)

//exportar router
module.exports=router
