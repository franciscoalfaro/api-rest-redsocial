const express = require("express")
const router = express.Router()
const LikeController = require("../controller/like")
const check = require("../middlewares/auth")

//definir rutas
router.get("/prueba", LikeController.pruebaLike)

router.post("/megusta/:id", check.auth, LikeController.likePublication)
router.post("/nolike/:id", check.auth, LikeController.unlike)
router.delete("/unlike/:id", check.auth, LikeController.deleteLike)

router.get("/listlikes/:id", check.auth, LikeController.listLikes);


//exportar router
module.exports=router