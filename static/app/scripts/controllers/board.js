'use strict';

angular.module('retrospectApp')
    .controller('BoardCtrl', [
        '$scope',
        '$q',
        '$routeParams',
        'retrospectives',
        'tickets',
        'tags',

        function ($scope, $q, $routeParams, retrospectives, tickets, tags) {
            var getTags = function () {
                    console.log('Updating tags...')
                    tags.get(function (tags) {
                        $scope.tags = tags.results.map(function (tag) {
                            return tag.name;
                        });

                        $scope.tagsData = {
                            local: $scope.tags
                        };
                    });
                },

                getTickets = function () {
                    console.log('Updating tickets...');
                    tickets.get({'retroId': $scope.retroId}, function (tickets) {
                        console.log('Got tickets');
                        $scope.tickets = tickets.results;
                    });
                },

                saveTicketTags = function (tags) {
                    var defer = $q.defer(),
                        ptags = $scope.selectedTags.map(function (tag) {
                                    return { 'name': tag };
                                });

                    if (!$scope.selectedTags.length) {
                        defer.resolve(true);
                        return defer.promise;
                    }

                    tickets.put(
                        {
                            'retroId': $scope.retroId,
                            'ticketId': $scope.selectedTicket.id
                        },
                        {
                            'tags': ptags
                        },
                        function (response) {
                            console.log(response);
                            defer.resolve(response);
                        }
                    );

                    return defer.promise;
                };

            $scope.retroId = $routeParams.retroId;
            $scope.retroName = '';
            $scope.tickets = [];

            $scope.tags = [];
            $scope.selectedTags = [];
            $scope.selectedTicket = null;

            $scope.tagsData = {
                local: []
            };

            $scope.choosingTag = false;

            $scope.deleteTicket = function (ticket) {
                var index = $scope.tickets.indexOf(ticket);

                tickets.delete({
                    'ticketId': ticket.id,
                    'retroId': $scope.retroId
                }, function () {
                    console.log('got a response');
                });

                $scope.tickets.splice(index, 1);
            };

            /**
             * Won't select the tag if it already exists in the tags array.
             *
             * @return {void}
             */
            $scope.selectTag = function () {
                debugger;
                if (!~$scope.selectedTags.indexOf($scope.tagSelect)) {
                    // @TODO: This is a quick fix. When you click the autocomplete selection
                    // you get a object not a string.
                    if ($scope.tagSelect.value) {
                        $scope.tagSelect = $scope.tagSelect.value;
                    }
                    $scope.selectedTags.push($scope.tagSelect);
                    $scope.tagSelect = '';
                }
            };

            /**
             * Won't try to remove a tag.
             *
             * @param  {string} deselectThisTag The tag name.
             * @return {void}
             */
            $scope.deselectTag = function (deselectThisTag) {
                var index = $scope.selectedTags.indexOf(deselectThisTag);

                if (~index) {
                    $scope.selectedTags.splice(index, 1);
                }
            };

            $scope.chooseTags = function (ticket) {
                $scope.choosingTag = true;
                $scope.selectedTicket = ticket;

                // We now reference the ticket tags
                $scope.selectedTags = ticket.tags || [];
            };

            $scope.closeTagChooser = function () {
                saveTicketTags($scope.selectedTags)
                    .then(function (thereWereNewTags) {
                        // Maybe don't refresh if no tags were saved.
                        if (thereWereNewTags) {
                            $scope.choosingTag = false;
                            $scope.selectedTicket = null;
                            $scope.refresh();
                        }
                    });
            };

            $scope.refresh = function () {
                getTickets();
                getTags();
            };

            retrospectives.get({'retroId': $scope.retroId}, function (retrospective) {
                $scope.retroName = retrospective.name;
            });

            $scope.refresh();
        }
    ]
);
