var url = '/api/Expense';
var odaturl = '/odata/OdataExpense?$select=Id,Amount,Reason,GivenDate,BillDate,BillNumber,HasImage,ContactName,ContactId,CustomerId,GroupName,ReceiverId,IsApprove&$orderby=GivenDate desc';
var typeaheadurl = "/api/Contacts";
var typeaheadGroupurl = "/odata/OdataIncomeExpenseGroup?$select=GroupName";
var typInExpName = "/api/IncomeExpenseGroup";
function expenseCtrl($scope, repository, $http, utilityService, fileUpload) {
    $scope.searchoptions = singleSearch;
    $scope.searchoptions1 = doubleSearch;
    $scope.searchoptions2 = tripleSearch;
    $scope.searchNum = numDateSearch;
    $scope.singleSearchDefault = singleSearch[2].text;
    $scope.doubleSearchDefault = doubleSearch[2].text;
    $scope.tripleSearchDefault = tripleSearch[2].text;
    $scope.searchNumDefault = numDateSearch[0].text;

    $scope.isList = true;
    $scope.isUpdate = false;
    $scope.isView = false;
    $scope.name = ''; // This will hold the selected item
    $scope.filterCondition = '';
    $scope.daydatepicker = new Date().getDate();
    
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = pagesize;
    $scope.itemsPerPage = 25;
    $scope.IsSA = rle == 'SA';

    $scope.addExpense = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = false;
        $scope.groupDetail = null;
        $scope.payerDetail = null;
        $scope.Reason = null;
        $scope.isView = false;
    }
    $scope.showExpense = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = true;
    }
    $scope.pageChange = function (pageno) {
        $scope.load(pageno);
    }

    $scope.load = function (pageno) {
        var skipnum = parseInt($scope.itemsPerPage) * parseInt(pageno - 1);
        var loadurl = odaturl + "&$skip=" + skipnum + "&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
        repository.get(function (results) {
            if (!angular.isObject(results.value)) {
                $window.location.reload();
            }
            $scope.expenses = results.value;
            $scope.totalItems = parseInt(results["odata.count"]);
        }, loadurl);

    }

    $scope.reset = function () {
        $scope.Expense = null;
    }

    $scope.edit = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.Expense = results;
            formatDateStringinEdit($scope, utilityService);
            getPayerDetails($scope);
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = false;
    }

    $scope.view = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.Expense = results;
            formatDateStringinEdit($scope, utilityService);
            getPayerDetails($scope);
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = true;
    }
    $scope.uploadFile = function (id) {
        if (angular.isDefined($scope.myFile) && angular.isObject($scope.myFile)) {
            var file = $scope.myFile;
            var uploadUrl = "/api/FileUpload/expense_" + id;
            fileUpload.uploadFileToUrl(file, uploadUrl);
        }
    };

    $scope.delete = function (id) {
        var isdelete = confirm("Do you want to delete this expense");
        if (!isdelete) { return false; }
        var deleteurl = url + '/' + id;
        repository.delete(function () {
            alert('Record deleted successfully');
            $scope.load($scope.currentPage);
        }, deleteurl);
    }

    $scope.save = function (myForm, isApprove) {
        $scope.Expense.HasImage = angular.isDefined($scope.myFile) && angular.isObject($scope.myFile) ? true : false;
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        if (angular.isDefined($scope.myFile) && angular.isObject($scope.myFile)) {
            if (!(/\.(gif|jpg|jpeg|tiff|png)$/i).test($scope.myFile.name)) {
                alert('Invalid image type. Please select valid image types like gif, jpg, jpeg, tiff or png.');
                return false;
            }
        }
        setPayerDetails($scope);
        if ($scope.Expense.ContactName != null && angular.isDefined($scope.Expense.ContactName) && $scope.Expense.ContactName != '' && (angular.isUndefined($scope.Expense.ContactId) || $scope.Expense.ContactId == '')) {
            alert("Please select name from dropdown"); return false;
        }
        //if ($scope.Expense == null || angular.isUndefined($scope.Expense.ContactId) || $scope.Expense.ContactId == '') { alert("Please select name from dropdown"); return false; }
        $scope.isUpdate = false;
        $scope.Expense.IsApprove = isApprove;
        formatDateString($scope, utilityService);
        repository.insert(function () {
            alert('Record saved successfully');
            $scope.load(0);
            $scope.isList = true;
            $scope.Expense = null;
        }, $scope.Expense,
         function (resp) {
             if (resp != null && angular.isDefined(resp) && angular.isDefined(resp.data) && resp.data.HasImage) {
                $scope.uploadFile(resp.data.Id);
            }
         });
    }

    $scope.update = function (myForm, isApprove) {
        $scope.Expense.HasImage = $scope.Expense.HasImage || angular.isDefined($scope.myFile) && angular.isObject($scope.myFile) ? true : false;
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        if (angular.isDefined($scope.myFile) && angular.isObject($scope.myFile)) {
            if (!(/\.(gif|jpg|jpeg|tiff|png)$/i).test($scope.myFile.name)) {
                alert('Invalid image type. Please select valid image types like gif, jpg, jpeg, tiff or png.');
                return false;
            }
        }
        setPayerDetails($scope);
        if ($scope.Expense.ContactName != null && angular.isDefined($scope.Expense.ContactName) && $scope.Expense.ContactName != '' && (angular.isUndefined($scope.Expense.ContactId) || $scope.Expense.ContactId == '')) {
            alert("Please select name from dropdown"); return false;
        }
        //if ($scope.Expense == null || angular.isUndefined($scope.Expense.ContactId) || $scope.Expense.ContactId == '') { alert("Please select name from dropdown"); return false; }
        if ($scope.Expense != null && angular.isDefined($scope.Expense.Id) && $scope.Expense.Id > 0) {
            var updateurl = url + '/' + $scope.Expense.Id;
            $scope.Expense.IsApprove = isApprove;
            formatDateString($scope, utilityService);
            repository.update(function () {
                alert('Record updated successfully');
                $scope.load(0);
            }, $scope.Expense, updateurl);
            if ($scope.Expense != null && angular.isDefined($scope.Expense)) {
                $scope.uploadFile($scope.Expense.Id);
            }
        }
        else {
            alert("Invalid information for edit expense")
        }
    }

    $scope.claerTopFilter = function () {
        $scope.Filter = null;
        $scope.filter();
    }

    $scope.topfilter = function () {
        var condition = '';
        var nameCon = '';
        var amountCon = '';
        var groupCon = '';
        var emailCon = '';
        var dateCon = '';
        if ($scope.Filter != null && angular.isDefined($scope.Filter)) {
            if (angular.isDefined($scope.Filter.Name) && $scope.Filter.Name != '') {
                nameCon = "(startswith(ContactName, '" + $scope.Filter.Name + "'))";
            }
            if (angular.isDefined($scope.Filter.Amount) && $scope.Filter.Amount != '') {
                amountCon = "(Amount eq " + $scope.Filter.Amount + ")";
                amountCon = nameCon != '' ? " and " + amountCon : amountCon;
            }
            if (angular.isDefined($scope.Filter.Group) && $scope.Filter.Group != '') {
                groupCon = "(startswith(GroupName, '" + $scope.Filter.Group + "'))";
                groupCon = nameCon != '' || amountCon != '' ? " and " + groupCon : groupCon;
            }
            if (angular.isDefined($scope.Filter.FDate) && $scope.Filter.FDate != '') {
                if (isNaN(Date.parse(utilityService.setSearchDate($scope.Filter.FDate)))) {
                    alert('Please enter valid date');
                    return false;
                }
                if (angular.isDefined($scope.Filter.TDate) && $scope.Filter.TDate != '') {
                    if (isNaN(Date.parse(utilityService.setSearchDate($scope.Filter.TDate)))) {
                        alert('Please enter valid date');
                        return false;
                    }
                    dateCon = "(GivenDate ge datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "' and GivenDate le datetime'" + utilityService.setSearchDate($scope.Filter.TDate) + "')";
                }
                else {
                    dateCon = "(GivenDate eq datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "')"
                }
                dateCon = nameCon != '' || amountCon != '' || groupCon != '' ? " and " + dateCon : dateCon;
            }



            if (nameCon != '' || amountCon != '' || groupCon != '' || dateCon != '' || emailCon != '') {
                condition = "&$filter=(" + nameCon + amountCon + groupCon + dateCon + emailCon + ")";
            }
            $scope.filterCondition = condition;

            var loadurl = odaturl + condition + "&$skip=0&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
            repository.get(function (results) {
                if (!angular.isObject(results.value)) {
                    $window.location.reload();
                }
                $scope.expenses = results.value;
                $scope.totalItems = parseInt(results["odata.count"]);
            }, loadurl);
        }
    }

    $scope.filter = function () {
        var condition = '';
        var nameCon = '';
        var amountCon = '';
        var groupCon = '';
        var dateCon = '';

        if (angular.isDefined($scope.nameFilter) && angular.isDefined($scope.nameFilter.Text) && $scope.nameFilter.Text != '') {
            var options = '';
            if (angular.isUndefined($scope.nameFilter.Options)) {
                //set default value
                options = singleSearch[2].value;
            }
            else {
                options = $scope.nameFilter.Options;
            }
            nameCon = options.replace(/\plcholder/g, "'" + $scope.nameFilter.Text + "'");
            nameCon = nameCon.replace(/\plc/g, "ContactName");
            $('.namefilter').addClass('filterSelection');
        }

        if (angular.isDefined($scope.amountFilter) && angular.isDefined($scope.amountFilter.Text) && $scope.amountFilter.Text != '') {
            var options = '';
            if (angular.isUndefined($scope.amountFilter.Options)) {
                //set default value
                options = numDateSearch[0].value;
            }
            else {
                options = $scope.amountFilter.Options;
            }
            amountCon = options.replace(/\plcholder/g, "" + $scope.amountFilter.Text + "");
            amountCon = amountCon.replace(/\plc/g, "Amount");
            amountCon = nameCon != '' ? " and " + amountCon : amountCon;
            $('.amountFilter').addClass('filterSelection');
        }

        if (angular.isDefined($scope.dateFilter) && angular.isDefined($scope.dateFilter.Text) && $scope.dateFilter.Text != '') {
            if (isNaN(Date.parse(utilityService.setSearchDate($scope.dateFilter.Text)))) {
                alert('Please enter valid date');
                return false;
            }
            var options = '';
            if (angular.isUndefined($scope.dateFilter.Options)) {
                //set default value
                options = numDateSearch[0].value;
            }
            else {
                options = $scope.dateFilter.Options;
            }

            if (angular.isDefined($scope.dateFilter) && angular.isDefined($scope.dateFilter.Text1) && $scope.dateFilter.Text1 != '') {
                if (isNaN(Date.parse(utilityService.setSearchDate($scope.dateFilter.Text1)))) {
                    alert('Please enter valid date');
                    return false;
                }
                dateCon = "(GivenDate ge datetime'" + utilityService.setSearchDate($scope.dateFilter.Text) + "' and GivenDate le datetime'" + utilityService.setSearchDate($scope.dateFilter.Text1) + "')";
            }
            else {
                dateCon = options.replace(/\plcholder/g, "datetime'" + utilityService.setSearchDate($scope.dateFilter.Text) + "'");
                dateCon = dateCon.replace(/\plc/g, "GivenDate");
            }
            dateCon = nameCon != '' || amountCon != '' ? " and " + dateCon : dateCon;
            $('.dateFilter').addClass('filterSelection');
        }

        if (angular.isDefined($scope.groupFilter) && angular.isDefined($scope.groupFilter.Text) && $scope.groupFilter.Text != '') {
            var options = '';
            if (angular.isUndefined($scope.groupFilter.Options)) {
                //set default value
                options = singleSearch[2].value;
            }
            else {
                options = $scope.groupFilter.Options;
            }
            groupCon = options.replace(/\plcholder/g, "'" + $scope.groupFilter.Text + "'");
            groupCon = groupCon.replace(/\plc/g, "GroupName");
            groupCon = nameCon != '' || amountCon != '' || dateCon != '' ? " and " + groupCon : groupCon;
            $('.groupFilter').addClass('filterSelection');
        }


        if (nameCon != '' || amountCon != '' || dateCon != '' || groupCon != '') {
            condition = "&$filter=(" + nameCon + amountCon + dateCon + groupCon + ")";
        }

        $scope.filterCondition = condition;

        var loadurl = odaturl + condition + "&$skip=0&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
        repository.get(function (results) {
            if (!angular.isObject(results.value)) {
                $window.location.reload();
            }
            $scope.expenses = results.value;
            $scope.totalItems = parseInt(results["odata.count"]);
        }, loadurl);
    };

    $scope.clearNamefilter = function () {
        $scope.nameFilter = {};
        $('.namefilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearAmountFilter = function () {
        $scope.amountFilter = {};
        $('.amountFilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearGroupFilter = function () {
        $scope.groupFilter = {};
        $('.groupFilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearDatefilter = function () {
        $scope.dateFilter = {};
        $('.dateFilter').removeClass('filterSelection');
        $scope.filter();
    }

    $scope.changeName = function () {
        if ($scope.payerDetail != null && angular.isDefined($scope.payerDetail) && angular.isDefined($scope.payerDetail.ContactId)) {
            delete $scope.payerDetail.ContactId;
        }
        if ($scope.Expense != null && angular.isDefined($scope.Expense) && angular.isDefined($scope.Expense.ContactId)) {
            delete $scope.Expense.ContactId;
        }
    }

    $scope.getAll = function (val) {
        return repository.getWebApi(typeaheadurl + '/' + val + '/all');
    };

    $scope.Group = function (val) {
        var loadurl = typeaheadGroupurl + "&$filter=startswith(GroupName, '" + val + "') &$top=35&$inlinecount=allpages"
        return repository.getTypeAhead(loadurl);
    };

    $scope.getinExpNames = function (val) {
        return repository.getWebApi(typInExpName + '/' + val);
    };

    $scope.exportToPdf = function () {
        //PDF headers
        var dispHead = ['Id', 'Name', 'Description', 'Group Name', 'Date', 'Approved', 'Amount', 'Bill Number', 'Bill Date'];

        var expensePdf = [];

        //PDF document configaruations
        var linebreakPos = 30;
        var pdfProperty = {
            cellWidth: 34,
            leftMargin: 0,
            topMargin: 2,
            rowHeight: 12,
            titlefontsize: 18,
            headerfontsize: 10,
            cellfontsize: 6.5,
            recordperpage: 12,
            name: 'Expense.pdf',
            l: {
                orientation: 'l',
                unit: 'mm',
                format: 'a4',
                compress: true,
                fontSize: 8,
                lineHeight: 1,
                autoSize: true,
                printHeaders: true
            },
            prop: {
                title: 'Expense List',
                subject: 'List of contacts',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        var total = 0;
        //Get the data and then generate Pdf
        repository.getTypeAhead(odaturl + $scope.filterCondition).then(function (pdfExpense) {

            if (pdfExpense != null && !angular.isUndefined(pdfExpense)) {
                angular.forEach(pdfExpense, function (expense, index) {
                    var pdfExpense = {};
                    pdfExpense.Id = " " + expense.Id + " ";
                    pdfExpense.Name = expense.ContactName != null && !angular.isUndefined(expense.ContactName) && expense.ContactName != '' ? formatStringBreaking(expense.ContactName, linebreakPos) + '.' : '';
                    pdfExpense.Reason = expense.Reason != null && !angular.isUndefined(expense.Reason) && expense.Reason != '' ? formatStringBreaking(expense.Reason, linebreakPos) : ' ';
                    pdfExpense.GroupName = expense.GroupName != null && !angular.isUndefined(expense.GroupName) && expense.GroupName != '' ? expense.GroupName : ' ';
                    pdfExpense.GivenDate = expense.GivenDate != null && !angular.isUndefined(expense.GivenDate) && expense.GivenDate != '' ? utilityService.getDateFromOdata(expense.GivenDate) : ' ';
                    pdfExpense.IsApprove = expense.IsApprove != null && !angular.isUndefined(expense.IsApprove) && expense.IsApprove == true ? 'True' : 'False';
                    pdfExpense.Amount = expense.Amount != null && !angular.isUndefined(expense.Amount) && expense.Amount != '' ? ' ' + expense.Amount + ' ' : ' ';
                    pdfExpense.BillNumber = expense.BillNumber != null && !angular.isUndefined(expense.BillNumber) && expense.BillNumber != '' ? utilityService.getDateFromOdata(expense.BillNumber) : ' ';
                    pdfExpense.BillDate = expense.BillDate != null && !angular.isUndefined(expense.BillDate) && expense.BillDate != '' ? utilityService.getDateFromOdata(expense.BillDate) : ' ';
                    total += parseFloat(expense.Amount);
                    expensePdf.push(pdfExpense);
                });
            }
            pdfProperty.splField = "Total : " + total;

            $scope.openPDF(expensePdf, dispHead, pdfProperty);
        });
    }

    $scope.exportToPdfSingle = function (id) {
        var expensePdf = [];

        //PDF document configaruations
        var linebreakPos = 28;
        var pdfProperty = {
            cellWidth: 100,
            leftMargin: 0,
            topMargin: 1,
            rowHeight: 10,
            titlefontsize: 18,
            headerfontsize: 12,
            cellfontsize: 9,
            recordperpage: 15,
            name: 'Receipt.pdf',
            l: {
                orientation: 'l',
                unit: 'mm',
                format: 'a4',
                compress: true,
                fontSize: 9,
                lineHeight: 1,
                autoSize: true,
                printHeaders: true
            },
            prop: {
                title: 'Expense',
                subject: 'Expense',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        //Get the data and then generate Pdf
        repository.getTypeAhead(odaturl + '&$filter=(Id eq ' + id + ')').then(function (pdfExpense) {
            if (pdfExpense != null && !angular.isUndefined(pdfExpense) && pdfExpense.length > 0) {
                var expense = pdfExpense[0];
                expensePdf.push({ Name: "Id", Value: ' ' + expense.Id + ' ' });
                expensePdf.push({ Name: "Name", Value: expense.ContactName != null && !angular.isUndefined(expense.ContactName) && expense.ContactName != '' ? expense.ContactName : ' ' });
                expensePdf.push({ Name: "Amount", Value: expense.Amount != null && !angular.isUndefined(expense.Amount) && expense.Amount != '' ? ' ' + expense.Amount + ' ' : ' ' });
                expensePdf.push({ Name: "Date", Value: expense.GivenDate != null && !angular.isUndefined(expense.GivenDate) && expense.GivenDate != '' ? utilityService.getDateFromOdata(expense.GivenDate) : ' ' });
                expensePdf.push({ Name: "Bill Number", Value: expense.BillNumber != null && !angular.isUndefined(expense.BillNumber) && expense.BillNumber != '' ? utilityService.getDateFromOdata(expense.BillNumber) : ' ' });
                expensePdf.push({ Name: "BillDate", Value: expense.BillDate != null && !angular.isUndefined(expense.BillDate) && expense.BillDate != '' ? utilityService.getDateFromOdata(expense.BillDate) : ' ' });
                expensePdf.push({ Name: "Description", Value: expense.Reason != null && !angular.isUndefined(expense.Reason) && expense.Reason != '' ? expense.Reason : ' ' });
                expensePdf.push({ Name: "Group Name", Value: expense.GroupName != null && !angular.isUndefined(expense.GroupName) && expense.GroupName != '' ? expense.GroupName : ' ' });
                //expensePdf.push({ Name: "Receiver", Value: expense.Receiver != null && !angular.isUndefined(expense.Receiver) && expense.Receiver != '' ? expense.Receiver : ' ' });
                expensePdf.push({ Name: "Approved", Value: expense.IsApprove != null && !angular.isUndefined(expense.IsApprove) && expense.IsApprove ? 'Approved' : ' ' });
                //expensePdf.push({ Name: "Signature", Value: ' ' });

                $scope.openPDF(expensePdf, null, pdfProperty, null);
            }
        });
    }
}

//Helper function
function formatDateString(scope, utilityService)
{
    if (scope.Expense.GivenDate != null && angular.isDefined(scope.Expense.GivenDate) && scope.Expense.GivenDate != '') {
        scope.Expense.GivenDate = utilityService.getDate(scope.Expense.GivenDate);
    }
    if (scope.Expense.BillDate != null && angular.isDefined(scope.Expense.BillDate) && scope.Expense.BillDate != '') {
        scope.Expense.BillDate = utilityService.getDate(scope.Expense.BillDate);
    }
}

function formatDateStringinEdit(scope, utilityService) {
    if (scope.Expense.GivenDate != null && angular.isDefined(scope.Expense.GivenDate) && scope.Expense.GivenDate != '') {
        scope.Expense.GivenDate = utilityService.formatDate(scope.Expense.GivenDate);
    }
    if (scope.Expense.BillDate != null && angular.isDefined(scope.Expense.BillDate) && scope.Expense.BillDate != '') {
        scope.Expense.BillDate = utilityService.formatDate(scope.Expense.BillDate);
    }
}

function setPayerDetails(scope)
{
    if (scope.payerDetail != null && angular.isDefined(scope.payerDetail.ContactId) && scope.payerDetail.ContactId != "" && scope.payerDetail.ContactId > 0) {
        scope.Expense.ContactName = scope.payerDetail.Name;
        scope.Expense.ContactId = scope.payerDetail.ContactId;
    }
    else {
        scope.Expense.ContactName = scope.payerDetail;
    }
    if (scope.groupDetail != null && angular.isDefined(scope.groupDetail) && angular.isDefined(scope.groupDetail.GroupName) && scope.groupDetail.GroupName != '') {
        scope.Expense.GroupName = scope.groupDetail.GroupName;
    }
    else
    {
        scope.Expense.GroupName = scope.groupDetail != null && angular.isDefined(scope.groupDetail) && scope.groupDetail != '' ? scope.groupDetail : '';
    }

    if (scope.Reason != null && angular.isDefined(scope.Reason) && angular.isDefined(scope.Reason.GroupName) && scope.Reason.GroupName != '') {
        scope.Expense.Reason = scope.Reason.GroupName;
    }
    else {
        scope.Expense.Reason = scope.Reason != null && angular.isDefined(scope.Reason) && scope.Reason != '' ? scope.Reason : '';
    }
    
}

function getPayerDetails(scope) {
    scope.payerDetail = {};
    scope.groupDetail = {};
    if (scope.Expense.ContactId != null && angular.isDefined(scope.Expense.ContactId) && scope.Expense.ContactId != "" && scope.Expense.ContactId > 0) {
        scope.payerDetail.Name = scope.Expense.ContactName;
        scope.payerDetail.ContactId = scope.Expense.ContactId;
    }
    else {
        scope.payerDetail = scope.Expense.ContactName;
    }

    if (scope.Expense.GroupName != null && angular.isDefined(scope.Expense.GroupName)) {
        scope.groupDetail.GroupName = scope.Expense.GroupName;
    }
    else {
        scope.groupDetail = '';
    }

    if (scope.Expense.Reason != null && angular.isDefined(scope.Expense.Reason)) {
        scope.Reason = scope.Expense.Reason;
    }
    else {
        scope.Reason = '';
    }
}
