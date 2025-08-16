import Joi from "joi";

export const userRegisterValidator = Joi.object({
    name: Joi.string().required().min(3),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(100)
})

export const userLoginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(100)
})