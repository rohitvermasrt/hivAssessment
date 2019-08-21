import express from 'express';
import bodyParser from 'body-parser'
import router from './routes/index.js';
// Set up the express app
const app = express();
const path = require("path")

// Parse incoming requests data
app.use(bodyParser.json({limit:1024*1024*20, type:'application/json'}));
app.use(bodyParser.urlencoded({ extended:true,limit:1024*1024*20,type:'application/x-www-form-urlencoding' }));
app.use(router);
app.use(express.static(path.join(__dirname,'public')))
// get all todos

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})