angular.module("umbraco")
  .controller("UmbracoForms.Editors.Form.CreateController",
    function ($scope, $location, formResource, navigationService, formHelper, formsValidationService) {
      $scope.model = {
        folderName: "",
        creatingFolder: false
      };

      var node = $scope.currentNode;

      formResource.getAllTemplates().then(function (response) {
        $scope.model.formTemplates = response.data;
      });

      function navigateToCreateForm(templateAlias) {
        $location
          .path("/forms/form/edit/" + $scope.currentNode.id)
          .search("create", "true")
          .search("template", templateAlias);
        navigationService.hideNavigation();
      }

      $scope.createEmptyForm = function () {
        navigateToCreateForm("");
      };

      $scope.createTemplateForm = function (templateAlias) {
        navigateToCreateForm(templateAlias);
      };

      $scope.showCreateFolderForm = function () {
        $scope.model.creatingFolder = true;
      };

      $scope.createFolder = function () {
        $scope.model.errorMessage = null;
        if (formHelper.submitForm({ scope: $scope, formCtrl: $scope.createFolderForm })) {

          formResource.createFolder(node.id, $scope.model.folderName).then(function (response) {

            navigationService.hideMenu();

            var folder = response.data;

            var currPath = node.path ? node.path : "-1";

            navigationService.syncTree({
              tree: "form",
              path: (currPath + ",folder-" + folder.id).split(','),
              forceReload: true,
              activate: true
            });

            formHelper.resetForm({ scope: $scope, formCtrl: $scope.createFolderForm });

          }, function (err) {

            formHelper.resetForm({ scope: $scope, formCtrl: $scope.createFolderForm, hasErrors: true });
            $scope.model.errorMessage = formsValidationService.getErrorMessageFromExceptionResponse(err);

          });
        }
      };

      $scope.hideDialog = function () {
        navigationService.hideDialog(true);
      };
    });
