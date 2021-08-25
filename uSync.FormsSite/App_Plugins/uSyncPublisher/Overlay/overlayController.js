
(function () {
    'use strict';

    function overlayController($scope, uSyncItemManager) {

        var vm = this;

        $scope.model.moveToNext = moveToNext;
        $scope.model.isComplete = isComplete;

        var model = $scope.model;

        vm.mode = 'Push';
        vm.isSingle = true;
        vm.options = $scope.model.options;
        vm.items = vm.options.items;

        vm.headings = {};

        vm.stepArgs = {
            stepAlias: '',
            target: '',
            options: '',
            clientId: ''
        };

        vm.state = {
            complete: false,
            loading: true,
            hideClose: true,
            valid: false,
            working: false,
            hasError: false,
            error: ''
        };

        vm.actionButton = { state: 'init', name: 'Send' };

        var evts = [];

        evts.push($scope.$watch('vm.state', function (state) {
            if (state !== undefined) {
                if (state.complete) {
                    $scope.model.closeButtonLabel = 'Done';
                    // $scope.model.submitButtonLabel = 'Done';
                    $scope.model.hideSubmitButton = true;
                }

                $scope.model.disableSubmitButton = !state.valid;
            }
        }, true));

        evts.push($scope.$watch('vm.headings', function (headings) {
            if (headings !== undefined) {
                if (headings.title !== undefined) {
                    $scope.model.title = headings.title;
                }

                if (headings.description !== undefined) {
                    $scope.model.subtitle = headings.description;
                }
            }
        }, true));


        $scope.$on('$destroy', function () {
            for (var x in evts) {
                evts[x]();
            }
        });

        function isComplete() {
            return vm.state.isComplete;
        }
     
        function moveToNext() {
            $scope.$broadcast('usync-publish-performAction')
        }

        function init() {
            $scope.model.disableSubmitButton = true;
        }

        init();

    };

    angular.module('umbraco')
        .controller('uSyncPublishOverlayController', overlayController);
})();