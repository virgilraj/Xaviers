var url = '/api/Income';
var odaturl = '/odata/OdataIncome?$select=Id,Amount,Description,ReceivedDate,ReceiverName,ContactName,ContactId,GroupName,ReceiverId,IsApprove&$orderby=ReceivedDate desc';
var typeaheadurl = "/api/Contacts";
var typeaheadGroupurl = "/odata/OdataIncomeExpenseGroup?$select=GroupName";
var typInExpName = "/api/IncomeExpenseGroup";
function incomeCtrl($scope, repository, $http, utilityService) {
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

    $scope.addIncome = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = false;
        $scope.groupDetail = null;
        $scope.payerDetail = null;
        $scope.Description = null;
        $scope.isView = false;
    }
    $scope.showIncome = function () {
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
            $scope.incomes = results.value;
            $scope.totalItems = parseInt(results["odata.count"]);
        }, loadurl);

    }

    $scope.reset = function () {
        $scope.Income = null;
    }

    $scope.edit = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.Income = results;
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
            $scope.Income = results;
            formatDateStringinEdit($scope, utilityService);
            getPayerDetails($scope);
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = true;
    }

    $scope.delete = function (id) {
        var isdelete = confirm("Do you want to delete this income");
        if (!isdelete) { return false; }
        var deleteurl = url + '/' + id;
        repository.delete(function () {
            alert('Record deleted successfully');
            $scope.load($scope.currentPage);
        }, deleteurl);
    }

    $scope.save = function (myForm, isApprove) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        setPayerDetails($scope);
        if ($scope.Income.ContactName !=null && angular.isDefined($scope.Income.ContactName) && $scope.Income.ContactName != '' && (angular.isUndefined($scope.Income.ContactId) || $scope.Income.ContactId == ''))
        {
            alert("Please select name from dropdown"); return false;
        }
        $scope.isUpdate = false;
        $scope.Income.IsApprove = isApprove;
        formatDateString($scope, utilityService);
        repository.insert(function () {
            alert('Record saved successfully');
            $scope.load(0);
            $scope.isList = true;
            $scope.Income = null;
        }, $scope.Income,
         function (resp) {
             //if (resp != null && angular.isDefined(resp) && angular.isDefined(resp.data)) {
             //    $scope.uploadFile(resp.data.ContactId);
             //}
         });
    }

    $scope.update = function (myForm, isApprove) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        setPayerDetails($scope);
        if ($scope.Income.ContactName != null && angular.isDefined($scope.Income.ContactName) && $scope.Income.ContactName != '' && (angular.isUndefined($scope.Income.ContactId) || $scope.Income.ContactId == '')) {
            alert("Please select name from dropdown"); return false;
        }
        //if ($scope.Income == null || angular.isUndefined($scope.Income.ContactId) || $scope.Income.ContactId == '') { alert("Please select name from dropdown"); return false; }
        if ($scope.Income != null && angular.isDefined($scope.Income.Id) && $scope.Income.Id > 0) {
            var updateurl = url + '/' + $scope.Income.Id;
            $scope.Income.IsApprove = isApprove;
            formatDateString($scope, utilityService);
            repository.update(function () {
                alert('Record updated successfully');
                $scope.load(0);
            }, $scope.Income, updateurl);
            //if ($scope.Contact != null && angular.isDefined($scope.Contact)) {
            //    $scope.uploadFile($scope.Contact.ContactId);
            //}
        }
        else {
            alert("Invalid information for edit contact")
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
                if (isNaN(Date.parse(utilityService.setSearchDate($scope.Filter.FDate))))
                {
                    alert('Please enter valid date');
                    return false;
                }
               
                if (angular.isDefined($scope.Filter.TDate) && $scope.Filter.TDate != '') {
                    if (isNaN(Date.parse(utilityService.setSearchDate($scope.Filter.TDate)))) {
                        alert('Please enter valid date');
                        return false;
                    }
                    dateCon = "(ReceivedDate ge datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "' and ReceivedDate le datetime'" + utilityService.setSearchDate($scope.Filter.TDate) + "')";
                }
                else
                {
                    dateCon = "(ReceivedDate eq datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "')"
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
                $scope.incomes = results.value;
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
        var recCon = '';

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
                dateCon = "(ReceivedDate ge datetime'" + utilityService.setSearchDate($scope.dateFilter.Text) + "' and ReceivedDate le datetime'" + utilityService.setSearchDate($scope.dateFilter.Text1) + "')";
            }
            else {
                dateCon = options.replace(/\plcholder/g, "datetime'" + utilityService.setSearchDate($scope.dateFilter.Text) + "'");
                dateCon = dateCon.replace(/\plc/g, "ReceivedDate");
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

        if (angular.isDefined($scope.receiverFilter) && angular.isDefined($scope.receiverFilter.Text) && $scope.receiverFilter.Text != '') {
            var options = '';
            if (angular.isUndefined($scope.receiverFilter.Options)) {
                //set default value
                options = singleSearch[2].value;
            }
            else {
                options = $scope.receiverFilter.Options;
            }
            recCon = options.replace(/\plcholder/g, "'" + $scope.receiverFilter.Text + "'");
            recCon = recCon.replace(/\plc/g, "ReceiverName");
            recCon = nameCon != '' || amountCon != '' || dateCon != '' || groupCon != '' ? " and " + recCon : recCon;
            $('.receiverFilter').addClass('filterSelection');
        }


        if (nameCon != '' || amountCon != '' || dateCon != '' || groupCon != '' || recCon !=  '') {
            condition = "&$filter=(" + nameCon + amountCon + dateCon + groupCon +  recCon +")";
        }

        $scope.filterCondition = condition;

        var loadurl = odaturl + condition + "&$skip=0&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
        repository.get(function (results) {
            if (!angular.isObject(results.value)) {
                $window.location.reload();
            }
            $scope.incomes = results.value;
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
    $scope.clearReceiverFilter = function () {
        $scope.receiverFilter = {};
        $('.receiverFilter').removeClass('filterSelection');
        $scope.filter();
    }

    $scope.changeName = function () {
        if ($scope.payerDetail != null && angular.isDefined($scope.payerDetail) && angular.isDefined($scope.payerDetail.ContactId)) {
            delete $scope.payerDetail.ContactId;
        }
        if ($scope.Income != null && angular.isDefined($scope.Income) && angular.isDefined($scope.Income.ContactId)) {
            delete $scope.Income.ContactId;
        }
    }

    $scope.getAll = function (val) {
        return repository.getWebApi(typeaheadurl + '/' + val + '/all');
    };

    $scope.getinExpNames = function (val) {
        return repository.getWebApi(typInExpName + '/' + val );
    };

    $scope.Group = function (val) {
        var loadurl = typeaheadGroupurl + "&$filter=startswith(GroupName, '" + val + "') &$top=35&$inlinecount=allpages"
        return repository.getTypeAhead(loadurl);
    };

    $scope.exportToPdf = function () {
        //PDF headers
        var dispHead = ['Id', 'Name', 'Description', 'Group Name', 'Date', 'Approved', 'Amount'];

        var incomePdf = [];

        //PDF document configaruations
        var linebreakPos = 35;
        var pdfProperty = {
            cellWidth: 41,
            leftMargin: 0,
            topMargin: 2,
            rowHeight: 12,
            titlefontsize: 18,
            headerfontsize: 10,
            cellfontsize: 6.5,
            recordperpage: 12,
            name: 'Income.pdf',
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
                title: 'Income List',
                subject: 'List of contacts',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        var total = 0;
        //Get the data and then generate Pdf
        repository.getTypeAhead(odaturl + $scope.filterCondition).then(function (pdfIncome) {

            if (pdfIncome != null && !angular.isUndefined(pdfIncome)) {
                angular.forEach(pdfIncome, function (income, index) {
                    var pdfIncome = {};
                    pdfIncome.Id = " " + income.Id + " ";
                    pdfIncome.Name = income.ContactName != null && !angular.isUndefined(income.ContactName) && income.ContactName != '' ? formatStringBreaking(income.ContactName, linebreakPos) + '.' : '';
                    pdfIncome.Description = income.Description != null && !angular.isUndefined(income.Description) && income.Description != '' ? formatStringBreaking(income.Description, linebreakPos) : ' ';
                    pdfIncome.GroupName = income.GroupName != null && !angular.isUndefined(income.GroupName) && income.GroupName != '' ? income.GroupName : ' ';
                    pdfIncome.ReceivedDate = income.ReceivedDate != null && !angular.isUndefined(income.ReceivedDate) && income.ReceivedDate != '' ? utilityService.getDateFromOdata(income.ReceivedDate) : ' ';
                    pdfIncome.IsApprove = income.IsApprove != null && !angular.isUndefined(income.IsApprove) && income.IsApprove == true ? 'True' : 'False';
                    pdfIncome.Amount = income.Amount != null && !angular.isUndefined(income.Amount) && income.Amount != '' ? ' ' + income.Amount + ' ' : ' ';
                    total += parseFloat(income.Amount);
                    incomePdf.push(pdfIncome);
                });
            }
            pdfProperty.splField = "Total : " + total;

            $scope.openPDF(incomePdf, dispHead, pdfProperty);
        });
    }

    $scope.exportToPdfSingle = function (id) {
        var incomePdf = [];

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
                title: 'Receipt',
                subject: 'List of contacts',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        //Get the data and then generate Pdf
        repository.getTypeAhead(odaturl + '&$filter=(Id eq ' + id + ')').then(function (pdfIncome) {
            if (pdfIncome != null && !angular.isUndefined(pdfIncome) && pdfIncome.length > 0) {
                var income = pdfIncome[0];
                incomePdf.push({ Name: "Id", Value: ' ' + income.Id + ' ' });
                incomePdf.push({ Name: "Name", Value: income.ContactName != null && !angular.isUndefined(income.ContactName) && income.ContactName != '' ? income.ContactName : ' ' });
                incomePdf.push({ Name: "Amount", Value: income.Amount != null && !angular.isUndefined(income.Amount) && income.Amount != '' ? ' ' + income.Amount + ' ' : ' ' });
                incomePdf.push({ Name: "Date", Value: income.ReceivedDate != null && !angular.isUndefined(income.ReceivedDate) && income.ReceivedDate != '' ? utilityService.getDateFromOdata(income.ReceivedDate) : ' ' });
                incomePdf.push({ Name: "Description", Value: income.Description != null && !angular.isUndefined(income.Description) && income.Description != '' ? income.Description : ' ' });
                incomePdf.push({ Name: "Group Name", Value: income.GroupName != null && !angular.isUndefined(income.GroupName) && income.GroupName != '' ? income.GroupName : ' ' });
                incomePdf.push({ Name: "Receiver", Value: income.ReceiverName != null && !angular.isUndefined(income.ReceiverName) && income.Receiver != '' ? income.ReceiverName : ' ' });
                incomePdf.push({ Name: "Approved", Value: income.IsApprove != null && !angular.isUndefined(income.IsApprove) && income.IsApprove ? 'Approved' : ' ' });
                incomePdf.push({ Name: "Signature", Value: ' ' });

                $scope.openPDF(incomePdf, null, pdfProperty, null);
            }
        });
    }
}

//Helper function
function formatDateString(scope, utilityService)
{
    if (scope.Income.ReceivedDate != null && angular.isDefined(scope.Income.ReceivedDate) && scope.Income.ReceivedDate != '') {
        scope.Income.ReceivedDate = utilityService.getDate(scope.Income.ReceivedDate);
    }
}

function formatDateStringinEdit(scope, utilityService) {
    if (scope.Income.ReceivedDate != null && angular.isDefined(scope.Income.ReceivedDate) && scope.Income.ReceivedDate != '') {
        scope.Income.ReceivedDate = utilityService.formatDate(scope.Income.ReceivedDate);
    }
}

function setPayerDetails(scope)
{
    if (scope.payerDetail != null && angular.isDefined(scope.payerDetail.ContactId) && scope.payerDetail.ContactId != "" && scope.payerDetail.ContactId > 0) {
        scope.Income.ContactName = scope.payerDetail.Name;
        scope.Income.ContactId = scope.payerDetail.ContactId;
    }
    else {
        scope.Income.ContactName = scope.payerDetail;
    }
    if (scope.groupDetail != null && angular.isDefined(scope.groupDetail) && angular.isDefined(scope.groupDetail.GroupName) && scope.groupDetail.GroupName != '') {
        scope.Income.GroupName = scope.groupDetail.GroupName;
    }
    else
    {
        scope.Income.GroupName = scope.groupDetail != null && angular.isDefined(scope.groupDetail) && scope.groupDetail != '' ? scope.groupDetail : '';
    }

    if (scope.Description != null && angular.isDefined(scope.Description) && angular.isDefined(scope.Description.GroupName) && scope.Description.GroupName != '') {
        scope.Income.Description = scope.Description.GroupName;
    }
    else {
        scope.Income.Description = scope.Description != null && angular.isDefined(scope.Description) && scope.Description != '' ? scope.Description : '';
    }
    
    
}

function getPayerDetails(scope) {
    scope.payerDetail = {};
    scope.groupDetail = {};
    scope.Description = {};
    if (scope.Income.ContactId != null && angular.isDefined(scope.Income.ContactId) && scope.Income.ContactId != "" && scope.Income.ContactId > 0) {
        scope.payerDetail.Name = scope.Income.ContactName;
        scope.payerDetail.ContactId = scope.Income.ContactId;
    }
    else {
        scope.payerDetail = scope.Income.ContactName;
    }

    if (scope.Income.GroupName != null && angular.isDefined(scope.Income.GroupName)) {
        scope.groupDetail.GroupName = scope.Income.GroupName;
    }
    else {
        scope.groupDetail = '';
    }

    if (scope.Income.Description != null && angular.isDefined(scope.Income.Description)) {
        scope.Description = scope.Income.Description;
    }
    else {
        scope.Description = '';
    }
}
