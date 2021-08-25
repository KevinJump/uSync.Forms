(function () {
    'use strict';

    function cacheService($http) {

        var cacheService = Umbraco.Sys.ServerVariables.uSync.cacheService;

        return {
            getStatus: getStatus,
            toggleCaches: toggleCaches,
            clearCaches: clearCaches,

            getAllUdis: getAllUdis,
            cacheItems: cacheItems,

            flush: flush
        };

        //////////

        function getStatus(set) {
            return $http.get(cacheService + "GetCacheStatus?set=" + set);
        }

        function toggleCaches(enabled, set) {
            return $http.post(cacheService + "ToggleCaches?enabled=" + enabled + "&set=" + set);
        }
        

        function clearCaches(set) {
            return $http.post(cacheService + "ClearCaches?set=" + set);
        }

        function getAllUdis(type) {
            return $http.get(cacheService + "GetAllUdis?type=" + type);
        }

        function cacheItems(type, set, udis) {
            return $http.post(cacheService + "CacheItems?type=" + type + "&set=" + set, udis);
        }

        function flush(set) {
            return $http.post(cacheService + "Flush?set=" + set);
        }

    }

    angular.module('umbraco')
        .factory('uSyncCacheService', cacheService);
})();