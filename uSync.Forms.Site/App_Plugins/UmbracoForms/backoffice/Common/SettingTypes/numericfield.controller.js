angular.module("umbraco").controller("UmbracoForms.SettingTypes.NumericFieldController",
  function ($scope) {

    var vm = this;

    // The prevalues setting is a string array in order: Min, Max, Default Value.
    vm.min = parseFloat($scope.setting.prevalues[0]);
    vm.max = parseFloat($scope.setting.prevalues[1]);
    var defaultValue = parseFloat($scope.setting.prevalues[2]);

    // Set the provided default value.
    if (!$scope.setting.value) {
      $scope.setting.value = defaultValue;
    }

    // Ensure we have a number.
    vm.value = parseFloat($scope.setting.value);

    vm.change = function () {
      // Convert it back to a string.
      $scope.setting.value = vm.value.toString();
    }

});
