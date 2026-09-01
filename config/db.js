const { MongoClient } = require("mongodb");

let db;

const connectDB = async() => {
    try{
        const client =  new MongoClient(process.env.MONGO_URI);
        await client.connect;
        db = client.db();
        console.log("MongoDB connected successfully.")
    }
    catch(err){
        console.error('There was an error connecting to MongoDB:', err);
        throw err;
    }
};

const getdb = () => {
    if(!db){
        throw new error("Database is not connected.");
    }
    return db
};

module.exports ={ connectDB, getdb }