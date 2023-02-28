const {Router} = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const Book = require('../models/book');
const { validationResult } = require('express-validator');
const { booksValidators } = require('../utils/validator');
const router = Router();

router.get('/', auth, (req, res)=>{
    res.render('add', {title:'Добавить книгу', isAdd:true});
});

router.post('/', auth, booksValidators, async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('add', {
            title:'Добавить книгу',
            isAdd:true,
            error: errors.array()[0].msg,
            data:{
                title: req.body.title,
                price: req.body.price,
                image: req.body.image,
            }
        });
    }
    const books = new Book({
        title: req.body.title,
        price: req.body.price,
        image: req.body.image,
        userId: req.user._id});
        try{
            await books.save();
            res.redirect('/books');
        }
        catch(err) {console.log(`Ошибка: ${err}`);}
});


module.exports = router;