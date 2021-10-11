angular.module("umbraco").controller("UmbracoForms.SettingTypes.RangeController",
  function ($scope) {

    var vm = this;

     // The prevalues setting is a string array in order: Min, Max, Step, Default.
    var min = parseFloat($scope.setting.prevalues[0]);
    var max = parseFloat($scope.setting.prevalues[1]);
    var step = parseFloat($scope.setting.prevalues[2]);
    var defaultValue = parseFloat($scope.setting.prevalues[3]);
    var stepDecimalPlaces = getDecimalPlaces(step);

    // Set the provided default value.
    if (!$scope.setting.value) {
      $scope.setting.value = defaultValue;
    }

    // Ensure we have a number.
    vm.value = parseFloat($scope.setting.value);

    vm.sliderOptions = {
      start: [vm.value],
      step: step,
      tooltips: [true],
      format: {
        to: function (value) {
          return value.toFixed(stepDecimalPlaces);
        },
        from: function (value) {
          return Number(value);
        }
      },
      range: {
        min: min,
        max: max,
      },
      pips: {
        mode: "steps",
        density: 100,
        format: {
          to: function (value) {
            return value.toFixed(stepDecimalPlaces);
          },
          from: function (value) {
            return Number(value);
          }
        },
      }
    };

    function getDecimalPlaces(value) {
      // Hat-tip: https://stackoverflow.com/a/17369245/489433
      if (Math.floor(value) === value) {
        return 0;
      }

      return value.toString().split(".")[1].length || 0;
    }

    vm.change = function (values) {
      // Convert it back to a string anytime the range slider value changed.
      // We're only supporting a single value, so as value provided is an array, we just take the first value.
      $scope.setting.value = values[0].toString();
    }

  });
