'use strict';

/**
 * @ngdoc overview
 * @name nosieApp
 * @description
 * # nosieApp
 *
 * Main module of the application.
 */
angular
  .module('nosieApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'contenteditable',
    'ngGeolocation',
    'cgBusy'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/message', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/stream', {
        templateUrl: 'views/stream.html',
        controller: 'StreamCtrl',
        controllerAs: 'stream'
      })
      .otherwise({
        redirectTo: '/stream'
      });
  });
