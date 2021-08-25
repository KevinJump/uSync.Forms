(function () {

    'use strict';

    function realtimeServerConfig($scope, $http) {

        // config view model 
        var cvm = this;
        cvm.showAll = true;

    };

    angular.module('umbraco')
        .controller('realtimeServerConfigController', realtimeServerConfig);

})();