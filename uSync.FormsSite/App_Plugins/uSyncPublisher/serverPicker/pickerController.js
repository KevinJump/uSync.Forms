(function () {
    'use strict';

    function pickerController($scope, editorService) {
        var vm = this;
        vm.loaded = false; 

        vm.value = $scope.model.value;

        vm.open = open;
        vm.remove = remove;

        vm.sortOptions = {
            axis: "y",
            containment: "parent",
            distance: 10,
            opacity: 0.7,
            tolerance: "pointer",
            scroll: true,
            cursor: "move",
            zIndex: 6000
        };

        // load.
        vm.loaded = true;

        /////////////
        function open() {
            var options = {
                title: 'Server Picker',
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'serverPicker/serverPickerDialog.html',
                size: 'small',
                submit: function (options) { 
                    editorService.close();

                    if (options !== undefined) {
                        vm.value.push(options);
                    }
                },
                close: function () {
                    editorService.close();
                }
            }

            editorService.open(options);
        }

        function remove(server) {
            for (let i = 0; i < vm.value.length; i++) {
                if (vm.value[i].Alias === server.Alias) {
                    vm.value.splice(i, 1);
                    break;
                }
            }
        }
    }

    angular.module('umbraco')
        .controller('uSyncPublisherServerPickerController', pickerController);

})();