// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load the models
var models  = require('../models');

var mysql = require('mysql');
var config = require('../config/database.json');

var connection = mysql.createConnection({
    host     : config.host,
    user     : config.DBUser,
    password : config.DBPassword
});

connection.query('USE ' + config.schema);

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    /*passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    }); */

    passport.deserializeUser(function(id, done) {
        connection.query("select * from User where id = "+id,function(err,rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            connection.query("select * from User where username = '"+username+"'",function(err,rows){
                if (err)
                    return done(err);
                if (rows.length) {
                    // FIXME: req.flash?
                    return done(null, false, { message: 'Username taken.' });
                } else {
                        // if there is no user with that email
                        // create the user
                        var newUser = new Object();

                        newUser.username    = username;
                        //newUserMysql.password = newUserMysql.generateHash(password);
                        newUser.password = password;

                        models.User.create({
                            username: username,
                            password: password
                        }).then(function (result) {
                            console.log(result);
                            newUser.id = result.id;
                            return done(null, newUser);
                        });
                }
            });
        }));

    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form

            connection.query("SELECT * FROM `User` WHERE `username` = '" + username + "'",function(err,rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, { message: 'Incorrect username.' }); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!( rows[0].password == password))
                    return done(null, false, { message: 'Wrong password.' }); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);

            });
        }));

};
