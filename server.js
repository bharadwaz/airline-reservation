var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var airports = require('./controllers/airports.js');
var signup = require('./controllers/signup.js');
var login = require('./controllers/login.js');
var schedule = require('./controllers/schedule.js');
var search = require('./controllers/search.js');
var passport = require('passport');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var flash    = require('connect-flash');
var tickets = require('./controllers/ticket.js');
var cancel = require('./controllers/cancellation.js')
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port);
});
app.use(express.static('public'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(cookieParser());
app.use(urlencodedParser);
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 
var setupPassportStrategy = require('./config/passportConfig.js');
setupPassportStrategy(passport);
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/airlineReservation/airports',airports);
app.use('/airlineReservation/signup',signup);
app.use('/airlineReservation/login',login);
app.use('/airlineReservation/schedules',schedule);
app.use('/airlineReservation/search',search);
app.use('/airlineReservation/tickets',tickets);
app.use('/airlineReservation/cancel',cancel);
app.get("/airlineReservation",function(req,res){
	res.render('login',{});
});

 