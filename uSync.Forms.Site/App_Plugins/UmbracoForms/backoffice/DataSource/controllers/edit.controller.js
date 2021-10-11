angular.module("umbraco").controller("UmbracoForms.Editors.DataSource.EditController", function ($scope, $routeParams, dataSourceResource, editorState, notificationsService, editorService, navigationService, formHelper, userService, securityResource) {

    //On load/init of 'editing' a prevalue source then
    //Let's check & get the current user's form security
    var currentUserId = null;

    userService.getCurrentUser().then(function (response) {
        currentUserId = response.id;

        //Now we can make a call to form securityResource
        securityResource.getByUserId(currentUserId).then(function (response) {
            $scope.security = response.data;

            //Check if we have access to current form OR manage forms has been disabled
            if (!$scope.security.userSecurity.manageDataSources) {

                //Show error notification
                notificationsService.error("Access Denied", "You do not have access to edit Datasources");

                //Resync tree so that it's removed & hides
                navigationService.syncTree({ tree: "datasource", path: ['-1'], forceReload: true, activate: false }).then(function (response) {

                    //Response object contains node object & activate bool
                    //Can then reload the root node -1 for this tree 'Forms Folder'
                    navigationService.reloadNode(response.node);
                });

                //Don't need to wire anything else up
                return;
            }
        });
    });

    if ($routeParams.create) {
	    //we are creating so get an empty data type item
	    dataSourceResource.getScaffold().then(function (response) {
			$scope.loaded = true;
			$scope.dataSource = response.data;

			dataSourceResource.getAllDataSourceTypesWithSettings()
		    .then(function (resp) {
		        $scope.types = resp.data;

		    });

			//set a shared state
			editorState.set($scope.form);
		});
    }
    else {
	        //we are editing so get the content item from the server
	        dataSourceResource.getByGuid($routeParams.id)
            .then(function (response) {

                $scope.dataSource = response.data;

                dataSourceResource.getAllDataSourceTypesWithSettings()
                    .then(function (resp) {
                        $scope.types = resp.data;
                        setTypeAndSettings();

                        $scope.loaded = true;
                    });



                //set a shared state
                editorState.set($scope.dataSource);
            });
	    }

	    $scope.setType = function () {
	        setTypeAndSettings();
	    };

	    $scope.save = function () {
            if (formHelper.submitForm({ scope: $scope })) {

                //set settings
                $scope.dataSource.settings = {};
                if($scope.dataSource.$type){
                    angular.forEach($scope.dataSource.$type.settings, function (setting) {
                        var key = setting.alias;
                        var value = setting.value;
                        $scope.dataSource.settings[key] = value;

                    });
                }

                //validate settings
                dataSourceResource.validateSettings($scope.dataSource)
                .then(function (response) {

                    $scope.errors = response.data;

                    if ($scope.errors.length > 0) {
                        $scope.dataSource.valid = false;
                        angular.forEach($scope.errors, function (error) {

                            notificationsService.error("Datasource failed to save", error.Message);

                        });
                    } else {
                        //save
                        dataSourceResource.save($scope.dataSource)
                        .then(function (response) {

                            $scope.dataSource = response.data;
                            //set a shared state
                            editorState.set($scope.dataSource);
                            setTypeAndSettings();
                            navigationService.syncTree({ tree: "datasource", path: [String($scope.dataSource.id)], forceReload: true });
                            notificationsService.success("Datasource saved", "");
                            $scope.dataSource.valid = true;
                            $scope.dataSourceForm.$dirty = false;
                        }, function (err) {
                            notificationsService.error("Datasource failed to save", "");
                        });
                    }


                }, function (err) {
                    notificationsService.error("Datasource failed to save", "Please check if your settings are valid");
                });
            }
	    };

	    $scope.showWizard = function() {
            var dataSourcesSettings = {
                view: "/App_Plugins/UmbracoForms/backoffice/Datasource/dialogs/wizard.html",
                dataSourceId: $scope.dataSource.id,
                size: 'medium'
            };

            editorService.open(dataSourcesSettings);
	    };

	    var setTypeAndSettings = function () {
	        $scope.dataSource.$type = _.where($scope.types, { id: $scope.dataSource.formDataSourceTypeId })[0];

	        //set settings
	        angular.forEach($scope.dataSource.settings, function (setting) {
	            for (var key in $scope.dataSource.settings) {
	                if ($scope.dataSource.settings.hasOwnProperty(key)) {
	                    if (_.where($scope.dataSource.$type.settings, { alias: key }).length > 0) {
	                        _.where($scope.dataSource.$type.settings, { alias: key })[0].value = $scope.dataSource.settings[key];
	                    }

	                }
	            }
	        });
	    };



	});
