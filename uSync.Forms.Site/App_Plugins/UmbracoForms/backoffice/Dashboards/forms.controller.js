angular.module("umbraco")
  .controller("UmbracoForms.Dashboards.FormsController",
    function ($scope, $location, $cookies, formResource, licensingResource, updatesResource, notificationsService, userService, securityResource, recordResource) {

      var vm = this;

      vm.overlay = {
        show: false,
        title: "Congratulations",
        description: "You've just installed Umbraco Forms - Let's create your first form"
      };

      var packageInstall = $cookies.get("umbPackageInstallId");

      if (packageInstall) {
        vm.overlay.show = true;
        $cookies.put("umbPackageInstallId", "");
      }

      //Default for canManageForms is false
      //Need a record in security to ensure user has access to edit/create forms
      vm.userCanManageForms = false;

      //Get Current User - To Check if the user Type is Admin
      userService.getCurrentUser().then(function (response) {
        vm.currentUser = response;
        vm.isAdminUser = response.userGroups.includes("admin");

        securityResource.getByUserId(vm.currentUser.id).then(function (response) {
          vm.userCanManageForms = response.data.userSecurity.manageForms;
        });
      });

      //if not initial install, but still do not have forms - display a message
      if (!vm.overlay.show) {

        //Check if we have any forms created yet - by chekcing number of items back from JSON response
        formResource.getOverView().then(function (response) {
          if (response.data.length === 0) {
            vm.overlay.show = true;
            vm.overlay.title = "Create a form";
            vm.overlay.description = "You do not have any forms setup yet, how about creating one now?";
          }
        });
      }

      vm.getLicenses = function (config) {

        vm.loginError = false;
        vm.hasLicenses = undefined;
        vm.isLoading = true;

        licensingResource.getAvailableLicenses(config).then(function (response) {
          var licenses = response.data;
          var currentDomain = window.location.hostname;

          vm.hasLicenses = licenses.length > 0;
          _.each(licenses, function (lic) {
            if (lic.bindings && lic.bindings.indexOf(currentDomain) >= 0) {
              lic.currentDomainMatch = true;
            }
          });

          vm.configuredLicenses = _.sortBy(_.filter(licenses, function (license) { return license.configured; }), 'currentDomainMatch');
          vm.openLicenses = _.filter(licenses, function (license) { return license.configured === false; });
          vm.isLoading = false;

        }, function (err) {
          vm.loginError = true;
          vm.hasLicenses = undefined;
          vm.isLoading = false;
        });

      };


      vm.configure = function (config) {
        vm.isLoading = true;
        licensingResource.configureLicense(config).then(function (response) {
          vm.configuredLicenses.length = 0;
          vm.openLicenses.length = 0;
          vm.loadStatus();
          notificationsService.success("License configured", "Umbraco forms have been configured to be used on this website");
        });
      };


      vm.loadStatus = function () {
        licensingResource.getLicenseStatus().then(function (response) {
          vm.status = response.data;
          vm.isLoading = false;
        });

        updatesResource.getUpdateStatus().then(function (response) {
          vm.version = response.data;
        });

        updatesResource.getVersion().then(function (response) {
          vm.currentVersion = response.data;
        });

        updatesResource.getSavePlainTextPasswordsConfiguration().then(function (response) {
          vm.savePlainTextPasswords = response.data.toString() === "true";
        });


      };

      //TODO: Can this die/go away?!
      vm.upgrade = function () {
        //Let's tripple check the user is of the userType Admin
        if (!$scope.isAdminUser) {
          //The user is not an admin & should have not hit this method but if they hack the UI they could potnetially see the UI perhaps?
          notificationsService.error("Insufficient Permissions", "Only Admin users have the ability to upgrade Umbraco Forms");
          return;
        }

        vm.installing = true;
        updatesResource.installLatest($scope.version.remoteVersion).then(function (response) {
          window.location.reload();
        }, function (reason) {
          //Most likely the 403 Unauthorised back from server side
          //The error is caught already & shows a notification so need to do it here
          //But stop the loading bar from spining forever
          vm.installing = false;
        });
      };


      vm.create = function () {

        //Let's tripple check the user is of the userType Admin
        if (!vm.userCanManageForms) {
          //The user is not an admin & should have not hit this method but if they hack the UI they could potnetially see the UI perhaps?
          notificationsService.error("Insufficient Permissions", "You do not have permissions to create & manage forms");
          return;
        }

        $location.url("forms/Form/edit/-1?template=&create=true");
      };


      vm.configuration = { domain: window.location.hostname };
      vm.loadStatus();


      /////////////////////

      vm.initialFormsLimit = 4;
      vm.formsLimit = 4; //Show top 4 by default

      vm.showMore = function () {
        var incrementLimitBy = 8;
        vm.formsLimit = vm.formsLimit + incrementLimitBy;
        getRecordCounts();
      };

      function getRecordCounts() {
        _.each(vm.forms, function (form, index) {

          // Only get record counts for forms that are a) visible and b) already populated.
          if (index >= vm.formsLimit || form.gotEntries) {
            return;
          }

          var filter = { form: form.id };

          recordResource.getRecordsCount(filter).then(function (response) {
            form.entries = response.data.count;
            form.gotEntries = true;
          });
        });
      }

      // Get all forms and populate visible ones with recorcd counts.
      formResource.getOverView().then(function (response) {
        vm.forms = response.data;
        getRecordCounts();
      });

    });
