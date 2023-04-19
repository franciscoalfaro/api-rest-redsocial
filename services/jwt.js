//importar dependencias 
const jwt = require("jwt-simple")
const moment =  require("moment")

//clave secreta
const secret_key = "SECRET_KEY_PROYECT_010102";

// crear funcion para genera tokens
const createToken = (user)=>{
    const payload = {
        id:user._id,
        name:user.name,
        surname:user.surname,
        nick:user.nick,
        email:user.email,
        role:user.role,
        imagen:user.imagen,
        iat: moment().unix(),
        //exp:moment().add(30, "days").unix se usa para tener el tiempo de expiracion del token
        exp:moment().add(30, "days").unix
    }
    //devolver jwt token
    return jwt.encode(payload, secret_key)

}
module.exports={
    createToken,
    secret_key
}





