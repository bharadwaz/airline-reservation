var express = require('express')
var logger = require('../helpers/logger.js');
var selectParser = require('../helpers/selectParser.js');
var connectionPool = require('../helpers/connectionPool.js');
var ticket_model = require('../models/tickets.js');
var router = express.Router()
router.post("/",function(req, res){
	var json_obj= req.body
	console.log(json_obj);
	console.log(typeof json_obj);
	var booking_id = json_obj["booking_id"];
	ticket_model.cancel(booking_id,function(booo){
		
		if(booo){
			res.send({"status":"success", "booking_id":booking_id});
		}else{
			res.send({"status":"failed"});
		}
	});
});
router.get("/",function(req,res){
	var queryString = 'select status,BOOKING_ID,sor.IATA as source,des.IATA as dest,starttime,endtime,airlines.name as airline_name,shortId,airplane__id from (SELECT tickets.status,TICKETS.BOOKING_ID,ROUTE.SOURCE_AIRPORT_ID AS s_id,ROUTE.DEST_AIRPORT_ID as d_id,route.AIRLINE_ID, route.airline as shortId,airplanes.airplane_id as airplane__id,schedule.starttime,schedule.endtime FROM TICKETS JOIN SCHEDULE ON TICKETS.SCHEDULE_ID = schedule.ID JOIN AIRPLANES ON SCHEDULE.AIRPLANE_ID = airplanes.ID JOIN ROUTE ON airplanes.ROUTE_ID = ROUTE.ID where tickets.user_id = $user_id) s join airports sor on s.s_id = sor.ID join airports des on s.d_id = des.ID join airlines on s.AIRLINE_ID = airlines.id'
	queryString = queryString.replace("$user_id",req.user["ID"]);
	connectionPool.query(queryString, function(err, rows){
		

		if(!err){
		console.log("fasdfksadf^^^^^^^^^^^^^^^^^^^^^^^^^^");
		var formated_result = formated_date(rows);
		console.log(formated_result);
		res.render('cancel',{ cancel_result_data:formated_result})
	 }else{
		 console.log("%%%%%%%%% GOT ERROR %%%%%%%%%%%%");
		 console.log(err);
		 res.send('found error');
	 } 

	});
})
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
function formated_date(rows){
var result = []
for(var i = 0 ; i < rows.length; i++){
	var cur_obj = {}
	cur_obj["airline"] = rows[i]["airline_name"]
	cur_obj["flight_id"] = rows[i]["shortId"]+"-"+rows[i]["airplane__id"]
	cur_obj["sourceIATA"] = rows[i]["source"];
	cur_obj["destinationIATA"] = rows[i]["dest"];
	cur_obj["BOOKING_ID"] = rows[i]["BOOKING_ID"];
	cur_obj['status'] = rows[i]['status']
	var departDate  = rows[i]["starttime"];
	
	cur_obj["departDate"] = departDate.slice(0,16).replace(/-/g,'/')
	
	var arrivalDate = rows[i]["endtime"]
	cur_obj["arrivalDate"] = arrivalDate.slice(0,16).replace(/-/g,'/')
	cur_obj["duration"] = get_duration(rows[i]["starttime"], rows[i]["endtime"]);
    cur_obj["stops"] = "non stop";	
	result.push(cur_obj);
}
return result;
}
function get_duration(start_str, end_str){
	var start_date_obj = getDateObj(start_str);	
	var end_date_obj = getDateObj(end_str);
	var timeDiff = Math.abs(end_date_obj.getTime() - start_date_obj.getTime());
	var minutes_diff = timeDiff/(1000*60);
	var hours = minutes_diff/60;
	var minutes = minutes_diff%60;
	return hours+"hrs"+" "+minutes+"mins"
}
function getDateObj(date_str){
	var splits = date_str.split(' ');
	var date_splits = splits[0].split('-');
	var time_splits = splits[1].split(':');
	return new Date(date_splits[0], date_splits[1]-1, date_splits[2], time_splits[0], time_splits[1]);
}
module.exports = router

//begin -transaction
//insert data in tickets;
//insert data in to passengers
//insert update the num_tickets
//commit