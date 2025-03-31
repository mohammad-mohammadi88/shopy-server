const express = require('express');
const router = express.Router();

const authMiddleware = require('./middlewares/auth')

const authRouter = require('./auth');
const usersRouter = require('./users');
const productsRouter = require('./products');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.json({ success : 'node shop api'});
});

/* GET home page. */
router.get('/user', authMiddleware , (req, res, next) => {
  res.json({ status : 'success' , user : { ...req.user ,   permissions : [
    'see_products',
    'see_users',
    'edit_product',
    'delete_product',
    'edit_user',
    'delete_user'
  ]} });
});

router.use('/auth' , authRouter);
router.use('/users' , usersRouter);
router.use('/products'  , productsRouter);

module.exports = router;
