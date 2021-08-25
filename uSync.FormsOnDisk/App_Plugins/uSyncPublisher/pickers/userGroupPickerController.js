(function () {

    'use strict';

    function userGroupPickerController($scope, editorService, uSyncPublishService, userService) {

        var vm = this; 
        vm.remove = remove;
        vm.open = open;
        vm.loading = true;
        vm.readonly = true;
        vm.groups = [];

        vm.value = $scope.model.value.Groups;

        if (!vm.value) {
            vm.value = [];
        }

        loadUserGroups();


        userService.getCurrentUser().then(function (currentUser) {
            vm.readonly = !currentUser.allowedSections.includes("users");
        });

        function loadUserGroups() {
            vm.groups = [];
            uSyncPublishService.getUserGroups()
                .then(function (result) {

                    var userGroups = result.data;

                    vm.value.forEach(function (alias, index) {

                        var userGroup = _.where(userGroups, { alias: alias });

                        if (userGroup !== null && userGroup.length === 1) {
                            vm.groups.push(userGroup[0]);
                        }

                    });

                    vm.loading = false;
                });
        }

        function syncGroupList() {
            var list = [];

            vm.groups.forEach(function (group, index) {
                list.push(group.alias);
            });

            vm.value = list;
            $scope.model.value.Groups = vm.value;
        }


        function remove(group) {
            for (let i = 0; i < vm.groups.length; i++) {
                if (vm.groups[i].alias === group.alias) {
                    vm.groups.splice(i, 1);
                    break;
                }
            }

            syncGroupList();
        }

        function open() {

            var currentSelection = [];
            angular.copy(vm.groups, currentSelection);

            var options = {
                selection: currentSelection,
                submit: function (model) {
                    if (model.selection) {
                        vm.groups = model.selection;
                        syncGroupList();
                    }
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            };

            editorService.userGroupPicker(options);
        }
    }

    angular.module('umbraco')
        .controller('usyncUserGroupPickerController', userGroupPickerController);
})();