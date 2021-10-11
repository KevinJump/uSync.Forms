(function () {
  "use strict";

  function WorkflowsOverviewOverlayController($scope, workflowResource, notificationsService, editorService, overlayService) {

    var vm = this;
    // massive hack to fix submit when pressing enter
    vm.focusOverlay = true;

    vm.openWorkflowsTypesOverlay = openWorkflowsTypesOverlay;
    vm.editWorkflow = editWorkflow;
    vm.removeWorkflow = removeWorkflow;
    vm.editSubmitMessageWorkflow = editSubmitMessageWorkflow;

    if (!$scope.model.formWorkflows.onSubmit) {
      $scope.model.formWorkflows.onSubmit = [];
    }
    if (!$scope.model.formWorkflows.onApprove) {
      $scope.model.formWorkflows.onApprove = [];
    }

    vm.workflowsSortableOptions = {
      distance: 10,
      tolerance: "pointer",
      connectWith: ".umb-forms-workflows__sortable-wrapper",
      opacity: 0.7,
      scroll: true,
      cursor: "move",
      zIndex: 6000,
      handle: ".sortable-handle",
      items: ".sortable",
      placeholder: "umb-forms-workflow__workflow-placeholder",
      start: function (e, ui) {
        ui.placeholder.height(ui.item.height());
      },
      stop: function (event, ui) {
        updateSortOrder($scope.model.formWorkflows.onSubmit);
        updateSortOrder($scope.model.formWorkflows.onApprove);
      }
    };

    function updateSortOrder(array) {
      var sortOrder = 0;
      for (var i = 0; i < array.length; i++) {
        var arrayItem = array[i];
        if (arrayItem.isDeleted === false) {
          arrayItem.sortOrder = sortOrder;
          sortOrder++;
        }
      }
    }

    function openWorkflowsTypesOverlay(workflowTypeArray) {
      // set overlay settings and open overlay
      var workflowsTypesOverlay = {
        view: "/App_Plugins/UmbracoForms/backoffice/Form/overlays/workflows/workflow-types.html",
        title: "Choose workflow",
        fields: $scope.model.fields,
        size: "medium",
        submit: function (model) {

          // set sortOrder
          workflowTypeArray.push(model.workflow);
          updateSortOrder(workflowTypeArray);

          editorService.close();
        },
        close: function () {
          editorService.close();
        }
      };

      editorService.open(workflowsTypesOverlay);
    }

    function editWorkflow(workflow, collection, index) {

      // Take a clone of the original workflow so can reset if the changes aren't submitted.
      var preEditedWorkflow = JSON.parse(JSON.stringify(workflow));

      var workflowSettingsOverlay = {
        view: "/App_Plugins/UmbracoForms/backoffice/Form/overlays/workflows/workflow-settings.html",
        title: workflow.name,
        workflow: workflow,
        fields: $scope.model.fields,
        size: "medium",
        submit: function (model) {

          //Validate settings
          workflowResource.validateWorkflowSettings(model.workflow).then(function (response) {
            if (response.data.length > 0) {
              angular.forEach(response.data, function (error) {
                notificationsService.error("Workflow failed to save", error.Message);
              });
            } else {
              editorService.close();
            }

          });
        },
        close: function (hasChanges) {
          // Reset to original values after confirmation if changes were made and 'Submit' button was not used.
          if (hasChanges) {
            var overlay = {
              view: "confirm",
              title: "Confirmation",
              content: "Changes have been made which have not been saved.  Are you sure you wish to close?",
              closeButtonLabel: "No",
              submitButtonLabel: "Yes",
              submitButtonStyle: "danger",
              close: function () {
                // Keep workflow settings editor open.
                overlayService.close();
              },
              submit: function () {
                // Reset changes and close workflow settings editor.
                $scope.model.formWorkflows[collection][index] = preEditedWorkflow;
                overlayService.close();
                editorService.close();
              }
            };
            overlayService.open(overlay);
          } else {
            // No changes detected, so just close.
            editorService.close();
          }
        }
      };

      editorService.open(workflowSettingsOverlay);
    }

    function editSubmitMessageWorkflow() {

      var submitMessageWorkflowOverlay = {
        view: "/App_Plugins/UmbracoForms/backoffice/Form/overlays/workflows/submit-message-workflow-settings.html",
        title: "Message on submit",
        messageOnSubmit: $scope.model.messageOnSubmit,
        goToPageOnSubmit: $scope.model.goToPageOnSubmit,
        size: "medium",
        submit: function (model) {

          $scope.model.messageOnSubmit = model.messageOnSubmit;
          $scope.model.goToPageOnSubmit = model.goToPageOnSubmit;
          editorService.close();
        },
        close: function () {
          editorService.close();
        }
      };

      editorService.open(submitMessageWorkflowOverlay);
    }

    function removeWorkflow(workflow, event, workflowTypeArray) {
      workflow.isDeleted = true;
      updateSortOrder(workflowTypeArray);
      event.stopPropagation();
    }

    vm.close = function () {
      $scope.model.close();
    }

    vm.submit = function () {
      $scope.model.submit($scope.model);
    }

  }

  angular.module("umbraco").controller("UmbracoForms.Overlays.WorkflowsOverviewOverlayController", WorkflowsOverviewOverlayController);
})();
