(function () {
    "use strict";

    function ThemePickerController($scope, themePickerResource) {

        var vm = this;

        vm.loading = true;
        vm.selectedTheme = null;
        vm.error = null;

        vm.openThemePicker = openThemePicker;
        vm.remove = remove;

        function onInit() {

            //Only do this is we have a value saved
            if ($scope.model.value) {

                vm.selectedTheme = {};
                vm.selectedTheme.name = $scope.model.value;
                vm.selectedTheme.icon = "icon-brush";
            }
        }

        function openThemePicker() {
            if (!vm.themePickerOverlay) {
                vm.themePickerOverlay = {
                    view: "../App_Plugins/UmbracoForms/backoffice/Form/overlays/themepicker/themepicker.html",
                    show: true,
                    submit: function (model) {

                        vm.selectedTheme = model.selectedThemes[0];
                        vm.selectedTheme.icon = "icon-brush";
                        $scope.model.value = model.selectedThemes[0].name;

                        vm.themePickerOverlay.show = false;
                        vm.themePickerOverlay = null;

                    },
                    close: function (oldModel) {
                        vm.themePickerOverlay.show = false;
                        vm.formthemePickerOverlayPickerOverlay = null;
                    }
                }
            }
        }

        function remove() {
            vm.selectedTheme = null;
            $scope.model.value = null;
        }

        onInit();

    }

    angular.module("umbraco").controller("UmbracoForms.ThemePickerController", ThemePickerController);
})();
