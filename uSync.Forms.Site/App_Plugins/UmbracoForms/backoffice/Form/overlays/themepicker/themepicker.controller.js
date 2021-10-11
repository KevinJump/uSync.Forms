(function () {
    "use strict";

    function ThemePickerOverlayController($scope, themePickerResource) {

        var vm = this;

        vm.loading = false;
        vm.themes = [];
        vm.error = null;

        vm.pickTheme = pickTheme;

        function onInit() {

            vm.loading = true;

            // set default title
            if(!$scope.model.title) {
                $scope.model.title = "Select a theme";
            }

            // we don't need the submit button for a multi picker because we submit on select for the single picker
            if(!$scope.model.multiPicker) {
                $scope.model.hideSubmitButton = true;
            }

            // make sure we have an array to push to
            if(!$scope.model.selectedThemes) {
                $scope.model.selectedThemes = [];
            }

            // get the available forms
            themePickerResource.getThemes().then(function (response) {
                vm.themes = response;
                vm.loading = false;
            }, function (err) {
                //Error callback from - getting all Forms
                //Unsure what exception/error we would encounter
                //Would be just an empty collection if we cant find/get any
                vm.error = "An Error has occured while loading!";
                vm.loading = false;
            });
        }

        function pickTheme(theme) {

            if(theme.selected) {
                            
                // if form is already selected we deselect and remove it from the picked forms array
                theme.selected = false;

                angular.forEach($scope.model.selectedThemes, function(selectedTheme, index){
                    if(selectedTheme.name === theme.name) {
                        $scope.model.selectedThemes.splice(index, 1);
                    }
                });
                
            } else {

                // set selected flag so we can show checkmark icon
                theme.selected = true;

                // store selected form in an array
                $scope.model.selectedThemes.push(theme);

                // if it's not a multipicker - submit the overlay
                if(!$scope.model.multiPicker) {
                    $scope.model.submit($scope.model);
                }

            }

        }

        onInit();

    }

    angular.module("umbraco").controller("UmbracoForms.ThemePickerOverlayController", ThemePickerOverlayController);
    
})();
