(function () {
    'use strict';

    var userControlledBooleanComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/uSyncPublisher/Components/uSyncUserControlledBoolean.html',
        bindings: {
            option: '='
        },
        controllerAs: 'vm',
        controller: userControlledBooleanController

    };

    function userControlledBooleanController($scope) {

        var vm = this;
        vm.userControlled = userControlled;
        vm.toggleUser = toggleUser;

        // workout what the toggle is.
        if (vm.option !== undefined) {
            vm.getToggleValue(vm.option);
        }
        else {
            $scope.$watch('vm.option', function (newValue) {
                if (vm.toggle === undefined && newValue !== undefined) {
                    vm.toggle = getToggleValue(newValue);
                }
            });
        }

        function getToggleValue(value) {
            return value.substring(value.indexOf('-') + 1) === 'yes';
        }
     
        vm.changeToggle = changeToggle;
        function changeToggle(model) {
            if (model) {
                vm.option = vm.option.substring(0, vm.option.indexOf('-') + 1) + 'yes';
            }
            else {
                vm.option = vm.option.substring(0, vm.option.indexOf('-') + 1) + 'no';
            }
        }

        function toggleUser() {
            if (vm.option === undefined) {
                vm.option = 'user-yes';
            }

            else if (vm.option.startsWith('user-'))
            {
                vm.option = vm.option.substring(5);
            }
            else {
                vm.option = 'user-' + vm.option;
            }
        }

        function userControlled() {            
            return vm.option !== undefined && vm.option.startsWith('user-');
        }
    }

    angular.module('umbraco')
        .component('usyncUserControlledBoolean', userControlledBooleanComponent);
})();