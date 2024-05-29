const mongoose = require("mongoose");
mongoose.set('strictQuery', false)

const connection = async() => {

    try {
        //conexion mediante url a la BD mongo        
        await mongoose.connect("mongodb+srv://franciscoalfar:stpI5QI5cvqcvrmM@cluster1.hru2qfl.mongodb.net/social_network")
   
        console.log("Connection success social_network")
        
    } catch (error) {
        console.log(error);
        throw new Error("The connection has been refused..");
        
    }

}

module.exports={
    connection
}