angular.module("umbraco")
  .controller("UmbracoForms.Editors.Form.MoveController",
    function ($scope, formResource, treeService, navigationService, eventsService, notificationsService, formsValidationService) {

      $scope.dialogTreeApi = {};
      $scope.source = _.clone($scope.currentNode);

      var folderIdPrefix = "folder-";
      var movingFolder = $scope.currentNode.id.startsWith(folderIdPrefix);

      function nodeSelectHandler(args) {
        args.event.preventDefault();
        args.event.stopPropagation();

        if ($scope.target) {
          //un-select if there's a current one selected
          $scope.target.selected = false;
        }

        $scope.target = args.node;
        $scope.target.selected = true;
      }

      function parseFolderId(id) {
        return id.substring(folderIdPrefix.length);
      }

      $scope.move = function () {

        $scope.errorMessage = null;

        var handleSuccess = function (type, path) {
          $scope.errorMessage = null;

          treeService.removeNode($scope.currentNode);

          navigationService.syncTree({ tree: "form", path: path.split(','), forceReload: true, activate: true });

          notificationsService.showNotification({
            type: 0,
            header: "Moved",
            message: "The " + type + " was moved to the selected location.",
          });

          navigationService.hideMenu();

          eventsService.emit('app.refreshEditor');
        };

        var handleError = function (err) {
          $scope.errorMessage = formsValidationService.getErrorMessageFromExceptionResponse(err);
        };

        if (movingFolder) {
          formResource.moveFolder($scope.target.id, parseFolderId($scope.source.id))
            .then(function (response) {
              handleSuccess("folder", response.data);
            }, function (err) {
              handleError(err);
            });
        } else {
          formResource.moveForm($scope.target.id, $scope.source.id)
            .then(function (response) {
              handleSuccess("form", response.data);
            }, function (err) {
              handleError(err);
            });
        }

      };

      $scope.onTreeInit = function () {
        $scope.dialogTreeApi.callbacks.treeNodeSelect(nodeSelectHandler);
      };

      $scope.close = function () {
        navigationService.hideDialog();
      };

    });
