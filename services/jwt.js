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
        image:user.image,
        iat: moment().unix(),
        exp: moment().add(3, "days").unix()
    }
    //devolver jwt token
    return jwt.encode(payload, secret_key)

}
module.exports={
    createToken,
    secret_key
}





