(function () {
    'use strict';

    function serverPickerDialogController($scope, uSyncPublishService) {

        var vm = this;

        vm.loading = true; 
        vm.server = {};
        vm.selectedServer = null;

        vm.options = {
            Alias: '',
            Icon: '',
            Push: true,
            Pull: true,
            Name: '',
        };

        vm.submit = submit;
        vm.close = close; 
        vm.select = select;
        vm.valid = valid;

        uSyncPublishService.getAllServers()
            .then(function (result) {
                vm.servers = result.data;
                vm.loading = false;
            });

        ////////////////

        function select(server) {
            vm.selectedServer = server;
            vm.options.Alias = server.Alias;
            vm.options.Name = server.Name;
            vm.options.Icon = server.Icon;
        }

        function submit() {
            if ($scope.model.submit) {
                $scope.model.submit(vm.options);
            }
        }

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        function valid() {

            if (vm.selectedServer === null) {
                return false;
            }

            if (vm.options.Pull === false && vm.options.Push === false) {
                return false;
            }

            return true;
        }
    }


    angular.module('umbraco')
        .controller('uSyncPublishServerpickerDialogController', serverPickerDialogController);


})();