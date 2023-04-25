const express = require("express")
const router = express.Router()
const FollowController = require("../controller/follow")
const check = require("../middlewares/auth")

//definir rutas
router.get("/pruebas-follow", FollowController.pruebaFollow)
router.post("/save",check.auth, FollowController.save)

//exportar router
module.exports=router