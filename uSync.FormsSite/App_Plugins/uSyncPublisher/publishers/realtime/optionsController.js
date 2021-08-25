(function () {
    'use strict';

    function optionsController($scope, dateHelper, userService,
        uSyncPublishService, uSyncActionManager) {

        // publisher vm
        var pvm = this;

        var evts = [];

        pvm.process = $scope.vm.process;
        pvm.headings = $scope.vm.headings;

        pvm.mode = $scope.vm.mode;
        pvm.contentType = $scope.vm.contentType;
        pvm.flags = $scope.vm.flags;

        pvm.action = pvm.process.action;

        // used in the UI, not the logic.
        pvm.server = $scope.vm.server;

        pvm.showtoggle = pvm.server.HideAdvanced;
        pvm.showAdvanced = !pvm.showtoggle;

        if (pvm.headings !== null) {
            pvm.headings.boxTitle = pvm.server.Name + ': Settings';
            pvm.headings.boxDescription = uSyncActionManager.getDescription(pvm.mode, pvm.contentType, pvm.server.Name);
        }

        pvm.items = pvm.process.items;
        pvm.firstItem = pvm.items[0];
        pvm.contentName = pvm.firstItem.name;

        InitOptions();

        $scope.$on("$destroy", function () {
            for (var e in evts) {
                evts[e]();
            }
        });

        ///////

        function InitOptions() {
          
            var flags = uSyncPublishService.getFlags(pvm.flags);
            if (pvm.mode === 'pushFiles') { flags = 0; }

            _.map(pvm.items, function (item) {
                item.flags = flags;
            });

            // we don't do delete missing when its a multi-select.
            if (pvm.items.length > 1) {
                pvm.flags.deleteMissing.value = false;
            }

            pvm.process.options.items = pvm.items;
            pvm.process.options.removeOrphans = pvm.flags.deleteMissing.value;
            pvm.process.options.includeFileHash = pvm.flags.includeFiles.value

            // when the flags change.
            evts.push($scope.$watch('pvm.flags', function (newVal, oldVal) {
                if (newVal !== undefined) {
                    updateItemFlags(pvm.flags);
                    pvm.process.options.removeOrphans = pvm.flags.deleteMissing.value;
                    pvm.process.options.includeFileHash = pvm.flags.includeFiles.value;

                    if (pvm.mode.startsWith('file')) {
                        pvm.process.options.includeFileHash = true;
                    }

                }
            }, true));


            pvm.showtoggle = shouldShowAdvanced();
            pvm.showAdvanced = !pvm.showtoggle;
        }

        function updateItemFlags(flags) {
            var flagValue = uSyncPublishService.getFlags(flags);
            pvm.process.items.forEach(function (item) {
                item.flags = flagValue;
            });
        }

        function shouldShowAdvanced() {

            if (!pvm.server.HideAdvanced) return false; // TODO: remove ?

            if (pvm.action.actionOptions['canSchedule'] === true) return true;

            for (var flag in pvm.flags) {
                if (flag != 'includeChildren' && flag !== 'deleteMissing') {
                    if (pvm.flags[flag].toggle == true) {
                        return true;
                    }
                }
            }

            return false;
        }


        $scope.$on('sync-server-selected', function (event, args) {
            pvm.server = args.server;
        });


        //// schedules publishing stuff
        // pvm.datePickerConfig = {};

        pvm.process.options.attributes = {};
        pvm.process.options.attributes.releaseDate = null;

        pvm.currentUser = null;
        pvm.releaseDateFormatted = null;

        pvm.datePickerSetup = datePickerSetup;
        pvm.datePickerChange = datePickerChange;
        pvm.datePickerShow = datePickerShow;
        pvm.datePickerClose = datePickerClose;
        pvm.clearPublishDate = clearPublishDate;

        pvm.flatPickr = null;

        function datePickerSetup(instance) {
            pvm.flatPickr = instance;
        }

        function datePickerChange(date) {
            if (!date) { return; }
            var serverTime = dateHelper.convertToServerStringTime(moment(date), Umbraco.Sys.ServerVariables.application.serverTimeOffset);
            pvm.releaseDate = serverTime;
            pvm.releaseDateFormatted = dateHelper.getLocalDate(pvm.releaseDate, pvm.currentUser.locale, "MMM Do YYYY, HH:mm");

            pvm.process.options.attributes.releaseDate = serverTime;
        }

        function datePickerShow() {

        }

        function datePickerClose() {

        }

        function clearPublishDate() {

            pvm.process.options.attributes["releaseDate"] = null;

            pvm.releaseDate = null;

            // we don't have a publish date anymore so we can clear the min date for unpublish
            var now = new Date();
            var nowFormatted = moment(now).format("YYYY-MM-DD HH:mm");
            pvm.flatPickr.set("minDate", nowFormatted);
        }

        // get current backoffice user and format dates
        userService.getCurrentUser().then(function (currentUser) {

            pvm.currentUser = currentUser;

            var now = new Date();
            var nowFormatted = moment(now).format("YYYY-MM-DD HH:mm");

            pvm.datePickerConfig = {
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true,
                minDate: nowFormatted,
                defaultDate: nowFormatted
            };       
        });
    }

    angular.module('umbraco')
        .controller('uSyncPublisherOptionsController', optionsController);

})();