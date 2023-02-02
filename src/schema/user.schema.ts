import * as Joi from 'joi';

export const createUserSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  countryCode: Joi.string().required(),
  mobileNo: Joi.string().required(),
  profilePicture: Joi.string().optional(),
  password: Joi.string().required().min(6),
  userType: Joi.number().required(),
  totalBill: Joi.alternatives().conditional('userType', {
    is: 1,
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  agencyId: Joi.alternatives().conditional('userType', {
    is: 1,
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  address1: Joi.alternatives().conditional('userType', {
    is: 2,
    then: Joi.object({
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      country: Joi.string().optional(),
      street: Joi.string().optional(),
      state: Joi.string().optional(),
      postalCode: Joi.number().optional(),
      type: Joi.string().optional(),
      coordinates: Joi.array().optional(),
    }).required(),
    otherwise: Joi.forbidden(),

  }),
  address2: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
    street: Joi.string().optional(),
    state: Joi.string().optional(),
    postalCode: Joi.number().optional(),
    type: Joi.string().optional(),
    coordinates: Joi.array().optional(),
  }).optional(),

});


export const editUserSchema = Joi.object({
  userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  fullName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  countryCode: Joi.string().optional(),
  mobileNo: Joi.string().optional(),
  profilePicture: Joi.string().optional(),

});

