var logger = require('../helpers/logger.js');
var airplanes_model = require('../models/airplanes.js');
var fs = require('fs');
var logger = require('../helpers/logger.js');
var route_model = require('../models/route.js');
var travel_class_model = require('../models/travel_class.js');
var fs = require('fs');

var utilities = require('../helpers/utilities.js')
if(fs.existsSync("../data/airplanes_weekly_schedule.csv")){
	fs.unlinkSync("../data/airplanes_weekly_schedule.csv");
}
var start_time = [0,30,150,240,300,330,390, 510, 630,750, 840, 1020, 1050, 1110, 1200,1230,1320, 1350, 1410]
var j_time = [360,480,600,840,1080]
var fetchhandler = airplanes_model.fetchByBatch(["id"],null,2000);
function recursive_fetch(){
	console.log("About to fetch routes data... started")
	fetchhandler(function(err,rows){
		console.log("About to fetch routes data... batch Done..");
		if(rows.length < 2000){
			save_airplanes_weekly_schedule(rows);
			return;
		}
		save_airplanes_weekly_schedule(rows);
		recursive_fetch();
	})
}
function save_airplanes_weekly_schedule(rows){
	var start = 0;
	var data = [];
	for(var i = 0 ; i < rows.length; i++){
		update_weekly_schedule(rows[i]["id"],start,data);
		start = (start + 1)%7;
	}
	writeToFile(data)
}
function update_weekly_schedule(plane_id,start,data){
	var j = j_time[utilities.randomInt(0, j_time.length)];
	var s = start_time[utilities.randomInt(0, start_time.length)];
	data.push({"FLIGHT_ID":plane_id,"WEEK_DAYS":start,"J_TIME":j,"S_TIME":s});
	data.push({"FLIGHT_ID":plane_id,"WEEK_DAYS":(start+2)%7,"J_TIME":j,"S_TIME":s});
	data.push({"FLIGHT_ID":plane_id,"WEEK_DAYS":(start+4)%7,"J_TIME":j,"S_TIME":s});
}


function writeToFile(obj_arr){
	var fields = ["FLIGHT_ID","WEEK_DAYS","J_TIME","S_TIME"];
	var csv_string = "";
	for(var i = 0 ; i < obj_arr.length; i++){
		for(var j = 0 ; j < fields.length-1; j++){
			csv_string = csv_string+obj_arr[i][fields[j]]+",";
		}
		csv_string = csv_string+obj_arr[i][fields[fields.length-1]];
		csv_string  = csv_string+"\r\n";
	}
	fs.appendFileSync("../data/airplanes_weekly_schedule.csv",csv_string);
}
recursive_fetch();