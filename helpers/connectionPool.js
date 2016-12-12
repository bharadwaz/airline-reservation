var mysql = require('mysql');
var conf = require('../config/db_conf.js');

var pool  = mysql.createPool({
connectionLimit : conf.connectionLimit,
	host     : conf.host,
	user     : conf.user,
	password : conf.password,
	database : conf.database
	});

module.exports = pool;