angular.module("umbraco").controller("UmbracoForms.SettingTypes.Pickers.CheckboxController", function ($scope) {

  var vm = this;

  // Prevalues are a single element, containing a boolean value indicating whether the default value
  // when no setting is applied should be "checked"
  var defaultToTrue = $scope.setting.prevalues.length > 0 && $scope.setting.prevalues[0] ? true : false;

  vm.toggle = toggle;

  vm.checked = false;
  if (defaultToTrue) {
    vm.checked = $scope.setting.value !== 'False';
  } else {
    vm.checked = $scope.setting.value === 'True';
  }

  function toggle() {
    vm.checked = !vm.checked;

    if (vm.checked) {
      $scope.setting.value = 'True'
    } else {
      $scope.setting.value = 'False'
    }
  }
});
