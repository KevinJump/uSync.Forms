(function () {
    'use strict';

    function cacheController(
        overlayService, notificationsService,
        uSyncCacheService) {

        var vm = this;

        vm.set = 'publisher';

        vm.enabled = false;
        vm.toggleCaches = toggleCaches;
        vm.cacheButtonState = 'init';

        vm.rebuild = rebuild;

        getStatus(vm.set);

        /////////////

        function getStatus(set) {
            uSyncCacheService.getStatus(set).
                then(function (result) {
                    vm.status = result.data;
                    vm.enabled = checkEnabled(vm.status);
                });
        }

        function checkEnabled(status) {
            return status.enabled;
        }

        function toggleCaches() {

            if (vm.enabled) {
                confirmDisable();
            }
            else {

                uSyncCacheService.toggleCaches(true, vm.set)
                    .then(function (result) {

                        vm.status = result.data;
                        vm.enabled = checkEnabled(vm.status);

                        confirmRebuild(
                            'After enabling the cache it is recommended you rebuild all cached items to ensure its all upto date. Do you want to rebuild the cache?'
                        );
                    });
            }
        }


        function confirmDisable() {
            var overlay = {
                "view": "default",
                "title": "Disable cache",
                "content": "Disabling the cache will remove all cached content, if you re-enable the cache you will have to rebuild it.",
                "disableBackdropClick": true,
                "disableEscKey": true,
                "submitButtonLabel": "Keep cache enabled",
                "closeButtonLabel": "Disable cache",
                submit: function () {
                    overlayService.close();
                },
                close: function (model) {

                    model.submitButtonState = "busy";

                    uSyncCacheService.toggleCaches(false, vm.set)
                        .then(function (result) {

                            vm.status = result.data;
                            vm.enabled = checkEnabled(vm.status);

                            notificationsService.success('Removed', 'Cache disabled');
                        });

                    overlayService.close();

                }
            };

            overlayService.open(overlay);
        }

        function confirmRebuild(message) {
            var overlay = {
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'overlay/cacheOverlay.html',
                title: "Rebuild uSync caches",
                subtitle: "Refresh the uSync publisher caches for greater syncing speed",
                content: message,
                disableBackdropClick: true,
                disableEscKey: true,
                submitButtonLabel: "Rebuild",
                closeButtonLabel: "Close",
                submit: function (model) {

                    if (model.isRebuilt) {
                        overlayService.close();
                        getStatus(vm.set);
                    }
                    else {

                        if (model.rebuild != null) {
                            model.rebuild();
                        }

                    }

                },
                close: function () {
                    overlayService.close();
                    getStatus(vm.set);
                }
            };

            overlayService.open(overlay);

        }


        function rebuild() {
            confirmRebuild('');
        }
    }

    angular.module('umbraco')
        .controller('uSyncCacheController', cacheController);

})();