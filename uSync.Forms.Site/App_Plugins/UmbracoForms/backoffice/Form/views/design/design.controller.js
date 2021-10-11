/**
 * @ngdoc controller
 * @name UmbracoForms.Editors.Form.FormDesignController
 * @function
 *
 * @description
 * The controller for the Umbraco Forns type editor
 */
(function () {
    "use strict";

    function formDesignController($scope, formResource, userService, securityResource) {

        var vm = this;
        var currentUser = {};

        vm.currentPage = {};
        vm.security = {};

        //Get PreValues for the current form we are editing/designing
        formResource.getPrevalueSources().then(function (resp) {
            vm.prevaluesources = resp.data;

            formResource.getAllFieldTypesWithSettings().then(function (resp) {
                vm.fieldtypes = resp.data;
                vm.ready = true;
            });
        });

        userService.getCurrentUser().then(function (response) {
            currentUser = response;

            //Now we can make a call to form securityResource
            securityResource.getByUserId(currentUser.id).then(function (response) {
                vm.security = response.data;
            });

        });

    }

    angular.module("umbraco").controller("UmbracoForms.Editors.Form.FormDesignController", formDesignController);
})();
