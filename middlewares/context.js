'use strict';
const Joi = require('joi');

async function context(ctx, next) {
  ctx.Joi = Joi;
  ctx.validate = function(schema, valueObj = this.request.body) {
    const { error, value } = Joi.validate(valueObj, schema);
    if (!error) return value;
    error.errors = error.message;
    this.throw(422, error);
  };
  await next();
};

module.exports = context;
