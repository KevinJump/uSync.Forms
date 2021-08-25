(function () {
    'use strict';

    function sideBySideController($scope, $sce) {

        var vm = this;

        vm.source = $sce.trustAsResourceUrl($scope.model.source);
        vm.target = $sce.trustAsResourceUrl($scope.model.target)

        vm.close = close;

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }
    }


    angular.module('umbraco')
        .controller('uSyncSideBySideController', sideBySideController);
})();