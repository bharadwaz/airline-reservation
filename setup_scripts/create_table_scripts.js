var mysql      = require('mysql');
var logger = require('../helpers/logger.js');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '9966425377',
  database : 'airline_reservation'
});
var sql_create_statements = [
"CREATE TABLE AIRPORTS (ID int, NAME varchar(200), CITY varchar(200), COUNTRY varchar(100), IATA char(5), LATITUDE DOUBLE, LONGITUDE DOUBLE, ALTITUDE DOUBLE, TIMEZONE varchar(10), DST varchar(10), TZ varchar(75),PRIMARY KEY (ID));",

 "CREATE TABLE AIRLINES (ID int, NAME varchar(200), ALIAS varchar(250), IATA varchar(4), ICAO varchar(3), CALLSIGN varchar(100), COUNTRY varchar(100), ACTIVE varchar(4),PRIMARY KEY (ID));",
 
 "CREATE TABLE ROUTE (ID int NOT NULL AUTO_INCREMENT, AIRLINE varchar(4),  AIRLINE_ID int, SOURCE_AIRPORT varchar(5), SOURCE_AIRPORT_ID int, DEST_AIRPORT varchar(5), DEST_AIRPORT_ID int, PRIMARY KEY (ID), FOREIGN KEY (SOURCE_AIRPORT_ID) REFERENCES AIRPORTS(ID), FOREIGN KEY (DEST_AIRPORT_ID) REFERENCES AIRPORTS(ID));",
 
 "CREATE TABLE TRAVEL_CLASS (ID int NOT NULL AUTO_INCREMENT , CLASS varchar(30) NOT NULL, DESCRIPTION varchar(100), PRIMARY KEY (ID));",
 
 "CREATE TABLE PASS_TYPE(ID int NOT NULL AUTO_INCREMENT, TYPE varchar(30) NOT NULL, DESCRIPTION varchar(100), PRIMARY KEY (ID));",
 
 "CREATE TABLE AIRPLANES (ID int NOT NULL AUTO_INCREMENT, AIRPLANE_ID int, ROUTE_ID int, PRIMARY KEY (ID), FOREIGN KEY (ROUTE_ID) REFERENCES ROUTE(ID));",
 
 "CREATE TABLE AIRPLANES_INFO(ID int NOT NULL AUTO_INCREMENT,PLANE_ID int,CLASS_ID int,NUM_SEATS int, NUM_FARE varchar(30), FOREIGN KEY (CLASS_ID) REFERENCES TRAVEL_CLASS(ID), PRIMARY KEY (ID));",
 
 "CREATE TABLE AIRPLANES_WEEKLY_SCHEDULE (FLIGHT_ID int, WEEK_DAYS int, J_TIME int, S_TIME int);",
 
 "CREATE TABLE SCHEDULE (ID int NOT NULL AUTO_INCREMENT,AIRPLANE_ID int, STARTTIME varchar(20),ENDTIME varchar(20), PRIMARY KEY (ID));",
 
 "CREATE TABLE FARES_SEATS(ID int NOT NULL AUTO_INCREMENT,SCHEDULE_ID int,CLASS_ID int,NUM_SEATS int, NUM_FARE varchar(30), FOREIGN KEY (CLASS_ID) REFERENCES TRAVEL_CLASS(ID),FOREIGN KEY (SCHEDULE_ID) REFERENCES SCHEDULE(ID), PRIMARY KEY (ID));",
 
 "CREATE TABLE USERINFO(ID int NOT NULL AUTO_INCREMENT, EMAIL varchar(100), PHONE_NUM varchar(20), PASSWORD varchar(100),STREET varchar(100), CITY varchar(100), COUNTRY varchar(50), STATE varchar(50), ZIPCODE varchar(20),USERNAME varchar(100), PRIMARY KEY (ID));",
 
 "CREATE TABLE PASSENGERS(ID int NOT NULL AUTO_INCREMENT,BOOKING_ID varchar(200), NAME varchar(200), PHONE_NUM varchar(20), EMAIL varchar(50), ADDRESS varchar(200), IS_PRIMARY int, PRIMARY KEY(ID));",
 
 "CREATE TABLE TICKETS(BOOKING_ID varchar(200), USER_ID int, SCHEDULE_ID int, status varchar(100), ord int,CLASS_ID int, PRIMARY KEY (BOOKING_ID), FOREIGN KEY(SCHEDULE_ID) REFERENCES SCHEDULE(ID), FOREIGN KEY(USER_ID) REFERENCES USERINFO(ID));"
  "GRANT SELECT ON 'SCHEDULE' TO user@localhost;"
  "GRANT SELECT ON  'AIRPORTS' TO user@localhost;"
  "GRANT SELECT ON  'AIRPLANES' TO user@localhost;"
"GRANT SELECT ON 'AIRLINES' TO user@localhost;"
 ]

connection.connect();

function execute_statements(){
	var i = 0;
	function recursive(){
		if(i >= sql_create_statements.length){
			connection.end();
			return;
		}
		connection.query(sql_create_statements[i],function(err,rows,fields){
			if(!err){
				//console.log('Sucess -->> '+sql_create_statements[i]);
			}else{
				console.log('Failed-->> '+sql_create_statements[i]);
				console.log("Message -->> "+err);
				return;
			}
			i++;
			recursive();
		});
	}
	recursive();
}
logger.log('info', 'About to Create Table commands');
execute_statements();
