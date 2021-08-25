(function () {
    'use static';

    function syncController($scope, notificationsService,
        uSyncPublishService,
        uSyncPublishDialogManager) {

        var vm = this;
        vm.working = false;

        vm.servers = [];

        vm.checkSettings = checkSettings;


        /// init 
        getServers();

        //////////

        function checkSettings(server) {

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
                    server: server,
                    contentType: 'settings'
                }
            };

            uSyncPublishDialogManager.openSyncDialog('Deploy Settings', 'publisher', options, complete, 'SettingsPush', '');
        }

        function complete() {
            // console.log('done');
        }


        //////////
        function getServers() {
            uSyncPublishService.getAllServers()
                .then(function (result) {
                    vm.servers = result.data;
                    checkServers(vm.servers);
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

    }

    angular.module('umbraco')
        .controller('uSyncPublisherSyncController', syncController);
})();