var logger = require('../helpers/logger.js');
var airplanes_model = require('../models/airplanes.js');
var fs = require('fs');
var logger = require('../helpers/logger.js');
var route_model = require('../models/route.js');
var travel_class_model = require('../models/travel_class.js');
var fs = require('fs');

var utilities = require('../helpers/utilities.js')
if(fs.existsSync("../data/airplanes_info.csv")){
	fs.unlinkSync("../data/airplanes_info.csv");
}


var economy_id;
var economy_seats = 150;

var premium_id;
var premium_seats = 100;
var premium_fare_hike = 0.5;

var business_id;
var business_seats = 50;
var business_fare_hike = 1;
var fare = [800,820,925,950,975,990,1000,900,1050,1500,2000,1650,1700]

var fetchhandler = airplanes_model.fetchByBatch(["id"],null,2000);
function recursive_fetch(){
	console.log("About to fetch routes data... started")
	fetchhandler(function(err,rows){
		console.log("About to fetch routes data... batch Done..");
		if(rows.length < 2000){
			save_airplanes_info(rows);
			return;
		}
		save_airplanes_info(rows);
		recursive_fetch();
	})
}

function update_variables(){
	console.log("Updating variable started..");
	travel_class_model.fetchByCols(["*"],null,function(err,rows){
		if(!err){
			for(var i = 0 ; i < rows.length; i++){
				if(rows[i]["CLASS"] == "Economy"){
					economy_id = rows[i]["ID"];
				}else if(rows[i]["CLASS"] == "Premium"){
					premium_id = rows[i]["ID"];
				}else{
					business_id = rows[i]["ID"];
				}
			}
			console.log("Updating variable Done..");
			recursive_fetch();
		}else{
			console.log("Got error "+err);
		}
	})
}
function save_airplanes_info(rows){
	var data = [];
	for(var i = 0 ; i < rows.length; i++){
		update_airplanes_info(rows[i]["id"],data);
	}
	writeToFile(data)
}
function writeToFile(obj_arr){
	var fields = ["PLANE_ID","CLASS_ID","NUM_SEATS","NUM_FARE"];
	var csv_string = "";
	for(var i = 0 ; i < obj_arr.length; i++){
		for(var j = 0 ; j < fields.length-1; j++){
			csv_string = csv_string+obj_arr[i][fields[j]]+",";
		}
		csv_string = csv_string+obj_arr[i][fields[fields.length-1]];
		csv_string  = csv_string+"\r\n";
	}
	fs.appendFileSync("../data/airplanes_info.csv",csv_string);
}
function update_airplanes_info(plane_id,data){
	var base_fare = fare[utilities.randomInt(0,fare.length)];
	base_fare = base_fare + utilities.randomInt(0,50);
	data.push({"PLANE_ID": plane_id,"CLASS_ID":economy_id,"NUM_SEATS":economy_seats,"NUM_FARE":base_fare});
	data.push({"PLANE_ID": plane_id,"CLASS_ID":premium_id,"NUM_SEATS":premium_seats,"NUM_FARE":base_fare+base_fare*premium_fare_hike});
	data.push({"PLANE_ID": plane_id,"CLASS_ID":business_id,"NUM_SEATS":business_seats,"NUM_FARE":base_fare+base_fare*business_fare_hike});
}
update_variables();