
(function () {
    "use strict";

    function FileUploadSettingsController($scope, Upload, notificationsService) {
        
        var vm = this;
        vm.isUploading = false;
        vm.filePercentage = 0;
        vm.savedPath = $scope.setting.value;

        vm.uploadFile = function(file){

            // console.log('savedPath', vm.savedPath);

            Upload.upload({
                url: "backoffice/UmbracoForms/PreValueFile/PostAddFile",
                fields: {
                    'previousPath': vm.savedPath
                },
                file: file
            })
            .progress(function(evt) {
                // set uploading status on file
                vm.isUploading = true;
                
                // calculate progress in percentage
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total, 10);

                // set percentage property on file
                vm.filePercentage = progressPercentage;

                // console.log('progress', progressPercentage);
            })
            .success(function(data, status, headers, config) {
                // console.log('success data', data);
  
                //Set the path for the PreValue setting & will get saved into the JSON
                $scope.setting.value = data.FilePath;
                vm.savedPath = data.FilePath;

                //Reset
                vm.isUploading = false;
                vm.filePercentage = 0;
            })
            .error(function(evt, status, headers, config) {

                //Loop over notifications from response from API to show them
                if (angular.isArray(evt.notifications)) {
                    for (var i = 0; i < evt.notifications.length; i++) {
                        notificationsService.showNotification(evt.notifications[i]);
                    }
                }

                //Reset
                vm.isUploading = false;
                vm.filePercentage = 0;
            
            });

        };

    };

    angular.module("umbraco").controller("UmbracoForms.SettingTypes.FileUpload", FileUploadSettingsController);
})();