const express = require('express');
let {verificaToken, verificaAdmin_Role} = require('../middlewares/autenticacion');
let app = express();
let Categoria = require('../models/categoria');

//Mostrar todas las categorias
app.get('/categoria',verificaToken,  (req, res) => {
  Categoria.find({})
            .sort('descripcion') //ordena los resultados
            .populate('usuario', 'nombre email') //carga informacion de la coleccion referenciada
            .exec( (err, categorias)=> {
              if(err){
                return res.status(500).json({
                  ok: false,
                  err
                });
              }
              res.json({
                ok: true,
                categorias
              })
    });

});

//Mostrar una categoria por ID
app.get('/categoria/:id', (req, res) => {

   let id= req.params.id;
  Categoria.findById(id, (err, categoriaDB) =>{
    if(err){
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if(!categoriaDB){
      return res.status(500).json({
        ok: false,
        err: {
          message: 'El ID no es correcto'
        }
      })
    }
    res.json({
      ok: true,
      categoria: categoriaDB
    })
  });

});

//Crear categorias
app.post('/categoria',verificaToken,  (req, res) => {
    let body = req.body;
    let categoria = new Categoria({
      descripcion: body.descripcion,
      usuario: req.usuario.id
    });

    categoria.save( (err, categoriaDB) =>{
      if(err){
        return res.status(500).json({
          ok: false,
          err
        });
      }
      if(!categoriaDB){
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        categoria: categoriaDB
      })
    });
});

//Actualizar categorias
app.put('/categoria/:id', verificaToken,  (req, res) => {
  let id = req.params.id;
  let body = req.body;

  let descCategoria = {
    descripcion: body.descripcion
  }
  Categoria.findByIdAndUpdate( id, {new: true,descCategoria, runValidators: true}, (err, categoriaDB) =>{
    if(err){
      return res.status(500).json({
        ok: false,
        err
      });
    }
    if(!categoriaDB){
      return res.status(400).json({
        ok: false,
        err
      });
    }
    res.json({
      ok: true,
      categoria: categoriaDB
    })
  });
});

//Dlete categoria
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role],(req, res) => {
  //Solo un administrador puede borrar categorias
  let id = req.params.id;
  Categoria.findByIdAndRemove( id, (err, categoriaDB) =>{
    if(err){
      return res.status(500).json({
        ok: false,
        err: {
          message: 'El id no existe'
        }
      });
    }
    if(!categoriaDB){
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Categoria borrada.'
        }
      })
    }
  });

});

module.exports = app;
