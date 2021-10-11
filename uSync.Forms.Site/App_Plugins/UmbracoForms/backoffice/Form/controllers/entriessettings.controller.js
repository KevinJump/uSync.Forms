angular.module("umbraco").controller("UmbracoForms.Editors.Form.EntriesSettingsController",
  function ($scope, $log, $timeout, exportResource, utilityService, editorService) {

    //The Form ID is found in the filter object we pass into the dialog
    var formId = $scope.model.filter.form;

    exportResource.getExportTypes(formId).then(function (response) {
      $scope.exportTypes = response.data;
    });

    $scope.close = function () {
      editorService.closeAll();
    };

    $scope.export = function (type, filter) {
      if ($scope.exporting) {
        return;
      }

      $scope.exporting = true;

      filter.exportType = type.id;

      //Check if we need to do server time offset to the date we are displaying
      var serverTimeNeedsOffsetting = utilityService.serverTimeNeedsOffsetting();

      if (serverTimeNeedsOffsetting) {
        // Use the localOffset to correct the server times with the client browser's offset
        filter.localTimeOffset = new Date().getTimezoneOffset();
      }

      exportResource.generateExport(filter).then(function (response) {
        var url = exportResource.getExportUrl(response.data.formId, response.data.fileName);

        var iframe = document.createElement('iframe');
        iframe.id = "hiddenDownloadframe";
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.src = url;

        //remove all traces
        $timeout(function () {
          document.body.removeChild(iframe);
          $scope.exporting = false;
        }, 1000);

      });
    };

  });
