angular.module("umbraco").controller("UmbracoForms.SettingTypes.EmailTemplatePicker",
	function ($scope, pickerResource, editorService) {

	    $scope.openTreePicker = function() {

			var treePickerOverlay = {
				treeAlias: "EmailTemplates",
				section:"forms",
				entityType: "email-template",
				multiPicker: false,
				onlyInitialized: false,
				select: function(node){
					 pickerResource.getVirtualPathForEmailTemplate(node.id).then(function (response) {
						 //Set the picked template file path as the setting value
						$scope.setting.value = response.data.path;
					 });

                    editorService.close();
                },
                close: function (model) {
                    editorService.close();
                }
			};

            editorService.treePicker(treePickerOverlay);

	    };

	});
