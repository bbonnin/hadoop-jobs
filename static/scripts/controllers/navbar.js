
// Controller for the navigation bar

angular.module('navbar', []).controller('NavbarController', function ($scope, $location) {
    'use strict';

    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    }
});
