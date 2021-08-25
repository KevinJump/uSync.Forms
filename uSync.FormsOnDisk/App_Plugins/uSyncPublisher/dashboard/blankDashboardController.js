(function () {
    'use static';


    function blankDashboardController($scope, uSyncPublishService) {

        var vm = this;

        vm.onSelected = onSelected;
        vm.performAction = performAction;
        vm.reset = reset;

        vm.doSync = doSync;

        var emptyGuid = '00000000-0000-0000-0000-000000000000';
        vm.mode = 'settingsPull';

        init();

        ///////////
        function init() {

            vm.setup = false;
            vm.servers = [];
            vm.emptySite = true;


            uSyncPublishService.hasContentOrMedia(false)
                .then(function (result) {
                    vm.emptySite = !result.data;
                });

            vm.picked = false;
            vm.syncSettings = true;
            vm.syncContent = true;
            vm.syncMedia = true;

            vm.items = [];
            vm.options = {};
            vm.headings = {};

            vm.stepArgs = {};
            vm.state = {
                complete: false,
                loading: true,
                hideClose: true,
                complete: false,
                valid: false,
                working: false
            };

            vm.actionButton = { state: 'init', name: 'Send' };

            uSyncPublishService.getServers('pull')
                .then(function (result) {
                    vm.servers = result.data;
                    checkServers(vm.servers);
                });
        }

        function checkServers(servers) {
            servers.forEach(function (server) {
                uSyncPublishService.checkServer(server.Alias)
                    .then(function (result) {
                        vm.state.loading = false;
                        server.status = result.data;
                    });
            });
        }      

        function onSelected(server) {
            vm.server = server;
            vm.picked = true;
        }

        function performAction() {
            $scope.$broadcast('usync-publish-performAction')
        }

        function reset() {
            init();
        }


        function doSync() {
            vm.options = {
                serverAlias: vm.server.Alias,
                contentType: 'settings',
                simple: true, // simple view.
            };

            vm.items = [];

            if (vm.syncSettings) {
                vm.items.push(makeRootItem('ContentTypes', 'document-type'));
                vm.items.push(makeRootItem('DocTypes', 'data-type'));
                vm.items.push(makeRootItem('MediaTypes', 'media-type'));
                vm.items.push(makeRootItem('Domains', 'domain'));
                vm.items.push(makeRootItem('MemberTypes', 'member-type'));
                vm.items.push(makeRootItem('DictionaryItems', 'dictionary-item'));
                vm.items.push(makeRootItem('Macros', 'macro'));
                vm.items.push(makeRootItem('Templates', 'template'));
                vm.items.push(makeRootItem('Languages', 'language'));
            }

            if (vm.syncContent) {
                vm.items.push(makeRootItem('PublicAccess', 'protect'));
                vm.items.push(makeRootItem('Content', 'document'));
            }

            if (vm.syncMedia) {
                vm.items.push(makeRootItem('Media', 'media'));
            }

            vm.setup = true;

        }

        function makeRootItem(name, typename) {
            return {
                udi: 'umb://' + typename + '/' + emptyGuid,
                name: name,
                variants: [{ name: name }]
            };
        }
    }
    
    angular.module('umbraco')
        .controller('uSyncPublisherBlankDashboardController', blankDashboardController);
})();