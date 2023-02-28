const {Router} = require('express');
const auth = require('../middleware/auth');
const { validationResult } = require('express-validator');
const Books = require('../models/book');
const { booksValidators } = require('../utils/validator');
const router = Router();

function isOwner(books, req){
    return books.userId.toString() !== req.user._id.toString();
  }

router.get('/', async (req, res)=>{
   try{
    const books = await Books.find()
        .populate('userId', 'email name')
        .select('title price image');
     res.render('books', {
        title:'Книги',
        isBooks: true,
        userId: req.user ? req.user._id.toString() : null,
        books,
      csrf: req.csrfToken()
    });
   }
   catch(err){console.log(err)}
});

router.get('/:id', async (req, res)=>{
    try{
      const book = await Books.findById(req.params.id);
      res.render('books', {
        layout:'single-book',
        isBookSingle:true, 
        title:`Книга ${book.title}`,
        book});
    }
    catch(err){console.log(err)}
  });

  router.get('/:id/edit', auth, async (req, res)=>{
    if(!req.query.allow) return res.redirect('/');
    try{
      const books = await Books.findById(req.params.id);
      // console.log(books.userId);
      // console.log(books.userId.toString());
      if(isOwner(books, req)){
        return res.redirect('/books');
      }
      res.render('books-edit', {
      isBookSingle:true, 
      title:`Редактировать ${books.title}`,
      books
      });
    }
    catch(err){console.log(err)}
  });

  router.post('/edit', auth, booksValidators, async (req, res)=>{  
    try{
      const errors = validationResult(req);
      const id = req.body._id;
      const books = await Books.findById(id);
      if(!errors.isEmpty()){
        return res.status(422).redirect(`/books/${id}/edit?allow=true`);
      }
      if(isOwner(books, req)){
        return res.redirect('/books');
      }
      await Books.findByIdAndUpdate(id, { $set: {
        title:req.body.title, 
        price:req.body.price,
        image:req.body.image 
      }});
      res.redirect('/books');
    }
    catch(err){console.log(`ОШИБКА: ${err}`)}
  });

  router.post('/remove', auth, async (req, res)=>{
    try{
      await Books.deleteOne({
        _id: req.body._id,
        userId:req.user._id
      });
      res.redirect('/books');
    }
    catch(err){console.log(`Ошибка: ${err}`);}
  });

module.exports = router;