"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
var dotenv = require('dotenv').config({ path: path.join('.env') });
var ibmdb = require('ibm_db');
class App {
    constructor() {
        this.connectionString = 'DATABASE=' + (process.env.DATABASE) + ';' +
            'HOSTNAME=' + process.env.HOSTNAME + ';' + 'UID=' + process.env.UID + ';' +
            'PWD=' + process.env.PASSWORD + ';' + 'PORT=' + process.env.PORT + ';' +
            'PROTOCOL=' + process.env.PROTOCOL + ';';
        console.log(this.connectionString);
        this.express = express();
        this.middleware();
        this.routes();
    }
    middleware() {
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }
    routes() {
        let router = express.Router();
        router.post('/listFlights', (req, res, next) => {
            ibmdb.open(this.connectionString, function (err, conn) {
                conn.prepare('SELECT * FROM SAMPLE.FlightsData WHERE Year=? and Month=? and DayofMonth=? and Origin=? and Dest=?', function (err, stmt) {
                    if (err) {
                        console.log('errorr', err);
                    }
                    stmt.execute([req.body.Year, req.body.Month, req.body.DayofMonth, req.body.Origin, req.body.Dest], function (err, result) {
                        result.fetch(function (err, data) {
                            if (err) {
                                console.error(err);
                                res.status(401).json({ message: "Server error" });
                                result.closeSync();
                            }
                            else {
                                res.json({
                                    data
                                });
                            }
                            result.closeSync();
                        });
                    });
                });
                // conn.prepare("SELECT * FROM SAMPLE.FlightsData WHERE Year=? and Month=? and DayofMonth=? and Origin=? and Dest=?", function (err, stmt) {
                //   if (err) {
                //     //could not prepare for some reason
                //     console.log(err);
                //     return conn.closeSync();
                //   }
                //   //Bind and Execute the statment asynchronously
                //   stmt.execute([req.body.Year,req.body.Month,req.body.DayofMonth,req.body.Origin,req.body.Dest], function (err, result) {
                //     if( err ){
                //       console.log(req.body.Year,req.body.Month,req.body.DayofMonth,req.body.Origin,req.body.Dest)
                //        console.log('erorrrrrrr',err);  
                //     }
                //     else {
                //       result.fetch(function (err, data) {
                //         if (err) {
                //           console.error(err);
                //           res.status(401).json({ message: "Server error" });
                //           result.closeSync();
                //         }
                //         else {
                //           console.log(JSON.stringify(data));
                //           if(!data){
                //             res.status(401).json({message:"No data found"});
                //           }
                //           else   {
                //             res.json({
                //               data
                //             });
                //           } 
                //         }
                //         result.closeSync();
                //       });            
                //       result.closeSync();
                //     }
                //     //Close the connection
                //   conn.close(function(err){});
                //   });
                // });
            });
        });
        this.express.use('/', router);
    }
}
exports.default = new App().express;
