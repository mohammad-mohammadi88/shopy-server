var express = require('express');
var router = express.Router();
const yup = require('yup')
const userRepo = require('../app/db/repos/user.js');
const validate = require('./middlewares/validate.js');
const phoneRegExp = /^[\+|0][1-9]{1}[0-9]{7,11}$/
/* GET users listing. */

router.get('/', async (req, res, next) => {
  try {
    const { page=1 , per_page=10 } = req.query;

    let users = await userRepo.getUsersWithPaginate(
      page,
      per_page,
    );

    const total_page = Math.ceil( await userRepo.count() / per_page )

    return res.status(200).json({ 
      data : users ,
      total_page,
      status : 'success' 
    });  
    
  } catch (err) {
    next(err);
  }
});


const singleUserSchema = yup.object({
  params : yup.object({
    id : yup.string().required().test(
        'check-user-is-exists',
        "The user not exists",
        async val => !! await userRepo.findBy('id' , val)
      )
  })
});
/* GET Single User */
router.get('/:id', validate(singleUserSchema)  , async (req, res, next) => {
  try {
    let user = await userRepo.findBy('id' , req?.params?.id);

    return res.status(200).json({ user , status : 'success' });  
  } catch (err) {
    next(err)
  }
});


const updateProductSchema = yup.object({
  params : yup.object({
      id : yup.string().required().test(
        'check-product-is-exists',
        'محصول مورد نظر برای ویرایش وجود ندارد',
        async val => !! await userRepo.findBy('id' , val)
      )
  }),
  body : yup.object({
      name : yup.string(),
      phone : yup.string().matches(phoneRegExp, 'Phone number is not valid').test('check-phone-exists' , 'the phone is already exists' , async function (value) {
        const user = await userRepo.findOtherBy('phone' , value,this.parent.id)
        console.log("🚀 ~ user:", user)
        return (typeof user === "undefined");
      }),
      isAdmin : yup.boolean()
  })
});

router.patch('/:id/update' , validate(updateProductSchema) , async (req, res, next) => {
  console.log('first')
  try {
      const { name=undefined, phone=undefined, isAdmin=undefined } = req?.body;
      
      await userRepo.update(req?.params?.id , { name , phone , isAdmin });
      
      return res.status(200).json({ status : 'success' });  
  } catch (err) {
    next(err);
  }
});


const deleteUserSchema = yup.object({
  params : yup.object({
    id : yup.string().required().test(
        'check-user-is-exists',
        "user doesn't exist for deleting",
        async val => !! await userRepo.findBy('id' , val)
      )
  })
});

// /users/1/delete
router.delete('/:id/delete' , validate(deleteUserSchema) , (req, res, next) => {
  try {
    userRepo.delete(req.params.id);

    return res.status(200).json({ status : 'success' });  
  }  catch (err) {
    next(err);
  }
});

module.exports = router;
 