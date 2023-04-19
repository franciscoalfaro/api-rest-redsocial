
const express = require("express")
const router = express.Router()
const UserController = require("../controller/user")
const check = require("../middlewares/auth")

//definir rutas
router.get("/pruebas-usuario",check.auth, UserController.pruebaUser)
router.post("/register", UserController.register)
router.post("/login",UserController.login)
router.get("/profile/:id",check.auth, UserController.profile)


//exportar router
module.exports=router