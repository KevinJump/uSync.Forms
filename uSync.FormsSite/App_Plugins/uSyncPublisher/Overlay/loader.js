(function () {

    'use strict';

    function loader(eventsService, uSyncPublishOverlayManager) {

        eventsService.on('app.tabChange', function (evt, data) {
            update(data.content);
        });

        eventsService.on('content.loaded', function (evt, data) {
            update(data.content);
        });

        eventsService.on('content.newReady', function (evt, data) {
            update(data.content);
        });

        eventsService.on('content.saved', function (evt, data) {
            update(data.content);
        });

        function update(content) {
            uSyncPublishOverlayManager.insertPublishCmds(content);
        }
     
    }

    angular.module('umbraco').run(loader);

})();