const {Router} = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const resetEmail = require('../emails/reset');
const emails = require('../emails/reg');
const {validationResult} = require('express-validator');
const {regValidators} = require('../utils/validator');
const router = Router();

router.get('/login', async (req, res)=>{
    res.render('auth/login', {
        title: 'Авторизация', 
        isLogin:true, 
        error: req.flash('err'),
        passErr: req.flash('pass-match'),
        loginErr: req.flash('err-login'),
        loginPassErr: req.flash('err-pass')
    });
});

router.post('/login', async (req, res)=>{
    try{
        const {email, password} = req.body;
        const visitor = await User.findOne({email});
        if(visitor){
            // const isSame = password === visitor.password;
            const isSame = await bcrypt.compare(password, visitor.password);
            if(isSame){
                req.session.user = visitor;
                req.session.isAuthenticated = true;
                 req.session.save(err=>{
                     if(err) throw err;
                     res.redirect('/');
                });
            }
            else{
                req.flash('err-pass', 'Неправильный пароль!');
                res.redirect('/auth/login#login');
            }
        }
        else{
            req.flash('err-login', 'Такого пользователя не существует!');
            res.redirect('/auth/login#login');
        }
    }
    catch(err){console.log(`Ошибка: ${err}`)}
});

router.get('/logout', async (req, res)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    });
});

router.get('/password/:token', async (req, res)=>{
    if(!req.params.token){
      return res.redirect('/auth/login');
    }
    try{
      const user = await User.findOne({
        resetToken:req.params.token,
        resetTokenExp: {$gt: Date.now()},
      });
      if(!user) return res.redirect('/auth/login');
      else{
        res.render('auth/password', {
          title:'Восстановление доступа',
          error:req.flash('error'),
          userId: user._id.toString(),
          token:req.params.token
        });
      }
    }
    catch(err){console.log(`ОШИБКА! ${err}`)}
  });

router.post('/register', regValidators, async (req, res)=>{
    try{
        const {name, email, password} = req.body;
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            req.flash('err', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register');
        }
            const hashPase = await bcrypt.hash(password, 10);
            const user = new User({
                email, name, password: hashPase, cart: {items:[]}
            });
            await user.save();
            res.redirect('/auth/login#login');
            await emails(email);
    }
    catch(err) {console.log(`Ошибка: ${err}`)}
});

router.get('/reset', (req, res) =>{
    res.render('auth/reset', {title:'Восстановление пароля',
    error:req.flash('error'),
    });
});

router.post('/reset', (req, res) =>{
    try{
        crypto.randomBytes(32, async (err, buffer) =>{
            if(err){
                req.flash('error', 'Возникла непредвиденная ошибка, повторите попытку позже');
                return res.redirect('/auth/reset');
            }
            const token = buffer.toString('hex');
            const candidate = await User.findOne({email:req.body.email});
            if(candidate){
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + (3600 * 10);
                await candidate.save();
                await resetEmail(candidate.email, token);
                res.redirect('/auth/login');
            }
            else{
                req.flash('error', 'Данный email не зарегистрирован в системе');
                res.redirect('/auth/reset');
            }
        });
    }
    catch(err) {console.log(`Ошибка: ${err}!!!`)}
});

router.post('/password', async (req, res) =>{
    try{
        const user = await User.findOne({
            _id:req.body.userId,
            resetToken:req.body.token,
            resetTokenExp: {$gt: Date.now()}
        });
        if(user){
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login');
        }
        else{
            req.flash('loginError', 'Время жизни токена истекло');
            res.redirect('/auth/login');
        }
    }
    catch(err){console.log(`Ошибка: {$err}`)}
});

module.exports = router;