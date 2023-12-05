const Publication = require("../models/publication")

const Like = require("../models/like")
const NoLike = require("../models/nolike")


const pruebaLike = (req, res)=>{
    console.log("holaa")
    return res.status(200).send({
        status: "success",
        message: "mensaje enviado desde controller LikeController",

    })


}

//like
const likePublication = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const userId = req.user.id; // Suponiendo que recibes el ID del usuario que da like

        // Verificar si el usuario ya dio like a la publicación
        const existingLike = await Like.findOne({user: userId, liked:publicationId });
        if (existingLike) {
            return res.status(400).json({ status: "error", message: "El usuario ya dio me gusta a esta publicación" });
        }

        // Crear nuevo like
        const newLike = new Like({ liked: publicationId, user: userId });
        await newLike.save();

        return res.status(200).json({ status: "success", message: "Me gusta agregado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al agregar el me gusta" });
    }
}

//este end-poit guarda los no me gusta
const unlike = async(req, res)=>{
    try {
        const publicationId = req.params.id;
        const userId = req.user.id; // Suponiendo que recibes el ID del usuario que da like

        // Verificar si el usuario ya dio like a la publicación
        const existingLike = await NoLike.findOne({user: userId, noliked:publicationId });
        if (existingLike) {
            return res.status(400).json({ status: "error", message: "El usuario ya dio no me gusta a esta publicación" });
        }

        // Crear nuevo no me gusta
        const newLike = new NoLike({ noliked: publicationId, user: userId });
        await newLike.save();

        return res.status(200).json({ status: "success", message: "no me gusta agregado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al agregar no me gusta" });
    }

}


// Eliminar like de una publicación
const deleteLike = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const userId = req.user.id;

        // Buscar y eliminar el like correspondiente al usuario y la publicación, primero en el modelo Like
        let like = await Like.findOneAndDelete({ liked: publicationId, user: userId });

        // Si no se encontró en Like, buscar y eliminar en el modelo NoLike
        if (!like) {
            like = await NoLike.findOneAndDelete({ noliked: publicationId, user: userId });
            if (!like) {
                return res.status(400).json({ status: "error", message: "El usuario no dio like o no me gusta a esta publicación" });
            }
        }

        return res.status(200).json({ status: "success", message: "Like eliminado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al eliminar el like o no me gusta" });
    }
}

const listLikes = async (req, res) => {
    try {
        const publicationId = req.params.id;
        console.log(publicationId)

        // Buscar los likes que tiene la publicación utilizando el ID de la publicación
        const likes = await Like.find({ liked: publicationId });
        const Nolikes = await NoLike.find({ noliked: publicationId });

        // Contar la cantidad de likes obtenidos
        const likesCount = likes.length;
        const nolikesCount = Nolikes.length

        return res.status(200).json({ 
            status: "success", 
            likesCount, 
            likes,
            Nolikes,
            nolikesCount
         });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al obtener los likes de la publicación" });
    }
}


module.exports={
    pruebaLike,
    likePublication, 
    deleteLike,
    unlike,
    listLikes
}