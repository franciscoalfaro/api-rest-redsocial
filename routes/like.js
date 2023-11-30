const express = require("express")
const router = express.Router()
const LikeController = require("../controller/like")
const check = require("../middlewares/auth")

//definir rutas
router.get("/prueba", LikeController.pruebaLike)



//exportar router
module.exports=router