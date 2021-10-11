(function () {
  "use strict";

  function Controller($scope, formResource, navigationService, formHelper, notificationsService, formsValidationService) {

    var vm = this;
    vm.buttonState = "init";
    vm.errorMessage = null;

    var node = $scope.currentNode;
    vm.newName = node.name;

    vm.performRename = performRename;
    vm.cancelRename = cancelRename;

    var folderIdPrefix = "folder-";
    vm.deletingFolder = $scope.currentNode.id.startsWith(folderIdPrefix);

    function parseFolderId(id) {
      return id.substring(folderIdPrefix.length);
    }

    function performRename() {

      if (vm.deletingFolder) {

        vm.errorMessage = null;
        if (formHelper.submitForm({ scope: $scope, formCtrl: $scope.renameForm })) {

          formResource.renameFolder(parseFolderId(node.id), vm.newName).then(function (response) {

            var path = $scope.currentNode.path;

            navigationService.syncTree({
              tree: "form",
              path: path.split(','),
              forceReload: true,
              activate: true
            });

            notificationsService.showNotification({
              type: 0,
              header: "Renamed",
              message: "The folder was renamed.",
            });

            navigationService.hideMenu();

          }, function (err) {

            formHelper.resetForm({ scope: $scope, formCtrl: $scope.createFolderForm, hasErrors: true });
            vm.errorMessage = formsValidationService.getErrorMessageFromExceptionResponse(err);
          });
        }

      } else {
        // Only folder renames are supported, but keeping this placeholder in in case
        // we wanted to implement for forms too.
      }

    }

    function cancelRename() {
      navigationService.hideNavigation();
    };
  }

  angular.module("umbraco").controller("UmbracoForms.Editors.Form.RenameController", Controller);

})();
