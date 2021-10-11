(function () {
  "use strict";

  function FormSecurityEditController($scope, $routeParams, securityResource, notificationsService, navigationService) {

    var vm = this;

    vm.page = { name: "Form Security" };
    vm.security = {};
    vm.save = save;
    vm.loading = true;

    function init() {

      // Ensure the current item we are editing is highlighted in the tree.
      // Note: doesn't work for the admin user (as this leads to a path of -1 which is also used for the tree's root node).
      navigationService.syncTree({ tree: "formsecurity", path: [String($routeParams.id)], forceReload: true });

      securityResource.getByUserId($routeParams.id).then(function (resp) {
        vm.security = resp.data;
        vm.loading = false;
      });
    }

    vm.toggleManageForms = function () {
      vm.security.userSecurity.manageForms = !vm.security.userSecurity.manageForms;
    }

    vm.toggleManageWorkflows = function () {
      vm.security.userSecurity.manageWorkflows = !vm.security.userSecurity.manageWorkflows;
    }

    vm.toggleManageDataSources = function () {
      vm.security.userSecurity.manageDataSources = !vm.security.userSecurity.manageDataSources;
    }

    vm.togglePreValueSources = function () {
      vm.security.userSecurity.managePreValueSources = !vm.security.userSecurity.managePreValueSources;
    }

    vm.toggleFormAccess = function (form) {
      form.HasAccess = !form.HasAccess;
    }

    function save() {

      // Add a property to the object to save the Umbraco User ID taken from the routeParam.
      vm.security.userSecurity.user = $routeParams.id;

      securityResource.save(vm.security).then(function (response) {
        vm.security = response.data;
        notificationsService.success("User form security saved", "");

        // SecurityForm is the name of the <form name='securityForm'>
        // Set it back to Pristine after we save, so when we browse away we don't get the 'discard changes' notification
        $scope.securityForm.$setPristine();

      }, function (err) {
        notificationsService.error("User form security failed to save", "");
      });
    }

    init();

  }

  angular.module("umbraco").controller("UmbracoForms.Editors.Security.EditController", FormSecurityEditController);

})();
