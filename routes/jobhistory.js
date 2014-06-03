var http = require("http");
var config = require("../config.json");

var testMode = process.argv.length > 2 && process.argv[2] === 'test';
console.log("Test mode = " + testMode);
console.log(process.argv.length);
console.log(process.argv[1]);
var testJobs = require("../test/jobs.json");
var testJob = require("../test/job.json");
var testJobAttempts = require("../test/job_attempts.json");

var BASE_PATH = "/ws/v1/history/mapreduce/jobs";

var options = {
    port : 19888,
    method : "GET",
    headers : {
        "Cache-Control" : "no-cache"
    }
};

/**
 * Returns the cluster names.
 */
function getClusters(req, resp) {
    var clusters = [];
    for (var cluster in config.clusters) {
        clusters.push(cluster);
    }
    resp.send(clusters);
}

/**
 * Processing the job attempts request. 
 */
function getJobAttempts(req, resp) {

    var jobId = req.params.id;
    var cluster = req.params.cluster;

    options.path = BASE_PATH + "/" + jobId + "/tasks";
    options.hostname = config.clusters[cluster].host;

    if (testMode) {
        resp.send(testJobAttempts);
    }
    else {
        sendRequest(processJobTasks, { clientResponse : resp, jobId : jobId, cluster : cluster });
    }
}

/**
 * Callback for processing job tasks.
 */
function processJobTasks(err, context, tasksInfo) {

    if (err) {
        context.clientResponse.send(500);
    }
    else if (tasksInfo && tasksInfo.tasks) {

        var attempts = [];
        var attemptNb = tasksInfo.tasks.task.length;

        tasksInfo.tasks.task.forEach(function(task, index) {
            if (task.successfulAttempt) {
                options.path = BASE_PATH + "/" + context.jobId + "/tasks/" + task.id + "/attempts/" + task.successfulAttempt;
                options.hostname = config.clusters[context.cluster].host;
                sendRequest(function(err, ctx, attemptsInfo) {
                    if (err) {
                        context.clientResponse.send(500);
                    }
                    else {
                        attempts.push(attemptsInfo.taskAttempt);
                        if (attempts.length == attemptNb) { 
                            context.clientResponse.send(attempts);
                        }
                    }
                },
                null);
            }
            else {
                attemptNb--;
            }
        });
    }
    else {
        context.clientResponse.send(404);
    }
}

/**
 * Send job info request.
 */
function getJobInfo(req, resp) {

    var jobId = req.params.id;
    var cluster = req.params.cluster;

    options.path = BASE_PATH + "/" + jobId;
    options.hostname = config.clusters[cluster].host;

    if (testMode) {
        resp.send(testJob);
    }
    else {
        sendRequest(processJobInfo, resp);
    }
}

/**
 * Callback for processing job info response.
 */
function processJobInfo(err, resp, jobInfo) {

    if (err) {
        resp.send(500);
    }
    else {
        resp.send(jobInfo.job);
    }
}

/**
 * Send job list request.
 */
function getJobList(req, resp) {

    options.path = BASE_PATH;
    options.hostname = config.clusters[req.params.cluster].host;

    if (testMode) {
        resp.send(testJobs);
    }
    else {
        sendRequest(processJobList, resp);
    }
}

/**
 * Callback for processing job list response.
 */
function processJobList(err, resp, jobList) {

    if (err) {
        resp.send(500);
    }
    else if (jobList.jobs) {
        resp.send(jobList.jobs.job);
    }
    else {
        resp.send([]);
    }
}

/**
 * Send of an HTTP request.
 */
function sendRequest(callback, cbData) {

    var body = "";

    var req = http.request(options, function(resp) {

        resp.on("data", function(chunk) {
            body += chunk;
        });

        resp.on("end", function() {
            callback(null, cbData, JSON.parse(body));
        });
    

    });

    req.on("error", function(err) {
        console.log("Error : " + err.message);
        callback(err, cbData, null);
    });

    req.end();
}

/*
 * Exported functions.
 */
exports.getJobList = getJobList;
exports.getJobInfo = getJobInfo;
exports.getJobAttempts = getJobAttempts;
exports.getClusters = getClusters;