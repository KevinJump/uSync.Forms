(function () {
    'use strict';

    function serverManager(overlayService, notificationsService, uSyncPublishService) {

        return {
            checkServer: checkServer,
            checkServerByUrl: checkServerByUrl,

            createLocalApiKeys: createLocalApiKeys,
            remoteSetup: remoteSetup,
        };

        function checkServer(alias, showSuccessBar, callback) {
            uSyncPublishService.checkServer(alias)
                .then(function (result) {

                    if (showSuccessBar) {
                        notificationsService.success('Connected', 'Server connection setup');
                    }

                    if (callback) {
                        callback(result.data);
                    }
                }, function (error) {
                    notificationsService.error('error', error.data.ExceptionMessage);
                    if (callback) {
                        callback(null);
                    }
                });
        }

        function checkServerByUrl(url, callback) {
            uSyncPublishService.checkServerUrl(url)
                .then(function (result) {
                    if (callback) {
                        callback(result.data);
                    }
                }, function (error) {
                    if (callback) {
                        callback({
                            Status: 'Error',
                            Message: error.data.ExceptionMessage
                        });
                    }
                });
        }

        function createLocalApiKeys() {
            var overlay = {
                title: 'Create local security keys',
                subtitle: 'create required security id and key',
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'remote/setupkeys.html',
                isModal: true,
                busy: false,
                disableBackdropClick: true,
                disableEscapeKey: true,
                skipFormValidation: true,
                submitButtonLabel: 'Create security keys',
                closeButtonLabel: 'Not now',
                submit: function (model) {
                    // create keys. 
                    uSyncPublishService.createKeys()
                        .then(function (result) {
                            overlayService.close();
                        }, function (error) {
                            notificationsService.error('Error', 'Unable to setup server');
                            overlayService.close();
                        });
                },
                close: function () {
                    // save settings
                    overlayService.close();
                }
            };

            overlayService.open(overlay);
        }



        function remoteSetup(server, callback) {

            var overlay = {
                title: 'Setup ' + server.Name,
                subtitle: 'Setup API connection to ' + server.Url,
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'remote/remoteOverlay.html',
                server: server,
                isModal: true,
                busy: false,
                disableBackdropClick: true,
                disableEscKey: true,
                skipFormValidation: true,
                disableSubmitButton: true,
                submitButtonLabel: 'Continue',
                closeButtonLabel: 'Close',
                submit: function (model) {

                    // do the actual login stuff here.... 
                    model.busy = true;
                    disableSubmitButton: true,

                        uSyncPublishService.setupServer(model.server.Alias, model.server.Url, model.username, model.password)
                        .then(function (result) {
                                if (result.data.Success) {

                                    notificationsService.success('Success', result.data.Message);

                                    overlayService.close();

                                    if (callback) {
                                        callback(result.data.Success);
                                    }
                                }
                                else {
                                    model.busy = false;
                                    model.showError = true;
                                    model.error = result.data.Message;
                                }
                            }, function (error) {
                                notificationsService.error('Error', 'Unable to setup server');
                                if (callback) {
                                    callback(false);
                                }
                                overlayService.close();
                            });

                },
                close: function () {
                    overlayService.close();
                }
            };

            overlayService.open(overlay);
        }


    }

    angular.module('umbraco')
        .factory('uSyncPublishServerManager', serverManager);


})();