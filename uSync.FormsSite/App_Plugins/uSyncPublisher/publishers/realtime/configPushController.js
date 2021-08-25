(function () {
    'use strict';

    function configPushController($scope,
        uSyncPublishService) {

        // events dear boy.
        var unsubscribe = [];

        // publisher vm
        var pvm = this;

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
            docTypes: { toggle: true, value: true, typeName: 'document-type', root: emptyGuid },
            dataTypes: { toggle: true, value: true, typeName: 'data-type', root: emptyGuid },
            mediaTypes: { toggle: true, value: true, typeName: 'media-type', root: emptyGuid },
            domains: { toggle: true, value: true, typeName: 'domain', root: emptyGuid },
            memberTypes: { toggle: true, value: true, typeName: 'member-type', root: emptyGuid },
            dictionary: { toggle: true, value: true, typeName: 'dictionary-item', root: emptyGuid },
            macro: { toggle: true, value: true, typeName: 'macro', root: emptyGuid },
            template: { toggle: true, value: true, typeName: 'template', root: emptyGuid },
            files: { toggle: true, value: true, typeName: null, root: emptyString },
            systemFiles: { toggle: true, value: false, typeName: null, root: emptyString },
            languages: { toggle: true, value: true, typeName: 'language', root: emptyString },
            protect: { toggle: true, value: true, typeName: 'protect', root: emptyGuid },
            content: { toggle: true, value: false, typeName: 'document', root: emptyGuid },
            media: { toggle: true, value: false, typeName: 'media', root: emptyGuid }
        };

        // used in the UI, not the logic.
        pvm.server = $scope.vm.selectedServer;

        var item = $scope.vm.items[0];

        var contentName = item.name;

        if ($scope.vm.headings !== undefined) {
            $scope.vm.headings.title = 'Sync Settings';
            $scope.vm.headings.description = "Deploy settings to " + pvm.server.Name;
            // $scope.model.description = pvm.server.Url
        }

        InitOptions();

        $scope.$on('$destroy', function () {
            for (var u in unsubscribe) {
                unsubscribe[u]();
            }
        })
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
            }],



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

                    // console.log(pvm.stepArgs.options);
                    if (newVal.template.value === true && newVal.files.value !== true) {
                        newVal.files.value = true;
                    }
                }
            }, true));
        }
    }

    angular.module('umbraco')
        .controller('uSyncPublisherConfigPushController', configPushController);

})();