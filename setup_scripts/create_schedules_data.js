var mysql  = require('mysql');
var conf = require('../config/db_conf.js');
var logger = require('../helpers/logger.js');
var modelHelper = require('../helpers/modelHelper.js');
var airplanes_model = require('../models/airplanes.js');
var airplanes_info_model = require('../models/airplanes_info.js');
var airplanes_weekly_model = require('../models/airplanes_weekly_schedule.js');
var fs = require('fs');
var start_date = new Date(2016,10,25);
var end_date = new Date(2017,0,30);
var fetchHandler = airplanes_weekly_model.fetchByBatch(["flight_id","week_days","j_time","s_time"],null,2000);
function recursive(){
	fetchHandler(function(err,rows){
		if(!err){
			if(rows.length < 2000){
				getInsertStatement(rows);
				console.log("Done...");
				return;
			}
			getInsertStatement(rows);
			recursive();
		}
	})
}
function getInsertStatement(rows){
	var schedule_data = [];
	for(var i =  0; i < rows.length; i++){
		var week_day = rows[i]["week_days"];
		var date = new Date(start_date);
		var cur_week_day = date.getDay();
		var diff = ((cur_week_day-week_day)+7)%7;
		date.setDate(date.getDate()+diff);
		while(date <= end_date){
			var cur_schedule_obj = {}
			var s_date_time = new Date(date);
			s_date_time.setMinutes(s_date_time.getMinutes()+rows[i]["s_time"]);
			cur_schedule_obj["starttime"] = format(s_date_time);
			
			var e_date_time = new Date(s_date_time);
			e_date_time.setMinutes(e_date_time.getMinutes()+rows[i]["j_time"]);
			cur_schedule_obj["endtime"] = format(e_date_time);
			
			cur_schedule_obj["airplane_id"] = rows[i]["flight_id"];
			schedule_data.push(cur_schedule_obj);
			date.setDate(date.getDate()+7);
		}
	}
	writeToFile(schedule_data);
}
function writeToFile(obj_arr){
	var fields = ["airplane_id","starttime","endtime"];
	var csv_string = "";
	for(var i = 0 ; i < obj_arr.length; i++){
		for(var j = 0 ; j < fields.length-1; j++){
			csv_string = csv_string+obj_arr[i][fields[j]]+",";
		}
		csv_string = csv_string+obj_arr[i][fields[fields.length-1]];
		csv_string  = csv_string+"\r\n";
	}
	fs.appendFileSync("../data/schedule.csv",csv_string);
}
function format(date){
	var format_str = "";
	format_str = format_str+date.getFullYear();
	
	if(date.getMonth()+1 < 10){
		format_str = format_str+"-"+"0"+(date.getMonth()+1);
	}else{
		format_str = format_str+"-"+(date.getMonth()+1);
	}
	
	if(date.getDate() < 10){
		format_str = format_str+"-"+"0"+(date.getDate());
	}else{
		format_str = format_str+"-"+(date.getDate());
	}
	
	if(date.getHours()<10){
		format_str = format_str+" "+"0"+(date.getHours());
	}else{
		format_str = format_str+" "+(date.getHours());
	}
	
	if(date.getMinutes() < 10){
		format_str = format_str+":"+"0"+(date.getMinutes());
	}else{
		format_str = format_str+":"+(date.getMinutes());
	}
	
	if(date.getSeconds() < 10){
		format_str = format_str+":"+"0"+(date.getSeconds());
	}else{
		format_str = format_str+":"+(date.getSeconds());
	}
	return format_str;
}
recursive();