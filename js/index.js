angular.module('rr0', ['rr0.nav', 'rr0.place', 'rr0.foot', 'rr0.context', 'ui.router'])
  .config(['$logProvider', function ($logProvider) {
    'use strict';
    $logProvider.debugEnabled(false);
  }])
  .controller('AppController', ['$scope', function ($scope) {
    'use strict';
    $scope.title = '';
    $scope.setTitle = function(newTitle) {
      $scope.title = newTitle;
    };

    $scope.author = '';
    $scope.copyright = '';
  }]);