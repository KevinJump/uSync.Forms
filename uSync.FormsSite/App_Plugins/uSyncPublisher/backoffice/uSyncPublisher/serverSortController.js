(function () {
    'use strict';

    function serverSortController($scope,
        navigationService,
        notificationsService,
        uSyncPublishService) {

        var vm = this;
        vm.loading = true;

        vm.sortOrder = {};
        vm.servers = [];

        vm.sortableOptions = {
            distance: 10,
            tolerance: 'pointer',
            opacity: 0.7,
            scroll: true,
            cursor: 'move',
            helper: fixSortableHelper,
            update: function () {
                vm.sortOrder.column = '';
                vm.sortOrder.reverse = false;
            }
        };

        vm.save = save;
        vm.close = close;
        vm.sort = sort;

        init();

        function init() {

            vm.loading = true;
            uSyncPublishService.getAllServers()
                .then(function (result) {
                    vm.servers = result.data;
                    vm.loading = false;
                });
        }

        /////////////

        function sort(column) {

        }


        function save() {

            vm.saveButtonState = "busy";

            var order = [];

            for (let i = 0; i < vm.servers.length; i++) {
                order.push(vm.servers[i].Alias);
            }

            uSyncPublishService.setServerOrder(order)
                .then(function (result) {

                    navigationService.syncTree({ tree: "uSyncPublisher", path: $scope.currentNode.path, forceReload: true })
                        .then(() => navigationService.reloadNode($scope.currentNode));

                    vm.saveButtonState = "success";
                }, function (error) {
                    vm.error = error;
                    vm.saveButtonState = "error";
                });
        }

        function close() {
            navigationService.hideDialog();
        }

        ////////
        function fixSortableHelper(e, ui) {
            // keep the correct width of each table cell when sorting
            ui.children().each(function () {
                $(this).width($(this).width());
            });
            return ui;
        }
    }

    angular.module('umbraco')
        .controller('uSyncPublisherServerSortController', serverSortController);

})();