angular.module("umbraco").controller("UmbracoForms.SettingTypes.FieldMapperController",
  function ($scope, $routeParams, pickerResource) {

    function init() {

      if (!$scope.setting.value) {
        $scope.mappings = [];
      } else {
        $scope.mappings = JSON.parse($scope.setting.value);
      }

      var formId = $routeParams.id;

      if (formId === -1 && $scope.model && $scope.model.fields) {

      } else {

        pickerResource.getAllFields($routeParams.id).then(function (response) {
          $scope.fields = response.data;
        });
      }
    }

    $scope.addMapping = function () {
      console.log('add');

      $scope.mappings.push({
        alias: "",
        value: "",
        staticValue: ""
      });
    };

    $scope.deleteMapping = function (index) {
      $scope.mappings.splice(index, 1);
      $scope.setting.value = JSON.stringify($scope.mappings);
    };

    $scope.stringifyValue = function () {
      $scope.setting.value = JSON.stringify($scope.mappings);
    };

    init();

  });
