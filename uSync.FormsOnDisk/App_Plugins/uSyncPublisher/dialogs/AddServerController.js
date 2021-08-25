(function () {
    'use strict';

    function addServerController($rootScope, $scope, notificationsService,
        uSyncPublishService, uSyncPublishServerManager) {

        var vm = this;
        vm.loading = false;
        vm.selected = false;
        vm.checked = false;
        vm.showCheck = false;

        vm.dialog = {
            title: 'Add Server',
            description: 'Connect to a new server'
        };

        vm.server = {
            Name: '',
            Url: ''
        };

        vm.checkState = 'init';

        vm.close = close;
        vm.save = save;
        vm.select = select;

        vm.nameChange = nameChange;
        vm.urlChange = urlChange;

        vm.setupServer = setupServer;
        vm.checkServer = checkServer;

        init();

        function init() {
            getSettings();
            loadTemplates();
        }

        function getSettings() {
            uSyncPublishService.getSettings()
                .then(function (result) {
                    vm.settings = result.data;

                    if (!vm.settings.HasAppId) {
                        uSyncPublishServerManager.createLocalApiKeys();
                    }
                });
        }

        // template stuff 
        function loadTemplates() {
            uSyncPublishService.getTemplates()
                .then(function (result) {
                    vm.templates = result.data;
                }, function (error) {

                });
        }

        function select(template) {
            vm.templates.forEach(function (t) {
                t.selected = false;
            });

            template.selected = true;
            vm.selected = true;

            vm.server.Icon = template.icon;
            vm.server.Enabled = true;
            vm.server.PullEnabled = true;
            vm.server.SendSettings = template.flags;
            vm.server.Publisher = template.publisher;
            vm.server.PublisherConfig = template.publisherConfig
        }

        function urlChange() {
            vm.showCheck = false;
        }

        function nameChange() {
            if (vm.server.Name != null) {
                vm.server.Alias = vm.server.Name.toUmbracoAlias();
            }
        }

        function checkServer() {
            vm.checkState = 'busy';
            vm.server.Url = vm.server.Url.trimEnd('/');
            uSyncPublishServerManager.checkServerByUrl(vm.server.Url,
                function (status) {
                    vm.status = status;
                    if (status.Status === 'Success') {
                        vm.checkState = 'success';
                    }
                    else {
                        vm.checkState = 'error';
                    }
                    vm.checked = true;
                    vm.showCheck = true;
                });
        }

        function setupServer() {
            uSyncPublishServerManager.remoteSetup(vm.server,
                function (success) {
                    if (success) {
                        checkServer();
                    }
                });
        }

        // dialog controls
        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        function save() {
            uSyncPublishService.saveServer(vm.server)
                .then(function (result) {
                    vm.buttonState = 'success';
                    notificationsService.success('Saved', vm.server.Alias + ' server settings have been updated');
                    $rootScope.$broadcast('usync-publish-serverSave');
                }, function (error) {
                    vm.buttonState = 'error';
                    notificationsService.error('error', error.data.ExceptionMessage);
                });

            if ($scope.model.submit) {
                $scope.model.submit(vm.server);
            }
        }

    }

    angular.module('umbraco')
        .controller('uSyncAddServerController', addServerController);

})();