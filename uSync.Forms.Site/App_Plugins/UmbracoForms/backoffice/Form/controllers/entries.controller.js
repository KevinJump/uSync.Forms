angular.module("umbraco").controller("UmbracoForms.Editors.Form.EntriesController", function ($scope, $routeParams, recordResource, formResource, editorService, userService, securityResource, notificationsService, navigationService, overlayService) {

  // On load/init of 'editing' a form then
  // Let's check & get the current user's form security
  var currentUserId = null;
  var currentFormSecurity = null;

  var vm = this;
  vm.pagination = {
    pageNumber: 1,
    totalPages: 1
  };
  vm.allIsChecked = false;
  vm.selectedEntry = {};
  vm.showEntryDetails = false;
  vm.userLocale = "";

  vm.nextPage = nextPage;
  vm.prevPage = prevPage;
  vm.goToPageNumber = goToPageNumber;
  vm.viewEntryDetails = viewEntryDetails;
  vm.closeEntryDetails = closeEntryDetails;
  vm.nextEntryDetails = nextEntryDetails;
  vm.prevEntryDetails = prevEntryDetails;
  vm.datePickerChange = datePickerChange;
  vm.toggleRecordState = toggleRecordState;
  vm.canEditSensitiveData = false;


  vm.keyboardShortcutsOverview = [

    {
      "name": "Entry details",
      "shortcuts": [
        {
          "description": "Next entry",
          "keys": [
            {
              "key": "→"
            }
          ]
        },
        {
          "description": "Previous entry",
          "keys": [
            {
              "key": "←"
            }
          ]
        },
        {
          "description": "Close details",
          "keys": [
            {
              "key": "esc"
            }
          ]
        }
      ]
    }

  ];

  // By default set to have access (in case we do not find the current user's per individual form security item)
  $scope.hasAccessToCurrentForm = true;

  userService.getCurrentUser().then(function (response) {
    currentUserId = response.id;
    vm.userLocale = response.locale;

    // Set the API controller response on the Angular ViewModel
    vm.canEditSensitiveData = response.userGroups.indexOf("sensitiveData") !== -1;

    // Now we can make a call to form securityResource
    securityResource.getByUserId(currentUserId).then(function (response) {
      $scope.security = response.data;

      // Use _underscore.js to find a single item in the JSON array formsSecurity
      // where the FORM guid matches the one we are currently editing (if underscore does not find an item it returns undefinied)
      currentFormSecurity = _.where(response.data.formsSecurity, { Form: $routeParams.id });

      if (currentFormSecurity.length === 1) {
        // Check & set if we have access to the form
        // if we have no entry in the JSON array by default its set to true (so won't prevent)
        $scope.hasAccessToCurrentForm = currentFormSecurity[0].HasAccess;
      }

      // Check if we have access to current form OR manage forms has been disabled
      if (!$scope.hasAccessToCurrentForm || !$scope.security.userSecurity.manageForms) {

        // Show error notification
        notificationsService.error("Access Denied", "You do not have access to view this form's entries");

        // Resync tree so that it's removed & hides
        navigationService.syncTree({ tree: "form", path: ['-1'], forceReload: true, activate: false }).then(function (response) {

          // Response object contains node object & activate bool
          // Can then reload the root node -1 for this tree 'Forms Folder'
          navigationService.reloadNode(response.node);
        });

        // Don't need to wire anything else up
        return;
      }
    });
  });


  formResource.getWithWorkflowsByGuid($routeParams.id)  // We could call getByGuid here, as we don't need the workflows.
                                                        // But this request gets us a FormDesign object, which has the path populated.
    .then(function (response) {
      $scope.form = response.data;
      $scope.loaded = true;

      // As we are editing an item we can highlight it in the tree.
      // We get back the path to the form, so we need to add one more element to the end which is the id of the "entries" node, made up of the
      // form's Id suffixed with "_entries".
      var path = $scope.form.path.split(',');
      path.push(path[path.length - 1] + "_entries");
      navigationService.syncTree({ tree: "form", path: path, forceReload: false });

      // Populate the available recordset actions (we need to do this after retrieving the form, so
      // we can filter out those not appropriate for forms that are automatically approved).
      recordResource.getRecordSetActions().then(function (response) {
        $scope.recordSetActions = response.data.filter(function (action) {
          return $scope.form.manualApproval || action.isAvailableForApprovedRecords;
        });
      });

    });

  $scope.states = [
    {
      "name": "Approved",
      "isChecked": true
    },
    {
      "name": "Submitted",
      "isChecked": true
    }
  ];

  $scope.filter = {
    startIndex: 1, // Page Number
    length: 20, // No per page
    form: $routeParams.id,
    sortBy: "created",
    sortOrder: "descending",
    states: ["Approved", "Submitted"],
    localTimeOffset: new Date().getTimezoneOffset()
  };

  $scope.records = [];

  // Default value
  $scope.loading = false;

  $scope.toggleRecordStateSelection = function (recordState) {
    var idx = $scope.filter.states.indexOf(recordState);

    // is currently selected
    if (idx > -1) {
      $scope.filter.states.splice(idx, 1);
    }

    // is newly selected
    else {
      $scope.filter.states.push(recordState);
    }
  };

  $scope.hiddenFields = [2];
  $scope.toggleSelection = function toggleSelection(field) {
    var idx = $scope.hiddenFields.indexOf(field);

    // is currently selected
    if (idx > -1) {
      $scope.hiddenFields.splice(idx, 1);
    } else {
      $scope.hiddenFields.push(field);
    }
  };


  $scope.edit = function (schema) {
    editorService.open(
      {
        view: "/App_Plugins/UmbracoForms/backoffice/Form/dialogs/entriessettings.html",
        schema: schema,
        toggle: $scope.toggleSelection,
        hiddenFields: $scope.hiddenFields,
        filter: $scope.filter,
        size: 'medium'
      });
  };

  // $scope.pagination = [];


  function nextPage(pageNumber) {
    $scope.filter.startIndex++;
    $scope.loadRecords($scope.filter);
  }

  function prevPage(pageNumber) {
    $scope.filter.startIndex--;
    $scope.loadRecords($scope.filter);
  }

  function goToPageNumber(pageNumber) {
    // do magic here
    $scope.filter.startIndex = pageNumber;
    $scope.loadRecords($scope.filter);
  }

  function viewEntryDetails(schema, entry, event) {

    vm.selectedEntry = {};

    var entryIndex = $scope.records.results.indexOf(entry);
    // get the count of the entry across the pagination: entries pr page * page index + entry index
    var entryCount = $scope.filter.length * ($scope.filter.startIndex - 1) + (entryIndex + 1);

    vm.selectedEntry = entry;
    vm.selectedEntry.index = entryIndex;
    vm.selectedEntry.entryCount = entryCount;
    vm.selectedEntry.details = [];

    if (schema && entry) {
      for (var index = 0; index < schema.length; index++) {
        var schemaItem = schema[index];

        // Select the value from the entry.fields array
        var valueItem = entry.fields[index];

        // Create new object to push into details above (so our angular view is much neater)
        var itemToPush = {
          name: schemaItem.name,
          value: valueItem,
          viewName: schemaItem.view,
          view: '/App_Plugins/UmbracoForms/backoffice/Common/RenderTypes/' + schemaItem.view + '.html',
          containsSensitiveData: schemaItem.containsSensitiveData
        };

        var excludeItems = ["member", "state", "created", "updated"];
        var found = excludeItems.indexOf(schemaItem.id);

        if (excludeItems.indexOf(schemaItem.id) === -1) {
          vm.selectedEntry.details.push(itemToPush);
        }

      }
    }

    vm.showEntryDetails = true;

    if (event) {
      event.stopPropagation();
    }
  }

  function closeEntryDetails() {
    vm.selectedEntry = {};
    vm.showEntryDetails = false;
  }

  function nextEntryDetails() {

    // get the current index and plus 1 to get the next item in the array
    var nextEntryIndex = vm.selectedEntry.index + 1;
    var entriesCount = $scope.records.results.length;
    var currentPage = $scope.filter.startIndex;
    var totalNumberOfPages = $scope.records.totalNumberOfPages;

    if (nextEntryIndex < entriesCount) {

      var entry = $scope.records.results[nextEntryIndex];
      viewEntryDetails($scope.records.schema, entry);

    } else if (totalNumberOfPages > 1 && currentPage < totalNumberOfPages) {

      $scope.filter.startIndex++;
      vm.pagination.pageNumber++;

      recordResource.getRecords($scope.filter).then(function (response) {
        $scope.records = response.data;
        $scope.allIsChecked = ($scope.selectedRows.length >= $scope.records.results.length);
        vm.pagination.totalPages = response.data.totalNumberOfPages;

        limitRecordFields($scope.records);

        // get the first item from the new collection
        var entry = $scope.records.results[0];
        viewEntryDetails($scope.records.schema, entry);

      });

    }

  }

  function prevEntryDetails() {


    var prevEntryIndex = vm.selectedEntry.index - 1;
    var totalNumberOfPages = $scope.records.totalNumberOfPages;
    var currentPage = $scope.filter.startIndex;

    if (vm.selectedEntry.index > 0) {

      var entry = $scope.records.results[prevEntryIndex];
      viewEntryDetails($scope.records.schema, entry);

    } else if (totalNumberOfPages > 1 && currentPage !== 1) {

      $scope.filter.startIndex--;
      vm.pagination.pageNumber--;

      recordResource.getRecords($scope.filter).then(function (response) {
        $scope.records = response.data;
        $scope.allIsChecked = ($scope.selectedRows.length >= $scope.records.results.length);
        vm.pagination.totalPages = response.data.totalNumberOfPages;

        limitRecordFields($scope.records);

        // get the last item from the new collection
        var lastEntryIndex = $scope.records.results.length - 1;
        var entry = $scope.records.results[lastEntryIndex];
        viewEntryDetails($scope.records.schema, entry);

      });

    }
  }

  function datePickerChange(dateRange) {
    $scope.filter.startDate = dateRange.startDate;
    $scope.filter.endDate = dateRange.endDate;
    $scope.filterChanged();
  }

  function toggleRecordState(recordState) {
    if (recordState.isChecked) {
      $scope.filter.states.push(recordState.name);
    } else {
      var index = $scope.filter.states.indexOf(recordState.name);
      if (index !== -1) {
        $scope.filter.states.splice(index, 1);
      }
    }
    $scope.filterChanged();
  }

  $scope.next = function () {
    $scope.filter.startIndex++;
  };

  $scope.prev = function () {
    $scope.filter.startIndex--;
  };

  $scope.goToPage = function (index) {
    $scope.filter.startIndex = index;
  };


  $scope.search = _.debounce(function (resetIndex) {

    // Set loading to true
    $scope.loading = true;

    $scope.reset(resetIndex);

    $scope.$apply(function () {
      recordResource.getRecords($scope.filter).then(function (response) {
        // Got results back - set loading to false]
        $scope.loading = false;

        $scope.records = response.data;
        vm.pagination.totalPages = response.data.totalNumberOfPages;

        limitRecordFields($scope.records);

      });
    });


  }, 300);


  $scope.filterChanged = function () {
    var resetIndex = true;
    $scope.search(resetIndex);
  };

  $scope.loadRecords = function (filter, append) {

    // Set loading to true
    $scope.loading = true;

    recordResource.getRecords(filter).then(function (response) {
      // Got response from server
      $scope.loading = false;

      if (append) {
        $scope.records = $scope.records.results.concat(response.data.results);
      } else {
        $scope.records = response.data;
      }

      $scope.allIsChecked = ($scope.selectedRows.length >= $scope.records.results.length);

      limitRecordFields($scope.records);

      vm.pagination.totalPages = response.data.totalNumberOfPages;

    });
  };

  $scope.loadRecords($scope.filter);

  function limitRecordFields(records) {
    // function to limit how many fields are
    // shown in the entries table

    var falseFromIndex = 2;
    var falseToIndex = records.schema.length - 4;
    var trueFalseArray = [];

    // make array of true/false
    angular.forEach(records.schema, function (schema, index) {
      if (index <= falseFromIndex || index >= falseToIndex) {
        trueFalseArray.push(true);
      } else {
        trueFalseArray.push(false);
      }
    });

    // set array for schema
    records.showSchemaArray = trueFalseArray;

    // set array for row fields
    angular.forEach(records.results, function (result) {
      result.showRecordsArray = trueFalseArray;
    });
  }

  $scope.reset = function (resetIndex) {
    $scope.selectedRows.length = 0;
    $scope.allIsChecked = false;

    if (resetIndex) {
      $scope.filter.startIndex = 1;
    }

  };

  $scope.clearSelection = function () {
    $scope.selectedRows.length = 0;
    vm.allIsChecked = false;

    for (var i = 0; i < $scope.records.results.length; i++) {
      var row = $scope.records.results[i];
      row.selected = false;
    }
  };

  $scope.more = function () {
    $scope.filter.startIndex++;
    $scope.loadRecords($scope.filter, true);
  };

  $scope.selectedRows = [];

  $scope.toggleRow = function (row) {
    row.selected = !row.selected;
    if (row.selected) {
      $scope.selectedRows.push(row.id);
      $scope.allIsChecked = ($scope.selectedRows.length >= $scope.records.results.length);
    } else {
      var i = $scope.selectedRows.indexOf(row.id);
      $scope.selectedRows.splice(i, 1);
      $scope.allIsChecked = false;
    }
  };

  $scope.toggleRowLegacy = function (row) {
    if (row.selected) {
      $scope.selectedRows.push(row.id);
      $scope.allIsChecked = ($scope.selectedRows.length >= $scope.records.results.length);
    } else {
      var i = $scope.selectedRows.indexOf(row.id);
      $scope.selectedRows.splice(i, 1);
      $scope.allIsChecked = false;
    }
  };

  $scope.allIsChecked = false;
  $scope.toggleAllLegacy = function ($event) {
    var checkbox = $event.target;
    $scope.selectedRows.length = 0;

    for (var i = 0; i < $scope.records.results.length; i++) {
      var entity = $scope.records.results[i];
      entity.selected = checkbox.checked;

      if (checkbox.checked) {
        $scope.selectedRows.push(entity.id);
      }
    }
  };

  $scope.toggleAll = function () {

    var newValue = !$scope.allIsChecked;

    for (var i = 0; i < $scope.records.results.length; i++) {
      var entity = $scope.records.results[i];

      if (entity.selected !== newValue) {
        $scope.toggleRow(entity);
      }

    }

  };

  $scope.executeRecordSetAction = function (action) {

    // Get the data we need in order to send to the API Endpoint
    var model = {
      formId: $scope.form.id,
      recordKeys: $scope.selectedRows,
      actionId: action.id
    };

    var performAction = function () {
      $scope.recordSetActionExecuting = true;
      recordResource.executeRecordSetAction(model).then(function (response) {
        $scope.reset(true);
        $scope.loadRecords($scope.filter, false);
        $scope.recordSetActionExecuting = false;
        notificationsService.success("Executed Action", "Successfully executed action " + action.name);
      }, function (err) {
        // Error Function - so get an error response from API
        notificationsService.error("Executed Action", "Failed to execute action " + action.name + " due to error: " + err);
      });
    };

    // Check if the action we are running requires a confirmation and that we have a message to be displayed.
    if (action.needsConfirm && action.confirmMessage.length > 0) {

      var overlay = {
        view: "confirm",
        title: "Confirmation",
        content: action.confirmMessage,
        closeButtonLabel: "No",
        submitButtonLabel: "Yes",
        submitButtonStyle: "danger",
        close: function () {
          overlayService.close();
        },
        submit: function () {
          performAction();
          overlayService.close();
        }
      };
      overlayService.open(overlay);
    }
    else {
      // No confirmation required, so execute immediately.
      performAction();
    }
  };
});
