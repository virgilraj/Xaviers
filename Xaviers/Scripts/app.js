//Global variables
var itemperpage = 10;
var pagesize = 5;

var singleSearch = [{ value: "(plc eq plcholder)", text: "is equal to" },
                    { value: "(plc ne plcholder)", text: "is not equal to" },
                    { value: "(startswith(plc, plcholder))", text: "starts with" },
                    { value: "(indexof(plc, plcholder) gt -1)", text: "contains" },
                    { value: "(endswith(plc, plcholder))", text: "ends with" }
];

var doubleSearch = [{ value: "(plc eq plcholder or plc1 eq plcholder)", text: "is equal to" },
                    { value: "(plc ne plcholder or plc1 ne plcholder)", text: "is not equal to" },
                    { value: "(startswith(plc, plcholder) or startswith(plc1, plcholder))", text: "starts with" },
                    { value: "(indexof(plc, plcholder) gt -1 or indexof(plc1, plcholder) gt -1)", text: "contains" },
                    { value: "(endswith(plc, plcholder) or endswith(plc1, plcholder))", text: "ends with" }
];

var tripleSearch = [{ value: "(plc eq plcholder or plc1 eq plcholder or plc2 eq plcholder)", text: "is equal to" },
                    { value: "(plc ne plcholder or plc1 ne plcholder or plc2 ne plcholder)", text: "is not equal to" },
                    { value: "(startswith(plc, plcholder) or startswith(plc1, plcholder) or startswith(plc2, plcholder))", text: "starts with" },
                    { value: "(indexof(plc, plcholder) gt -1 or indexof(plc1, plcholder) gt -1 or indexof(plc2, plcholder) gt -1)", text: "contains" },
                    { value: "(endswith(plc, plcholder) or endswith(plc1, plcholder) or endswith(plc2, plcholder))", text: "ends with" }
];

var numDateSearch = [{ value: "(plc eq plcholder)", text: "is equal to" },
                    { value: "(plc ne plcholder)", text: "is not equal to" },
                    { value: "(plc ge plcholder)", text: "greater than or equal" },
                    { value: "(plc gt plcholder)", text: "greater than" },
                    { value: "(plc le plcholder)", text: "less than or equal" },
                    { value: "(plc lt plcholder)", text: "less than" }
];

var numDateSearch1 = [{ value: "(plc eq plcholder or plc1 eq plcholder or plc2 eq plcholder)", text: "is equal to" },
                    { value: "(plc ne plcholder or plc1 eq plcholder or plc2 eq plcholder)", text: "is not equal to" },
                    { value: "(plc ge plcholder or plc1 eq plcholder or plc2 eq plcholder)", text: "greater than or equal" },
                    { value: "(plc gt plcholder or plc1 eq plcholder or plc2 eq plcholder)", text: "greater than" },
                    { value: "(plc le plcholder or plc1 eq plcholder or plc2 eq plcholder)", text: "less than or equal" },
                    { value: "(plc lt plcholder or plc1 eq plcholder or plc2 eq plcholder)", text: "less than" }
];

app.factory('repository', function ($http) {
    return {
        get: function (callback, urls) {
            $http.get(urls).success(callback);
        }
        ,

        //method for insert
        insert: function (callback, contact, responsecallback) {
            $http.post(url, contact).success(callback).then(responsecallback);
        },

        //method for update
        update: function (callback, contact, updateurl) {
            $http.put(updateurl, contact).success(callback);
        },

        //method for delete
        delete: function (callback, deleteurl) {
            $http.delete(deleteurl).success(callback);
        },

        getWebApi: function (url) {
            return $http.get(url).then(function (resp) {
                return resp.data
            });
        },

        getTypeAhead: function (url) {
            return $http.get(url).then(function (resp) {
                //return resp.data; // success callback returns this
                return resp.data.value;
            });
        },
        getDashboard: function (url) {
            return $http.get(url).then(function (resp) {
                return resp;
            });
        }
    }
});


app.directive('daydatepickerfinace', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#fdate1').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: sFDate,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});

app.directive('daydatepicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#date1').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: -1,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});

app.directive('daydatepicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#datefuture').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: 1,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});

app.directive('daydatepicker2', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#date2').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: -1,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});
app.directive('daydatepicker3', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#date3').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: -1,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});
app.directive('daydatepicker4', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#date4').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: -1,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});
app.directive('daydatepicker5', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#date5').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: -1,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});
app.directive('daydatepicker6', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#date6').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: -1,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});
app.directive('daydatepicker7', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#date7').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: -1,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});
app.directive('daydatepicker8', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#date8').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: -1,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});

app.directive('daydatepickerfrom', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $("input[id^='daydatepickerf']").Zebra_DatePicker({
                    direction: -1,
                    format: 'd-m-Y',
                    pair: $("input[id^='daydatepickert']"),
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});
app.directive('daydatepickerto', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $("input[id^='daydatepickert']").Zebra_DatePicker({
                    direction: 0,
                    format: 'd-m-Y',
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});
app.directive('daydatepicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $('#filterdate').Zebra_DatePicker({
                    format: 'd-m-Y',
                    direction: -1,
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});

app.directive('daydatepickerfrom1', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $("input[id^='daydatepickerf']").Zebra_DatePicker({
                    direction: 0,
                    format: 'd-m-Y',
                    pair: $("input[id^='daydatepickert']"),
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});
app.directive('daydatepickerto1', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $("input[id^='daydatepickert']").Zebra_DatePicker({
                    direction: 0,
                    format: 'd-m-Y',
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});

app.directive('alldate', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            $(function () {
                $("input[id^='alldate']").Zebra_DatePicker({
                    direction: 0,
                    format: 'd-m-Y',
                    onSelect: function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
        }
    }
});

//Pdf generator
app.directive('pdf', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.openPDF = function (dataObj, displayHeader, pdfProperty, imageData) {
                var imgUrl = (logo != null && angular.isDefined(logo) && logo == 'True') ? "/customerLogo/" + custid + "_icon.png" : "/images/spacer.gif";
                var haslogo = (logo != null && angular.isDefined(logo) && logo == 'True') ? true : false;
                getImageFromUrl(imgUrl, function (logoData) {

                    var doc = new jsPDF(pdfProperty.l, '', '', '');
                    doc.setProperties(pdfProperty.prop);
                    doc.cellInitialize();
                    if (imageData != null) {
                        doc.addImage({
                            imageData: imageData,
                            //angle: -20,
                            x: 200,
                            y: 44, //,
                            w: 100,
                            h: 100
                        });
                    }

                    doc.cellInitialize();

                    if (logoData != null && haslogo) {
                        doc.addImage({
                            imageData: logoData,
                            x: 2,
                            y: 2, //,
                            w: 20,
                            h: 20
                        });
                    }

                    var rowcount = 0;

                    doc.margins = 1;
                    doc.setFontSize(pdfProperty.titlefontsize);
                    doc.cell(pdfProperty.leftMargin, 0, pdfProperty.cellWidth + 500, pdfProperty.rowHeight + 13, displayTitle != null ? haslogo ? '           ' + displayTitle : '' + displayTitle : ' ', 0, 'center');

                    doc.margins = 1;
                    doc.setFontSize(pdfProperty.titlefontsize);
                    doc.cell(pdfProperty.leftMargin, pdfProperty.topMargin, pdfProperty.cellWidth + 500, pdfProperty.rowHeight + 10, pdfProperty.prop.title != null ? pdfProperty.prop.title : ' ', 1, 'center');

                    if (displayHeader != null && !angular.isUndefined(displayHeader)) {
                        angular.forEach(displayHeader, function (header, k) {
                            doc.margins = 1;
                            doc.setFontSize(pdfProperty.headerfontsize);
                            doc.cell(pdfProperty.leftMargin, pdfProperty.topMargin, pdfProperty.cellWidth, pdfProperty.rowHeight  + 5, header != null ? header : ' ', 2);  // 1st=left margin    2nd parameter=top margin,     3rd=row cell width      4th=Row height
                        });
                    }

                    if (dataObj != null && !angular.isUndefined(dataObj)) {
                        $.each(dataObj, function (i, row) {
                            $.each(row, function (j, cellContent) {
                                doc.margins = 1;
                                doc.setFontSize(pdfProperty.cellfontsize);
                                doc.cell(pdfProperty.leftMargin, pdfProperty.topMargin, pdfProperty.cellWidth, pdfProperty.rowHeight, cellContent != null ? cellContent : ' ', i + 3);  // 1st=left margin    2nd parameter=top margin,     3rd=row cell width      4th=Row height
                            });

                            if ((i + 1) % (pdfProperty.recordperpage) == 0) {
                                doc.addPage();
                                doc.cellInitialize();
                                doc.margins = 1;
                            }
                            rowcount++;
                        });
                    }

                    if (pdfProperty.splField != null && angular.isDefined(pdfProperty.splField)) {
                        doc.margins = 1;
                        doc.setFontSize(pdfProperty.headerfontsize);
                        doc.cell(pdfProperty.leftMargin, pdfProperty.topMargin, pdfProperty.cellWidth + 500, pdfProperty.rowHeight, pdfProperty.splField, rowcount + 3, 'center');
                        rowcount = rowcount + 2;
                    }

                    if (pdfProperty.chidTable != null && angular.isDefined(pdfProperty.chidTable) && angular.isDefined(pdfProperty.chidTable.title) && pdfProperty.chidTable.title != '') {
                        doc.margins = 1;
                        doc.setFontSize(pdfProperty.cellfontsize);
                        doc.cell(pdfProperty.leftMargin, pdfProperty.topMargin, pdfProperty.cellWidth * 3, pdfProperty.rowHeight, pdfProperty.chidTable.title, rowcount + 3, 'center');
                        rowcount = rowcount + 2;
                    }

                    if (pdfProperty.chidTable != null && angular.isDefined(pdfProperty.chidTable) && pdfProperty.chidTable.data != null && angular.isDefined(pdfProperty.chidTable.data)) {

                        $.each(pdfProperty.chidTable.data, function (i, row) {
                            $.each(row, function (j, cellContent) {
                                doc.margins = 1;
                                doc.setFontSize(pdfProperty.cellfontsize);
                                doc.cell(pdfProperty.leftMargin, pdfProperty.topMargin, pdfProperty.cellWidth, pdfProperty.rowHeight, cellContent != null ? cellContent : ' ', (rowcount + i + 3));  // 1st=left margin    2nd parameter=top margin,     3rd=row cell width      4th=Row height
                            });

                            if ((i + 1) % (pdfProperty.recordperpage) == 0) {
                                doc.addPage();
                                doc.cellInitialize();
                                doc.margins = 1;
                            }
                            rowcount++;
                        });
                    }

                    doc.save(pdfProperty.name);
                });
            };
        }
    }
});

//Starts :: File upload
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function (file, uploadUrl) {
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        })
        .success(function () {
        })
        .error(function () {
            alert("Some technical error in file upload");
        });
    }
}]);
//End :: File upload

//Common helper functions

var getImageFromUrl = function (url, callback) {
    var img = new Image();

    img.onError = function () {
        alert('Cannot load image: "' + url + '"');
    };
    img.onload = function () {
        callback(img);
    };
    img.src = url;
}

function formatStringBreaking(str, position)
{
    if (angular.isUndefined(str)) return false;
    var newStr = '';
    var chararry = str.split('');
    for(var i=0; i<chararry.length; i++)
    {
        newStr += (position / i) == 1 ? "\n" : "";
        newStr += chararry[i];
    }
    return newStr;
}