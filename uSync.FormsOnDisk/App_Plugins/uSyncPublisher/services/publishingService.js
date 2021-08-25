(function () {
    'use strict';

    function publishingService($http) {

        var serviceRoot = Umbraco.Sys.ServerVariables.uSyncPublisher.publisherService;


        return {
            getAction: getAction,
            performAction: performAction,
            clean: clean
        };

        ////////////

        function getAction(request) {
            return $http.post(serviceRoot + 'GetAction', request);
        }

        function performAction(request) {
            return $http.post(serviceRoot + 'PerformAction', request);
        }

        function clean(id, server) {
            return $http.delete(serviceRoot + `clean/${id}?server=` + server);
        }
    };

    angular.module('umbraco')
        .factory('uSyncPublishingService', publishingService);

})();