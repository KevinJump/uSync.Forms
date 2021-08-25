(function () {
    'use strict';

    function remoteOverlayController($scope) {

        var vm = this;
        vm.server = $scope.model.server;
        vm.togglePassword = togglePassword;

        $scope.model.disableSubmitButton = false;

        function togglePassword() {
            var elem = $("form[name='usyncremoteserver'] input[name='password']");
            elem.attr("type", (elem.attr("type") === "text" ? "password" : "text"));
            elem.focus();
            $(".password-text.show, .password-text.hide").toggle();
        }


    }

    angular.module('umbraco')
        .controller('uSyncPublisherRemoteOverlayController', remoteOverlayController);

})();