(function () {
    'use strict';

    function exportController($scope,
        navigationService, overlayService,
        uSyncExporterService) {

        var vm = this;
        vm.hasError = false;

        vm.node = $scope.currentNode;

        vm.exportItem = exportItem;
        vm.exportContainer = exportContainer;

        vm.hasChildren = $scope.currentNode.hasChildren;
        vm.isDocType = $scope.currentNode.nodeType === 'documentTypes';
        vm.isMedia = $scope.currentNode.nodeType === 'media';

        vm.options = {
            includeChildren: false,
            includeAncestors: true,
            includeDependencies: true,
            includeFiles: false,
            includeMedia: false,
        };

        vm.close = close;

        function exportItem() {

            prepItem(vm.node);

            vm.options.selection = [vm.node]

            var overlay = {
                options: vm.options,
                view: Umbraco.Sys.ServerVariables.umbracoSettings.appPluginsPath + '/uSyncExporter/exportOverlay.html',
                title: 'Create a sync pack',
                subtitle: 'Create a sync pack of the items you want to export',
                disableBackdropClick: true,
                disableEscKey: true,
                submitButtonLabel: 'Create',
                closeButtonLable: 'close',
                submit: function (model) {
                    if (model.create !== null && model.create !== undefined) {
                        model.create()
                    }
                },
                close: function (close) {
                    overlayService.close();
                }
            };

            overlayService.open(overlay);
        }

        function exportContainer(itemType) {

            console.log(vm.node);
            exportItem();
        }

        function prepItem(item) {

            item.flags = {
                includeChildren: false,
                includeAncestors: true,
                includeDependencies: true
            };

            switch (item.nodeType) {
                case 'media':
                case 'content':
                case 'container':
                    item.flags.includeChildren = true;
                    break;
                case 'templates':
                    item.flags.includeFiles = true;
                    break;
                case 'macros':
                    item.udi = 'umb://macro/00000000-0000-0000-0000-000000000000';
                    break;
            }
        }


        function close() {
            if ($scope.model && $scope.model.close) {
                $scope.model.close();
            }
            else {
                navigationService.hideDialog();
            }
        }
    }

    angular.module('umbraco')
        .controller('usyncExporterExportController', exportController);

})();