const express = require("express");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors= require('cors');
dotenv.config();

const userAuthRoutes = require('./routes/userAuth');
const userRoutes = require('./routes/UserRoute');
const chatRoutes=require('./routes/ChatRoute');
const app=express();
const connectDB = require('../config/db');
const redisClient = require('../config/redis');
app.use(cors({
    origin:"http://localhost:5174",
    credentials:true
}
))
app.use(cookieParser()); //extracts raw cookie data from the HTTP request header into a JavaScript object that’s easy to use in your code.
app.use(express.json()); // to convert JSON body to JS object

app.use('/user', userAuthRoutes);
app.use('/users',userRoutes);
app.use('/chat',chatRoutes);




const InitializeConnection = async()=>{
    try{
        await Promise.all([connectDB(),redisClient.connect()]);
        console.log('Redis connected successfully');
       //ng the problem router to handle problem-related routes
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
    })
    }   
    catch(err){
        console.error('Redis connection error:', err);
    }
}

InitializeConnection();
