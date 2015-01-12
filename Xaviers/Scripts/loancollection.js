var url = '/api/LoanCollection';
var odaturl = '/odata/OdataLoanCollection?$orderby=Date desc';
var typeaheadurl = "/api/Contacts";
function loanCollectionCtrl($scope, repository, $http, utilityService) {
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
    $scope.loanList = {};
    $scope.curEMI = 0;
    $scope.totalNeedToClose = 0;
    $scope.IsSA = rle == 'SA';

    $scope.addLoanCollection = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = false;
        $scope.groupDetail = null;
        $scope.payerDetail = null;
        $scope.Description = null;
        $scope.isView = false;
        $scope.totalNeedToClose = 0;
        $scope.loanList = {};
        $scope.LoanName = '';
    }
    $scope.showLoanCollection = function () {
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
            $scope.loans = results.value;
            $scope.totalItems = parseInt(results["odata.count"]);
        }, loadurl);

    }

    $scope.getLoanAmount = function()
    {
        var loanID = angular.isDefined($scope.LoanName) && $scope.LoanName.split(' ').length > 0 ? $scope.LoanName.split(' ')[0] : 0;
        if (loanID > 0) {
            
            var taxAmt = repository.getWebApi(url + '/' + loanID + '/all').then(function (loaninfo) {
                if (loaninfo != null && angular.isDefined(loaninfo) && loaninfo.length > 0)
                {
                    if ($scope.Loan == null || angular.isUndefined($scope.Loan)) {
                        $scope.Loan = {};
                    }
                    $scope.Loan.loanId = loanID;
                    $scope.Loan.Amount = Math.round(loaninfo[0].CurrentPrincipal + loaninfo[0].CurrentInterest,2);
                    $scope.totalNeedToClose = loaninfo[0].TotalAmountRequiredToClose;

                }
            });
        }
    }

    $scope.reset = function () {
        $scope.Loan = null;
    }

    $scope.getInstanceBalance = function () {
        if ($scope.payerDetail != null && angular.isDefined($scope.payerDetail) && angular.isDefined($scope.payerDetail.ContactId) && angular.isDefined($scope.payerDetail.LoanList)) {
            $scope.loanList = $scope.payerDetail.LoanList;
        }
    }

    $scope.edit = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.Loan = results;
            
            var lnAmt = repository.getWebApi(url + '/' + $scope.Loan.ContactId + '/contact').then(function (loaninfo) {
                if (loaninfo != null && angular.isDefined(loaninfo) && loaninfo.length > 0)
                {
                    $scope.loanList = loaninfo[0].LoanList;
                    $scope.Loan.Amount += $scope.Loan.Interest;
                    angular.forEach(loaninfo[0].LoanList, function (dta, index) {
                        var lnId = dta.LoanName.split(' ').length > 0 ? dta.LoanName.split(' ')[0] : 0;
                        if($scope.Loan.LoanId == lnId)
                        {
                            $scope.totalNeedToClose = dta.loanAmount + $scope.Loan.Amount;
                            $scope.LoanName = dta.LoanName;
                        }
                    });
                }
            });

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
            $scope.Loan = results;
            var lnAmt = repository.getWebApi(url + '/' + $scope.Loan.ContactId + '/contact').then(function (loaninfo) {
                if (loaninfo != null && angular.isDefined(loaninfo) && loaninfo.length > 0) {
                    $scope.loanList = loaninfo[0].LoanList;
                    $scope.Loan.Amount += $scope.Loan.Interest;
                    angular.forEach(loaninfo[0].LoanList, function (dta, index) {
                        var lnId = dta.LoanName.split(' ').length > 0 ? dta.LoanName.split(' ')[0] : 0;
                        if ($scope.Loan.LoanId == lnId) {
                            $scope.totalNeedToClose = dta.loanAmount + $scope.Loan.Amount;
                            $scope.LoanName = dta.LoanName;
                        }
                    });
                }
            });

            formatDateStringinEdit($scope, utilityService);
            getPayerDetails($scope);
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = true;
    }

    $scope.delete = function (id) {
        var isdelete = confirm("Do you want to delete this loan");
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
        if ($scope.Loan == null || angular.isUndefined($scope.Loan.ContactId) || $scope.Loan.ContactId == '') { alert("Please select name from dropdown"); return false; }
        if ($scope.totalNeedToClose < $scope.Loan.Amount) { alert("Oops! Amount should not greater than " + $scope.totalNeedToClose); return false; }
        $scope.isUpdate = false;
        $scope.Loan.IsApprove = isApprove;
        formatDateString($scope, utilityService);
        repository.insert(function () {
            alert('Record saved successfully');
            $scope.load(0);
            $scope.isList = true;
            $scope.Loan = null;
        }, $scope.Loan,
         function (resp) {
             //if (resp != null && angular.isDefined(resp) && angular.isDefined(resp.data)) {
             //    $scope.uploadFile(resp.data.ContactId);
             //}
         });
    }

    $scope.update = function (myForm, isApprove) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        setPayerDetails($scope);
        if ($scope.Loan == null || angular.isUndefined($scope.Loan.ContactId) || $scope.Loan.ContactId == '') { alert("Please select name from dropdown"); return false; }
        if ($scope.totalNeedToClose < $scope.Loan.Amount) { alert("Oops! Amount should not greater than " + $scope.totalNeedToClose); return false; }
        if ($scope.Loan != null && angular.isDefined($scope.Loan.Id) && $scope.Loan.Id > 0) {
            var updateurl = url + '/' + $scope.Loan.Id;
            $scope.Loan.IsApprove = isApprove;
            formatDateString($scope, utilityService);
            repository.update(function () {
                alert('Record updated successfully');
                $scope.load(0);
            }, $scope.Loan, updateurl);
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
                    dateCon = "(Date ge datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "' and Date le datetime'" + utilityService.setSearchDate($scope.Filter.TDate) + "')";
                }
                else
                {
                    dateCon = "(Date eq datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "')"
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
                $scope.loans = results.value;
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
                dateCon = "(Date ge datetime'" + utilityService.setSearchDate($scope.dateFilter.Text) + "' and Date le datetime'" + utilityService.setSearchDate($scope.dateFilter.Text1) + "')";
            }
            else {
                dateCon = options.replace(/\plcholder/g, "datetime'" + utilityService.setSearchDate($scope.dateFilter.Text) + "'");
                dateCon = dateCon.replace(/\plc/g, "Date");
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
            $scope.loans = results.value;
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
        if ($scope.Loan != null && angular.isDefined($scope.Loan) && angular.isDefined($scope.Loan.ContactId)) {
            delete $scope.Loan.ContactId;
        }
    }

    $scope.getAll = function (val) {
        return repository.getWebApi(url + '/' + val);
    };


    $scope.exportToPdf = function () {
        //PDF headers
        var dispHead = ['Id', 'Name', 'Description', 'Date', 'Principal Amount','Interest', 'Approved'];

        var incomePdf = [];

        //PDF document configaruations
        var linebreakPos = 35;
        var pdfProperty = {
            cellWidth: 41,
            leftMargin: 0,
            topMargin: 2,
            rowHeight: 12,
            titlefontsize: 20,
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
                title: 'Loan List',
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
                    pdfIncome.Date = income.Date != null && !angular.isUndefined(income.Date) && income.Date != '' ? utilityService.getDateFromOdata(income.Date) : ' ';
                    pdfIncome.Amount = income.Amount != null && !angular.isUndefined(income.Amount) && income.Amount != '' ? ' ' + income.Amount.toFixed(2) + ' ' : ' ';
                    pdfIncome.Interest = income.Interest != null && !angular.isUndefined(income.Interest) && income.Interest != '' ? ' ' + income.Interest.toFixed(2) + ' ' : ' ';
                    pdfIncome.IsApprove = income.IsApprove != null && !angular.isUndefined(income.IsApprove) && income.IsApprove == true ? 'True' : 'False';
                    
                    total += parseFloat(income.Amount);
                    incomePdf.push(pdfIncome);
                });
            }
            pdfProperty.splField = "Total : " + total.toFixed(2);

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
            headerfontsize: 13,
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
                incomePdf.push({ Name: "Date", Value: income.Date != null && !angular.isUndefined(income.Date) && income.Date != '' ? utilityService.getDateFromOdata(income.Date) : ' ' });
                incomePdf.push({ Name: "Description", Value: income.Description != null && !angular.isUndefined(income.Description) && income.Description != '' ? income.Description : ' ' });
                incomePdf.push({ Name: "Amount", Value: income.Amount != null && !angular.isUndefined(income.Amount) && income.Amount != '' ? ' ' + income.Amount.toFixed(2) + ' ' : ' ' });
                incomePdf.push({ Name: "Interest", Value: income.Interest != null && !angular.isUndefined(income.Interest) && income.Interest != '' ? ' ' + income.Interest.toFixed(2) + ' ' : ' ' });
                incomePdf.push({ Name: "Approved", Value: income.IsApprove != null && !angular.isUndefined(income.IsApprove) && income.IsApprove ? 'Approved' : ' ' });
                incomePdf.push({ Name: "Receiver", Value: income.ReceiverName != null && !angular.isUndefined(income.ReceiverName) && income.ReceiverName != '' ? income.ReceiverName : ' ' });
                incomePdf.push({ Name: "", Value: '' });
                incomePdf.push({ Name: "Signature", Value: ' ' });

                $scope.openPDF(incomePdf, null, pdfProperty, null);
            }
        });
    }
}

//Helper function
function formatDateString(scope, utilityService)
{
    if (scope.Loan.Date != null && angular.isDefined(scope.Loan.Date) && scope.Loan.Date != '') {
        scope.Loan.Date = utilityService.getDate(scope.Loan.Date);
    }
}

function formatDateStringinEdit(scope, utilityService) {
    if (scope.Loan.Date != null && angular.isDefined(scope.Loan.Date) && scope.Loan.Date != '') {
        scope.Loan.Date = utilityService.formatDate(scope.Loan.Date);
    }
}

function setPayerDetails(scope)
{
    if (scope.payerDetail != null && angular.isDefined(scope.payerDetail.ContactId) && scope.payerDetail.ContactId != "" && scope.payerDetail.ContactId > 0) {
        scope.Loan.ContactName = scope.payerDetail.Name;
        scope.Loan.ContactId = scope.payerDetail.ContactId;
    }
    else {
        scope.Loan.ContactName = scope.payerDetail;
    }
    if (scope.groupDetail != null && angular.isDefined(scope.groupDetail) && angular.isDefined(scope.groupDetail.GroupName) && scope.groupDetail.GroupName != '') {
        scope.Loan.GroupName = scope.groupDetail.GroupName;
    }
    else
    {
        scope.Loan.GroupName = scope.groupDetail != null && angular.isDefined(scope.groupDetail) && scope.groupDetail != '' ? scope.groupDetail : '';
    }

    if (scope.Description != null && angular.isDefined(scope.Description) && angular.isDefined(scope.Description.GroupName) && scope.Description.GroupName != '') {
        scope.Loan.Description = scope.Description.GroupName;
    }
    else {
        scope.Loan.Description = scope.Description != null && angular.isDefined(scope.Description) && scope.Description != '' ? scope.Description : '';
    }
    
    
}

function getPayerDetails(scope) {
    scope.payerDetail = {};
    scope.groupDetail = {};
    scope.Description = {};
    if (scope.Loan.ContactId != null && angular.isDefined(scope.Loan.ContactId) && scope.Loan.ContactId != "" && scope.Loan.ContactId > 0) {
        scope.payerDetail.Name = scope.Loan.ContactName;
        scope.payerDetail.ContactId = scope.Loan.ContactId;
    }
    else {
        scope.payerDetail = scope.Loan.ContactName;
    }

    if (scope.Loan.GroupName != null && angular.isDefined(scope.Loan.GroupName)) {
        scope.groupDetail.GroupName = scope.Loan.GroupName;
    }
    else {
        scope.groupDetail = '';
    }

    if (scope.Loan.Description != null && angular.isDefined(scope.Loan.Description)) {
        scope.Description = scope.Loan.Description;
    }
    else {
        scope.Description = '';
    }
}
