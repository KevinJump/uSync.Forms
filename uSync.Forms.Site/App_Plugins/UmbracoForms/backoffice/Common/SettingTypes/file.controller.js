angular.module("umbraco").controller("UmbracoForms.SettingTypes.File",
  function ($scope, editorService) {

    $scope.openMediaPicker = function () {

      var mediaPicker = {
        submit: function (model) {
          var selectedImage = model.selection[0];
          populateFile(selectedImage);

          editorService.close();
        },
        close: function () {
          editorService.close();
        }
      };

      editorService.mediaPicker(mediaPicker);
    };

    $scope.clear = function () {
      $scope.setting.value = undefined;
    };

    function populateFile(item) {
      $scope.setting.value = item.image;
    }
  });
