const { func } = require('joi')
const Joi = require('joi')

const mongoId = {
  method: (value, helpers) => {
    if (!ObjectId.isValid(value))
      return helpers.error("any.invalid");
    return value;
  },
  description: "Mongo id checker, for Joi"
}


function pathInfo(path, schema) {
  let raw = schema[path]
  return {
    path: raw.path, 
    type: raw.instance,
    required: raw.isRequired || false,
    validators: raw.validators || [],
    paths: raw.schema? schemaInfo(raw.schema) : null
  }
}


function schemaInfo(schema) {
  let info = {}
  for(const key in schema.paths){
    item = pathInfo(key, schema.paths)
    nestedPath = item.path.split('.')
    if(nestedPath.length==1)
      info[item.path] = item
    else{
      let subpath = info
      let last = nestedPath.pop()
      for(const path of nestedPath){
        if(!subpath[path])
          subpath[path] = {
            path,
            type: 'Schema',
            required: false,
            validators: [],
            paths : {}
          }
        subpath = subpath[path].paths
      }
      subpath[last] = {
        ...item,
        path: last,
      }
    }
  }
  return info
}

function parseInfo(joiInfo, info) {
  for(const key in info){
    let type = info[key].type
    if('String'==type)
      type = Joi.string()
    else if('Number'==type)
      type = Joi.number()
    else if('Date'==type)
      type = Joi.date()
    else if ('Buffer'==type)
      type = Joi.array().items(Joi.number())
    else if('Boolean'==type)
      type = Joi.boolean()
    else if('ObjectID'==type)
      type = Joi.custom(mongoId.method, mongoId.description)
    else if('Array'==type)
      type = Joi.array().items(Joi.object(parseInfo({}, info[key].paths)))
    else if('Decimal128'==type)
      type = Joi.number()
    else if('Mixed'==type)
      type = Joi.any()
    else if('Schema'==type)
      type = Joi.object(parseInfo({}, info[key].paths))
    joiInfo[key] = type
  }
  
  return joiInfo
}

function schema2joiParam(params) {
  let info = schemaInfo(schema)
  return parseInfo({}, info)
}

function schema2Joi(schema, options={}) {
  options = {
    required: options.required || false,

  }
  let info = schemaInfo(schema)
  let joiObject = Joi.object(parseInfo({}, info))
  return joiObject
}

exports.schema2joi = schema2Joi
exports.schema2joiParam = schema2joiParam