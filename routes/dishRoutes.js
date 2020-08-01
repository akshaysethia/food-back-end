const router = require('express').Router();
const multer = require('multer');
const Dish = require('../models/dishModel');
const User = require('../models/userModel');
const sharp = require('sharp');
const path = require('path');
const passport = require('passport');

const storage = multer.memoryStorage();

var imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files !', false));
    } else {
        cb(null, true);
    }
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });

router.post(
    '/addImage',
    passport.authenticate('jwt', { session: false }),
    upload.single('image'),
    async (req, res) => {
        if (req.user.admin) {
            if (req.file) {
                await sharp(req.file.buffer)
                    .resize(500, 500, { fit: 'fill' })
                    .toFile(
                        path.join(__dirname, '../public/images/') +
                            req.file.originalname
                    );
                res.json({
                    success: true,
                    image: `/images/${req.file.originalname}`,
                });
            } else {
                res.json({ success: false, image: null });
            }
        } else {
            res.json({ success: false, image: null });
        }
    }
);

router.post(
    '/addDish',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        if (req.user.admin) {
            var dish = new Dish({
                name: req.body.name,
                image: req.body.image,
                cost: req.body.cost,
                description: req.body.description,
                featured: req.body.featured,
                veg: req.body.veg,
                places: req.body.places,
            });
            Dish.create(dish)
                .then((newDish) => {
                    if (newDish) {
                        res.json({ success: true, message: 'Dish Created !' });
                    } else {
                        res.json({
                            success: false,
                            message: 'Dish could not be Created !',
                        });
                    }
                })
                .catch((err) => console.log('An Error Occurred: ', err));
        }
    }
);

router.get('/getDishes', (req, res) => {
    Dish.find({})
        .then((dishes) => {
            if (dishes) {
                res.json({ success: true, dishes: dishes });
            } else {
                res.json({ success: false, dishes: null });
            }
        })
        .catch((err) => console.log('An Error Occurred: ', err));
});

router.get('/featuredDishes', (req, res) => {
    Dish.find({ featured: true })
        .then((dishes) => {
            if (dishes) {
                res.json({ success: true, dishes: dishes });
            } else {
                res.json({ success: false, dishes: null });
            }
        })
        .catch((err) => console.log('An Error Occurred: ', err));
});

router.get(
    '/orders',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        if (!req.user.admin) {
            User.findById(req.user.id)
                .populate('orders.dish')
                .then((reqUser) => {
                    if (reqUser) {
                        res.json({
                            success: true,
                            message: 'Orders Recieved !',
                            orders: reqUser.orders,
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'Orders Unavaiable !',
                            orders: null,
                        });
                    }
                })
                .catch((err) => console.log('An Error Occurred: ', err));
        } else {
            res.json({
                success: false,
                message: 'Admins Not Allowed To Order !',
            });
        }
    }
);

router.delete(
    '/removeOrder/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        var o = [];
        if (!req.user.admin) {
            User.findById(req.user.id)
                .then((reqUser) => {
                    if (reqUser) {
                        o = reqUser.orders;
                        console.log(o);
                        if (!o) {
                            res.json({ success: false, message: 'Nothing To Remove !' });
                        } else {
                            o.forEach(order => {
                                console.log('Order Id: ', order.dish);
                                if (order.dish == req.params.id) {
                                    order.quantity -= 1;
                                }
                            });
                            var result = o.filter(order => order.quantity > 0);
                            console.log('Result: ', result);

                            reqUser.orders = result;

                            reqUser.save()
                                .then((upUser) => {
                                    if (upUser) {
                                        res.json({ success: true, message: 'Dish Removed !' });
                                    } else {
                                        res.json({ success: false, message: 'Dish Could not be Removed !' });
                                    }
                                })
                                .catch(err => console.log('An Error Occurred: ', err));
                        }
                    }
                })
                .catch((err) => console.log('An Error Occurred: ', err));
        } else {
            res.json({
                success: false,
                message: 'Admins Not Allowed To Order !',
            });
        }
    }
);

module.exports = router;
