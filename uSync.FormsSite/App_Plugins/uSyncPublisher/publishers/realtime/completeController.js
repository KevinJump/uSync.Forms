(function () {
    'use strict';
    function completeController($scope) {
        $scope.vm.complete = true;
    }

    angular.module('umbraco')
        .controller('uSyncPublisherCompleteController', completeController);
})();