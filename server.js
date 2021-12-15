const express = require('express')
const connectDB = require ('./config/db');
const app = express();

//connect to DB
connectDB();
//const { MongoClient } = require('mongodb');
//const uri = "mongodb+srv://ajithkallur:<bhavyakallur>@devconnector.4tns3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
//const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//client.connect(err => {
 // const collection = client.db("test").collection("devices");
//   perform actions on the collection object
  //client.close();
//});


app.get('/', (req,res) => res.send('API Runing'));

//Init Middleware
app.use(express.json({extended: false}));
//define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server started on port ${PORT}'));


