/**
 * Created by harshana on 6/1/17.
 */


var weatherApp = angular.module('myCalender', ['mgcrea.ngStrap']);

weatherApp.controller('homeController', function ($scope, $timeout, $q, $popover) {
        $scope.MonthNames = ['*', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $scope.data = [];


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
                    var events = response.result.items;
                    resolve(events);

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
                            widthStyle: {'width': '2px'}
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
                                id: event.id


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
            getEventsForCalender('pearson.com_0jlo9lghjersvsfs1dqe6r9j3c@group.calendar.google.com')
                .then(function (first) {

                    getEventsForCalender('pearson.com_1ph0u04hfumpa10i2nimqv0a14@group.calendar.google.com')
                        .then(function (secound) {
                            for (var i = 0; i < 13; i++) {
                                var monthData = {
                                    name: $scope.MonthNames[i],
                                    no: i,
                                    calenders: []
                                };
                                if (i === 0) {
                                    monthData.calenders.push({name: 'Calender 1', events: [], showName: 'Calender 1'});
                                    monthData.calenders.push({name: 'Calender 2', events: [], showName: 'Calender 2'});

                                } else {
                                    console.log(first);
                                    var events = populateDateForCal(first, i);
                                    monthData.calenders.push({name: 'Calender 1', events: events});

                                    events = populateDateForCal(secound, i);
                                    monthData.calenders.push({name: 'Calender 2', events: events});

                                }
                                $scope.data.push(monthData)
                            }
                            console.log($scope.data);
                        });
                });

        }


        /**
         *  Called when the signed in status changes, to update the UI
         *  appropriately. After a sign-in, the API is called.
         */
        $scope.updateSigninStatus = function (isSignedIn) {
            if (isSignedIn) {
                authorizeButton.style.display = 'none';
                signoutButton.style.display = 'block';
                populateData();
            } else {
                authorizeButton.style.display = 'block';
                signoutButton.style.display = 'none';
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
        };
        $scope.myPopover = {};

        $scope.calenderItem_click = function ($event, calender, event) {

            console.log(calender);
            console.log(event);
            if (calender.events.length > 3) {
                if (!$scope.myPopover['_MY_' + calender.$$hashKey + event.id]) {
                    calender.itemClickHandler = function ($event, event) {
                        if (!$scope.myPopover[calender.$$hashKey + event.id]) {
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
                    };
                    var myPopover = $popover(
                        angular.element($event.currentTarget),
                        {
                            trigger: 'click',
                            autoClose: true,
                            placement: 'bottom',
                            content: calender,
                            templateUrl: 'popover-a.html'
                        }
                    );
                    $scope.myPopover['_MY_' + calender.$$hashKey + event.id] = myPopover;
                    $timeout(function () {
                        $event.target.click();
                    }, 500);
                }
            } else {
                if (!$scope.myPopover[calender.$$hashKey + event.id]) {
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
                    /* $scope.myPopover[event.id].$promise.then(function () {
                     $scope.myPopover[event.id].toggle($event);
                     }
                     );*/
                }

            }

        };

        $scope.init();

    }
)
;
