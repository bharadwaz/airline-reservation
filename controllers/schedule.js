var express = require('express')
var logger = require('../helpers/logger.js');
var selectParser = require('../helpers/selectParser.js');
var connectionPool = require('../helpers/connectionPool.js');
var router = express.Router()

//middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  console.log("In the schedule request");
  next()
})
//define the home page route
router.get('/', function (req, res) {
  /*
    start_date: 2016-06-16
	source_airport_id: 123
	dest_airport_id: 213
	class: 12
	num_passenger: 5
  */
  var start_date = req.query.start_date;
  var return_date = req.query.returnDate;
  var seats = req.query.num_passenger;
  var clas = req.query.class;
  var s_airport_id = req.query.source_airport_id;
  var d_airport_id = req.query.dest_airport_id;
  var trip_type = req.query.tripType;
  res.set({
  'Content-Type': 'application/json',
  "Access-Control-Allow-Origin": '*'
  });
  if(trip_type == 'round'){
  	  console.log("&&&& Round trip selected &&&&&");
  	  var final_result = [];
  	  getFlights(start_date,seats,clas,s_airport_id,d_airport_id,function(result){
  	  	final_result.push(result);
  	  	getFlights(return_date,seats,clas,d_airport_id,s_airport_id,function(result){
  	  		final_result.push(result);
  	  		console.log("Final Result is ------------>>>>>");
  	  		console.log(final_result);
  	  		res.render('schedules',{ result_data:final_result, trip_type: trip_type, clazz: clas,"passenger_count":seats})
  	  	});
     });}else{
  	  	getFlights(start_date,seats,clas,s_airport_id,d_airport_id,function(result){
  	  		res.render('schedules',{ result_data:result, trip_type: trip_type, clazz: clas,"passenger_count":seats})
  	  	});
  	  }
  });

function getFlights(start_date,seats,clas,s_airport_id,d_airport_id,cb){
  var date = start_date.split("-");
  var dateObj = new Date(date[0],date[1]-1,date[2]);
  var date_str = format(dateObj);
  var temp_end_date = new Date(date[0],date[1]-1, date[2]);
  temp_end_date.setDate(temp_end_date.getDate()+3);
  var end_str = format(temp_end_date);
  queryString = "select fare,airlines.name as airline_name,shortId,schedule_id,airplane__id,sor.IATA as source,des.IATA as dest,starttime,endtime from (select route.airline_id, route.SOURCE_AIRPORT_ID as s_id, route.DEST_AIRPORT_ID as d_id, route.airline as shortId, schedule.id as schedule_id, airplanes.airplane_id as airplane__id,schedule.starttime,schedule.endtime,FARES_SEATS.num_fare as fare from schedule join FARES_SEATS on schedule.ID = FARES_SEATS.SCHEDULE_ID join airplanes on schedule.airplane_id = airplanes.id join route on route.id = airplanes.route_id join airlines on route.airline_id = airlines.id where schedule.starttime > '$starttime' and schedule.endtime < '$endtime' and FARES_SEATS.CLASS_ID = $class and FARES_SEATS.NUM_SEATS >= $seats and route.SOURCE_AIRPORT_ID = $s_airport_id and route.DEST_AIRPORT_ID = $d_airport_id) s join airlines on s.airline_id = airlines.ID join airports sor on s.s_id = sor.id join airports des on s.d_id = des.id;"

  queryString = queryString.replace('$starttime',date_str);
  queryString =queryString.replace('$endtime',end_str);
  queryString =queryString.replace('$seats',seats);
  queryString =queryString.replace('$class',clas);
  queryString =queryString.replace('$s_airport_id',s_airport_id);
  queryString =queryString.replace('$d_airport_id',d_airport_id);
  connectionPool.query(queryString,function(err,rows, fields){
	 if(!err){
		var result = formated_date(rows);
		console.log(result);
		cb(result);
		
	 }else{
		 console.log("%%%%%%%%% GOT ERROR %%%%%%%%%%%%");
		 console.log(err);
		 cb(null);
	 } 
  });

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
function formated_date(rows){
var result = []
for(var i = 0 ; i < rows.length; i++){
	var cur_obj = {}
	cur_obj["airline"] = rows[i]["airline_name"]
	cur_obj["flight_id"] = rows[i]["shortId"]+"-"+rows[i]["airplane__id"]
	cur_obj["sourceIATA"] = rows[i]["source"];
	cur_obj["destinationIATA"] = rows[i]["dest"];
	cur_obj["route_id"] = rows[i]["schedule_id"];
	var departDate  = rows[i]["starttime"];
	
	cur_obj["departDate"] = departDate.slice(0,16).replace(/-/g,'/')
	
	var arrivalDate = rows[i]["endtime"]
	cur_obj["arrivalDate"] = arrivalDate.slice(0,16).replace(/-/g,'/')
	
	
	cur_obj["fare"] = "$"+rows[i]["fare"]
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