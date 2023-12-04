const express = require("express")
const router = express.Router()
const LikeController = require("../controller/like")
const check = require("../middlewares/auth")

//definir rutas
router.get("/prueba", LikeController.pruebaLike)

router.post("/like/:id", check.auth, LikeController.likePublication)
router.post("/nolike/:id", check.auth, LikeController.unlike)
router.delete("/unlike/:id", check.auth, LikeController.deleteLike)



//exportar router
module.exports=router