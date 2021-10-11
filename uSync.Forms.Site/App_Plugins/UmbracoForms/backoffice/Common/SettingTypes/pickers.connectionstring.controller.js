angular.module("umbraco").controller("UmbracoForms.SettingTypes.Pickers.ConnectionStringController",
	function ($scope, $routeParams, pickerResource) {
	    pickerResource.getAllConnectionStrings().then(function (response) {
	        $scope.strings = response.data;
	    });
	});