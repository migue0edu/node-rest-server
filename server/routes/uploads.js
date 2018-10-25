const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

//Opciones predeterminadas
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {

  let tipo = req.params.tipo;
  let id = req.params.id;

  //Valida tipo
  let tiposVailidos = ['productos', 'usuarios'];
  if(tiposVailidos.indexOf( tipo) <0){
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Las tipos permitidos son: productos, usuarios'
      }
    });
  }
  if (!req.files)
    return res.status(400)
      .json({
        ok: false,
        err: {message: 'No files were uploaded'}
      });

  let archivo = req.files.archivo;
  let nombreA = archivo.name.split('.');
  let extension = nombreA[nombreA.length - 1];
  //Extenseiones  permitidas
  let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
  if(extensionesValidas.indexOf( extension) < 0){
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Las extensiones permitidas son: png jpg gif jpeg'
      }
    });
  }
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${ extension }`;
  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
      if (err)
        return res.status(500)
        .json({
          ok: false,
          err
        });

      //Imagen Cargada
      if(tipo === 'usuarios'){
        imagenUsuario(id, res, nombreArchivo);
      }else{
        imagenProducto(id, res, nombreArchivo);
      }
    });
});

function imagenUsuario(id, res, nombreArchivo){
  Usuario.findById(id, (err, usuarioBD) => {
    if(err){
      borraArchivo(nombreArchivo, 'usuarios');
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if(!usuarioBD){
      borraArchivo(nombreArchivo, 'usuarios');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario no existe'
        }
      });
    }
    borraArchivo(usuarioBD.img, 'usuarios');

    usuarioBD.img = nombreArchivo;
    usuarioBD.save((err, usuarioGuardado) => {
      res.json({
        ok: true,
        usuario: usuarioGuardado,
        img: nombreArchivo
      })
    });
  });
}

function imagenProducto(id, res, nombreArchivo){
  Producto.findById(id, (err, productoDB) => {
    if(err){
      borraArchivo(nombreArchivo, 'productos');
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if(!productoDB){
      borraArchivo(nombreArchivo, 'productos');
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no existe'
        }
      });
    }
    if(!productoDB.disponible){
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no disponible'
        }
      });
    }
    borraArchivo(productoDB.img, 'productos');

    productoDB.img = nombreArchivo
    productoDB.save((err, productoGuardado) => {
      res.json({
        ok: true,
        producto: productoGuardado,
        img: nombreArchivo
      })
    });

  });
}

function borraArchivo(nombreImagen, tipo){
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
  if(fs.existsSync(pathImagen)){
    fs.unlinkSync(pathImagen);
  }
}

module.exports = app;
