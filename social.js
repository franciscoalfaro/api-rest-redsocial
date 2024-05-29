//importar dependencia de conexion
const {connection} = require("./database/connection");
const express = require("express");
const cors = require ("cors")

console.log("API Connection success")
// efectuar conexion a BD
connection();

//crear conexion a servidor de node
const app = express();
const puerto = 3004;

//configurar cors
app.use(cors());

//conertir los datos del body a obj js
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//cargar rutas
const UserRoutes = require("./routes/user")
const PublicationRoutes = require("./routes/publication")
const FollowRoutes = require("./routes/follow")
const LikeRoutes = require("./routes/like")
const RecoveryRouter = require("./routes/recovery")

app.use("/api/user" ,UserRoutes)
app.use("/api/publication" ,PublicationRoutes)
app.use("/api/follow" ,FollowRoutes)
app.use("/api/like", LikeRoutes)
app.use("/api/recovery", RecoveryRouter)

//ruta de prueba
app.get('/probando',(req, res) => {
    return res.status(200).json({
        "id":"1",
        "Nombre":"Francisco Alfaro",
    })
})

//escuchar peticiones http

app.listen(puerto, ()=> {
    console.log("Server runing in port :" +puerto)
})