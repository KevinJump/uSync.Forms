(function () {
    'use strict';

    function browserDashboard($scope, appState, uSyncPublishService, uSyncPublishDialogManager) {

        var vm = this;

        vm.section = appState.getSectionState('currentSection');

        vm.servers = [];
        vm.server = {};
        vm.picked = false;

        vm.openDialog = openDialog;
        vm.getFolders = getFolders;
        vm.clearSelection = clearSelection;
        vm.onSelected = onSelected;

        vm.selectionLabel = 'Pull selection';

        vm.selectLocal = selectLocal;
        vm.local = false;

        vm.rootKey = '00000000-0000-0000-0000-000000000000';

        vm.isBlank = false;
        vm.mode = 'pull';

        vm.items = {
            folders: [],
            nodes: []
        };

        uSyncPublishService.getServers(vm.mode)
            .then(function (result) {
                vm.servers = result.data;
                checkServers(vm.servers);
            });

        uSyncPublishService.hasContentOrMedia(false)
            .then(function (result) {
                vm.isBlank = !result.data;
            });


        vm.layouts = [
            {
                name: 'Grid',
                icon: 'icon-thumbnails-small',
                path: 'gridpath',
                selected: true,
                active: true
            },
            {
                name: 'List',
                icon: 'icon-list',
                path: 'listpath',
                selected: true
            }
        ];

        if (vm.section === 'content') {
            vm.activeLayout = vm.layouts[1];
            vm.layouts[0].active = false;
            vm.layouts[1].active = true;
        }
        else {
            vm.activeLayout = vm.layouts[0];
        }

        ///////////


        function checkServers(servers) {
            servers.forEach(function (server) {
                uSyncPublishService.checkServer(server.Alias)
                    .then(function (result) {
                        server.status = result.data;
                    });
            });
        }

        //////////////
        function openDialog() {

            if (vm.section === 'content') {
                if (vm.local) {
                    uSyncPublishDialogManager.openPublisherDialog({
                        contentType: vm.section,
                        items: vm.selected
                    }, function (result) {
                        if (result) {
                            refresh();
                        }
                    });
                }
                else {
                    uSyncPublishDialogManager.openPublisherPullDialog({
                        contentType: vm.section,
                        serverAlias: vm.server.Alias,
                        items: vm.selected
                    }, function (result) {
                        if (result) {
                            refresh();
                        }
                    });
                }
            }
            else {
                if (vm.local) {
                    uSyncPublishDialogManager.openPublisherMediaPush({
                        contentType: vm.section,
                        items: vm.selected
                    }, function (result) {
                        if (result) {
                            refresh();
                        }
                    });
                }
                else {
                    uSyncPublishDialogManager.openPublisherMediaPull({
                        application: vm.section,
                        serverAlias: vm.server.Alias,
                        items: vm.selected
                    }, function (result) {
                        if (result) {
                            refresh();
                        }
                    });
                }

            }
        }

        function selectLocal() {
            vm.local = true;
            vm.selectionLabel = 'Push selection';
            vm.picked = false;
            vm.server = { name: 'local' };
            vm.servers.forEach(function (server) {
                server.selected = false;
            });
            vm.items = {};
            clearSelection();
            getFolders(vm.rootKey);
        }


        //////////////

        function onSelected(server) {
            vm.picked = true;
            vm.local = false;
            vm.selectionLabel = 'Pull selection';
            vm.server = server;
            vm.loading = true;
            getFolders(vm.rootKey);
        }

        function getFolders(key) {
            vm.loading = true;
            vm.currentKey = key;
            clearSelection();

            if (vm.local) {
                if (vm.section === 'content') {
                    uSyncPublishService.getLocalContentFolders(key)
                        .then(function (result) {
                            vm.items = result.data;
                            vm.loading = false;
                            checkContentItems(vm.local);
                        });
                }
                else {
                    uSyncPublishService.getLocalMediaFolders(key)
                        .then(function (result) {
                            vm.items = result.data;
                            vm.loading = false;
                        });
                }
            }
            else {

                if (vm.section === 'content') {
                    uSyncPublishService.getContentFolders(key, vm.server.Alias)
                        .then(function (result) {
                            vm.items = result.data;
                            vm.loading = false;
                            checkContentItems(vm.local);
                        });
                }
                else {
                    uSyncPublishService.getMediaFolders(key, vm.server.Alias)
                        .then(function (result) {
                            vm.items = result.data;
                            vm.loading = false;
                            checkMediaItems();
                        });

                }
            }
        }

        function checkContentItems(local) {

            if (local && vm.items != null) {
                setLocal(vm.items.folders);
                setLocal(vm.items.nodes);
            }
            else {

                var udis =
                    _.union(
                        _.pluck(vm.items.folders, 'udi'),
                        _.pluck(vm.items.nodes, 'udi'));

                uSyncPublishService.getContentChanges(udis, vm.server.Alias)
                    .then(function (results) {
                        updateChanges(vm.items.folders, results.data);
                        updateChanges(vm.items.nodes, results.data);
                    });
            }
        }

        function setLocal(items) {
            if (items !== null && items !== undefined) {
                items.forEach(function (item) {
                    item.local = true;
                });
            }
        }

        function checkMediaItems() {
            var udis =
                _.union(
                    _.pluck(vm.items.folders, 'udi'),
                    _.pluck(vm.items.nodes, 'udi'));

            uSyncPublishService.getMediaChanges(udis, vm.server.Alias)
                .then(function (results) {
                    updateChanges(vm.items.folders, results.data);
                    updateChanges(vm.items.nodes, results.data);
                });

        }

        function updateChanges(items, changes) {

            if (items !== null && items !== undefined) {
                items.forEach(function (item) {

                    var index = _.findIndex(changes, { udi: item.udi });

                    if (index != -1) {

                        item.syncChecked = true;
                        item.syncAction = changes[index].action;
                        item.syncChange = changes[index].action.Change != 'NoChange';
                    }
                });
            }

        }

        function refresh() {
            clearSelection();

            if (vm.currentKey != null) {
                getFolders(vm.currentKey);
            }
            else {
                onSelected(vm.server);
            }
        }

        function clearSelection() {
            vm.selected = [];

            clearsSelectedItems(vm.items.folders);
            clearsSelectedItems(vm.items.nodes);
        }

        function clearsSelectedItems(items) {
            if (items !== undefined && items !== null) {
                for (let i = 0; i < items.length; i++) {
                    items[i].selected = false;
                }
            }
        }

        vm.selected = [];

    }

    angular.module('umbraco')
        .controller('uSyncPublisherBrowserDashboardController', browserDashboard);

})();