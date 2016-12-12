var mysql      = require('mysql');
var conf = require('../config/db_conf.js');
var logger = require('../helpers/logger.js');
var airplanes_model = require('../models/airplanes.js');
var airplanes_info_model = require('../models/airplanes_info.js');
var airplanes_weekly_schedule_model = require('../models/airplanes_weekly_schedule.js');
var route_model = require('../models/route.js');
var travel_class_model = require('../models/travel_class.js');
var utilities = require('../helpers/utilities.js')
var economy_id;
var economy_seats = 150;

var premium_id;
var premium_seats = 100;
var premium_fare_hike = 0.5;

var business_id;
var business_seats = 50;
var business_fare_hike = 1;
var start_time = [0,30,150,240,300,330,390, 510, 630,750, 840, 1020, 1050, 1110, 1200,1230,1320, 1350, 1410]
var j_time = [360,480,600,840,1080]
var fare = [800,820,925,950,975,990,1000,900,1050,1500,2000,1650,1700]
var fetchhandler = route_model.fetchByBatch(["id"],null,2000);
function recursive_fetch(){
	console.log("About to fetch routes data... started")
	fetchhandler(function(err,rows){
		console.log("About to fetch routes data... batch Done..");
		save_airplanes(rows,function(){
			console.log("rows length is -->>"+Object.keys(rows).length);
			if(Object.keys(rows).length < 2000){
				return;
			}
			
			recursive_fetch();
		});
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
function save_airplanes(rows,finalcb){
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
	console.log("Object created for Airplanes");
	airplanes_model.save_bulk(airplanes_data,function(rows){
			var start = 0;
			console.log('Plane saved Done..');
			for(var i = 0 ;  i < Object.keys(rows).length; i++){
				update_airplanes_info(rows[i],airplanes_info_data);
				update_weekly_schedule(rows[i],start,weekly_data);
				start = (start + 1)%7;
			}
			console.log('About to save Airplance info');
			airplanes_info_model.save_bulk(airplanes_info_data,function(cur_rows){
				console.log('About to save Weekly schedule data info');
				airplanes_weekly_schedule_model.save_bulk(weekly_data,function(cur_rows){
					finalcb(null)
				})
			});
	});
}

function update_airplanes_info(plane_id,data){
	var base_fare = fare[utilities.randomInt(0,fare.length)];
	base_fare = base_fare + utilities.randomInt(0,50);
	data.push({"PLANE_ID": plane_id,"CLASS_ID":economy_id,"NUM_SEATS":economy_seats,"NUM_FARE":base_fare});
	data.push({"PLANE_ID": plane_id,"CLASS_ID":premium_id,"NUM_SEATS":premium_seats,"NUM_FARE":base_fare+base_fare*premium_fare_hike});
	data.push({"PLANE_ID": plane_id,"CLASS_ID":business_id,"NUM_SEATS":business_seats,"NUM_FARE":base_fare+base_fare*business_fare_hike});
}

function update_weekly_schedule(plane_id,start,data){
	var j = j_time[utilities.randomInt(0, j_time.length)];
	var s = start_time[utilities.randomInt(0, start_time.length)];
	data.push({"FLIGHT_ID":plane_id,"WEEK_DAYS":start,"J_TIME":j,"S_TIME":s});
	data.push({"FLIGHT_ID":plane_id,"WEEK_DAYS":(start+2)%7,"J_TIME":j,"S_TIME":s});
	data.push({"FLIGHT_ID":plane_id,"WEEK_DAYS":(start+4)%7,"J_TIME":j,"S_TIME":s});
}
update_variables();