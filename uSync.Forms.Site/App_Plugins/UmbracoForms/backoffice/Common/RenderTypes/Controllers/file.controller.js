angular.module("umbraco").controller("UmbracoForms.RenderTypes.FileController",
    function($scope){

       

        var imageExts = ['jpg','jpeg','png','gif','bmp'];

        $scope.files = $scope.field.replace('~', '').split(',');

        $scope.isImage = function(filepath){
            return imageExts.indexOf( $scope.getExtension(filepath) ) >= 0;
        };

        $scope.getExtension = function(filepath){
            return filepath.substring(filepath.lastIndexOf(".")+1).toLowerCase();
        };

        $scope.getFileName = function(filepath){
            return filepath.substring(filepath.lastIndexOf("/")+1);
        };

        $scope.getPreview = function(filepath){
            return filepath.replace('~','') + "?width=400";
        };

    });
