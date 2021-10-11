angular.module("umbraco")
.controller("UmbracoForms.Editors.PreValueSource.DeleteController",
	function ($scope, preValueSourceResource, navigationService, treeService) {
	    $scope.delete = function (id) {
	        preValueSourceResource.deleteByGuid(id).then(function () {
	          
	            treeService.removeNode($scope.currentNode);
	            navigationService.hideNavigation();

	        });

	    };
	    $scope.cancelDelete = function () {
	        navigationService.hideNavigation();
	    };
	});