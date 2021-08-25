(function () {

    function exportOverlayController($scope, uSyncHub, uSyncExporterService) {

        var vm = this;
        vm.exporting = false; 
        vm.loading = true;
        vm.complete = false;

        vm.update = {};

        $scope.model.exported = false; 
        $scope.model.create = createExport; 

        vm.options = {
            id: '00000000-0000-0000-0000-000000000000',
            name: 'syncpack_' + moment().format('YYYY_MM_DD_hhmmss') ,
            stepIndex: 0,
            request: {
                pageNumber: 0,
                // fill in the request here...
                items: [],
                options: {
                    removeOrphans: false,
                    includeFiles: $scope.model.options.includeFiles,
                    includeFileHash: false,
                    includeSystemFiles: false,
                    includeMediaFiles: $scope.model.options.includeMedia,
                    orphanTypes: false,
                    cultures: [],
                    attributes: [],
                },
            },
            clientId: getClientId()
        };

        vm.selection = $scope.model.options.selection;

        getItems(vm.selection);

        function getItems(selection) {

            var items = prepItems(selection, $scope.model.options);

            uSyncExporterService.getSyncItems(items)            
                .then(function (result) {
                    vm.options.request.items = result.data;
                    vm.loading = false; 
                });
        }

        function prepItems(selection, options) {

            var items = [];

            for (let n = 0; n < selection.length; n++) {
                items.push({
                    id: selection[n].id,
                    udi: selection[n].udi,
                    name: selection[n].name,
                    entityType: selection[n].entityType,
                    nodeType: selection[n].nodeType,
                    includeChildren: selection[n].flags.includeChildren,
                    includeAncestors: selection[n].flags.includeAncestors,
                    includeDependencies: selection[n].flags.includeDependencies,
                    includeMedia: options.includeMedia,
                    includeConfig: options.includeConfig,
                    includeLinked: options.includeLinked,
                    includeViews: options.includeFiles
                });
            }

            if (options.includeDictionary) {
                items.push({
                    id: -1,
                    udi: 'umb://dictionary-item/00000000-0000-0000-0000-000000000000',
                    includeChildren: true,
                    name: 'All dictionary items'
                });
            }
         
            return items;

        }

        function createExport() {

            $scope.model.disableSubmitButton = true;
            $scope.model.submitButtonState = 'busy';

            vm.exporting = true;

            processExport();
        }

        function processExport () {

            uSyncExporterService.createExport(vm.options)
                .then(function (result) {

                    var response = result.data;
                    vm.options.id = response.id;

                    vm.options.request.items = response.response.items;
                    vm.progress = response.progress;

                    if (response.exportComplete) {
                        getExport();
                    }
                    else {
                        vm.options.stepIndex = response.stepIndex;
                        vm.options.request.pageNumber = response.nextPage;
                        processExport();
                    }
                });
        }

        function getExport() {

            vm.update.Message = "Compressing `Sync-Pack'";

            uSyncExporterService.getExport(vm.options)
                .then(function (result) {
                    $scope.model.hideSubmitButton = true;
                    $scope.model.closeButtonLabel = 'Done';
                    vm.update.Count = 100;
                    vm.update.Total = 100;
                    vm.exporting = false;
                    vm.complete = true; 
                });
        }

        vm.calcPercentage = calcPercentage;

        function calcPercentage(update) {
            if (update != null && update != undefined) {
                return (update.Count / update.Total) * 100;
            }
            return 0;
        }


        //////// SignalR
        initSignalRHub();

        function initSignalRHub() {
            uSyncHub.initHub(function (hub) {
                vm.hub = hub;

                vm.hub.on('update', function (update) {
                    vm.update = update;
                    vm.update.blocks = update.Message.split('||');
                });

                vm.hub.on('add', function (status) {
                    vm.status = status;
                });

                vm.hub.start();
            });
        }

        function getClientId() {
            if ($.connection !== undefined && $.connection.hub !== undefined) {
                return $.connection.hub.id;
            }
            return "";
        }
    }

    angular.module('umbraco')
        .controller('uSyncExportOverlayController', exportOverlayController);

})();