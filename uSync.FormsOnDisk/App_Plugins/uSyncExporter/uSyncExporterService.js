(function () {
    'use strict';

    function uSyncExporterService($http, $q,
        umbRequestHelper, uSyncDependencyManager) {

        var serviceRoot = Umbraco.Sys.ServerVariables.uSync.exporterService;

        var service = {
            getSettings: getSettings,
            getExporters: getExporters,
            isLicenced: isLicenced,

            getSyncItems: getSyncItems,

            createExport: createExport,
            getExport: getExport,

            reportPack: reportPack,
            importPack: importPack,
            

        };

        return service;

        ////
        function isLicenced() {
            return $http.get(serviceRoot + "IsLicenced");
        }

        function getSettings() {
            return $http.get(serviceRoot + "GetSettings");
        }

        function getExporters() {
            return $http.get(serviceRoot + "GetExporters");
        }

        function getSyncItems(items) {
            
            return $http.post(serviceRoot + "GetSyncItems", items);
        }

        function createExport(request) {
            return $http.post(serviceRoot + "CreateExport", request);
        }

        function getExport(request) {
            return downloadPost(serviceRoot + "GetExport", request);
        }


        function reportPack(request) {
            return $http.post(serviceRoot + "ReportPack", request);
        }

        function importPack(request) {
            return $http.post(serviceRoot + "ImportPack", request);
        }


        /*
         * Downloads a file to the client using AJAX/XHR
         * Based on an implementation here: web.student.tuwien.ac.at/~e0427417/jsdownload.html
         * See https://stackoverflow.com/a/24129082/694494
         */
        function downloadPost(httpPath, payload) {

            // Use an arraybuffer
            return $http.post(httpPath, payload, { responseType: 'arraybuffer' })
                .then(function (response) {

                    var octetStreamMime = 'application/octet-stream';
                    var success = false;

                    // Get the headers
                    var headers = response.headers();

                    // Get the filename from the x-filename header or default to "download.bin"
                    var filename = headers['x-filename'] || 'download.bin';

                    // Determine the content type from the header or default to "application/octet-stream"
                    var contentType = headers['content-type'] || octetStreamMime;

                    try {
                        // Try using msSaveBlob if supported
                        let blob = new Blob([response.data], { type: contentType });
                        if (navigator.msSaveBlob)
                            navigator.msSaveBlob(blob, filename);
                        else {
                            // Try using other saveBlob implementations, if available
                            var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                            if (saveBlob === undefined) throw "Not supported";
                            saveBlob(blob, filename);
                        }
                        success = true;
                    } catch (ex) {
                        console.log("saveBlob method failed with the following exception:");
                        console.log(ex);
                    }

                    if (!success) {
                        // Get the blob url creator
                        var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                        if (urlCreator) {
                            // Try to use a download link
                            var link = document.createElement('a');
                            if ('download' in link) {
                                // Try to simulate a click
                                try {
                                    // Prepare a blob URL
                                    let blob = new Blob([response.data], { type: contentType });
                                    let url = urlCreator.createObjectURL(blob);
                                    link.setAttribute('href', url);

                                    // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
                                    link.setAttribute("download", filename);

                                    // Simulate clicking the download link
                                    var event = document.createEvent('MouseEvents');
                                    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                                    link.dispatchEvent(event);
                                    success = true;

                                } catch (ex) {
                                    console.log("Download link method with simulated click failed with the following exception:");
                                    console.log(ex);
                                }
                            }

                            if (!success) {
                                // Fallback to window.location method
                                try {
                                    // Prepare a blob URL
                                    // Use application/octet-stream when using window.location to force download
                                    let blob = new Blob([response.data], { type: octetStreamMime });
                                    let url = urlCreator.createObjectURL(blob);
                                    window.location = url;
                                    success = true;
                                } catch (ex) {
                                    console.log("Download link method with window.location failed with the following exception:");
                                    console.log(ex);
                                }
                            }

                        }
                    }

                    if (!success) {
                        // Fallback to window.open method
                        window.open(httpPath, '_blank', '');
                    }

                    return $q.resolve();

                }, function (response) {

                    return $q.reject({
                        errorMsg: "An error occurred downloading the file",
                        data: response.data,
                        status: response.status
                    });
                });
        }
    }

    angular.module('umbraco')
        .factory('uSyncExporterService', uSyncExporterService);

})();
