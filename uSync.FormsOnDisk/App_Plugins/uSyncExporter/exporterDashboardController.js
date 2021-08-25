(function () {
    'use strict';

    function exporterDashboardController($scope, $q,
        editorService, overlayService,
        uSyncExportManager, uSyncExporterService) {

        var vm = this;

        vm.licenced = false;
        vm.loading = true;
        vm.selection = [];

        vm.showHelp = showHelp;
        vm.pickTypes = pickTypes;
        vm.createExport = createExport;
        vm.remove = remove;

        vm.openImportDialog = openImportDialog;
        vm.disableImport = Umbraco.Sys.ServerVariables.uSync.exporterDisableImport;

        init();

        function init() {

            vm.loading = true;
            var promises = [];

            promises.push(uSyncExporterService.isLicenced()
                .then(function (result) {
                    vm.licenced = result.data
                }));


            promises.push(uSyncExporterService.getSettings()
                .then(function (result) {
                    vm.version = result.data.version;
                    vm.includeFiles = result.data.includeFiles;
                    vm.includeMedia = result.data.includeMedia;
                    vm.includeLinked = result.data.includeLinked;
                    vm.includeDictionary = result.data.includeDictionary;
                }));

            promises.push(uSyncExporterService.getExporters()
                .then(function (result) {
                    vm.exporters = result.data;
                }));

            $q.all(promises).then(function () {
                vm.loading = false;
            })
           
        }

        function openImportDialog() {
            uSyncExportManager.openImportDialog({
                entity: { id: -1, name: 'uSync Pack' }
            }, null);
        }


        function createExport() {

            var overlay = {
                options: {
                    selection: vm.selection,
                    includeFiles: vm.includeFiles,
                    includeMedia: vm.includeMedia,
                    includeLinked: vm.includeLinked,
                    includeConfig: vm.includeConfig,
                    includeDictionary: vm.includeDictionary
                },
                view: Umbraco.Sys.ServerVariables.umbracoSettings.appPluginsPath + '/uSyncExporter/exportOverlay.html',
                title: 'Create sync pack',
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
            }

            overlayService.open(overlay);

        }


        ///// Pickers
        function pickTypes(exporter) {

            var options = {
                section: exporter.section,
                title: 'Add ' + exporter.type,
                size: 'small',
                view: exporter.view,
                treeAlias: exporter.type,
                multiPicker: true,
                idType: 'int',
                submit: function (model) {
                    vm.selection = vm.selection.concat(prepSelection(model.selection, exporter.entityType));
                    cleanSelection();
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                },
                select: function (node) {
                    node.selected = node.selected === true ? false : true;
                    multiSelectItem(node, this.selection);
                },
                selection: vm.selection
            };

            if (exporter.blockContainers) {
                // don't let the user pick the containers.
                options.filter = function (i) {
                    return i.metaData.isContainer;
                };
                options.filterCssClass = 'not-allowed';
            }

            editorService.open(options);
        }

        function cleanSelection() {


            console.log(vm.selection);

            vm.selection = _.uniq(vm.selection, false, function (s) {
                return s.id + s.name;
            });

            console.log(vm.selection);

        }

        function prepSelection(selection, entityType) {

            if (selection.length > 0) {

                for (let n = 0; selection.length > n; n++) {
                    prepItem(selection[n], entityType);
                }
            }

            return selection;
        }

        function prepItem(item, entityType) {

            item.flags = {
                includeChildren: false,
                includeAncestors: true,
                includeDependencies: true
            };

            item.entityType = entityType;

            switch (item.nodeType) {
                case 'media':
                case 'content':
                case 'container':
                    item.flags.includeChildren = true;
                    break;
                case 'templates':
                    item.flags.includeFiles = true;
                    break;
                case 'dictionary':
                    item.flags.includeAncestors = false;
                    item.flags.includeDependencies = false;
                    break;
            }
        }

        function findItem(id, selection) {

            if (selection.length > 0) {
                for (let n = 0; selection.length > n; n++) {
                    if (selection[n].id === id) {
                        return n;
                    }
                }
            }

            return -1;

        }

        function multiSelectItem(item, selection) {

            var index = findItem(item.id, selection);

            if (index != -1) {
                selection.splice(index, 1);
            }
            else {
                prepItem(item);
                selection.push(item);
            }
        }

        function remove(id) {

            var index = findItem(id, vm.selection);
            if (index != -1) {
                vm.selection.splice(index, 1);
            }
        }


        ///// UI - Help
        function showHelp(title, view) {

            vm.help = {
                title: title,
                subtitle: 'uSync exporter help',
                view: '/App_plugins/uSyncExporter/help/' + view + ".html",
                show: true,
                hideSubmitButton: true,
                submit: function (model) {
                    vm.help.show = false;
                    vm.help = {}
                },
                close: function (model) {
                    vm.help.show = false;
                    vm.help = {}
                }
            }
        }

    }

    angular.module('umbraco')
        .controller('uSyncExporterDashboardController', exporterDashboardController);
})();