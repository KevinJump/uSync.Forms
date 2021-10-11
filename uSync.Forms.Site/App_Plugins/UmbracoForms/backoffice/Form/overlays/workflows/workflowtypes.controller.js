(function() {
    "use strict";

  function WorkflowTypesOverlayController($scope, workflowResource, notificationsService, editorService, overlayService) {

        var vm = this;

        vm.workflowTypes = [];
        vm.searchTerm = "";

        vm.pickWorkflowType = pickWorkflowType;
        vm.filterItems = filterItems;
        vm.showDetailsOverlay = showDetailsOverlay;
        vm.hideDetailsOverlay = hideDetailsOverlay;

        function init() {

            // get workflows with settings
            workflowResource.getAllWorkflowTypesWithSettings()
                .then(function(response) {
                    vm.workflowTypes = response.data;
                    setDefaultWorkflowIcon(vm.workflowTypes);
                });

        }

        function setDefaultWorkflowIcon(workflowTypes) {

            for(var i = 0; i < workflowTypes.length; i++) {
                var workflowType = workflowTypes[i];
                if(!workflowType.icon) {
                    workflowType.icon = "icon-mindmap";
                }
            }
        }

        function pickWorkflowType(selectedWorkflowType) {

            // set overlay settings + open overlay
            var workflowSettingsOverlay = {
                view: "/App_Plugins/UmbracoForms/backoffice/Form/overlays/workflows/workflow-settings.html",
                title: selectedWorkflowType.name,
                workflow: $scope.model.workflow,
                workflowType: selectedWorkflowType,
                fields: $scope.model.fields,
                size: "medium",
                submit: function(model) {
                    workflowResource.validateWorkflowSettings(model.workflow).then(function(response){
                        if (response.data.length > 0) {
                            angular.forEach(response.data, function (error) {
                                notificationsService.error("Workflow failed to save", error.Message);
                            });
                        } else {

                            //Need to add the properties to the $scope from this submitted model
                            $scope.model.workflow = model.workflow;

                            // submit overlay and return the model
                            $scope.model.submit($scope.model);

                            // close the infinite editor
                            editorService.close();
                        }

                    });
                },
                close: function (hasChanges) {
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
                              // Close workflow settings editor.
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

        function filterItems() {
            // clear item details
            $scope.model.itemDetails = null;
        }

        function showDetailsOverlay(workflowType) {

            var workflowDetails = {};
            workflowDetails.icon = workflowType.icon;
            workflowDetails.title = workflowType.name;
            workflowDetails.description = workflowType.description;

            $scope.model.itemDetails = workflowDetails;

        }

        function hideDetailsOverlay() {
            $scope.model.itemDetails = null;
        }

        vm.close = function() {
	        $scope.model.close();
        }

        init();

    }

    angular.module("umbraco").controller("UmbracoForms.Overlays.WorkflowTypesOverlayController", WorkflowTypesOverlayController);
})();
