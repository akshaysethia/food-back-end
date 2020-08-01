const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { model } = require('../models/userModel');

router.post('/register', (req, res) => {
    var user = new User({
        name: req.body.name,
        email: req.body.email,
        admin: req.body.admin,
        veg: req.body.veg,
    });

    User.findOne({ email: user.email })
        .then((foundUser) => {
            if (foundUser) {
                res.json({ success: false, message: 'User Already Exists !' });
            } else {
                bcrypt
                    .genSalt(15)
                    .then((salt) => {
                        if (salt) {
                            bcrypt
                                .hash(req.body.password, salt)
                                .then((hash) => {
                                    if (hash) {
                                        user.password = hash;
                                        User.create(user)
                                            .then((regUser) => {
                                                if (regUser) {
                                                    res.json({
                                                        success: true,
                                                        message:
                                                            'User Created !',
                                                    });
                                                } else {
                                                    res.json({
                                                        success: false,
                                                        message:
                                                            'User could not be Created !',
                                                    });
                                                }
                                            })
                                            .catch((err) =>
                                                console.log(
                                                    'An Error Occurred: ',
                                                    err
                                                )
                                            );
                                    } else {
                                        res.json({
                                            success: false,
                                            message:
                                                'Hash could not be Generated !',
                                        });
                                    }
                                })
                                .catch((err) =>
                                    console.log('An Error Occurred: ', err)
                                );
                        } else {
                            res.json({
                                success: false,
                                message: 'Salt could not be Generated !',
                            });
                        }
                    })
                    .catch((err) => console.log('An Error Occurred: ', err));
            }
        })
        .catch((err) => console.log('An Error Occurred: ', err));
});

router.post('/login', (req, res) => {
    var { email, password } = req.body;

    User.findOne({ email: email })
        .then((user) => {
            if (user) {
                bcrypt
                    .compare(password, user.password)
                    .then((match) => {
                        if (match) {
                            const jsonuser = { _id: user._id };
                            const token = jwt.sign(
                                jsonuser,
                                process.env.SECRET,
                                { expiresIn: 14400000 }
                            );
                            res.json({
                                success: true,
                                message: 'Logged In Successfully !',
                                token: 'JWT ' + token,
                                user: {
                                    name: user.name,
                                    email: user.email,
                                    admin: user.admin,
                                    veg: user.veg,
                                },
                            });
                        } else {
                            res.json({
                                success: false,
                                message: 'Incorrect Password !',
                                user: null,
                            });
                        }
                    })
                    .catch((err) => console.log('An Error Occurred: ', err));
            } else {
                res.json({
                    success: false,
                    message: 'No User with such Email !',
                    user: null,
                });
            }
        })
        .catch((err) => console.log('An Error Occurred: ', err));
});

router.get('/checkToken', (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
            console.log('An Error Occurred: ', err);
        } else if (!user) {
            res.json({ success: false, message: 'InValid Jwt !', user: null });
        } else {
            res.json({
                success: true,
                message: 'Valid Jwt !',
                user: {
                    name: user.name,
                    email: user.email,
                    admin: user.admin,
                    veg: user.veg,
                },
            });
        }
    })(req, res);
});

router.get(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            user: {
                name: req.user.name,
                email: req.user.email,
                admin: req.user.admin,
                veg: req.user.veg,
            },
        });
    }
);

router.put(
    '/addOrder',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        var flag = 1;
        var o = [];
        o.push({ dish: req.user.id, quantity: 1 });
        if (!req.user.admin) {
            User.findById(req.user._id)
                .then((reqUser) => {
                    if (reqUser) {
                        o = reqUser.orders;
                        o.forEach((order) => {
                            if (order.dish._id == req.body.id) {
                                order.quantity += 1;
                                flag = 0;
                            }
                        });
                        if (flag == 1) {
                            o.push({ dish: req.body.id, quantity: 1 });
                        }

                        reqUser.orders = o;

                        reqUser
                            .save()
                            .then((upUser) => {
                                if (upUser) {
                                    res.json({
                                        success: true,
                                        message: 'Dish Added to Cart !',
                                    });
                                } else {
                                    res.json({
                                        success: false,
                                        message: 'Dish could not be Added !',
                                    });
                                }
                            })
                            .catch((err) =>
                                console.log('An Error Occurred: ', err)
                            );
                    } else {
                        res.json({
                            success: false,
                            message: 'User Not Found !',
                        });
                    }
                })
                .catch((err) => console.log('An Error Occurred: ', err));
        } else {
            res.json({ success: false, message: 'Admins Not Allowed !' });
        }
    }
);

module.exports = router;
