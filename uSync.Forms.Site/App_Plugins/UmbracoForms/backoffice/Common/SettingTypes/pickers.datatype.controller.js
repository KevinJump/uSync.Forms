angular.module("umbraco").controller("UmbracoForms.SettingTypes.Pickers.DataTypeController",
	function ($scope, $routeParams, pickerResource) {
	    pickerResource.getAllDataTypes().then(function (response) {
	        $scope.datatypes = response.data;
	    });
	});