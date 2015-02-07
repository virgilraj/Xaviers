var url = '/api/Loan';
var odaturl = '/odata/OdataLoan?$orderby=StartDate desc';
var typeaheadurl = "/api/Contacts";
var loaninfoUrl = '/api/LoanCollection'
function loanCtrl($scope, repository, $http, utilityService) {
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
    $scope.LoanInfo = null;
    $scope.IsSA = rle == 'SA';

    $scope.addLoans = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = false;
        $scope.payerDetail = null;
        $scope.isView = false;
        if ($scope.Loan == null || angular.isUndefined($scope.Loan)) {
            $scope.Loan = {};
            $scope.Loan.LoanType = "Y";
            $scope.Loan.Source = "SS";
        }
    }
    $scope.showLoans = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = true;
    }
    $scope.pageChange = function (pageno) {
        $scope.load(pageno);
    }

    $scope.getTotal = function (id, typ) {
        var loanTot = 0;
        if (id > 0 && $scope.LoanInfo != null && angular.isDefined($scope.LoanInfo) && $scope.LoanInfo.length > 0) {
            var tot = $.grep($scope.LoanInfo, function (loan) { return (loan.LoanId == id) });
            if (tot != null && angular.isDefined(tot) && tot.length > 0) {
                if (typ == 'P') {
                    loanTot = tot[0].TotalPrincipalPaid + tot[0].TotalInterestPaid;
                }else if(typ == 'T')
                {
                    loanTot = tot[0].Total;
                }
            }
        }
        return loanTot;
    }

    $scope.load = function (pageno) {
        var skipnum = parseInt($scope.itemsPerPage) * parseInt(pageno - 1);
        var loadurl = odaturl + $scope.filterCondition + "&$skip=" + skipnum + "&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
        repository.get(function (results) {
            if (!angular.isObject(results.value)) {
                $window.location.reload();
            }
            //$scope.loans = results.value;
            $scope.totalItems = parseInt(results["odata.count"]);
            var loanids = '';
            if (results.value != null && angular.isDefined(results.value) && angular.isObject(results.value) && results.value.length > 0) {
                angular.forEach(results.value, function (dta, index) {
                    //taxids += taxids != '' ? ',' + dta.Id : dta.Id;
                    loanids += ',' + dta.Id;
                });
            }
            if (loanids != '') {
                var taxAmt = repository.getWebApi(loaninfoUrl + '/' + loanids + '/all').then(function (loaninfo) {
                    $scope.LoanInfo = loaninfo;
                    $scope.loans = results.value;
                });
            }
        }, loadurl);

    }

    $scope.reset = function () {
        $scope.Loan = null;
    }

    $scope.edit = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.Loan = results;
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
            formatDateStringinEdit($scope, utilityService);
            getPayerDetails($scope);
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = true;
    }

    $scope.delete = function (id) {
        var isdelete = confirm("Do you want to delete this loan?");
        if (!isdelete) { return false; }
        var deleteurl = url + '/' + id;
        repository.delete(function (res) {
            if (angular.isObject(res) && angular.isDefined(res) && angular.isDefined(res.content) && res.content == 'USED') {
                alert('Loan can not be deleted since used in collection module');
                return false;
            }
            alert('Record deleted successfully');
            $scope.load($scope.currentPage);
        }, deleteurl);
    }

    $scope.save = function (myForm, isApprove) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        setPayerDetails($scope);
        if ($scope.Loan == null || angular.isUndefined($scope.Loan.ContactId) || $scope.Loan.ContactId == '') { alert("Please select name from dropdown"); return false; }
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
                    dateCon = "(StartDate ge datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "' and StartDate le datetime'" + utilityService.setSearchDate($scope.Filter.TDate) + "')";
                }
                else
                {
                    dateCon = "(StartDate eq datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "')"
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
                //$scope.loans = results.value;
                $scope.totalItems = parseInt(results["odata.count"]);
                $scope.totalItems = parseInt(results["odata.count"]);
                var loanids = '';
                if (results.value != null && angular.isDefined(results.value) && angular.isObject(results.value) && results.value.length > 0) {
                    angular.forEach(results.value, function (dta, index) {
                        //taxids += taxids != '' ? ',' + dta.Id : dta.Id;
                        loanids += ',' + dta.Id;
                    });
                }
                if (loanids != '') {
                    var taxAmt = repository.getWebApi(loaninfoUrl + '/' + loanids + '/all').then(function (loaninfo) {
                        $scope.LoanInfo = loaninfo;
                        $scope.loans = results.value;
                    });
                }
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
                dateCon = "(StartDate ge datetime'" + utilityService.setSearchDate($scope.dateFilter.Text) + "' and StartDate le datetime'" + utilityService.setSearchDate($scope.dateFilter.Text1) + "')";
            }
            else {
                dateCon = options.replace(/\plcholder/g, "datetime'" + utilityService.setSearchDate($scope.dateFilter.Text) + "'");
                dateCon = dateCon.replace(/\plc/g, "StartDate");
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
            //$scope.loans = results.value;
            $scope.totalItems = parseInt(results["odata.count"]);
            $scope.totalItems = parseInt(results["odata.count"]);
            var loanids = '';
            if (results.value != null && angular.isDefined(results.value) && angular.isObject(results.value) && results.value.length > 0) {
                angular.forEach(results.value, function (dta, index) {
                    //taxids += taxids != '' ? ',' + dta.Id : dta.Id;
                    loanids += ',' + dta.Id;
                });
            }
            if (loanids != '') {
                var taxAmt = repository.getWebApi(loaninfoUrl + '/' + loanids + '/all').then(function (loaninfo) {
                    $scope.LoanInfo = loaninfo;
                    $scope.loans = results.value;
                });
            }
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
        return repository.getWebApi(typeaheadurl + '/' + val + '/all');
    };

    $scope.pendingList = function (id, name) {
        //PDF headers
        var dispHead = ['Name', 'Principal Amt', 'Interest Amt', 'Late Fee', 'Due Month/Year'];

        var loanPdf = [];

        //PDF document configaruations
        var linebreakPos = 35;
        var pdfProperty = {
            cellWidth: 40,
            leftMargin: 0,
            topMargin: 2,
            rowHeight: 12,
            titlefontsize: 18,
            headerfontsize: 10,
            cellfontsize: 7.5,
            recordperpage: 12,
            name: 'Loanpendings.pdf',
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
                title: id + ' ' + name,
                subject: 'List of contacts',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        var total = 0;
        //Get the data and then generate Pdf
        repository.getWebApi(url + '/' + id + '/loan').then(function (pdfTax) {

            if (pdfTax != null && !angular.isUndefined(pdfTax) && pdfTax.length > 0) {
                angular.forEach(pdfTax, function (tax, index) {
                    var pdfLoan = {};
                    pdfLoan.Name = tax.Name != null && !angular.isUndefined(tax.Name) && tax.Name != '' ? formatStringBreaking(tax.Name, linebreakPos) + '' : '';
                    pdfLoan.CurrentPrincipal = tax.CurrentPrincipal != null && !angular.isUndefined(tax.CurrentPrincipal) && tax.CurrentPrincipal != '' ? ' ' + tax.CurrentPrincipal.toFixed(2) + ' ' : '0';
                    pdfLoan.CurrentInterest = tax.CurrentInterest != null && !angular.isUndefined(tax.CurrentInterest) && tax.CurrentInterest != '' ? ' ' + tax.CurrentInterest.toFixed(2) + ' ' : '0';
                    pdfLoan.CurrentLateFee = tax.CurrentLateFee != null && !angular.isUndefined(tax.CurrentLateFee) && tax.CurrentLateFee != '' ? ' ' + tax.CurrentLateFee.toFixed(2) + ' ' : '0';
                    pdfLoan.MonthOrYear = tax.MonthOrYear != null && !angular.isUndefined(tax.MonthOrYear) && tax.MonthOrYear != '' ? formatStringBreaking(tax.MonthOrYear, linebreakPos) + '' : '';
                    loanPdf.push(pdfLoan);
                });

                $scope.openPDF(loanPdf, dispHead, pdfProperty);
            }
            else {
                alert('No records found');
                return false;
            }
        });
    }

    $scope.exportToPdf = function () {
        //PDF headers
        var dispHead = ['Loan Id', 'Name','Description', 'Amount',  'Interest', 'EMI', 'Start Date', 'Expected Total', 'Total Paid', 'Status'];

        var incomePdf = [];

        //PDF document configaruations
        var linebreakPos = 28;
        var pdfProperty = {
            cellWidth: 30,
            leftMargin: 0,
            topMargin: 2,
            rowHeight: 10,
            titlefontsize: 18,
            headerfontsize: 9,
            cellfontsize: 6.5,
            recordperpage: 12,
            name: 'Loans.pdf',
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
                title: 'Loans List',
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
                angular.forEach(pdfIncome, function (loan, index) {
                    var pdfIncome = {};
                    pdfIncome.Id = " " + loan.Id + " ";
                    pdfIncome.Name = loan.ContactName != null && !angular.isUndefined(loan.ContactName) && loan.ContactName != '' ? formatStringBreaking(loan.ContactName, linebreakPos) + '.' : '';
                    pdfIncome.Description = loan.Description != null && !angular.isUndefined(loan.Description) && loan.Description != '' ? formatStringBreaking(loan.Description, linebreakPos) : ' ';
                    pdfIncome.Amount = loan.Amount != null && !angular.isUndefined(loan.Amount) && loan.Amount != '' ? ' ' + loan.Amount + ' ' : ' ';
                    pdfIncome.InterestRate = loan.InterestRate != null && !angular.isUndefined(loan.InterestRate) && loan.InterestRate != '' ? ' ' + loan.InterestRate + ' ' : ' ';
                    pdfIncome.InstalmentPeriod = loan.InstalmentPeriod != null && !angular.isUndefined(loan.InstalmentPeriod) && loan.InstalmentPeriod != '' ? ' ' + loan.InstalmentPeriod + ' ' : ' ';
                    pdfIncome.StartDate = loan.StartDate != null && !angular.isUndefined(loan.StartDate) && loan.StartDate != '' ? utilityService.getDateFromOdata(loan.StartDate) : ' ';
                    pdfIncome.ExpectedTotal = ' ' + $scope.getTotal(loan.Id, 'T')  + ' ';
                    pdfIncome.PaidTotal = ' ' + $scope.getTotal(loan.Id, 'P') + ' ';
                    pdfIncome.Status = loan.LoanStatus != null && !angular.isUndefined(loan.LoanStatus) && loan.LoanStatus == 'C' ? 'Closed' : 'Active';
                    
                    total += parseFloat(loan.Amount);
                    incomePdf.push(pdfIncome);
                });
            }
            //pdfProperty.splField = "Total : " + total;

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
            headerfontsize: 10,
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
                incomePdf.push({ Name: "Loan Id", Value: ' ' + income.Id + ' ' });
                incomePdf.push({ Name: "Name", Value: income.ContactName != null && !angular.isUndefined(income.ContactName) && income.ContactName != '' ? income.ContactName : ' ' });
                incomePdf.push({ Name: "Description", Value: income.Description != null && !angular.isUndefined(income.Description) && income.Description != '' ? income.Description : ' ' });
                incomePdf.push({ Name: "Amount", Value: income.Amount != null && !angular.isUndefined(income.Amount) && income.Amount != '' ? ' ' + income.Amount + ' ' : ' ' });
                incomePdf.push({ Name: "Interest Rate", Value: income.InterestRate != null && !angular.isUndefined(income.InterestRate) && income.InterestRate != '' ? ' ' + income.InterestRate + ' ' : ' ' });
                incomePdf.push({ Name: "Instalment Period", Value: income.InstalmentPeriod != null && !angular.isUndefined(income.InstalmentPeriod) && income.InstalmentPeriod != '' ? ' ' + income.InstalmentPeriod + ' ' : ' ' });
                incomePdf.push({ Name: "Start Date", Value: income.StartDate != null && !angular.isUndefined(income.StartDate) && income.StartDate != '' ? utilityService.getDateFromOdata(income.StartDate) : ' ' });
                incomePdf.push({ Name: "Loan Type", Value: income.LoanType != null && !angular.isUndefined(income.LoanType) && income.LoanType == 'M' ? 'Monthly' : 'Yearly' });
                incomePdf.push({ Name: "Expected Total Amount", Value: ' ' + $scope.getTotal(income.Id, 'T') + ' ' });
                incomePdf.push({ Name: "Total Amount Paid", Value: ' ' + $scope.getTotal(income.Id, 'P') + ' ' });
                incomePdf.push({ Name: "Status", Value: income.LoanStatus != null && !angular.isUndefined(income.LoanStatus) && income.LoanStatus == 'C' ? 'Closed' : 'Active' });

                $scope.openPDF(incomePdf, null, pdfProperty, null);
            }
        });
    }
}

//Helper function
function formatDateString(scope, utilityService)
{
    if (scope.Loan.StartDate != null && angular.isDefined(scope.Loan.StartDate) && scope.Loan.StartDate != '') {
        scope.Loan.StartDate = utilityService.getDate(scope.Loan.StartDate);
    }
    if (scope.Loan.SanctionDate != null && angular.isDefined(scope.Loan.SanctionDate) && scope.Loan.SanctionDate != '') {
        scope.Loan.SanctionDate = utilityService.getDate(scope.Loan.SanctionDate);
    }
}

function formatDateStringinEdit(scope, utilityService) {
    if (scope.Loan.StartDate != null && angular.isDefined(scope.Loan.StartDate) && scope.Loan.StartDate != '') {
        scope.Loan.StartDate = utilityService.formatDate(scope.Loan.StartDate);
    }
    if (scope.Loan.SanctionDate != null && angular.isDefined(scope.Loan.SanctionDate) && scope.Loan.SanctionDate != '') {
        scope.Loan.SanctionDate = utilityService.formatDate(scope.Loan.SanctionDate);
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

    //if (scope.Description != null && angular.isDefined(scope.Description) && angular.isDefined(scope.Description.GroupName) && scope.Description.GroupName != '') {
    //    scope.Loan.Description = scope.Description.GroupName;
    //}
    //else {
    //    scope.Loan.Description = scope.Description != null && angular.isDefined(scope.Description) && scope.Description != '' ? scope.Description : '';
    //}
    
    
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

    //if (scope.Loan.Description != null && angular.isDefined(scope.Loan.Description)) {
    //    scope.Description = scope.Loan.Description;
    //}
    //else {
    //    scope.Description = '';
    //}
}
