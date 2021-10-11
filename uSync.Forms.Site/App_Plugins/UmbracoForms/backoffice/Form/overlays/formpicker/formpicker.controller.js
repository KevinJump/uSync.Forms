(function () {
    "use strict";

    function FormPickerOverlayController($scope, $http, formPickerResource, notificationsService) {

        var vm = this;

        vm.loading = false;
        vm.forms = [];
        vm.error = null;

        vm.pickForm = pickForm;

        function onInit() {

            vm.loading = true;

            // set default title
            if(!$scope.model.title) {
                $scope.model.title = "Select a form";
            }

            // we don't need the submit button for a multi picker because we submit on select for the single picker
            if(!$scope.model.multiPicker) {
                $scope.model.hideSubmitButton = true;
            }

            // make sure we have an array to push to
            if(!$scope.model.selectedForms) {
                $scope.model.selectedForms = [];
            }

            // get the available forms
            formPickerResource.getFormsForPicker($scope.model.allowedForms || null).then(function (response) {
                vm.forms = response;
                vm.loading = false;
            }, function (err) {
                //Error callback from - getting all Forms
                //Unsure what exception/error we would encounter
                //Would be just an empty collection if we cant find/get any
                vm.error = "An Error has occured while loading!";
                vm.loading = false;
            });
        }

        function pickForm(form) {

            if(form.selected) {

                // if form is already selected we deselect and remove it from the picked forms array
                form.selected = false;

                angular.forEach($scope.model.selectedForms, function(selectedForm, index){
                    if(selectedForm.id === form.id) {
                        $scope.model.selectedForms.splice(index, 1);
                    }
                });

            } else {

                // set selected flag so we can show checkmark icon
                form.selected = true;

                // store selected form in an array
                $scope.model.selectedForms.push(form);

                // if it's not a multipicker - submit the overlay
                if(!$scope.model.multiPicker) {
                    $scope.model.submit($scope.model);
                }

            }

        }

        onInit();

    }

    angular.module("umbraco").controller("UmbracoForms.FormPickerOverlayController", FormPickerOverlayController);

})();
