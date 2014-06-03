
// Controller for the job list

angular.module('hadoopJobsApp').controller('JobListController', function ($rootScope, $scope, $http, $timeout, $location) {
    'use strict';

    $scope.jobSort = "-startTime",
    $scope.filteredJobs = [],
    $scope.jobs = [],
    $scope.numPages = 0,
    $scope.currentPage = 1,
    $scope.numPerPage = 10,
    $scope.maxSize = 5;

    $scope.$on('cluster-changed', function (event, data) {
        $scope.refreshJobs();
    });

    $timeout(function () {
        if ($rootScope.getCluster()) {
            $scope.refreshJobs();
        }
    }, 100);

    $scope.refreshJobs = function () {
        $scope.refreshing = true;
        $scope.loadJobList($rootScope.getCluster());
    };

    $scope.loadJobList = function (cluster) {
        
        $http
            .get('/jobs/' + cluster, { "headers" : { "Cache-Control" : "no-cache" }})
            .success(function (data) {
                $scope.jobs = data;
                $scope.jobs.forEach(function(job) {
                    job.start = new Date(job.startTime).toLocaleString();
                    job.end = new Date(job.finishTime).toLocaleString();
                });
                $scope.totalItems = $scope.jobs.length;
                $scope.numPages = Math.ceil($scope.jobs.length / $scope.numPerPage);
                $scope.updateJobs();
                $scope.refreshing = false;
            })
            .error(function (err, status) {
                $scope.refreshing = false;
                $rootScope.showAlert(
                    { msg : 'Error when refreshing job list', type : 'danger'},
                    { data : err, status : status });
            });
    };

    $scope.totalJobs = function () {
        return $scope.filteredJobs.length;
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
        $scope.updateJobs();
    };

    $scope.showJob = function (id) {
        $location.path('/job');

        $timeout(function () {
            $rootScope.$broadcast('show-job', {jobId : id});
        }, 100);
    }

    $scope.updateJobs = function () {
        var begin = (($scope.currentPage - 1) * $scope.numPerPage),
            end = begin + $scope.numPerPage;

        $scope.filteredJobs = $scope.jobs.slice(begin, end);
      };

    $scope.$watch('currentPage + numPerPage', $scope.updateJobs);
    
})
.filter("startFrom", function() {
    
    return function(input, start) {
        start = +start;
        return input.slice(start);
    }

});
