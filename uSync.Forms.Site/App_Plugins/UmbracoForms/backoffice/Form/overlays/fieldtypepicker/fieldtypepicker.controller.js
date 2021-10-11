(function() {
    "use strict";

    function FieldTypePickerOverlayController($scope, formResource, formService) {

        var vm = this;

        vm.fieldTypes = [];
        vm.searchTerm = "";

        vm.pickFieldType = pickFieldType;
        vm.filterItems = filterItems;
        vm.showDetailsOverlay = showDetailsOverlay;
        vm.hideDetailsOverlay = hideDetailsOverlay;
        vm.close = close;

        function init() {

            // get workflows with settings
            formResource.getAllFieldTypesWithSettings()
                .then(function (response) {
                    vm.fieldTypes = response.data;
                });
        }


        function pickFieldType(selectedFieldType) {
            $scope.model.fieldType = selectedFieldType;
            $scope.model.submit($scope.model);
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

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        init();

    }

    angular.module("umbraco").controller("UmbracoForms.Overlays.FieldTypePickerOverlayController", FieldTypePickerOverlayController);
})();
