const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB= async ()=> {
    try{
await mongoose.connect(db);
console.log('MongoDB Connected');
    }catch(err){
console.error(err.message);
process.exit(1);
    }
}
module.exports = connectDB;


//const { MongoClient } = require('mongodb');
//const uri = "mongodb+srv://ajithkallur:<Sivaram@87>@devconnector.4tns3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
//const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//client.connect(err => {
 // const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  //client.close();
//});

