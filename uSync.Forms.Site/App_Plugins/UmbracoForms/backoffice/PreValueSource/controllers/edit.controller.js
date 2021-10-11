angular.module("umbraco").controller("UmbracoForms.Editors.PreValueSource.EditController", function ($scope, $routeParams, preValueSourceResource, editorState, notificationsService, navigationService, formHelper, userService, securityResource) {

    //On load/init of 'editing' a prevalue source then
    //Let's check & get the current user's form security
    var currentUserId = null;

    userService.getCurrentUser().then(function (response) {
        currentUserId = response.id;

        //Now we can make a call to form securityResource
        securityResource.getByUserId(currentUserId).then(function (response) {
            $scope.security = response.data;

            //Check if we have access to current form OR manage forms has been disabled
            if (!$scope.security.userSecurity.managePreValueSources) {

                //Show error notification
                notificationsService.error("Access Denied", "You do not have access to edit Prevalue sources");

                //Resync tree so that it's removed & hides
                navigationService.syncTree({ tree: "prevaluesource", path: ['-1'], forceReload: true, activate: false }).then(function (response) {

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
        preValueSourceResource.getScaffold()
		.then(function (response) {
		    $scope.loaded = true;
		    $scope.preValueSource = response.data;

		    preValueSourceResource.getAllPreValueSourceTypesWithSettings()
	        .then(function (resp) {
	            $scope.types = resp.data;
	           
	        });

		    //set a shared state
		    editorState.set($scope.form);
		});
    } else {

        //we are editing so get the content item from the server
        preValueSourceResource.getByGuid($routeParams.id)
        .then(function (response) {
            
            $scope.preValueSource = response.data;

            preValueSourceResource.getAllPreValueSourceTypesWithSettings()
                .then(function (resp) {
                    $scope.types = resp.data;
                    setTypeAndSettings();
                    getPrevalues();
                    $scope.loaded = true;
                });

            //As we are editing an item we can highlight it in the tree
            navigationService.syncTree({ tree: "prevaluesource", path: [String($routeParams.id)], forceReload: false });
           
            //set a shared state
            editorState.set($scope.preValueSource);
        });
    }

    $scope.setType = function () {
        $scope.prevalues = null;
        setTypeAndSettings();
    };

    $scope.save = function () {

        if (formHelper.submitForm({ scope: $scope })) {
            //set settings
            $scope.preValueSource.settings = {};
            if ($scope.preValueSource.$type) {
                angular.forEach($scope.preValueSource.$type.settings, function (setting) {
                    var key = setting.alias;
                    var value = setting.value;
                    $scope.preValueSource.settings[key] = value;

                });
            }
            
            //validate settings
            preValueSourceResource.validateSettings($scope.preValueSource)
                .then(function (response) {

                    $scope.errors = response.data;

                    if ($scope.errors.length > 0) {
                        angular.forEach($scope.errors, function (error) {

                            notificationsService.error("Prevaluesource failed to save", error.Message);
                        });
                    } else {
                        //save
                        preValueSourceResource.save($scope.preValueSource)
                            .then(function (response) {

                                $scope.preValueSource = response.data;
                                //set a shared state
                                editorState.set($scope.preValueSource);
                                setTypeAndSettings();
                                getPrevalues();
                                $scope.preValueSourceForm.$dirty = false;
                                navigationService.syncTree({
                                    tree: "prevaluesource",
                                    path: [String($scope.preValueSource.id)],
                                    forceReload: true
                                });
                                notificationsService.success("Prevaluesource saved", "");
                            }, function (err) {
                                notificationsService.error("Prevaluesource failed to save", "");
                            });
                    }

                }, function (err) {
                    notificationsService.error("Prevaluesource failed to save", "Please check if your settings are valid");
                });
        }
     };  

    var setTypeAndSettings = function() {
        $scope.preValueSource.$type = _.where($scope.types, { id: $scope.preValueSource.fieldPreValueSourceTypeId })[0];

        //set settings
        angular.forEach($scope.preValueSource.settings, function (setting) {
            for (var key in $scope.preValueSource.settings) {
                if ($scope.preValueSource.settings.hasOwnProperty(key)) {
                    if (_.where($scope.preValueSource.$type.settings, { alias: key }).length > 0) {
                        _.where($scope.preValueSource.$type.settings, { alias: key })[0].value = $scope.preValueSource.settings[key];
                    }

                }
            }
        });
    };

    var getPrevalues = function() {
        
        preValueSourceResource.getPreValues($scope.preValueSource)
            .then(function (response) {
            $scope.prevalues = response.data;
        });
    };

	});