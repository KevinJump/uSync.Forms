(function () {
    'use strict';

    function exportManager(editorService, navigationService) {

        return {
            openImportDialog: openImportDialog
        };


        function openImportDialog(options, cb) {
            navigationService.hideDialog();

            editorService.open({
                entity: {
                    id: options.entity.id * 1,
                    name: options.entity.name
                },
                title: 'Import uSync Pack',
                view: Umbraco.Sys.ServerVariables.umbracoSettings.appPluginsPath + '/uSyncExporter/importDialog.html',
                // size: 'small',
                submit: function (done) {
                    editorService.close();
                    if (cb !== undefined && cb !== null) {
                        cb(true);
                    }
                },
                close: function () {
                    editorService.close();
                    if (cb !== undefined && cb !== null) {
                        cb(false);
                    }
                }
            });
        }
    }

    angular.module('umbraco')
        .factory('uSyncExportManager', exportManager);
})();