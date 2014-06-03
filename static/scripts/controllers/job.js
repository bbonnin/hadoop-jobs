
// Controller for a job

angular.module('hadoopJobsApp').controller('JobController', function ($rootScope, $scope, $http, $cookies) {
    'use strict';

    var avgMapTimeChart = new Morris.Bar({
        element : "avgMapTimeByHost",
        data : [],
        hideHover : "auto",
        xkey : "host",
        ykeys : [ "avgMap" /*, "avgReduce", "avgShuffle"*/ ],
        labels : [ "Average Map Time (ms)", "Average Reduce Time (ms)", "Average Shuffle Time (ms)" ]
    });

    var nbMapsChart = new Morris.Bar({
        element : "nbMapsByHost",
        data : [],
        hideHover : "auto",
        xkey : "host",
        ykeys : [ "nbMaps" ],
        labels : [ "Maps" ]
    });

    var avgReduceTimeChart = new Morris.Bar({
        element : "avgReduceTimeByHost",
        data : [],
        hideHover : "auto",
        xkey : "host",
        ykeys : [ "avgReduce" ],
        labels : [ "Average Reduce Time (ms)" ]
    });

    var nbReducesChart = new Morris.Bar({
        element : "nbReducesByHost",
        data : [],
        hideHover : "auto",
        xkey : "host",
        ykeys : [ "nbReduces" ],
        labels : [ "Reduces" ]
    });

    $scope.$on('show-job', function (event, data) {
        $scope.jobId = data.jobId;
        $cookies.jobId = $scope.jobId;
        $scope.loadJob();
    });

    $scope.loadJob = function () {

        $http
            .get('/job/' + $rootScope.cluster + '/' + $scope.jobId)
            .success(function (data) {
                $scope.job = data;
                $scope.job.startDate = new Date($scope.job.startTime).toLocaleString();
                $scope.job.finishDate = new Date($scope.job.finishTime).toLocaleString();
                $scope.loadAttempts();
            })
            .error(function (err, status) {
                $scope.job = null;
                setGraphData([]);
                $scope.loading = false;
                $rootScope.showAlert(
                    { msg : 'Error when loading job', type : 'danger'},
                    { data : err, status : status });
            });
    };

    $scope.loadAttempts = function () {

        $http
            .get('/job_attempts/' + $rootScope.cluster + '/' + $scope.jobId)
            .success(function (data) {

                $scope.jobAttempts = data;

                var attemptByServer = {};
                $scope.jobAttempts.forEach(function (attempt) {
                    if (!attemptByServer[attempt.nodeHttpAddress]) {
                        attemptByServer[attempt.nodeHttpAddress] = [];    
                    }
                    attemptByServer[attempt.nodeHttpAddress].push(attempt);
                });

                var dataByHost = [];
                for (var host in attemptByServer) {
                    if (attemptByServer.hasOwnProperty(host)) {
                        var attempts = attemptByServer[host];
                        var totalMap = 0, nbMaps = 0;
                        var totalReduce = 0, nbReduces = 0;
                        var totalShuffle = 0, nbShuffles = 0;
                        attempts.forEach(function (attempt) {
                            if (attempt.type === "MAP") {
                                totalMap += attempt.elapsedTime;
                                nbMaps++;
                            }
                            else if (attempt.type === "REDUCE") {
                                totalReduce += attempt.elapsedReduceTime;
                                nbReduces++;
                                totalShuffle += attempt.elapsedShuffleTime;
                                nbShuffles++;
                            }
                        });
                        var avgMap = nbMaps > 0 ? Math.ceil(totalMap / nbMaps) : 0;
                        var avgReduce = nbReduces > 0 ? Math.ceil(totalReduce / nbReduces) : 0;
                        var avgShuffle = nbShuffles > 0 ? Math.ceil(totalShuffle / nbShuffles) : 0;
                        dataByHost.push({
                            host : host.substring(0, host.indexOf('.') == -1 ? host.indexOf(':') : host.indexOf('.')), 
                            avgMap : avgMap, avgReduce : avgReduce, avgShuffle : avgShuffle,
                            nbMaps : nbMaps, nbReduces : nbReduces
                        });
                    }
                }

                dataByHost.sort(function (a, b) {
                    if (a.host < b.host) {
                        return -1;
                    }
                    else {
                        return 1;
                    }
                    return 0; 
                });

                setGraphData(dataByHost); 
                $scope.loading = false;   
            })
            .error(function (err, status) {
                setGraphData([]);
                $scope.loading = false;
                $rootScope.showAlert(
                    { msg : 'Error when loading job attempts', type : 'danger'},
                    { data : err, status : status });
            });
    };

    $scope.searchJob = function () {
        $scope.loading = true;
        setGraphData([]);
        $cookies.jobId = $scope.jobId;
        $scope.loadJob();
    };

    function setGraphData(dataByHost) {
        avgMapTimeChart.setData(dataByHost);
        avgReduceTimeChart.setData(dataByHost);
        nbMapsChart.setData(dataByHost);
        nbReducesChart.setData(dataByHost);
    }
});
