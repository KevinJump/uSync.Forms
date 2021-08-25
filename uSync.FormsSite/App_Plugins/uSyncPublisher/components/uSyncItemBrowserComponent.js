(function () {

    'use strict';

    var uSyncItemBrowserComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/uSyncPublisher/Components/uSyncItemBrowser.html',
        bindings: {
            items: '=',
            selection: '=',
            loadFolder: '&',
            loading: '=',
            serverName: '=',
            type: '@',
            layouts: '=',
            activeLayout: '='
        },
        controllerAs: 'vm',
        controller: uSyncBrowserController
    };

    function uSyncBrowserController($scope, editorService) {

        var vm = this;

        vm.onClickItem = onClickItem;
        vm.onClickItemName = onClickItemName;
        vm.onBreadcrumbItem = onBreadcrumbItem;

        vm.rootKey = '00000000-0000-0000-0000-000000000000';
        vm.breadcrumb = [{ key: vm.rootKey, name: 'Media' }]

        vm.getChangeName = getChangeName;

        vm.current = vm.rootKey;

        vm.openDetail = openDetail;
        vm.openSideBySide = openSideBySide;

        ///////////// 
        vm.selectLayout = selectLayout;

        function selectLayout(layout) {
            vm.activeLayout = layout;
            vm.layouts.forEach(e => e.active = false);
            layout.active = true;
        };


        ///////
        function onBreadcrumbItem(item, $index) {
            if ($index < vm.breadcrumb.length - 1) {

                // vm.clearSelection();

                var pos = $index + 1;
                vm.breadcrumb.splice(pos, vm.breadcrumb.length - pos);

                vm.loadFolder({ key: vm.breadcrumb[vm.breadcrumb.length - 1].key });
            }
        }

        function onClickItem(item, $event) {

            $event.preventDefault();
            $event.stopPropagation();

            item.selected = !item.selected;

            var alreadySelected = false;
            // selection code.
            for (let i = 0; i < vm.selection.length; i++) {
                if (vm.selection[i].udi == item.udi) {
                    if (item.selected) {
                        alreadySelected = true;
                    }
                    else {
                        vm.selection.splice(i, 1);
                    }
                }
            }

            if (item.selected && !alreadySelected) {
                vm.selection.push(item);
            }
        }

        function onClickItemName(item, $event) {

            $event.preventDefault();
            $event.stopPropagation();

            if (item.isFolder && item.hasChildren && vm.loadFolder) {

                vm.breadcrumb.push({ key: item.key, name: item.name });
                vm.loadFolder({ key: item.key });

            }
            else {
                onClickItem(item, $event);
            }
        }


        /// nicer names for changes in the browser window.

        vm.changeNames = {
            'NoChange': 'In sync',
            'Update': 'Diffrent',
            'Delete': 'Not on target',
            'Create': 'No on local'
        };

        function getChangeName(action) {

            var name = vm.changeNames[action.Change];
            if (name == null || name === undefined)
                return action.Change;

            return name;

        }

        //// thumbnail making.

        function activate() {
            for (var i = 0; vm.items.nodes.length > i; i++) {
                setOriginalSize(vm.items.nodes[i]);
            }
        }

        var itemDefaultHeight = 200;
        var itemDefaultWidth = 200;
        var itemMaxWidth = 200;
        var itemMaxHeight = 200;

        function setOriginalSize(item) {

            if (item.height !== undefined && item.width !== undefined) {
                //set to a square by default
                item.width = itemDefaultWidth;
                item.height = itemDefaultHeight;
                item.aspectRatio = 1;

                item.aspectRatio = item.width / item.height;

                // set max width and height
                // landscape
                if (item.aspectRatio >= 1) {
                    if (item.width > itemMaxWidth) {
                        item.width = itemMaxWidth;
                        item.height = itemMaxWidth / item.aspectRatio;
                    }
                    // portrait
                } else {
                    if (item.height > itemMaxHeight) {
                        item.height = itemMaxHeight;
                        item.width = itemMaxHeight * item.aspectRatio;
                    }
                }
            }
        }

        function openDetail(action, $event) {

            $event.preventDefault();
            $event.stopPropagation();

            var options = {
                item: action,
                title: 'uSync Change',
                view: Umbraco.Sys.ServerVariables.application.applicationPath + "App_Plugins/uSync8/changeDialog.html",
                close: function () {
                    editorService.close();
                }
            };
            editorService.open(options);
        }

        function openSideBySide(item, $event) {

            $event.preventDefault();
            $event.stopPropagation();

            editorService.open({
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'dialogs/SideBySideCompare.html',
                title: 'Side by Side',
                source: item.localUrl,
                target: item.remoteUrl,
                size: '',
                submit: function (model) {
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            });

        }


        var evts = [];
        evts.push($scope.$watch('vm.items', function (newValue, oldValue) {
            if (newValue !== undefined && _.isArray(newValue.nodes)) {
                if (newValue.key === vm.rootKey) {
                    vm.breadcrumb = [vm.breadcrumb[0]];
                };

                activate();
            }
        }));

        evts.push($scope.$watch('vm.serverName', function (name) {
            if (name !== undefined) {
                vm.breadcrumb[0].name = vm.type + ' [' + name + ']';

            }
        }));


        $scope.$on('$destroy', function () {
            for (var e in evts) {
                evts[e]();
            }
        });


    }

    angular.module('umbraco')
        .component('usyncItemBrowser', uSyncItemBrowserComponent);

})();