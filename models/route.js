var mysql  = require('mysql');
var conf = require('../config/db_conf.js');
var logger = require('../helpers/logger.js');
var modelHelper = require('../helpers/modelHelper.js');
var connectionPool = require('../helpers/connectionPool.js');
/*var connection = mysql.createConnection({
  host     : conf.host,
  user     : conf.user,
  password : conf.password,
  database : conf.database
});*/
function fetchByCols(fields,condition,cb,offset,limit){
	console.log("limit is"+limit);
   var select_stmt = modelHelper.getSelecStatement("ROUTE",fields,null,offset,limit);
   //console.log(select_stmt);
   connectionPool.query(select_stmt,function(err,rows,fields){
	   if(err){
		   cb(err);
	   }else{
		   cb(null,rows);
	   }
   });   
}

function fetchByBatch(fields,condition,batchSize){
	var offset = 0;
	var limit = batchSize;
	function fetch(finalCallback){
		fetchByCols(fields,condition,callback,offset,limit);
		function callback(err,rows){
			offset = offset + limit;
			if(err){
				finalCallback(err);
			}else{
				finalCallback(null,rows);
			}
		}
	}
	return fetch;
}

module.exports = {"fetchByBatch":fetchByBatch, "fetchByCols":fetchByCols};