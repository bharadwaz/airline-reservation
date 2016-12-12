var mysql      = require('mysql');
var conf = require('../config/db_conf.js');
var logger = require('../helpers/logger.js');
var connection = mysql.createConnection({
  host     : conf.host,
  user     : conf.user,
  password : conf.password,
  database : conf.database
});
function fetchAll(cols,options,callback){
	if(!cols || !cols.length > 0){
		cols = [];
		cols.push('id');
		cols.push('name');
	}
	var selectString = "select ";
	for(var i = 0 ; i < cols.length-1; i++){
		selectString = selectString + cols[i]+", ";
	}
	if(cols.length > 0){
		selectString = selectString + cols[i];
	}
	var fromString = "from airports";
	var queryString = selectString+" "+fromString;
	logger.log('info','About to execute Query '+queryString);
	connection.query(queryString,function(err,rows,fields){
		//connection.end();
		callback(err,rows,fields);
	});
}
var exports = {"fetchAll": fetchAll};
module.exports = exports;