var mysql  = require('mysql');
var conf = require('../config/db_conf.js');
var logger = require('../helpers/logger.js');
var modelHelper = require('../helpers/modelHelper.js');
var connectionPool = require('../helpers/connectionPool.js');
var fs = require('fs');
var mainQueryString = "Select schedule.id as SCHEDULE_ID ,AIRPLANES_INFO.CLASS_ID, AIRPLANES_INFO.NUM_SEATS, AIRPLANES_INFO.NUM_FARE from schedule join airplanes on schedule.AIRPLANE_ID = airplanes.ID join AIRPLANES_INFO on airplanes.ID = AIRPLANES_INFO.PLANE_ID "
var offset = 0;
var batch = 10000;
var queryString = mainQueryString+" "+"limit "+batch+" offset "+offset+";"
if(fs.existsSync("../data/fares_seats.csv")){
	fs.unlinkSync("../data/fares_seats.csv");
}
function recursive() {
connectionPool.query(queryString,function(err,rows){
	if(!err){
		writeToFile(rows);
		if(rows.length < 10000){
			return;
		};
		offset = offset + batch;
		queryString = mainQueryString+" "+"limit "+batch+" offset "+offset+";"
		console.log(queryString)
		recursive();
	}else{
		console.log("Got error..");
	}
}) }
function writeToFile(obj_arr){
	var fields = ["SCHEDULE_ID","CLASS_ID","NUM_SEATS","NUM_FARE"];
	var csv_string = "";
	for(var i = 0 ; i < obj_arr.length; i++){
		for(var j = 0 ; j < fields.length-1; j++){
			csv_string = csv_string+obj_arr[i][fields[j]]+",";
		}
		csv_string = csv_string+obj_arr[i][fields[fields.length-1]];
		csv_string  = csv_string+"\r\n";
	}
	fs.appendFileSync("../data/fares_seats.csv",csv_string);
}
recursive();