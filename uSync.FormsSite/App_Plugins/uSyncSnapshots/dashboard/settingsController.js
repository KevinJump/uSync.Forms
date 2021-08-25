(function () {
    'use strict';

    function settingsController($scope, uSyncSnapshotService, notificationsService) {

        var vm = this;

        vm.settings = {
            folders: 'scripts,views,css'
        };

        vm.buttonState = 'init';

        vm.saveSettings = saveSettings;

        getSettings();

        function saveSettings() {
            vm.buttonState = 'busy';

            uSyncSnapshotService.saveSettings(vm.settings)
                .then(function (result) {
                    notificationsService.success('Saved', 'Settings Saved');
                    vm.buttonState = 'success';
                }, function (error) {
                        notificationsService.error("Error", error.data.ExceptionMessage);
                        vm.buttonState = 'error';
                });
        }

        function getSettings() {
            uSyncSnapshotService.getSettings()
                .then(function (result) {
                    vm.settings = result.data;
                })
        }
    }

    angular.module('umbraco')
        .controller('uSyncSnapshotSettingsController', settingsController);

})();