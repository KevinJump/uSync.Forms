(function () {
    'use strict';

    function publisherDialogController($scope) {

        var vm = this;

        // methods
        vm.close = close;
        vm.performAction = performAction;
        vm.showItems = showItems;

        // init
        vm.mode = $scope.model.mode;
        vm.options = $scope.model.options;
        vm.items = vm.options.items;
        vm.single = $scope.model.single;
        vm.hideItems = vm.options.hideItems ?? false;

        // state 
        vm.state = {
            complete: false,
            loading: true,
            hideClose: false,
            valid: false,
            working: false,
            hasError: false,
            error: ''
        };

        // ui
        vm.ui = {
            button: {
                state: 'init',
                name: 'Send',
            },
            headings: {
                title: 'uSyncPublisher',
                description: 'push and pull things',
                boxTitle: 'uSyncPublisher_box',
                boxDescription: 'uSyncPublisher_box_desc'
            }
        }

        // button
        vm.actionButton = {
            state: 'init',
            name: 'Send',
            valid: false
        };

        function showItems() {
            return !vm.hideItems && vm.items.length > 1;
        }


        function performAction() {
            $scope.$broadcast('usync-publish-performAction')
        }


        function close() {
            $scope.$broadcast('usync-publish-close');

            if (vm.state.complete && $scope.model.submit) {
                $scope.model.submit();
            }
            else if ($scope.model.close) {
                $scope.model.close();
            }
        }

    }

    angular.module('umbraco')
        .controller('uSyncPublisherDialogController', publisherDialogController);

})();