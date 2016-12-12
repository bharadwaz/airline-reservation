var mysql      = require('mysql');
var conf = require('../config/db_conf.js');
var logger = require('../helpers/logger.js');
var fs = require('fs');
var connection = mysql.createConnection({
  host     : conf.host,
  user     : conf.user,
  password : conf.password,
  database : conf.database
});
var fileString = fs.readFileSync('../data/airlines.csv',{"encoding":"utf8"});
var lines = fileString.split('\r\n');
var query_string = "INSERT INTO AIRLINES (ID, NAME, ALIAS, IATA, ICAO, CALLSIGN, COUNTRY, ACTIVE) VALUES({1},'{2}','{3}','{4}','{5}','{6}','{7}','{8}');"
debugger;
function insertData(){
	var i=0;
	var num_rows = 0;
	function recursive(){
		if( i>= lines.length){
			connection.end();
			return;
		}
		var line_data = lines[i];
		var split_data = line_data.split('\t');
		
		var cur_query_string = query_string;
		for(var j = 0 ; j < split_data.length; j++){
			var x = split_data[j].replace(/\"/g,'');
			x = x.replace(/\'/g, "")
			cur_query_string = cur_query_string.replace('{'+(j+1)+'}',x);
		}
		connection.query(cur_query_string,function(err,rows,feilds){
			if(err){
			   logger.log('error','failed to insert data for query '+cur_query_string);	
			}else{
				num_rows++;
			}
			i++;
			recursive();
		});
	}
	logger.log('info','about to start inserting the airline records');
	recursive();
	logger.log('info','inserted '+num_rows+'number of rows');
}
insertData();