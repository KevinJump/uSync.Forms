(function () {
    'use strict';

    function configPullController($scope, uSyncPublishService) {

        var unsubscribe = [];

        var pvm = this;

        // simple toggles.
        pvm.syncSettings = false;
        pvm.syncContent = false;
        pvm.syncMedia = false;

        // config from the parent. 
        pvm.mode = $scope.vm.mode;
        pvm.contentType = $scope.vm.contentType;

        // options stored on the parent.
        pvm.process = $scope.vm.process;
        
        pvm.flags = {
            includeChildren: { toggle: true, value: true },
            includeDecendants: { toggle: true, value: true },
            includeMedia: { toggle: false, value: false },
            includeLinked: { toggle: false, value: false },
            includeAncestors: { toggle: false, value: false },
            includeDependencies: { toggle: false, value: false },
            includeFiles: { toggle: false, value: true },
            includeMediaFiles: { toggle: false, value: false },
            deleteMissing: { toggle: false, value: false },
            includeSystemFiles: { toggle: false, value: false }
        };

        pvm.flagsValue = uSyncPublishService.getFlags(pvm.flags);

        var emptyGuid = '00000000-0000-0000-0000-000000000000';
        var emptyString = '';

        pvm.items = {
            docTypes: { toggle: true, value: true, typeName: 'document-type', root: emptyGuid, name: 'Document types' },
            dataTypes: { toggle: true, value: true, typeName: 'data-type', root: emptyGuid, name: 'Data types' },
            mediaTypes: { toggle: true, value: true, typeName: 'media-type', root: emptyGuid, name: 'Media types' },
            domains: { toggle: true, value: true, typeName: 'domain', root: emptyGuid, name: 'Domain settings' },
            memberTypes: { toggle: true, value: true, typeName: 'member-type', root: emptyGuid, name: 'Member types' },
            dictionary: { toggle: true, value: true, typeName: 'dictionary-item', root: emptyGuid, name: 'Dictionary items' },
            macro: { toggle: true, value: true, typeName: 'macro', root: emptyGuid, name: 'Macros' },
            template: { toggle: true, value: true, typeName: 'template', root: emptyGuid, name: 'Templates' },
            files: { toggle: true, value: true, typeName: null, root: emptyString, name: 'Files' },
            systemFiles: { toggle: true, value: false, typeName: null, root: emptyString, name: '' },
            languages: { toggle: true, value: true, typeName: 'language', root: emptyString, name: 'Languages' },
            protect: { toggle: true, value: true, typeName: 'protect', root: emptyGuid, name: 'Public access settings' },
            content: { toggle: true, value: false, typeName: 'document', root: emptyGuid, name: 'Content' },
            media: { toggle: true, value: false, typeName: 'media', root: emptyGuid, name: 'Media' }
        };

        // used in the UI, not the logic.
        pvm.server = $scope.vm.server;

        var item = $scope.vm.items[0];

        var contentName = item.name;

        if ($scope.vm.headings !== undefined) {
            $scope.vm.headings.title = 'Sync settings';
            $scope.vm.headings.description = 'Deploy settings to ' + pvm.server.Name
        }
        
        InitOptions();

        $scope.$on('$destroy', function () {
            for (var u in unsubscribe) {
                unsubscribe[u]();
            }
        });

        ///////

        function InitOptions() {

            pvm.process.options = {
                removeOrphans: pvm.flags.deleteMissing.value,
                includeFileHash: pvm.flags.includeFiles.value
            };

            pvm.process.items = [{
                id: item.id,
                name: contentName,
                udi: item.udi,
                flags: uSyncPublishService.getFlags(pvm.flags)
            }];

            if ($scope.vm.options.simple) {
                toggleSettings();
                toggleContent();
                toggleMedia();
            }

            // when the flags change.
            unsubscribe.push($scope.$watch('pvm.items', function (newVal, oldVal) {

                if (newVal !== undefined) {

                    pvm.process.items = [];

                    angular.forEach(newVal, function (value, key) {

                        if (key === 'files') {
                            pvm.process.options.includeFileHash = value.value;
                        }
                        else if (key == 'systemFiles') {
                            pvm.process.options.includeSystemFileHash = value.value;
                        }
                        else if (value.value === true && value.typeName !== null) {
                            pvm.process.items.push(
                                {
                                    udi: 'umb://' + value.typeName + '/' + value.root,
                                    name: value.typeName,
                                    flags: pvm.flagsValue
                                });
                        }
                    });

                    if (newVal.template.value === true && newVal.files.value !== true) {
                        newVal.files.value = true;
                    }
                }
            }, true));
        }


        ////// simple mode.

        pvm.toggleSettings = toggleSettings;
        pvm.toggleContent = toggleContent;
        pvm.toggleMedia = toggleMedia;
        pvm.toggleMode = toggleMode;

        function toggleSettings() {
            pvm.syncSettings = !pvm.syncSettings;
            pvm.items.docTypes.value = pvm.syncSettings;
            pvm.items.dataTypes.value = pvm.syncSettings;
            pvm.items.mediaTypes.value = pvm.syncSettings;
            pvm.items.memberTypes.value = pvm.syncSettings;
            pvm.items.dictionary.value = pvm.syncSettings;
            pvm.items.macro.value = pvm.syncSettings;
            pvm.items.template.value = pvm.syncSettings;
            pvm.items.files.value = pvm.syncSettings;
            pvm.items.languages.value = pvm.syncSettings;

            if (!pvm.syncSettings) {
                if (pvm.syncMedia) toggleMedia();
                if (pvm.syncContent) toggleContent();
            }
        }

        function toggleMedia() {
            pvm.syncMedia = !pvm.syncMedia;
            pvm.items.media.value = pvm.syncMedia;

            if (pvm.syncMedia && !pvm.syncSettings) {
                toggleSettings();
            }
        }

        function toggleContent() {
            pvm.syncContent = !pvm.syncContent;

            pvm.items.content.value = pvm.syncContent;
            pvm.items.domains.value = pvm.syncContent;
            pvm.items.protect.value = pvm.syncContent;

            if (pvm.syncContent && !pvm.syncSettings) {
                toggleSettings();
            }
        }

        function toggleMode() {
            $scope.vm.options.simple = !$scope.vm.options.simple;
        }
    };

    angular.module('umbraco')
        .controller('uSyncPublisherConfigPullController', configPullController);


})();