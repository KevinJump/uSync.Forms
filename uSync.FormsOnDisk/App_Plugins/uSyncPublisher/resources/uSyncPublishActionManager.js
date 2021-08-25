(function () {
    'use strict';

    function publishActionManager($q) {

        return {
            // flags
            initFlags: initFlags,
            prepToggles: prepToggles,

            // actions
            hasStepActions: hasStepActions,

            // ui things. 
            getDialogTitle: getDialogTitle,
            getActionMessage: getActionMessage,
            getDescription: getDescription,

            emptyGuid: '00000000-0000-0000-0000-000000000000',
            mergeResults: mergeResults,
            mergeDependencies: mergeDependencies
        };

        //////
       

        function getActionMessage(action) {
            return { title: action.Name, Steps: action.Steps };
        }

        function getDialogTitle(action) {
            return action.Name;
        }

        function getDescription(mode, contentType, serverName) {
            var modeName = mode === 'SettingsPush' ? 'Push' : mode;
            var direction = mode === 'pull' ? ' from ' : ' to ';
            return capitalizeFirstLetter(modeName + ' ' + contentType + direction + serverName);
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function hasStepActions(action) {
            for (let n = 0; n < action.Steps.length; n++) {
                if (action.Steps[n].IsAction == true) {
                    return true;
                }
            }

            return false;
        }

        ///// flags
        function initFlags() {
            return {
                includeAncestors: { toggle: false, value: false },

                includeChildren: { toggle: true, value: true },
                includeDecendants: { toggle: false, value: true },
                deleteMissing: { toggle: true, value: false },

                includeDependencies: { toggle: false, value: false },

                includeFiles: { toggle: false, value: false },
                includeMedia: { toggle: true, value: true },
                includeMediaFiles: { toggle: false, value: false },

                includeLinked: { toggle: true, value: false },
                includeConfig: { toggle: false, value: true }
            };
        }

        function prepToggles(server, flags, contentType) {
            var op = server.SendSettings;
            if (op !== undefined) {

                flags.includeAncestors = setToggle(op.IncludeAncestors);

                flags.includeChildren = setToggle(op.IncludeChildren);
                flags.includeDecendants = setToggle(op.includeDecendants);
                flags.deleteMissing = setToggle(op.DeleteMissing);

                flags.includeDependencies = setToggle(op.IncludeDependencies);

                flags.includeFiles = setToggle(op.IncludeFiles);
                flags.includeMedia = setToggle(op.IncludeMedia);
                flags.includeMediaFiles = setToggle(op.includeMediaFiles);

                flags.includeLinked = setToggle(op.IncludeLinked);
                flags.includeConfig = setToggle(op.IncludeConfig);

                // override the settings for media 
                if (contentType === 'media') {
                    flags.includeMedia = { toggle: false, value: true };
                    flags.includeAncestors = { toggle: false, value: true };
                    flags.includeFiles = { toggle: false, value: false };
                    flags.includeLinked = { toggle: false, value: false };
                }
            }

            return flags;
        }


        function setToggle(value) {
            if (value !== undefined && value.startsWith('user')) {
                return { toggle: true, value: value.endsWith('yes') };
            }
            else {
                return { toggle: false, value: value === 'yes' };
            }
        }

        function mergeResults(source, target) {

            if (source === null || source === undefined) {
                return target;
            }

            if (target === undefined || target === null) {
                target = [];
            }


            for (let i = 0; i < source.length; i++) {

                var targetAction = _.findWhere(target, { key: source[i].key });
                if (targetAction !== undefined) {
                    if (source[i].Change !== 'NoChange' && source[i].Change !== 'Import') {
                        var indexOfAction = _.indexOf(target, targetAction)
                        target[indexOfAction] = source[i];
                    }
                }
                else {
                    target.push(source[i]);
                }
            }

            return target;
        }

        function mergeDependencies(source, target) {
            if (source === null || source === undefined) {
                return target;
            }

            if (target === undefined || target === null) {
                target = [];
            }

            for (let i = 0; i < source.length; i++) {
                var targetDependency = _.findWhere(target, { Udi: source[i].Udi });
                if (targetDependency !== undefined) {
                    var index = _.indexOf(target, targetDependency);
                    target[index] = source[i];
                }
                else {
                    target.push(source[i]);
                }
            }

            return target;
        }
    }

    angular.module('umbraco')
        .factory('uSyncActionManager', publishActionManager);

})();