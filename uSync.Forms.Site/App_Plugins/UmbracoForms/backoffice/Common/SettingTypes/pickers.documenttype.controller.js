angular.module("umbraco").controller("UmbracoForms.SettingTypes.Pickers.DocumentTypeController",
	function ($scope, $routeParams, pickerResource) {
	    pickerResource.getAllDocumentTypesWithAlias().then(function (response) {
	        $scope.doctypes = response.data;
	    });
	});