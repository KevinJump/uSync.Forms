(function () {
    'use strict';

    var usyncSendOptionComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/uSyncPublisher/Components/uSyncSendOption.html',
        bindings: {
            option: '=',
            label: '@',
            description: '@',
            showDisabled: '<',
            disabled: '=',
            disabledValue: '='
        },
        controllerAs: 'vm',
        controller: sendOptionController
    };

    function sendOptionController($scope, localizationService) {

        var vm = this;
        vm.canToggle = canToggle;
        vm.toggle = toggle;


        vm.$onInit = function () {
            localize();
            vm.default = vm.option.value;
        }

        var evts = [];

        evts.push($scope.$watch('vm.disabled', function (newVal, oldVal) {
            if (newVal !== undefined) {
                if (newVal === true) {
                    vm.default = vm.option.value;
                    vm.option.value = vm.disabledValue;
                }
                else {
                    vm.option.value = vm.default;
                }
            }
        }));

        vm.$onDestroy = function () {
            for (var e in evts) {
                evts[e]();
            }
        };

        function canToggle(option) {
            return option.toggle;
        }

        function toggle(option) {
            if (option.toggle) {
                option.value = !option.value;
            }
        }

        function localize() {

            if (vm.label && vm.label[0] === '@') {
                localizationService.localize(vm.label.substring(1))
                    .then(function (data) {
                        vm.labelString = data;
                    });
            }
            else {
                vm.labelString = vm.label;
            }

            if (vm.description && vm.description[0] === '@') {
                localizationService.localize(vm.description.substring(1))
                    .then(function (data) {
                        vm.descriptionString = data;
                    });
            }
            else {
                vm.descriptionString = vm.description;
            }
        }   


    }

    angular.module('umbraco')
        .component('usyncSendOption', usyncSendOptionComponent);

})();