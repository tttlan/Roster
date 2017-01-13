angular.module('ui.recruit.job-requisition')
    .factory('JobRequisitionService', [
        '$server', 'API_BASE_URL', 'FormatRequisition', 'Permissions', '$HTTPCache', '$q', '$notify',
        'JobRequisitionListModel', 'JobRequisitionDetailModel', 'LocationListModel',
        function($server, API_BASE_URL, FormatRequisition, Permissions, $HTTPCache, $q,
                  $notify, JobRequisitionListModel, JobRequisitionDetailModel, LocationListModel) {

            var REQUISITION_URL = API_BASE_URL + 'recruitments/JobRequisitions';

            var service = {

                //#region POST api/recruitments/JobRequisitions/search?p={p}&ps={ps}&rc={rc}
                getListRequisition: function(page, pageSize, obj) {

                    var searchBody = {
                        "KeyWord": obj.keyWord,
                        "Statuses": obj.statues,
                        "Location": obj.location,
                        "FromDate": obj.fromDate,
                        "ToDate": obj.toDate
                    };

                    var url = REQUISITION_URL + "/search?p=" + page + "&ps=" + pageSize + "&rc=" + 1;

                    return $server.create({
                        'url': url,
                        'data': searchBody
                    })
                        .then(function(res) {
                            $HTTPCache.clear(url);
                            return JobRequisitionListModel.fromApi(res);
                        });
                },
                //#endregion

                //#region GET api/recruitments/JobRequisitions/Locations
                getRequisitionLocationList: function() {
                    var url = REQUISITION_URL + '/Locations';
                    return $server.get({'url': url})
                        .then(function(res) {
                            $HTTPCache.clear(url);
                            if (res.data.NetworkGroupDetailItemResults) {
                                return LocationListModel.fromApi(res);
                            }
                            return res;
                        });
                },
                //#endregion

                //#region POST api/recruitments/JobRequisitions
                createJobRequisition: function(requisitionObj) {
                    var url = REQUISITION_URL;
                    return $server.create({
                        'url': url,
                        'data': requisitionObj
                    })
                        .then(function(res) {
                            $HTTPCache.clear(url);
                            if (res.status === 200) {
                                $notify.add({
                                    message: 'Your requisition has been saved!',
                                    type: 'success',
                                    icon: '',
                                    visible: true
                                });
                                return res;
                            }
                        });
                },
                //#endregion

                //#region POST api/recruitments/JobRequisitions/submit
                submitJobRequisition: function(requisitionObj) {
                    var url = REQUISITION_URL + '/submit';
                    return $server.create({
                        'url': url,
                        'data': requisitionObj
                    })
                        .then(function(res) {
                            $HTTPCache.clear(url);
                            if (res.data.JobRequisitionDetail) {
                                $notify.add({
                                    message: 'Your requisition has been submitted!',
                                    type: 'success',
                                    icon: '',
                                    visible: true
                                });
                                return JobRequisitionDetailModel.fromApi(res);
                            } else {
                                res.data = null;
                            }
                            return res;
                        });
                },
                //#endregion

                //#region GET api/recruitments/JobRequisitions/{id}
                getJobRequisition: function(requisitionId) {
                    var url = REQUISITION_URL + '/' + requisitionId;
                    return $server.get({'url': url})
                        .then(function(res) {
                            $HTTPCache.clear(url);
                            if (res.data.JobRequisitionDetail) {
                                return JobRequisitionDetailModel.fromApi(res);
                            } else {
                                res.data = null;
                            }
                            return res;
                        });
                },
                //#endregion

                //#region PUT api/recruitments/JobRequisitions/{id}/process/{state}
                processCommonCase: function(url, obj) {
                    url = API_BASE_URL + url;
                    return $server.update({
                        'url': url,
                        'data': obj
                    })
                        .then(function(res) {
                            $HTTPCache.clear(url);
                            if (res.data.JobRequisitionDetail) {
                                return JobRequisitionDetailModel.fromApi(res);
                            }
                            return res;
                        });
                },

                deleteRequisition: function(url) {
                    url = API_BASE_URL + url;

                    return $server.remove({
                        'url': url
                    })
                        .then(function(res) {
                            $HTTPCache.clear(url);
                            if (res.data.JobRequisitionDetail) {
                                return JobRequisitionDetailModel.fromApi(res);
                            }
                            return res;
                        });
                }
                //#endregion
            };

            return service;
        }]);
