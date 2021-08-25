(function () {

    var usyncReportSummaryComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/uSyncPublisher/Components/usyncReportSummary.html',
        bindings: {
            results: '=',
            stage: '<',
            toggle: '=',
        },
        controllerAs: 'vm',
        controller: reportSummaryController
    };

    function reportSummaryController() {

        var vm = this;
        vm.getDetailText = getDetailText;

        vm.$onInit = function () {
            vm.summary = getChangeSummary(vm.results);
        }

        function getChangeSummary(results) {

            var summary = {
                total: results.length,
                changes: 0,
                update: 0,
                create: 0,
                delete: 0,
                pending: 0
            };

            for (let c = 0; c < results.length; c++) {
                switch (results[c].Change) {
                    case 'NoChange':
                        break;
                    case 'Update':
                    case 'Import':
                        summary.update++;
                        break;
                    case 'Delete':
                        summary.delete++;
                        break;
                    case 'Create':
                        summary.create++;
                        break;
                    case 'WillChange':
                        summary.pending++;
                        break;
                }
            };

            summary.changes = summary.update + summary.delete + summary.create;

            return summary;
        }


        function getDetailText(changes, verb) {

            var purals = changes == 1 ? 'item' : 'items';

            

            if (vm.stage == 'report') {
                
                return changes + ' ' + purals + ' will be ' + verb;
            }
            else {
                var tense = changes == 1 ? ' was ' : ' were ';
                return changes + ' ' + purals + tense + verb;   
            }
        }

    }

    angular.module('umbraco')
        .component('usyncReportSummary', usyncReportSummaryComponent);


})();