angular.module("umbraco")
  .controller("UmbracoForms.Editors.Form.CopyController",
    function ($scope, formResource, navigationService) {

      $scope.dialogTreeApi = {};
      $scope.copiedForm = {
        name: '',
        copyWorkflows: false,
        copyToNewFolder: false,
        copyToFolder: null,
      };

      function parseFolderId(id) {
        return id.substring("folder-".length);
      }

      //Copy Function run from button on click
      $scope.copyForm = function (formId) {

        var copyToFolderId = null;
        if ($scope.copiedForm.copyToNewFolder) {
          copyToFolderId = $scope.copiedForm.copyToFolder.id == "-1"
            ? "-1"
            : parseFolderId($scope.copiedForm.copyToFolder.id);
        }

        //Perform copy in formResource
        formResource.copy(formId, $scope.copiedForm.name, $scope.copiedForm.copyWorkflows, copyToFolderId).then(function (response) {

          //Reload the tree
          navigationService.syncTree({ tree: "form", path: response.data.path.split(","), forceReload: true, activate: false });

          //Once 200 OK then reload tree & hide copy dialog navigation
          navigationService.hideNavigation();
        });
      };

      function nodeSelectHandler(args) {
        args.event.preventDefault();
        args.event.stopPropagation();

        if ($scope.copiedForm.copyToFolder) {
          //un-select if there's a current one selected
          $scope.copiedForm.copyToFolder.selected = false;
        }

        $scope.copiedForm.copyToFolder = args.node;
        $scope.copiedForm.copyToFolder.selected = true;
      }

      $scope.onTreeInit = function () {
        $scope.dialogTreeApi.callbacks.treeNodeSelect(nodeSelectHandler);
      };

      //Cancel button - closes dialog
      $scope.cancelCopy = function () {
        navigationService.hideNavigation();
      }
    });
