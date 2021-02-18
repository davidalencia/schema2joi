const { schema2joi, schema2joiParam } = require('../index')
const mongoose =  require('mongoose');
const joi = require('joi')

const blogSchema = new mongoose.Schema({
  title:  {
    required: true,
    type: String, // String is shorthand for {type: String}
  },
  author: String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    extra: {
      n: Number
    },
    votes: Number,
    favs:  Number
  },
  extra: {},
  eggs: {
    type: Number,
    min: [6, 'Too few eggs'],
    max: 12
  },

});



let j = schema2joiParam(blogSchema)
console.log(j);

// let val = j.validate({
//   title: 'titulo',
//   author: 'Raul Jimenez',
//   comments: [{
//     body: 'cuerpo',
//     date: new Date()
//   }],
//   date: new Date(),
//   hidden: true,
//   meta: {
//     extra: {
//       n: 12
//     },
//     votes: 12,
//     favs: 1
//   },
//   eggs: 8
// })