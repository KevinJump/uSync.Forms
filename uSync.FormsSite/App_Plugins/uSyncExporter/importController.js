(function () {
    'use strict';

    function importController($scope,
        navigationService,
        notificationsService, uSyncExporterService,
        Upload,
        uSyncHub) {

        var vm = this;

        vm.buttonState = 'init';

        vm.importGroup = {
            defaultButton: {
                labelKey: 'usync_import',
                handler: function () {
                    vm.importPack(vm.importId, false);
                }
            },
            subButtons: [{
                labelKey: 'usync_importforce',
                handler: function () {
                    vm.importPack(vm.importId, true);
                }
            }]
        };

        vm.options = {};

        vm.close = close;
        vm.handleFiles = handleFiles;

        vm.upload = upload;
        vm.importPack = importPack;
        vm.reportPack = reportPack;

        vm.countChanges = countChanges;

        vm.file = null;
        vm.report = [];

        vm.state = 'init';

        vm.imported = false;
        vm.running = false;
        vm.uploaded = false;

        vm.update = {
            Message: 'Importing',
            Count: 1,
            Total: 1
        };

        // signalR
        InitHub();
        vm.calcPercentage = calcPercentage;
        vm.getTypeName = getTypeName;

        /////////////////////////////////

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
            else {
                navigationService.hideDialog();
            }
        }

        function countChanges(changes) {
            var count = 0;
            angular.forEach(changes, function (val, key) {
                if (val.Change !== 'NoChange') {
                    count++;
                }
            });

            return count;
        }

        ///// file managent 

        function handleFiles(files, event) {
            if (files && files.length > 0) {
                vm.file = files[0];
                // vm.upload(files[0]);
            }
        }

        function upload(file) {
            vm.buttonState = 'busy';
            vm.running = true;
            vm.uploaded = false;

            Upload.upload({
                url: Umbraco.Sys.ServerVariables.uSync.exporterService + 'UploadFile',
                fields: {
                    clientId: getClientId()
                },
                file: file
            }).success(function (data, status, headers, config) {
                vm.buttonState = 'success';
                vm.running = false;
                vm.uploaded = true;
                vm.importId = data.id;

                initOptions();

                reportPack();

            }).error(function (evt, status, headers, config) {
                vm.running = false;
                vm.buttonState = 'error';
            });
        }

        function reportPack() {

            vm.state = 'busy';

            uSyncExporterService.reportPack(vm.options)
                .then(function (result) {

                    var response = result.data;
                    vm.options.id = response.id;

                    vm.progress = response.progress;

                    if (!response.response.success) {
                        vm.state = 'error';
                        vm.errorMessage = response.response.message
                    }
                    else {

                        updateActions(response);

                        if (response.exportComplete) {
                            // show report
                            vm.state = 'report';
                        }
                        else {
                            vm.options.stepIndex = response.stepIndex;
                            vm.options.request.pageNumber = response.nextPage;
                            vm.options.request.handlerFolder = response.nextFolder;
                            reportPack();
                        }
                    }
                }, function (error) {
                        vm.running = false;
                        vm.buttonState = 'error';
                        console.log(error);
                        notificationsService.error('error', getError(error.data));
                });
        }

        function getError(error) {
            if (error.Message !== undefined)
                return error.Message + ' ' + error.ExceptionMessage;
            else {
                return error.message + ' ' + error.exceptionMessage;
            }
        }

        function importPack() {
            initOptions();
            processImport();
        }

        function processImport() {

            vm.state = 'busy';
            uSyncExporterService.importPack(vm.options)
                .then(function (result) {

                    var response = result.data;
                    vm.options.id = response.id;

                    vm.progress = response.progress;

                    updateActions(response);

                    if (response.exportComplete) {
                        // show report
                        vm.state = 'imported';
                    }
                    else {
                        vm.options.stepIndex = response.stepIndex;
                        vm.options.request.pageNumber = response.nextPage;
                        vm.options.request.handlerFolder = response.nextFolder;
                        processImport();
                    }
                });
        }


        function updateActions(response) {
            if (response != null && response.response != null) {
            var actions = response.response.actions;
                if (actions !== undefined && actions !== null && actions.length > 0) {
                    vm.report = actions;
                }
            }
        }

        function initOptions() {

            vm.options = {
                id: vm.importId,
                stepIndex: 0,
                request: {
                    pageNumber: 0,
                },
                clientId: getClientId()
            }
        }

        ////// SignalR things 
            
        vm.calcPercentage = calcPercentage;

        function InitHub() {
            uSyncHub.initHub(function (hub) {

                vm.hub = hub;

                vm.hub.on('update', function (update) {
                    vm.update = update;
                });

                vm.hub.on('add', function (data) {
                    vm.status = data;
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

        function calcPercentage(status) {
            if (status !== undefined) {
                return (100 * status.Count) / status.Total;
            }
            return 1;
        }

        function getTypeName(typeName) {
            var umbType = typeName.substring(0, typeName.indexOf(','));
            return umbType.substring(umbType.lastIndexOf('.') + 1);
        }


    }

    angular.module('umbraco')
        .controller('uSyncExporterImportController', importController);
})();