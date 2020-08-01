const pasport = require('passport');
const JwtStartegy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/userModel');
const passport = require('passport');

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
opts.secretOrKey = process.env.SECRET;

passport.use(new JwtStartegy(opts, function (info, done) {
    User.findOne({ _id: info._id }, function (err, user) {
        if (err) return done(err, false);
        else if (!user) return done(null, false);
        else return done(null, user);
    });
}));