(function () {
  "use strict";

  function WorkflowSettingsOverlayController($scope, workflowResource, editorService) {

    var vm = this;

    vm.workflowTypes = [];
    vm.focusWorkflowName = true;

    var prepareDataForEdit = function () {
      // Transform includeSensitiveData field from an integer derived from an enum to a boolean,
      // for user selection via a check-box.
      $scope.model.workflow.includeSensitiveData = $scope.model.workflow.includeSensitiveData == 1 ? true : false;
    };

    if ($scope.model.workflow) {
      prepareDataForEdit();
    }

    if ($scope.model.workflowType && $scope.model.workflowType.id) {
      workflowResource.getScaffoldWorkflowType($scope.model.workflowType.id).then(function (response) {
        $scope.model.workflow = response.data;
        prepareDataForEdit();
      });
    }

    vm.toggleActive = function () {
      $scope.model.workflow.active = !$scope.model.workflow.active;
      $scope.workflowSettingsForm.$setDirty();
    }

    vm.toggleIncludeSensitiveData = function () {
      $scope.model.workflow.includeSensitiveData = !$scope.model.workflow.includeSensitiveData;
      $scope.workflowSettingsForm.$setDirty();
    }

    vm.close = function () {
      $scope.model.close($scope.workflowSettingsForm.$dirty);
    };

    vm.submit = function () {
      $scope.model.submit($scope.model);
    };
  }

  angular.module("umbraco").controller("UmbracoForms.Overlays.WorkflowSettingsOverlayController", WorkflowSettingsOverlayController);
})();
