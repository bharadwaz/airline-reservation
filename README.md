# airline-reservation
## Description
Using this website user can able to register, login, search for a flights, book the tickets and cancel the tickets.
## Technology Stack
*Backend Server -> Nodejs
 *Authentication -> Passport.js
 *Rest Framework -> Express.js
 *Logging -> winston(not at all happy with this lib)
 * Node Database Driver -> mysql
*DataBase -> MySQL
*Frontend -> jquery, bootstrap
## Set up
* Install nodejs and mySql database server
* Change your database connectivity details in `./config/db_conf.js`
* Run create_table_scripts.js in setup_scripts folder(`node ./setup_scripts/create_table_scripts.js`)
* Run sql statements in `load_data.sql`(In mySql shell)(please run in the order of tables created in create_table_scripts)
## How to Run
* Run ` node server.js` You change port in server.js
* open browser and hit 'http://ipaddress:port/airlineReservation'