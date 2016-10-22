var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ip = require('ip');
var app = express();
var path = require('path');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var session      = require('express-session');

var config = require('./config/database.json');

var models = require('./models/index.js');


require('./config/passport')(passport); // pass passport for configuration

// Start Server
// models.sequelize.sync() creates the tables if they don't exist
models.sequelize.sync().then(function () {
  var server = app.listen(config.serverPort, function(){
    var host = ip.address();
    var port = server.address().port;
    console.log('Server is listening on localhost', port);
  });
});

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'yaoiyaoi' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes.js')(app, passport); // load our routes and pass in our app and fully configured passport