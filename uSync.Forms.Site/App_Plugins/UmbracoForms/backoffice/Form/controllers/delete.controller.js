(function () {
	"use strict";

	function Controller($scope, formResource, navigationService, notificationsService, treeService) {

		var vm = this;
		vm.buttonState = "init";

    vm.performDelete = performDelete;
    vm.cancelDelete = cancelDelete;

    var folderIdPrefix = "folder-";
    vm.deletingFolder = $scope.currentNode.id.startsWith(folderIdPrefix);

    // Forms can always be deleted...
    vm.canDelete = !vm.deletingFolder;

    function parseFolderId(id) {
      return id.substring(folderIdPrefix.length);
    }

    // ...but folders can only be deleted if empty (don't want to risk a mistaken click wiping out a tonne of records).
    if (vm.deletingFolder) {
      formResource.isFolderEmpty(parseFolderId($scope.currentNode.id)).then(function (result) {
        vm.canDelete = result.data;
      });
    }

    function performDelete(id) {

      vm.buttonState = "busy";

      if (vm.deletingFolder) {
        formResource.deleteFolderByGuid(parseFolderId(id)).then(function () {
          vm.buttonState = "success";
          treeService.removeNode($scope.currentNode);
          navigationService.hideNavigation();

          notificationsService.success("Successfully deleted the folder.");
        }, function (err) {
          vm.buttonState = "error";
          notificationsService.error("Folder failed to delete", err.data.Message);
        });

      } else {
        formResource.deleteByGuid(id).then(function () {
          vm.buttonState = "success";
          treeService.removeNode($scope.currentNode);
          navigationService.hideNavigation();

          notificationsService.success("Successfully deleted the form.");
        }, function (err) {
          vm.buttonState = "error";
          notificationsService.error("Form failed to delete", err.data.Message);
        });
      }

    }

    function cancelDelete() {
      navigationService.hideNavigation();
    };
	}

	angular.module("umbraco").controller("UmbracoForms.Editors.Form.DeleteController", Controller);

})();
