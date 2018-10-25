const express = require('express');

const {verificaToken} = require('../middlewares/autenticacion')

let app = express();
let Producto = require('../models/producto');

//Obtener productoSchema
app.get('/productos', verificaToken, (req, res) => {
  //trae todos los productos
  //populate: usuario categorias
  //paginado
  let desde = req.query.desde || 0;
  desde = Number(desde);
  let paginado = req.query.paginado || 5;
  paginado = Number(paginado);
  Producto.find({disponible: true})
          .populate('usuario', 'nombre email')
          .populate('Categoria', 'descripcion')
          .limit(paginado)
          .exec((err, productos) =>{
            if(err){
              return res.status(500).json({
                ok: false,
                err
              });
            }
            res.json({
              ok: true,
              productos
            });
          });
});

app.get('/productos/:id', verificaToken,  (req, res) => {
  let id= req.params.id;
  Producto.findById(id)
          .populate('usuario', 'nombre email')
          .populate('categoria', 'descripcion')
          .exec((err, product) =>{
            if(err){
              return res.status(500).json({
                ok: false,
                err
              });
            }
            if(!product){
              return res.status(400).json({
                ok: false,
                err: {
                  message: 'El ID no es correcto'
                }
              });
            }
            res.json({
              ok: true,
              producto: product
            });
          });
});

//Bucar productos
app.get('/productos/buscar/:termino', verificaToken, (req,res) => {
  let termino = req.params.termino;
  let regex = new RegExp(termino, 'i');

  Producto.find({nombre: regex})
          .populate('categoria', 'nombre')
          .exec((err, productos) => {
            if(err){
              return res.status(500).json({
                ok: false,
                err
              });
            }
          });
});

app.post('/productos', verificaToken, (req, res) => {
  let body = req.body;

  let producto = new Producto({
    usuario: req.usuario._id,
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoria
  })

  producto.save((err, product) =>{
    if(err){
      return res.status(500).json({
        ok:false,
        err
      })
    }
    res.status(201).json({
      ok: true,
      producto: product
    })
  });
});

app.put('/productos/:id', verificaToken,  (req, res) => {
  let id = req.params.id;
  let body = req.body;

  let nombre = body.nombre
  let precio = body.precioUni
  let descripcion = body.descripcion
  let disponible = body.disponible

  Categoria.findByIdAndUpdate(id, {new: true, nombre, precio, descripcion, disponible, runValidators: true},(err, product) =>{
    if(err){
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if(!product){
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      producto: product
    })
  });
});

app.delete('/productos/:id', verificaToken, (req, res) => {
  let id = req.params.id;
  Producto.findByIdAndRemove(id, (err, product) => {
    if(err){
      return res.status(500).json({
        ok: false,
        err: {
          message: 'Error al conectar la base de datos.'
        }
      });
    }
    if(!product){
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El ID no existe.'
        }
      });
    }
      product.disponible = false
      product.save( (err, productBorrado) => {
        if(err){
          return res.status(500).json({
            ok: false,
            err: {
              message: 'Error al conectar la base de datos.'
            }
          });
        }
      });
      res.json({
        ok: true,
        producto: productBorrado,
        mensaje: 'Producto borrado.'
      })
  });
});

module.exports = app;
