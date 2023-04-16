const express = require("express")
const router = express.Router()
const FollowController = require("../controller/follow")

//definir rutas
router.get("/pruebas-follow", FollowController.pruebaFollow)

//exportar router
module.exports=router