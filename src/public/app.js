/**
 * Created by harshana on 6/1/17.
 */


var myCalender = angular.module('myCalender', ['mgcrea.ngStrap']);

myCalender.controller('homeController', function ($scope, $timeout, $q, $popover) {
        $scope.MonthNames = ['Dept.', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $scope.data = [];
        $scope.showContent = false;

        // Client ID and API key from the Developer Console
        var CLIENT_ID = '502581757627-t6g279js6onoiaarmqqq3mfhl5ndi9mi.apps.googleusercontent.com';

        // Array of API discovery doc URLs for APIs used by the quickstart
        var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

        // Authorization scopes required by the API; multiple scopes can be
        // included, separated by spaces.
        var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

        var authorizeButton = angular.element('#authorize-button')[0];
        var signoutButton = angular.element('#signout-button')[0];

        function getEventsForCalender(calenderId) {
            return $q(function (resolve, reject) {
                var today = new Date();
                var dt = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
                gapi.client.calendar.events.list({
                    'calendarId': calenderId,
                    'timeMin': dt.toISOString(),
                    'showDeleted': false,
                    'singleEvents': true,
                    'maxResults': 999999,
                    'orderBy': 'startTime'
                }).then(function (response) {
                    //var events = response.result.items;
                    resolve(response.result);

                });
            });
        }

        function populateDateForCal(data, month) {
            try {
                var events = [];
                var today = new Date();
                var startDt = new Date(today.getFullYear(), month - 1, 1, 0, 0, 0, 0);
                var endDt = new Date(today.getFullYear(), month, 0, 23, 59, 59, 999);
                var monthEvents = data.filter(function (f) {
                    if (f.start.hasOwnProperty('dateTime')) {
                        return new Date(f.start.dateTime) >= startDt && new Date(f.start.dateTime) <= endDt;
                    }
                    else if (f.start.hasOwnProperty('date')) {
                        return new Date(f.start.date) >= startDt && new Date(f.start.date) <= endDt;
                    } else {
                        return false;
                    }

                });
                if (monthEvents.length == 0) {
                    //add blank one
                    events.push(
                        {
                            name: '',
                            attendees: [],
                            start: undefined,
                            end: undefined,
                            location: '',
                            description: '',
                            widthStyle: {'width': '10%'}
                        });

                } else {
                    for (var j = 0; j < monthEvents.length; j++) {
                        var event = monthEvents[j];
                        var extraClasses = 'show-item';
                        if (j == 0)
                            extraClasses = 'left-brdr show-item';
                        var startDt = undefined;
                        if (event.start.hasOwnProperty('dateTime')) {
                            startDt = new Date(event.start.dateTime);
                        } else {
                            startDt = new Date(event.start.date);
                        }

                        var endDt = undefined;
                        if (event.end.hasOwnProperty('dateTime')) {
                            endDt = new Date(event.end.dateTime);
                        } else {
                            endDt = new Date(event.end.date);
                        }
                        var colorId = 'color-default';
                        if (event.hasOwnProperty('colorId')) {
                            colorId = 'color-' + event.colorId;
                        }
                        var att = undefined;
                        if (event.hasOwnProperty('attachments')) {
                            att = event.attachments;
                        }
                        events.push(
                            {
                                name: event.summary,
                                attendees: event.attendees,
                                start: startDt,
                                end: endDt,
                                location: event.location,
                                description: event['description'],
                                widthStyle: {'width': (100 / (monthEvents.length )) - 6 + '%'},
                                extraClass: extraClasses,
                                colorId: colorId,
                                id: event.id,
                                attachments: att

                            });
                    }
                }
                return events;
            }
            catch (e) {
                console.log(e);
            }

        }


        function populateData() {
            $scope.data = [];
            var calIds = [
                'pearson.com_gvkila91d7vgf3pnthuh5dn058@group.calendar.google.com',
                'pearson.com_bbgfdvvqfrunt79b2c4cgh0lt8@group.calendar.google.com',
                'pearson.com_tgvprfn8e0aakbautlu6h6ra90@group.calendar.google.com',
                'pearson.com_b6jl3fraislnke3tfb969ru7ts@group.calendar.google.com',
                'pearson.com_coo567atdfiskutr7iipul84kk@group.calendar.google.com',
                'pearson.com_sten15kc2iqfkithdpojcq104c@group.calendar.google.com',
                'pearson.com_3polpfv3rqttj2tbcqo80km5eg@group.calendar.google.com',
                'pearson.com_h2mll5g9ndpt6qebq8cp5lj0d8@group.calendar.google.com'
            ];

            var apiData = [];

            for (var i = 0; i < calIds.length; i++) {

                getEventsForCalender(calIds[i]).then(
                    function (data) {
                        apiData.push(data);
                    }
                )
            }

            var fillData = function () {

                apiData = apiData.sort(function (a, b) {
                    if (a.summary.toLowerCase() < b.summary.toLowerCase()) {
                        return -1;
                    }
                    else if (a.summary.toLowerCase() > b.summary.toLowerCase()) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                if (calIds.length === apiData.length) {
                    for (var i = 0; i < 13; i++) {
                        var monthData = {
                            name: $scope.MonthNames[i],
                            no: i,
                            calenders: []
                        };
                        for (var j = 0; j < apiData.length; j++) {
                            var api = apiData[j];
                            if (i === 0) {
                                monthData.calenders.push({
                                    name: api.summary,
                                    events: [],
                                    showName: api.summary,
                                    title: api.description,
                                    id: api.etag
                                });

                            } else {

                                var events = populateDateForCal(api.items, i);
                                monthData.calenders.push({
                                    name: api.summary,
                                    events: events,
                                    id: api.etag + '-' + i
                                });
                            }
                        }

                        $scope.data.push(monthData)
                    }
                    $scope.showContent = true;
                } else {
                    console.log('fildata waiting 600');
                    $timeout(fillData, 600);
                }
            };
            fillData();
        }


        /**
         *  Called when the signed in status changes, to update the UI
         *  appropriately. After a sign-in, the API is called.
         */
        $scope.updateSigninStatus = function (isSignedIn) {
            if (isSignedIn) {
                authorizeButton.style.display = 'none';
                //  signoutButton.style.display = 'block';
                populateData();
            } else {
                authorizeButton.style.display = 'block';
                //signoutButton.style.display = 'none';
            }
        };

        /**
         *  Initializes the API client library and sets up sign-in state
         *  listeners.
         */
        $scope.initClient = function () {

            gapi.client.init({
                discoveryDocs: DISCOVERY_DOCS,
                clientId: CLIENT_ID,
                scope: SCOPES
            }).then(function () {
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen($scope.updateSigninStatus);

                // Handle the initial sign-in state.
                $scope.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            });
        };

        /**
         *  On load, called to load the auth2 library and API client library.
         */
        $scope.init = function () {
            var countUp = function () {
                if (typeof gapi !== 'undefined') {
                    gapi.load('client:auth2', $scope.initClient);
                } else {
                    console.log('checking again in 1 sec!');
                    $timeout(countUp, 1000);
                }
            };
            countUp();
        };

        /**
         *  Sign in the user upon button click.
         */
        $scope.btnAuthorize_click = function () {
            gapi.auth2.getAuthInstance().signIn();
        };
        /**
         *  Sign out the user upon button click.
         */
        $scope.btnSignOut_click = function () {
            gapi.auth2.getAuthInstance().signOut();
            $scope.showContent = false;
        };
        $scope.myPopover = {};

        $scope.calenderItem_click = function ($event, calender, event) {

            console.log(calender);
            console.log(event);
            if (event === null) {
                var p = angular.element($event.currentTarget.parentNode.parentNode);

                if (!$scope.myPopover['_G_' + p.attr('id')]) {

                    var myPopover = $popover(
                        angular.element(p),
                        {
                            trigger: 'click',
                            autoClose: true,
                            placement: 'bottom',
                            content: calender,
                            templateUrl: 'popover-a.html'
                        }
                    );
                    $scope.myPopover['_G_' + p.attr('id')] = myPopover;
                    $timeout(function () {
                        $event.target.click();
                    }, 500);
                }
            } else {
                if (!$scope.myPopover[calender.$$hashKey + event.id]) {
                    if (event.attendees && event.attendees.length > 0) {
                        event.attendeesList = event.attendees.map(function (val) {
                            return val.displayName || val.email;
                        }).join(', ');
                    }
                    var myPopover = $popover(
                        angular.element($event.currentTarget),
                        {
                            trigger: 'click',
                            autoClose: true,
                            placement: 'bottom',
                            content: event,
                            templateUrl: 'popover.html'
                        }
                    );
                    $scope.myPopover[calender.$$hashKey + event.id] = myPopover;
                    $timeout(function () {
                        $event.target.click();
                    }, 500);
                }

            }

        };

        $scope.init();

    }
)
;

myCalender.directive('moreButton', function () {
    return {
        restrict: 'E',
        scope: {
            evnt: '='
        },
        controller: function ($scope, $popover, $timeout, $rootScope) {

            $scope.btnId = 'btn_' + Math.random().toString().replace('.', '_');

            $scope.togglePopover = function ($event) {
                $rootScope.$broadcast('ItemClicked');
                if ($scope.myPopover) {

                } else {
                    if ($scope.evnt.attendees && $scope.evnt.attendees.length > 0) {
                        $scope.evnt.attendeesList = $scope.evnt.attendees.map(function (val) {
                            return val.displayName || val.email;
                        }).join(', ');
                    }
                    $scope.myPopover = $popover(
                        angular.element('#' + $scope.btnId),
                        {
                            trigger: 'click',
                            autoClose: true,
                            placement: 'bottom',
                            content: $scope.evnt,
                            templateUrl: 'popover.html'
                        }
                    );
                    $timeout(function () {
                        $event.target.click();
                    }, 500);
                }
            };
            $scope.$on('ItemClicked', function (event) {
                if ($scope.myPopover) {
                    $scope.myPopover.hide();
                }
            });
            $scope.init = function () {

            };
        },
        template: ' <button id="{{btnId}}" class="btn btn-success" ng-click="togglePopover($event)">Show</button>'
    }
});