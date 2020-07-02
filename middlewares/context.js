'use strict';
const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose');

async function context(ctx, next) {
  ctx.Joi = Joi;
  ctx._ = _;
  ctx.mongoose = mongoose;
  ctx.validate = function(schema, valueObj = this.request.body) {
    const { error, value } = Joi.validate(valueObj, schema);
    if (!error) return value;
    error.errors = error.message;
    this.throw(422, error);
  };
  ctx.helper = {
    validateObj(type) {
      let obj = {};
      switch (type) {
        case '_id': {
          obj = ctx.Joi.string().regex(/^[a-f\d]{24}$/i);
          break;
        }
        case 'user': {
          break;
        }
        default: break;
      }
      return obj;
    }
  };
  await next();
}

module.exports = context;
