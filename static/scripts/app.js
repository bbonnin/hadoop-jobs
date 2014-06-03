
var hadoopJobsApp = angular.module('hadoopJobsApp', ['ui.bootstrap', 'ngRoute', 'ngResource', 'ngCookies', 'navbar']);

/** Configuration of the application routes */
hadoopJobsApp.config(function ($routeProvider, $httpProvider) {
    'use strict';

    $httpProvider.interceptors.push('HttpInterceptor');

    $routeProvider.when('/', {
        redirectTo : '/jobs'
    })
    .when('/jobs', {
        templateUrl : 'views/joblist.html',
        controller : 'JobListController'

    })
    .when('/job', {
        templateUrl : 'views/job.html',
        controller: 'JobController'
    })
    .otherwise({
        redirectTo : '/'
    });
});

hadoopJobsApp.run(function ($rootScope, $location, $timeout) {
    'use strict';

    $timeout(function () {
        if (!$rootScope.getCluster()) {
            $rootScope.showAlert({msg : 'You have to select a cluster', type : 'info'});
        }
    }, 20);
    
});



/** Main Controller. */
hadoopJobsApp.controller('HadoopJobsCtrl', function ($scope, $location, $rootScope, $cookies, $http) {
    'use strict';

    $rootScope.cluster = $cookies.cluster ? $cookies.cluster : "?";
    $rootScope.alerts = [];

    $scope.clusters = [];

    $http.get('/clusters').success(function (data) {
        $scope.clusters = data;
    });

    $scope.$on('$routeChangeStart', function(next, current) {
        $rootScope.closeAlert();
    });

    $scope.checkCluster = function () {
        var cluster = $scope.selectedCluster;
        if (cluster) {
            $cookies.cluster = cluster;
            $rootScope.cluster = cluster;
            $("#clusterName").text(cluster);
            $("#chooseCluster").modal("hide");

            $rootScope.$broadcast('cluster-changed');
        }
    };

    $rootScope.getCluster = function () {
        return $rootScope.cluster && $rootScope.cluster !== "?" ? $rootScope.cluster : null;
    };

    $rootScope.showAlert = function (alert, httpResponse) {
        var newAlert = alert;

        if (httpResponse) {
            if (httpResponse.data && httpResponse.data.message) {
                newAlert.msg += ' : ' + httpResponse.data.message;
            }
            else if (httpResponse.status === 404) {
                newAlert.msg += ' : requested resource does not exist';
            }
            else {
                newAlert.msg += ' (error HTTP = ' + httpResponse.status + ')';
            }
        }

        $rootScope.alerts = [ newAlert ];
    };

    $rootScope.closeAlert = function($index) {
        $rootScope.alerts = [];
    };
});


hadoopJobsApp.factory('HttpInterceptor', function ($rootScope, $q, $location) {
    'use strict';

    return {
        
        'request': function (config) {
            //$rootScope.closeAlert();
            return config || $q.when(config);
        },

        'responseError': function (response) {
            // Generic error display
            $rootScope.showAlert(
                    { msg : 'Error during when requesting data', type : 'danger'},
                    { data : response.data, status : response.status });

            $rootScope.reponse = response;
            return $q.reject(response);
        }
    };
    
});
