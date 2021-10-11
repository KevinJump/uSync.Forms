angular.module("umbraco")
.controller("UmbracoForms.Editors.DataSource.DeleteController",
	function ($scope, dataSourceResource, navigationService, treeService) {
	    $scope.delete = function (id) {
	        dataSourceResource.deleteByGuid(id).then(function () {

	            treeService.removeNode($scope.currentNode);
	            navigationService.hideNavigation();

	        });

	    };
	    $scope.cancelDelete = function () {
	        navigationService.hideNavigation();
	    };
	});