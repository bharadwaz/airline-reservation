var logger = require('../helpers/logger.js');
var route_model = require('../models/route.js');
var fs = require('fs');
var fetchhandler = route_model.fetchByBatch(["id"],null,2000);
if(fs.existsSync("../data/airplanes.csv")){
	fs.unlinkSync("../data/airplanes.csv");
}
function recursive_fetch(){
	console.log("About to fetch routes data... started")
	fetchhandler(function(err,rows){
		console.log("About to fetch routes data... batch Done..");
		if(rows.length < 2000){
			save_airplanes(rows);
			return;
		}
		save_airplanes(rows);
		recursive_fetch();
	})
}
function save_airplanes(rows){
	var airplanes_data = [];
	var airplanes_info_data = [];
	var weekly_data = [];
	console.log("In save Airplanes");
	console.log("Rows count "+Object.keys(rows).length);
	for(var i = 0 ; i < Object.keys(rows).length ; i++){
		var airplanes_obj = {};
		airplanes_obj["AIRPLANE_ID"] = rows[i]["id"];
		airplanes_obj["ROUTE_ID"] = rows[i]["id"];
		airplanes_data.push(airplanes_obj);
	}
	writeToFile(airplanes_data)
	console.log("Object created for Airplanes");
}
function writeToFile(obj_arr){
	var fields = ["AIRPLANE_ID","ROUTE_ID"];
	var csv_string = "";
	for(var i = 0 ; i < obj_arr.length; i++){
		for(var j = 0 ; j < fields.length-1; j++){
			csv_string = csv_string+obj_arr[i][fields[j]]+",";
		}
		csv_string = csv_string+obj_arr[i][fields[fields.length-1]];
		csv_string  = csv_string+"\r\n";
	}
	fs.appendFileSync("../data/airplanes.csv",csv_string);
}
recursive_fetch();