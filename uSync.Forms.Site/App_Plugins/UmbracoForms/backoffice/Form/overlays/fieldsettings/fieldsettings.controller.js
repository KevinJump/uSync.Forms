/**
 * @ngdoc controller
 * @name UmbracoForms.Overlays.FieldSettingsOverlay
 * @function
 *
 * @description
 * The controller for the Field Settings dialog
 */

(function () {
    "use strict";

    function FieldSettingsOverlay($scope, localizationService, formService, userService, editorService, formHelper) {

        var vm = this;

        vm.showValidationPattern = false;
        vm.focusOnPatternField = false;
        vm.focusOnMandatoryField = false;
        vm.canEditSensitiveData = false; //Default to false - until we check with the server for this user to see if they have rights to edit/set this property
        vm.loading = true;  //We need to do a serverside call lookup at init/active to check is user has access to sensitive data
        vm.selectedValidationType = {};
        vm.actionTypes = [];
        vm.logicTypes = [];
        vm.operators = [];
        vm.mandatoryToggleText = "Field is mandatory";


        var localizeValidation = localizationService.localizeMany(
            [
                "validation_validateAsEmail",
                "validation_validateAsNumber",
                "validation_validateAsUrl",
                "validation_enterCustomValidation",
                "validation_fieldIsMandatory"]
        ).then(function (labels) {
            vm.validationTypes = [{
                "name": labels[0],
                "key": "email",
                "pattern": "^[a-zA-Z0-9_\.\+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+$",
                "enableEditing": true
            }, {
                "name": labels[1],
                "key": "number",
                "pattern": "^[0-9]*$",
                "enableEditing": true
            }, {
                "name": labels[2],
                "key": "url",
                "pattern": "https?\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}",
                "enableEditing": true
            }, {
                "name": labels[3],
                "key": "custom",
                "pattern": "",
                "enableEditing": true
            }];

            vm.mandatoryToggleText = labels[4];
        });

        vm.changeValidationType = changeValidationType;
        vm.changeValidationPattern = changeValidationPattern;
        vm.openFieldTypePicker = openFieldTypePicker;
        vm.deleteConditionRule = deleteConditionRule;
        vm.addConditionRule = addConditionRule;
        vm.getPrevalues = getPrevalues;
        vm.conditionFieldSelected = conditionFieldSelected;
        vm.submitOnEnter = submitOnEnter;
        vm.submit = submit;
        vm.close = close;
        vm.toggleConditions = toggleConditions;
        vm.toggleMandatory = toggleMandatory;
        vm.toggleSensitiveData = toggleSensitiveData;
        vm.toggleAllowMultipleFileUploads = toggleAllowMultipleFileUploads;
        vm.matchValidationType = matchValidationType;


        //Creating duplicate of the fields array on the model
        //As the select for the conditions needs to ensure it does not include itself

        //Need to use angular.copy() otherwise when we remove item in fieldConditions its data-binding back down to the original model.fields
        vm.fieldConditions = angular.copy($scope.model.fields);

        //Trying not to use _underscore.js
        //Loop over array until we find the item where the ID matches & remove object from the array
        for (var i = 0; i < vm.fieldConditions.length; i++) {
            if (vm.fieldConditions[i].id === $scope.model.field.id) {
                vm.fieldConditions.splice(i, 1);
                break;
            }
        }



        function activate() {
            vm.actionTypes = formService.getActionTypes();
            vm.logicTypes = formService.getLogicTypes();
            vm.operators = formService.getOperators();


            //Verify that the current user is allowed to view & change the property 'containsSensitiveData'
            userService.getCurrentUser().then(function (user) {

                //Set the API controller response on the Angular ViewModel
                vm.canEditSensitiveData = user.userGroups.indexOf("sensitiveData") !== -1;

                //Got a response back from promise - so lets load up the UI
                vm.loading = false;
            });

            if (!$scope.model.field.condition) {
                $scope.model.field.condition = {};
                $scope.model.field.condition.actionType = vm.actionTypes[0].value;
                $scope.model.field.condition.logicType = vm.logicTypes[0].value;
            }

            matchValidationType();

            // If the prevalue source Id hasn't been defined, ensure angularjs doesn't add an initial empty
            // select list option by initialising to the first empty value (the 'Choose...' prompt.)
            // See: https://stackoverflow.com/a/12654812/489433
            if (!$scope.model.field.prevalueSourceId) {
                $scope.model.field.prevalueSourceId = '00000000-0000-0000-0000-000000000000';
            }
        }

        function changeValidationPattern() {
            matchValidationType();
        }

        function openFieldTypePicker(field) {

            vm.focusOnMandatoryField = false;

            var fieldTypePicker = {
                view: "/App_Plugins/UmbracoForms/backoffice/Form/overlays/fieldtypepicker/field-type-picker.html",
                title: "Choose answer type",
                hideSubmitButton: true,
                size: "medium",
                submit: function (model) {

                    formService.loadFieldTypeSettings(field, model.fieldType);

                    // this should be removed in next major version
                    field.removePrevalueEditor = true;

                    editorService.close();
                },
                close: function (model) {
                    editorService.close();
                }
            };
            editorService.open(fieldTypePicker);
        }

        function matchValidationType() {

            if ($scope.model.field.regex !== null && $scope.model.field.regex !== "" && $scope.model.field.regex !== undefined) {

                return localizeValidation.then(function () {
                    var match = false;
                    // find and show if a match from the list has been chosen
                    angular.forEach(vm.validationTypes, function (validationType, index) {
                        if ($scope.model.field.regex === validationType.pattern) {
                            vm.selectedValidationType = validationType;
                            vm.showValidationPattern = true;
                            match = true;
                        }
                    });
                    if (!match) {
                        // if there is no match - choose the custom validation option.
                        angular.forEach(vm.validationTypes, function (validationType) {
                            if (validationType.key === "custom") {
                                vm.selectedValidationType = validationType;
                                vm.showValidationPattern = true;
                            }
                        });
                    }
                });
            }

        }

        function toggleConditions() {
            $scope.model.field.condition.enabled = !$scope.model.field.condition.enabled;
        }
        function toggleSensitiveData() {
            $scope.model.field.containsSensitiveData = !$scope.model.field.containsSensitiveData;
        }
        function toggleMandatory() {
            $scope.model.field.mandatory = !$scope.model.field.mandatory;
        }
        function toggleAllowMultipleFileUploads() {
            $scope.model.field.allowMultipleFileUploads = !$scope.model.field.allowMultipleFileUploads;
        }
        function changeValidationType(selectedValidationType) {

            if (selectedValidationType) {
                $scope.model.field.regex = selectedValidationType.pattern;
                vm.showValidationPattern = true;

                // set focus on textarea
                if (selectedValidationType.key === "custom") {
                    vm.focusOnPatternField = true;
                }

            } else {
                $scope.model.field.regex = "";
                vm.showValidationPattern = false;
            }

        }

        function conditionFieldSelected(selectedField, rule) {
            formService.populateConditionRulePrevalues(selectedField, rule, $scope.model.fields);
        }

        function deleteConditionRule(rules, rule) {
            formService.deleteConditionRule(rules, rule);
        }

        function addConditionRule(condition) {
            formService.addEmptyConditionRule(condition);
            // set default operator
            var lastIndex = condition.rules.length - 1;
            condition.rules[lastIndex].operator = vm.operators[0].value;
        }

        function getPrevalues(field) {
            formService.loadFieldTypePrevalues(field);
        }

        function submitOnEnter(event) {
            if (event && event.keyCode === 13) {
                submit();
            }
        }

        function submit() {
            if ($scope.model.submit) {
                if (formHelper.submitForm({ scope: $scope })) {
                    $scope.model.submit($scope.model);
                }
            }
        }

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        activate();

    }

    angular.module("umbraco").controller("UmbracoForms.Overlays.FieldSettingsOverlay", FieldSettingsOverlay);

})();
