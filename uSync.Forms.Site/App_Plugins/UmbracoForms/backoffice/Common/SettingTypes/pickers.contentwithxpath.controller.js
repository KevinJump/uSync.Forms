angular.module("umbraco").controller("UmbracoForms.SettingTypes.Pickers.ContentWithXpathController",
	function ($scope, $routeParams, editorService, entityResource, iconHelper, utilityService) {

	var umbracoVersion = Umbraco.Sys.ServerVariables.application.version;

	$scope.queryIsVisible = false;
	$scope.helpIsVisible = false;
	$scope.query = "";


	if (!$scope.setting) {
	    $scope.setting = {};
	}

	function init() {

		if(angular.isNumber($scope.setting.value)){

			entityResource.getById($scope.setting.value, "Document").then(function (item) {
				item.icon = iconHelper.convertFromLegacyIcon(item.icon);
				$scope.node = item;
			});

		} else if($scope.setting.value) {

			$scope.queryIsVisible = true;
			$scope.query = $scope.setting.value;

		}

	}

	$scope.openContentPicker = function () {

		var contentPicker = {
			submit: function(model) {
				populate(model.selection[0]);
				editorService.close();
			},
			close: function() {
				editorService.close();
			}
		};
		editorService.contentPicker(contentPicker);

	};

	$scope.showQuery = function() {
	    $scope.queryIsVisible = true;
	};

	$scope.toggleHelp = function() {
		$scope.helpIsVisible = !$scope.helpIsVisible;
	};

	$scope.setXpath = function() {
	    $scope.setting.value = $scope.query;
	};

	$scope.clear = function () {
	    $scope.id = undefined;
	    $scope.node = undefined;
	    $scope.setting.value = undefined;
		$scope.query = undefined;
		$scope.queryIsVisible = false;
	};

	function populate(item) {
	    $scope.clear();
	    item.icon = iconHelper.convertFromLegacyIcon(item.icon);
	    $scope.node = item;
	    $scope.id = item.id;
	    $scope.setting.value = item.id;
	}

	init();

});
