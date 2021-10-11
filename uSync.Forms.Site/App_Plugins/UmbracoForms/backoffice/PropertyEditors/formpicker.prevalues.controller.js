(function () {
    "use strict";

    function FormPickerPrevaluesController($scope, $http, formPickerResource, notificationsService) {

        var vm = this;

        vm.openFormPicker = openFormPicker;
        vm.remove = remove;

        function onInit() {

            if(!$scope.model.value) {
                $scope.model.value = [];
            }

            if(!vm.forms) {
                vm.forms = [];
            }

            if($scope.model.value && $scope.model.value.length > 0) {
                formPickerResource.getPickedForms($scope.model.value).then(function(response){
                    vm.forms = response;
                });

            }

        }

        function openFormPicker() {
            if (!vm.formPickerOverlay) {
                vm.formPickerOverlay = {
                    view: "../App_Plugins/UmbracoForms/backoffice/Form/overlays/formpicker/formpicker.html",
                    multiPicker: true,
                    show: true,
                    submit: function (model) {

                        if(model.selectedForms && model.selectedForms.length > 0) {
                            selectForms(model.selectedForms);
                        }

                        vm.formPickerOverlay.show = false;
                        vm.formPickerOverlay = null;

                    },
                    close: function (oldModel) {
                        vm.formPickerOverlay.show = false;
                        vm.formPickerOverlay = null;
                    }
                }
            }
        }

        function selectForms(selectedForms) {
            angular.forEach(selectedForms, function (selectedForm) {
                // make sure the form isn't already picked
                if($scope.model.value.indexOf(selectedForm.id) === -1) {
                    // store form object on view model
                    vm.forms.push(selectedForm);
                    // store id for value
                    $scope.model.value.push(selectedForm.id);
                }
            });
        }

        function remove(selectedForm) {

            //remove from view model
            angular.forEach($scope.model.value, function(formId, index){
                if(formId === selectedForm.id) {
                    $scope.model.value.splice(index, 1);
                }
            })

            // remove from model.value
            angular.forEach(vm.forms, function(form, index){
                if(form.id === selectedForm.id) {
                    vm.forms.splice(index, 1);
                }
            });

        }

        onInit();

    }

    angular.module("umbraco").controller("UmbracoForms.FormPickerPrevaluesController", FormPickerPrevaluesController);
})();
