(function () {
    'use strict';

    function defaultController($rootScope, $q, $timeout,
        notificationsService, uSyncPublishService, uSyncPublishDialogManager) {

        var vm = this;
        vm.loading = true;
        vm.settings = {};
        vm.version = '';

        vm.addNew = addNew;
        vm.deploy = deploy;
        vm.gotoSettings = gotoSettings;

        vm.toggleValue = toggleValue;
        vm.copyText = copyText;

        init();

        $rootScope.$on('usync-publish-server-delete', function () {
            init();
        });

        /////
        function addNew() {
            uSyncPublishDialogManager.openNewServerDialog(null, 
                function (saved) {
                    init();
                });
        }

        function gotoSettings(server) {
            uSyncPublishDialogManager.openServerDialog(server.Alias,
                function (saved) {
                    init();
                });
        }

        function deploy(server) {

            var items = [
                {
                    id: '-1', uid: '', name: 'ContentType'
                },
                {
                    id: '-1', udi: '', name: 'DataType'
                },
                {
                    id: '-1', udi: '', name: 'MediaType'
                }];

            var options = {
                entity: {
                    id: '-1',
                    items: items,
                    server: server
                },
                contentType: 'settings'
            };

            uSyncPublishDialogManager.openSyncDialog('Deploy Settings', 'publisher', options, complete, 'SettingsPush', '');
        }

        function complete() {
            // callback for sync dialog.
        }

        /////
        function init() {
            vm.loading = true;
            var promises = [];

            promises.push(uSyncPublishService.getAllServers()
                .then(function (result) {
                    vm.servers = result.data;
                    checkServers(vm.servers);
                }));


            promises.push(uSyncPublishService.getSettings()
                .then(function (result) {
                    vm.settings = result.data;
                }));


            $q.all(promises).then(function () {
                vm.loading = false;
            });

            uSyncPublishService.getVersion()
                .then(function (result) {
                    vm.version = result.data;
                });
        }

        function checkServers(servers) {
            servers.forEach(function (server) {
                uSyncPublishService.checkServer(server.Alias)
                    .then(function (result) {
                        server.status = result.data;
                    });
            });
        }
        

        function toggleValue(value) {
            vm.settings[value] = !vm.settings[value];

            if (vm.time !== undefined && vm.time != null) {
                $timeout.cancel(vm.time);
            }

            // toggle but wait one second before saving (so you can toggle multiple things.)
            vm.time = $timeout(saveSettings, 1000);
        }

        function saveSettings() {
            uSyncPublishService.saveSettings(vm.settings)
                .then(function (result) {
                    notificationsService.success('Save', 'uSync publisher settings saved');
                }, function (error) {
                    notificationsService.error('Error', error.data.ExceptionMessage);
                });
        }


        function copyText() {
            var range = document.createRange();
            range.selectNode(document.getElementById("serverUrl"));
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand("copy");
            window.getSelection().removeAllRanges();
            notificationsService.success('Copied', 'Server url copied to clipboard');
        }


    }

    angular.module('umbraco')
        .controller('uSyncPublisherSettingsDefaultController', defaultController);
})();