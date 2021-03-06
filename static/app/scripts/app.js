'use strict';

angular.module('retrospectApp', ['ngSanitize', 'ngRoute', 'ngResource', 'retrospectApp.config','fundoo.services'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/retrospectives.html',
                controller: 'RetroCtrl'
            })
            .when('/retrospectives/:retroId', {
                templateUrl: 'views/board.html',
                controller: 'BoardCtrl'
            })
            .when('/retrospectives/:retroId/markup', {
                templateUrl: 'views/wikiboard.html',
                controller: 'BoardCtrl'
            })
            .when('/wordcloud', {
                templateUrl: 'views/wordcloud.html',
                controller: 'WordCloudCtrl'
            })
            .when('/tickets/:retroId', {
                templateUrl: 'views/tickets.html',
                controller: 'TicketCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

    });
