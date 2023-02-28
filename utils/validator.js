const {body} = require('express-validator');
const User = require('../models/user');

exports.regValidators = [
    body('email')
    .isEmail().withMessage('Введите корректный email')
    .custom(async (value, {req})=>{
        try{
            const user = await User.findOne({email: value});
            if(user) return Promise.reject('Такой email уже существует!');
        }
        catch(err) {console.log(err)}
    }).normalizeEmail(),
    body('password', 'Пароль должен быть минимум 8 символов')
    .isLength({min:0, max:25}).isAlphanumeric(),
    body('confirm').custom((value, {req})=>{
        if(value !== req.body.password){
            throw new Error('Пароли не совпадают');
        }
        return true;
    }),
    body('name').isLength({min:3}).withMessage('Имя слишком короткое! (мин. 3 символа)')
];

exports.booksValidators = [
    body('title')
        .isLength({min:5}).withMessage('Минимальная длина названия составляет 5 символов!')
        .trim(),
        body('price').isNumeric().withMessage('Введите корректную цену!'),
        body('image', 'Введите правильный url').isURL().trim()
];