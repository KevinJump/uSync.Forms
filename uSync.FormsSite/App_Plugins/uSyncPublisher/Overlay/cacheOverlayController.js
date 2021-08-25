(function () {
    'use strict';

    function cacheOverlayController($scope, $q, notificationsService, uSyncDependencyManager, uSyncCacheService) {

        var vm = this;
        vm.rebuilding = false;

        $scope.model.rebuilt = false;
        $scope.model.rebuild = rebuildCache
        $scope.model.submitButtonLabel = 'rebuild';

        vm.status = {
            Title: 'Rebuilding uSync Caches',
            Message: 'Collecting items',
            Progress: 0
        };

        vm.offset = 230;
        vm.offsetStyle = { transform: 'translateX(' + vm.offset + 'px)' };

        vm.batchSize = 25;

        vm.cacheTypes = [
            { name: 'Data types', type: 'data-type', icon: 'icon-autofill', active: true },
            { name: 'Content Types', type: 'document-type', icon: 'icon-item-arrangement' },
            { name: 'Media Types', type: 'media-type', icon: 'icon-thumbnails' },
            { name: 'Content', type: 'document', icon: 'icon-document color-orange' },
            { name: 'Media', type: 'media', icon: 'icon-picture color-green' }
        ];

        function rebuildCache() {

            $scope.model.disableSubmitButton = true;
            $scope.model.submitButtonState = 'busy';
            vm.rebuilding = true;

            vm.error = '';

            var i = 0;

            uSyncCacheService.clearCaches('publisher')
                .then(function () {
                    processRebuild(vm.cacheTypes[0]);
                });

            function processRebuild(itemType) {

                calcOffset(i);
                vm.cacheTypes[i].active = true;
                i++;

                rebuildEntityType(itemType)
                    .then(function (result) {
                        if (i < vm.cacheTypes.length) {
                            vm.cacheTypes[i - 1].active = false;
                            processRebuild(vm.cacheTypes[i]);
                        }
                        else {
                            flushCache();
                            $scope.model.closeButtonLabel = 'Done';
                            $scope.model.rebuilt = true;
                            $scope.model.hideSubmitButton = true;
                        }
                    }, function (error) {
                        notificationsService.error('error', 'there where problems rebuilding the cache');
                    });
            }
        }

        function rebuildEntityType(itemType) {

            return $q(function (resolve, reject) {

                vm.status = {
                    Title: 'Rebuilding ' + itemType.name,
                    Icon: itemType.icon,
                    Message: 'Collecting items',
                    Progress: 0
                };

                uSyncCacheService.getAllUdis(itemType.type)
                    .then(function (result) {

                        var batches = uSyncDependencyManager.createBatches(result.data, 10);

                        processItems(itemType.type, batches)
                            .then(function (result) {
                                resolve();
                            }, function (error) {
                                reject(error);
                            });
                    });
            });
        }


        function processItems(entityType, batches) {

            return $q(function (resolve, reject) {

                var i = 0;
                process(batches[i]);

                function process(items) {
                    i++;

                    vm.status.Message = 'Processing batch ' + i + ' of ' + batches.length;
                    vm.status.Progress = (i / batches.length) * 100;

                    uSyncCacheService.cacheItems(entityType, 'publisher', items)
                        .then(function (result) {
                            if (i < batches.length) {
                                process(batches[i]);
                            }
                            else {
                                vm.status.Message = 'Complete';
                                resolve();
                            }
                        }, function (error) {
                            reject(error);
                        });
                }
            });
        }

        function flushCache() {
            uSyncCacheService.flush('publisher')
                .then(function () {
                    // done
                }, function (error) {
                    notificationsService.error('error', 'unable to save cache to disk, check logs');
                });

        }

        function calcOffset(n) {
            var offset = vm.offset - (75 * n);
            vm.offsetStyle = { transform: 'translateX(' + offset + 'px)' };
        }

    }

    angular.module('umbraco')
        .controller('uSyncCacheOverlayController', cacheOverlayController);
})();
