const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Dish = require('../models/dish');
const User = require('../models/user');

const getDishById = async (req, res, next) => {
    const dishId = req.params.pid;

    let dish;
    try {
        dish = await Dish.findById(dishId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a dish.',
            500
            );
            return next(error);
    }
    
    if (!dish) {
        const error = new HttpError(
            'Could not find a dish for the provided id.',
            404
            );
        return next(error);
    } 

    res.json({ dish: dish.toObject({ getters: true }) }); 
};

const getDishesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let userWithDishes;
    try {
        userWithDishes = await User.findById(userId).populate('dishes');
    } catch (err) {
        const error = new HttpError(
            'Fetching dishes failed, please try again later.',
            500
            );
        return next(error);
    }
    

    if (!userWithDishes || userWithDishes.dishes.length === 0) {
        return next(
        new HttpError('Could not find dishes for the provided user id.', 404)
        );
    } 

    res.json({ dishes: userWithDishes.dishes.map(dish => dish.toObject({ getters: true })) });
};

const createDish = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
            );
    }

    const { title, description, address, stars, name } = req.body;
    let coordinates;
    try {
    coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdDish = new Dish({
        title,
        description,
        stars,
        name,
        address,
        location: coordinates,
        image: req.file.path,
        creator: req.userData.userId
    });

    let user;
    try {
        user = await User.findById(req.userData.userId); 
    } catch (err) {
        const error = new HttpError(
            'Creating dish failed, please try again', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    //console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdDish.save({ session: sess });
        user.dishes.push(createdDish);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating dish failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ dish: createdDish });
};

const updateDish = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next( 
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const { title, description } = req.body;
    const dishId = req.params.pid;

    let dish;
    try {
        dish = await Dish.findById(dishId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update dish.',500);
        return next(error);
    }

    if (dish.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
            'You are not allowed to edit this dish.',401);
        return next(error);
    }

    dish.title = title;
    dish.description = description;

    try {
        await dish.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update dish.', 
            500
            );
        return next(error);
    }

    res.status(200).json({ dish: dish.toObject({ getters: true }) });
};

const deleteDish = async (req, res, next) => {
    const dishId = req.params.pid;

    let dish;
    try {
        dish = await Dish.findById(dishId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete dish.', 500);
        return next(error);
    }

    if (!dish) {
        const error = new HttpError('Could not find dish for this id.', 404);
        return next(error);
    }
    
    if (dish.creator.id !== req.userData.userId) {
        const error = new HttpError(
            'You are not allowed to delete this dish.',401);
        return next(error);
    }

    const imagePath = dish.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await dish.remove({ session: sess });
        dish.creator.dishes.pull(dish);
        await dish.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete dish.',500);
            return next(error);
    }

    fs.unlink(imagePath, err => {
        console.log(err);
    });

    res.status(200).json({ message: 'Deleted dish.' });
};

exports.getDishById = getDishById;
exports.getDishesByUserId = getDishesByUserId;
exports.createDish = createDish;
exports.updateDish = updateDish;
exports.deleteDish = deleteDish;
