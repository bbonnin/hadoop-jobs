var http = require('http');
var express = require('express');
var jobhistory = require('./routes/jobhistory');

var app = express();

//------------------
// Configure express
//------------------
app.configure(function() {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/static'));
});


//-----------------------------------------------------
// Define services to get clusters and job informations
//-----------------------------------------------------
app.get('/clusters', jobhistory.getClusters);
app.get('/jobs/:cluster', jobhistory.getJobList);
app.get('/job/:cluster/:id', jobhistory.getJobInfo);
app.get('/job_attempts/:cluster/:id', jobhistory.getJobAttempts);

//----------------------
// Start the HTTP server
//----------------------
app.listen(9999);
console.log('Listening on port 9999...');
