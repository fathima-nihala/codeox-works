const express = require('express');
const mongoose = require('mongoose')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
app.use(cors())
dotenv.config()
app.use(express.json())
const users = require('./Router/userRoutes')



mongoose.connect(process.env.DB_LOCAL, {
}).then(con => {
    console.log(`MongoDb is connected to the host:${con.connection.host}`);
}).catch((err) => {
    console.log(err);
})


app.use('/user', users);

app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT}`);
})