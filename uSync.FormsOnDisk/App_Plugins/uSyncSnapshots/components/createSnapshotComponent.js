(function () {
    'use strict';

    var createSnapshotComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/uSyncSnapshots/Components/createComponent.html',
        controllerAs: 'vm',
        controller: createSnapshotController
    };

    function createSnapshotController($rootScope,
        uSync8DashboardService,
        uSyncSnapshotService,
        notificationsService,
        uSyncHub) {

        var vm = this;

        vm.working = false;
        vm.reported = false;
        vm.result = '';

        vm.create = createSnapshot;
        vm.snapshot = {
            name: '',
            includeFolders: true
        };

        vm.createButton = {
            state: 'init',
            defaultButton: {
                labelKey: 'usync_create-snapshot',
                handler: function () {
                    createSnapshot('');
                }
            },
            subButtons: []
        };

        initHub();
        getHandlerGroups();

        ///
        function createSnapshot(group) {
            vm.createButton.state = 'busy';
            vm.working = true;
            vm.reported = false;
            vm.result = "";

            uSyncSnapshotService.createSnapshot(vm.snapshot.name, vm.snapshot.includeFolders, group, getClientId())
                .then(function (result) {
                    vm.createButton.state = 'success';
                    vm.reported = true;

                    if (result.data.FileCount === 0) {
                        vm.result = 'Empty Snapshot, no changes detected';
                    }
                    else {
                        vm.result = 'Snapshot created ' + result.data.FileCount + ' changes captured';
                    }

                    $rootScope.$broadcast('usync-snapshot-reloaded');
                    notificationsService.success('complete', 'snapshot created');
                }, function (error) {
                    vm.working = false;
                    vm.createButton.state = 'error';
                    notificationsService.error('failed', error.data.ExceptionMessage);
                });
        }

        function getHandlerGroups() {
            uSync8DashboardService.getHandlerGroups()
                .then(function (result) {
                    angular.forEach(result.data, function (group, key) {
                        vm.createButton.subButtons.push({
                            handler: function () {
                                createSnapshot(group);
                            },
                            labelKey: 'usync_create-' + group.toLowerCase()
                        });
                    });
                });
        }

        function initHub() {
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
        .component('usyncSnapshotCreate', createSnapshotComponent);
})();