var mysql      = require('mysql');
var conf = require('../config/db_conf.js');
var logger = require('../helpers/logger.js');
var fs = require('fs');
var filename = process.argv[2];
var t_c = process.argv[3];
var table_name = process.argv[4];
var filePath = "../models/"+table_name+".js";
var model = require(filePath);
var fileString = fs.readFileSync(filename,{"encoding":"utf8"});
var data = fileString.split('\r\n');
if(t_c == 't'){
	cols = data[0].split('\t');
}else if(t_c == 'c'){
	cols = data[0].split(',');
}else{
	cols = data[0].split(',');
}
fields_arr = [];
for(var i = 1 ; i < data.length; i++){
	if(t_c == 't'){
		var fields = data[i].split("\t");
	}else if(t_c == 'c'){
		var fields = data[i].split(",");
	}else{
		var fields = data[i].split(",");
	}
	var fields_obj = {};
	for(var j = 0 ; j < cols.length; j++){
		fields_obj[cols[j]] = fields[j];
	}
	console.log(fields_obj);
	fields_arr.push(fields_obj);
}
model.save_bulk(fields_arr,function(){
	console.log("Done..");
	return;
});