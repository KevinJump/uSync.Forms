(function () {
  "use strict";

  function FormPickerController($scope, $location, formPickerResource, userService, securityResource) {

    var vm = this;
    var allowedForms = null;
    var formSecurity = null;

    vm.loading = true;
    vm.selectedForm = null;
    vm.error = null;

    vm.openFormPicker = openFormPicker;
    vm.remove = remove;

    vm.openFormDesigner = openFormDesigner;
    vm.openFormEntries = openFormEntries;

    function onInit() {

      if ($scope.model.config && $scope.model.config.allowedForms) {
        allowedForms = $scope.model.config.allowedForms;
      }

      userService.getCurrentUser().then(function (response) {
        var currentUserId = response.id;
        securityResource.getByUserId(currentUserId).then(function (response) {
          formSecurity = response.data.formsSecurity;

          //Only do this is we have a value saved
          if ($scope.model.value) {

            formPickerResource.getPickedForm($scope.model.value).then(function (response) {
              setSelectedForm(response);
            }, function (err) {
              //The 500 err will get caught by UmbRequestHelper & show the stacktrace in YSOD dialog if in debug or generic red error to see logs

              //Got an error from the HTTP API call
              //Most likely cause is the picked/saved form no longer exists & has been deleted
              //Need to bubble this up in the UI next to prop editor to make it super obvious

              //Using Angular Copy - otherwise the data binding will be updated
              //So the error message wont make sense, if the user then updates/picks a new form as the model.value will update too
              var currentValue = angular.copy($scope.model.value);

              //Put something in the prop editor UI - some kind of red div or text
              vm.error = "The saved/picked form with id '" + currentValue + "' no longer exists. Pick another form below or clear out the old saved form";
            });

          }
        });
      });
    }

    function openFormPicker() {
      if (!vm.formPickerOverlay) {
        vm.formPickerOverlay = {
          view: "../App_Plugins/UmbracoForms/backoffice/Form/overlays/formpicker/formpicker.html",
          allowedForms: allowedForms,
          show: true,
          submit: function (model) {

            // save form for UI and save on property model
            if (model.selectedForms && model.selectedForms.length > 0) {
              setSelectedForm(model.selectedForms[0]);
              $scope.model.value = model.selectedForms[0].id;
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

    function setSelectedForm(form) {
      vm.selectedForm = form;
      vm.selectedForm.icon = "icon-umb-contour";

      // Set properties indicating if the current user has access to the selected form.
      if (formSecurity) {
        var formSecurityForForm = formSecurity.filter(function (fs) {
          return fs.Form == vm.selectedForm.id;
        });
        if (formSecurityForForm.length > 0) {
          vm.selectedForm.canEditForm = formSecurityForForm[0].HasAccess;
          vm.selectedForm.canViewEntries = formSecurityForForm[0].HasAccess;
        }
      }
    }

    function openFormDesigner() {
      $location.url("forms/Form/edit/" + vm.selectedForm.id);
    }

    function openFormEntries() {
      $location.url("forms/Form/entries/" + vm.selectedForm.id);
    }

    function remove() {
      vm.selectedForm = null;
      $scope.model.value = null;
    }

    onInit();

  }

  angular.module("umbraco").controller("UmbracoForms.FormPickerController", FormPickerController);
})();
