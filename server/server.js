require('./config/config');
const express = require('express')


const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Configuracion de rutas
app.use( require('./routes/index') );


mongoose.connect(process.env.URLDB, (err, res) => {
  if (err ) throw err;
  console.log('Base de datos On-line');
});

app.listen(process.env.PORT, () =>{
  console.log('Escuchano puerto: ', process.env.PORT);
})
