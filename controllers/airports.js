var express = require('express')
var logger = require('../helpers/logger.js');
var selectParser = require('../helpers/selectParser.js');
var airport_model = require('../models/airports.js');
var router = express.Router()

//middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
//define the home page route
router.get('/', function (req, res) {
  logger.log('info','got request to fetch Airports');
  logger.log('info','select statement is'+req.query["$select"]);
  res.set({
  'Content-Type': 'application/json',
  "Access-Control-Allow-Origin": '*'
  });
  airport_model.fetchAll(selectParser(req.query["$select"]),{},function(err,rows,feilds){
	res.send(rows);
  });
});
module.exports = router