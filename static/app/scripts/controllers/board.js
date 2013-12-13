'use strict';

angular.module('retrospectApp')
    .controller('BoardCtrl', [
        '$scope',
        '$routeParams',
        'retrospectives',
        'tickets',

        function ($scope, $routeParams, retrospectives, tickets, BoardService) {
            var updateTickets;

            $scope.retroId = $routeParams.retroId;
            $scope.retroName = '';
            $scope.tickets = [];
            $scope.choosingTag = false;

            $scope.deleteTicket = function (ticket) {
                var index = $scope.tickets.indexOf(ticket);

                tickets.delete({'ticketId': ticket.id, 'retroId': $scope.retroId}, function () {
                    console.log('got a response');
                });

                $scope.tickets.splice(index, 1);
            };

            $scope.updateTickets = function () {
                console.log('Updating tickets.');
                tickets.get({'retroId': $scope.retroId}, function (tickets) {
                    console.log('Got tickets');
                    $scope.tickets = tickets.results;
                });
            };

            $scope.chooseTag = function (ticket) {
                console.log(ticket.id);
                $scope.choosingTag = true;
            };

            retrospectives.get({'retroId': $scope.retroId}, function (retrospective) {
                $scope.retroName = retrospective.name;
            });

            $scope.updateTickets();
        }
    ]
);
