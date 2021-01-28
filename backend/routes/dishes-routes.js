const express = require('express');
const { check } = require('express-validator');

const dishesControllers = require('../controllers/dishes-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid', dishesControllers.getDishById); 

router.get('/user/:uid', dishesControllers.getDishesByUserId);

router.use(checkAuth);

router.post(
    '/',
    fileUpload.single('image'),
    [
        check('title')
        .not()
        .isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address')
        .not()
        .isEmpty()
    ],
    dishesControllers.createDish
    );

router.patch(
    '/:pid',
    [
        check('title')
        .not()
        .isEmpty(),
        check('description').isLength({ min: 5 })
    ],
    dishesControllers.updateDish
    );

router.delete('/:pid', dishesControllers.deleteDish);

module.exports = router;