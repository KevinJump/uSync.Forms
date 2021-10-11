
angular.module("umbraco")
  .controller("Umbraco.Forms.GridEditors.FormPickerController",
    function ($scope, $timeout, editorService, macroResource, macroService, $routeParams, $sce) {

      $scope.title = "Click to insert form";
      $scope.macroAlias = "renderUmbracoForm";

      $scope.setFormMacro = function () {

        var dialogData = {
          richTextEditor: true,
          macroData: $scope.control.value || {
            macroAlias: $scope.macroAlias
          }
        };

        var macroPicker = {
          dialogData: dialogData,
          submit: function (model) {
            var macroObject = macroService.collectValueData(model.selectedMacro, model.macroParams, dialogData.renderingEngine);

            $scope.control.value = {
              macroAlias: macroObject.macroAlias,
              macroParamsDictionary: macroObject.macroParamsDictionary
            };

            $scope.setPreview($scope.control.value);
            editorService.close();
          },
          close: function () {
            editorService.close();
          }
        };
        editorService.macroPicker(macroPicker);
      };

      $scope.setPreview = function (macro) {
        var contentId = $routeParams.id;

        macroResource.getMacroResultAsHtmlForEditor(macro.macroAlias, contentId, macro.macroParamsDictionary)
          .then(function (htmlResult) {
            $scope.title = macro.macroAlias;
            if (htmlResult.trim().length > 0 && htmlResult.indexOf("Macro:") < 0) {
              // Replace the form tag with a div and indicate trusted HTML for accurate preview in the grid editor.
              // See: https://github.com/umbraco/Umbraco.Forms.Issues/issues/612
              htmlResult = htmlResult.replace('<form', '<div').replace('</form>', '</div>');
              $scope.preview = $sce.trustAsHtml(htmlResult);
            }
          });

      };

      $timeout(function () {
        if ($scope.control.$initializing) {
          $scope.setFormMacro();
        } else if ($scope.control.value) {
          $scope.setPreview($scope.control.value);
        }
      }, 200);
    });
