const mongoose = require("mongoose");
mongoose.set('strictQuery', false)

const connection = async() => {

    try {
        //conexion mediante url a la BD mongo

        await mongoose.connect("mongodb://localhost:27017/social_network");
        
        //await mongoose.connect("mongodb+srv://franciscoalfar:stpI5QI5cvqcvrmM@cluster1.hru2qfl.mongodb.net/social_network")
   
        //paramtros dentro de obejeto en caso de problemas de conexion
        //use NewUrlParser:true
        //useUnifiedTopology:true
        //useCreateIndex:true

        console.log("Connection success social_network")
        
    } catch (error) {
        console.log(error);
        throw new Error("The connection has been refused..");
        
    }

}

module.exports={
    connection
}