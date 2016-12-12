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
function save_one(fields,cb){
	var insertString = modelHelper.getInsertStatement("AIRPLANES",fields);
	connectionPool.query(insertString,function(err,rows,fields){
		//connection.end();
		if(err){
			logger.log('info','Query Execution Failed'+err);
			cb(err); 
		}else{
			cb(null,rows[0]);
		}
	});
}
function save_bulk(arr_fields,cb,batchSize){
	insert_stmts =[]
	for(var i = 0 ; i < arr_fields.length; i++){
		insert_stmts.push( modelHelper.getInsertStatement("AIRPLANES",arr_fields[i]) );
	}
	modelHelper.save_bulk(connectionPool,insert_stmts,cb,batchSize);
}

function fetchByCols(fields,condition,cb,offset,limit){
	console.log("limit is"+limit);
   var select_stmt = modelHelper.getSelecStatement("AIRPLANES",fields,null,offset,limit);
   console.log(select_stmt);
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

module.exports = {"save_one":save_one, "save_bulk":save_bulk, "fetchByBatch":fetchByBatch, "fetchByCols":fetchByCols};