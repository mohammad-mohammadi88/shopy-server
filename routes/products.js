var express = require('express');
const validate = require('./middlewares/validate');
var router = express.Router();
const yup = require("yup");
const productRepo = require('./../app/db/repos/product')
const authMiddleware = require('./middlewares/auth')



const getProductSchema = yup.object({
  query : yup.object({
      page : yup.number(),
      per_page : yup.number(),
      productId: yup.string(),
  })
});

/* GET Products listing. */
router.get('/' , validate(getProductSchema), async (req, res, next) => {
  try {
      const { page=1 , per_page=10,productId } = req.query;
      let data;
      let total_page;
      if(productId) {
        data = await productRepo.getWithSameCategoryWithPaginate(page,per_page,productId)
        total_page = Math.ceil( await productRepo.getSameCategoryCount(productId) / per_page)
      } else {
        data = await productRepo.getWithPaginate(
          page,
          per_page,
        );
        total_page = Math.ceil( await productRepo.count() / per_page )
      }

      return res.status(200).json({ 
        data,
        total_page,
        status : 'success' 
      });  
      
  } catch (err) {
    next(err);
  }
});


// Get products id
router.get('/productsId' , validate(getProductSchema), async (req, res, next) => {
  try {
      const { page=1 , per_page=10 } = req.query;

      let products = await productRepo.getProductsIdWithPaginate(
        page,
        per_page,
      );

      const total_page = Math.ceil( await productRepo.count() / per_page )

      return res.status(200).json({ 
        data :products ,
        total_page,
        status : 'success' 
      });  
      
  } catch (err) {
    next(err);
  }
});


const getUserProductsSchema = yup.object({
  query : yup.object({
      page : yup.number(),
      per_page : yup.number(),
  }),
  params: yup.object({
    user_id: yup.number().required()
  })
});

/* GET Products listing. */
router.get('/userProducts/:user_id' , validate(getUserProductsSchema), async (req, res, next) => {
  try {
      const { user_id } = req.params
      const { page=1 , per_page=10 } = req.query;

      let products = await productRepo.getUserProductsWithPaginate(
        page,
        per_page,
        user_id
      );

      console.log(await productRepo.userProductCount(user_id))
      const total_page = Math.ceil( await productRepo.count() / per_page )

      return res.status(200).json({ 
        data :products ,
        total_page,
        status : 'success' 
      });  
      
  } catch (err) {
    next(err);
  }
});


const singleProductSchema = yup.object({
  params : yup.object({
    id : yup.string().required().test(
        'check-product-is-exists',
        'محصول مورد نظر برای حذف وجود ندارد',
        async val => !! await productRepo.findBy('id' , val)
      )
  })
});
/* GET Single Product */
router.get('/:id', validate(singleProductSchema)  , async (req, res, next) => {
  try {
    console.log(Math.random())
    let product = await productRepo.findBy('id' , req?.params?.id);

    return res.status(200).json({ product , status : 'success' });  
  } catch (err) {
    next(err)
  }
});



const createProductSchema = yup.object({
  body : yup.object({
      title : yup.string(),
      body : yup.string(),
      category : yup.string(),
      price : yup.number()
    })
});

/* Post Create Product */
router.post('/create' , authMiddleware, validate(createProductSchema) , async (req, res, next) => {
    try {
      const { title , body , category , price } = req.body;
      const user_id = req?.user?.id 
      await productRepo.create({
        title,
        body,
        category,
        price,
        user_id
      });

      return res.status(200).json({ status : 'success' });  
      
  } catch (err) {
    next(err);
  }
});


const updateProductSchema = yup.object({
  params : yup.object({
      id : yup.string().required().test(
        'check-product-is-exists',
        'محصول مورد نظر برای ویرایش وجود ندارد',
        async val => !! await productRepo.findBy('id' , val)
      )
  }),
  body : yup.object({
      title : yup.string(),
      body : yup.string(),
      category : yup.string(),
      price : yup.number()
  })
});

/* Post Update Product */
router.patch('/:id/update' ,authMiddleware, validate(updateProductSchema) ,async (req, res, next) => {
  try {
    const { title=undefined , body=undefined , category=undefined , price=undefined } = req.body;
    await productRepo.update(req?.params?.id , { title , body , category , price });

    return res.status(200).json({ status : 'success' });  
  } catch (err) {
    next(err);
  }
});


const deleteProductSchema = yup.object({
  params : yup.object({
    id : yup.string().required().test(
        'check-product-is-exists',
        'محصول مورد نظر برای حذف وجود ندارد',
        async val => !! await productRepo.findBy('id' , val)
      )
  })
});

// /product/1/delete
router.delete('/:id/delete' ,authMiddleware, validate(deleteProductSchema) , (req, res, next) => {
  try {
    productRepo.delete(req.params.id);

    return res.status(200).json({ status : 'success' });  
  }  catch (err) {
    next(err);
  }
});


module.exports = router;
