(function () {
    'use strict';

    function peopleController(notificationsService, uSyncExpansionService, uSyncHub) {
        var vm = this;

        vm.importHandlers = importHandlers;
        vm.reportHandlers = reportHandlers;
        vm.exportHandlers = exportHandlers;

        vm.memberTypes = ['member', 'member-group'];
        vm.userTypes = ['user', 'user-group'];

        vm.importMemberButton = {
            state: 'init',
            defaultButton: {
                labelKey: 'usync_importmembers',
                handler: function () {
                    vm.importHandlers(vm.memberTypes, false);
                }
            },
            subButtons: [{
                labelKey: 'usync_importmembersforce',
                handler: function () {
                    vm.importHandlers(vm.memberTypes, true);
                }
            }]
        };


        vm.importUserButton = {
            state: 'init',
            defaultButton: {
                labelKey: 'usync_importusers',
                handler: function () {
                    vm.importHandlers(vm.userTypes, false);
                }
            },
            subButtons: [{
                labelKey: 'usync_importusersforce',
                handler: function () {
                    vm.importHandlers(vm.userTypes, true);
                }
            }]
        };


        vm.status = {
            Count: 0, Total: 1, Message: 'Initializing', Handlers: []
        };

        vm.update = {
            Message: '', Count: 0, Total: 1
        };

        vm.licenced = true;
        uSyncExpansionService.isLicenced('people', '8.0.0')
            .then(function (result) {
                vm.licenced = result.data;
            });

        InitHub();

        function importHandlers(handlers, force) {

            vm.reported = false;
            vm.working = true;
            vm.action = 'Import';

            uSyncExpansionService.importItems(handlers, force, getClientId())
                .then(function (result) {
                    vm.results = result.data;
                    vm.working = false;
                    vm.reported = true;
                    vm.buttonState = 'success';
                }, function (error) {
                    vm.buttonState = 'error';
                    vm.working = false;
                    vm.reported = true;
                    notificationsService.error('Importing', error.data.Message);
                });
        }

        function reportHandlers(handlers) {

            vm.reported = false;
            vm.working = true;
            vm.action = 'Report';

            uSyncExpansionService.reportItems(handlers, getClientId())
                .then(function (result) {
                    vm.results = result.data;
                    vm.working = false;
                    vm.reported = true;
                    vm.buttonState = 'success';
                }, function (error) {
                    vm.buttonState = 'error';
                    vm.working = false;
                    vm.reported = true;
                    notificationsService.error('Reporting', error.data.Message);
                });

        }


        function exportHandlers(handlers) {


            vm.reported = false;
            vm.working = true;
            vm.action = 'Export';

            uSyncExpansionService.exportItems(handlers, getClientId())
                .then(function (result) {
                    vm.results = result.data;
                    vm.working = false;
                    vm.reported = true;
                    vm.buttonState = 'success';
                }, function (error) {
                    vm.buttonState = 'error';
                    vm.working = false;
                    vm.reported = true;
                    notificationsService.error('Exporting', error.data.Message);
                });


        }


        ////// signal r
        ////// SignalR things 
        function InitHub() {
            uSyncHub.initHub(function (hub) {

                vm.hub = hub;

                vm.hub.on('add', function (data) {
                    vm.status = data;
                });

                vm.hub.on('update', function (update) {
                    vm.update = update;
                });

                vm.hub.start();
            });
        }

        function getClientId() {
            if ($.connection !== undefined && $.connection.hub !== undefined) {
                return $.connection.hub.id;
            }
            return "";
        }
    }

    angular.module('umbraco')
        .controller('uSyncPeopleController', peopleController);
})();