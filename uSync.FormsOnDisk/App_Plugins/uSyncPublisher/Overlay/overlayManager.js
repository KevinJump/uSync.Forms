(function () {
    'use strict';

    function overlayManager($rootScope, overlayService, uSyncItemManager) {

        var mgr = {};

        return {
            insertPublishCmds: insertPublishCmds
        };

        /////
        function insertPublishCmds(content) {

            if (content !== undefined) {
                mgr.content = content;
            }

            var contentForm = angular.element(document).find('[name="contentForm"]');
            if (contentForm != null) {
                var formScope = findScope($rootScope);
                if (formScope != null) {
                    if (_.contains(formScope.content.allowedActions, '^')) {

                        if (formScope.subButtons !== null) {
                            if (!_.some(formScope.subButtons, function (b) { return b.letter == 'SYNCPUB'; })) {
                                var button = {
                                    letter: 'SYNCPUB',
                                    labelKey: 'usyncpublish_publishButton',
                                    handler: publishToSite,
                                    alias: 'usyncSitePublish',
                                    addEllipsis: 'true'
                                };

                                formScope.subButtons.splice(1, 0, button);
                            }
                        }
                    }
                }
            }
        }

        function findScope(scope) {

            if (!scope) return null;

            var contentScope = null;
            if (scope.subButtons !== undefined && scope.content !== undefined) {
                return scope;
            }

            if (scope.$$childHead !== null) {
                contentScope = findScope(scope.$$childHead);
            }

            if (contentScope === null && scope.$$nextSibling !== null) {
                contentScope = findScope(scope.$$nextSibling);
            }

            return contentScope;
        }

        function publishToSite() {

            var treeItem = {
                Id: mgr.content.id,
                treeAlias: "content",
                sectionAlias: "content"
            };

            uSyncItemManager.getEntity(treeItem)
                .then(function (result) {

                    var options = {
                        items: [result.data],
                        treeItem: treeItem,
                    };

                    openPublishDialog(options);
                });
        }


        function openPublishDialog(options) {

            var overlay = {
                title: 'Publish to server...',
                subtitle: 'Select which server you wish to publish the content to',
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'overlay/overlayDialog.html',
                isModal: true,

                server: {},
                options: options,

                disableBackdropClick: true,
                disableEscKey: true,
                skipFormValidation: true,
                disableSubmitButton: true,
                submitButtonLabel: 'Continue',
                closeButtonLabel: 'Close',
                submit: function () {
                    if (this.isComplete != null && this.isComplete()) {
                        $scope.$broadcast('usync-publish-close');
                        overlayService.close();
                    }
                    else {
                        if (this.moveToNext != null) {
                            this.moveToNext();
                        }
                    }
                },
                close: function () {
                    overlayService.close();
                }
            };

            overlayService.open(overlay);
          
        }
    }

    angular.module('umbraco')
        .factory('uSyncPublishOverlayManager', overlayManager);
})();