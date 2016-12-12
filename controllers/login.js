var express = require('express')
var logger = require('../helpers/logger.js');
var selectParser = require('../helpers/selectParser.js');
var User = require('../models/userinfo.js');
var hashGen = require('../helpers/hashGen.js');
var passport = require('passport');
var router = express.Router()

//middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log("finally in login Request");
  console.log('Time: ', Date.now())
  next();
})

router.post('/', passport.authenticate('local-signin', {
        successRedirect : '/airlineReservation/search', // redirect to the secure profile section
        failureRedirect : '/airlineReservation', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
module.exports = router