const moongose = require('mongoose')
const Schema = moongose.Schema;

let categoriaSchema = new Schema({
  descripcion: {type: String, unique: true, reqiured: [true, "Es necesario agregar una descripción"]},
  usuario: {type: Schema.Types.ObjectId, ref: 'Usuario'}
});

module.exports = moongose.model('Categoria', categoriaSchema);
