var url = '/api/RecurringTaxCollection';
var odaturl = '/odata/OdataRecurringTaxCollection?$orderby=ReceivedDate desc';
var typeaheadurl = "/api/Contacts";
var pdfUrl = "/odata/OdataRecurringTaxCollection?$orderby=ReceivedDate desc"
var typeadhedTax = '/odata/OdataRecurringTax?$select=Id,TaxName&$orderby=StartDate desc'
function taxCollectionCtrl($scope, repository, $http, utilityService) {
    $scope.searchoptions = singleSearch;
    $scope.searchoptions1 = doubleSearch;
    $scope.searchoptions2 = tripleSearch;
    $scope.searchNum = numDateSearch;
    $scope.searchNum1 = numDateSearch1;
    $scope.singleSearchDefault = singleSearch[2].text;
    $scope.doubleSearchDefault = doubleSearch[2].text;
    $scope.tripleSearchDefault = tripleSearch[2].text;
    $scope.searchNumDefault = numDateSearch[0].text;
    $scope.searchNumDefault1 = numDateSearch1[0].text;

    $scope.isList = true;
    $scope.isView = false;
    $scope.isUpdate = false;
    $scope.name = ''; // This will hold the selected item
    $scope.filterCondition = '';
    $scope.daydatepicker = new Date().getDate();

    $scope.amount = 'F';

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = pagesize;
    $scope.itemsPerPage = 25;
    $scope.isTypeChange = false;
    $scope.PayType = '';

    $scope.ExcludedMembers = [];
    $scope.TaxTotalAmount = [];

    $scope.BalanceAmount = 0;
    $scope.TotalReceivedAmount = 0;
    $scope.IsSA = rle == 'SA';

    $scope.$on('UpdateParent', function (angularObject, input) {
        //alert(input.BalanceAmount);
        $scope.BalanceAmount = input.BalanceAmount;
    });

    $scope.addTaxCollection = function () {
        $scope.amount = 'F';
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = false;
        $scope.taxDetail = null;
        $scope.payerDetail = null;
        $scope.isView = false;
        $scope.isTypeChange = false;
    }
    $scope.showTaxCollection = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = true;
    }
    $scope.pageChange = function (pageno) {
        $scope.load(pageno);
    }

    $scope.getBalance = function (taxid, contactid) {
        var taxTot = 0;
        if (taxid > 0 && angular.isDefined($scope.TaxTotalAmount) && $scope.TaxTotalAmount.length > 0) {
            var tot = $.grep($scope.TaxTotalAmount, function (tax) { return (tax.TaxId == taxid && tax.ContactId == contactid) });
            if (tot != null && angular.isDefined(tot) && tot.length > 0) {
                taxTot = tot[0].BalanceAmount;
            }
        }
        return taxTot;
    }

    $scope.getReceived = function (taxid, contactid) {
        var taxTot = 0;
        if (taxid > 0 && angular.isDefined($scope.TaxTotalAmount) && $scope.TaxTotalAmount.length > 0) {
            var tot = $.grep($scope.TaxTotalAmount, function (tax) { return (tax.TaxId == taxid && tax.ContactId == contactid) });
            if (tot != null && angular.isDefined(tot) && tot.length > 0) {
                taxTot = tot[0].TotalReceivedAmount;
            }
        }
        return taxTot;
    }

    $scope.getInstanceBalance = function()
    {
        if($scope.taxDetail != null && angular.isDefined($scope.taxDetail) && angular.isDefined($scope.taxDetail.Id) &&
        $scope.payerDetail != null && angular.isDefined($scope.payerDetail) && angular.isDefined($scope.payerDetail.ContactId))
        {
            var taxids = $scope.payerDetail.ContactId + '|' + $scope.taxDetail.Id;
            var taxAmt = repository.getWebApi(url + '/' + taxids).then(function (taxAmount) {
                if (taxAmount != null && angular.isDefined(taxAmount) && taxAmount.length > 0) {
                    $scope.BalanceAmount = taxAmount[0].BalanceAmount;
                    $scope.TotalReceivedAmount = taxAmount[0].TotalReceivedAmount;
                    
                    if (taxAmount[0].PayType != null && angular.isDefined(taxAmount[0].PayType) && taxAmount[0].PayType != '') {
                        $scope.Tax = {};
                        $scope.Tax.PayType = taxAmount[0].PayType
                        //$scope.PayType = taxAmount[0].PayType;
                        $scope.isTypeChange = true;
                    }
                    //$scope.$emit('UpdateParent', taxAmount[0]);
                }
            });
        }
    }
    
    $scope.load = function (pageno) {
        var skipnum = parseInt($scope.itemsPerPage) * parseInt(pageno - 1);
        var loadurl = odaturl + $scope.filterCondition + "&$skip=" + skipnum + "&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
        repository.get(function (results) {
            if (!angular.isObject(results.value)) {
                $window.location.reload();
            }
            $scope.totalItems = parseInt(results["odata.count"]);
            //$scope.taxs = results.value;
            var taxids = '';
            if (results.value != null && angular.isDefined(results.value) && angular.isObject(results.value) && results.value.length > 0) {
                angular.forEach(results.value, function (dta, index) {
                    if (taxids != '')
                    {
                        var tx = ',' + dta.ContactId + '|' + dta.RecurringTaxId;
                        taxids += tx;
                    }
                    else
                    {
                        var tx = dta.ContactId + '|' + dta.RecurringTaxId;
                        taxids += tx;
                    }
                    
                });
            }
            if (taxids != '') {
                var taxAmt = repository.getWebApi(url + '/' + taxids).then(function (taxAmount) {
                    $scope.TaxTotalAmount = taxAmount;
                    $scope.taxs = results.value;
                });
            }

            $scope.taxs = results.value;
        }, loadurl);

    }

    $scope.reset = function () {
        $scope.Tax = null;
    }

    $scope.edit = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.Tax = results;
            $scope.isTypeChange = true;
            getPayerDetails($scope);
            formatDateStringinEdit($scope, utilityService);
            $scope.BalanceAmount = $scope.getBalance($scope.Tax.RecurringTaxId, $scope.Tax.ContactId);
            $scope.TotalReceivedAmount = $scope.getReceived($scope.Tax.RecurringTaxId, $scope.Tax.ContactId);
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
            $scope.Tax = results;
            getPayerDetails($scope);
            formatDateStringinEdit($scope, utilityService);
            $scope.BalanceAmount = $scope.getBalance($scope.Tax.RecurringTaxId, $scope.Tax.ContactId);
            $scope.TotalReceivedAmount = $scope.getReceived($scope.Tax.RecurringTaxId, $scope.Tax.ContactId);
        }, editUrl);
        $scope.isView = true;
        $scope.isUpdate = true;
        $scope.isList = false;
    }

    $scope.delete = function (id) {
        var isdelete = confirm("Do you want to delete this record");
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
        if ($scope.Tax == null || angular.isUndefined($scope.Tax.ContactId) || $scope.Tax.ContactId == '') { alert("Please select name from dropdown"); return false; }
        if ($scope.Tax == null || angular.isUndefined($scope.Tax.RecurringTaxId) || $scope.Tax.RecurringTaxId == '') { alert("Please select tax from dropdown"); return false; }
        $scope.isUpdate = false;
        $scope.Tax.IsApprove = isApprove;
        formatDateString($scope, utilityService);
        repository.insert(function () {
            alert('Record saved successfully');
            $scope.load(0);
            $scope.isList = true;
            $scope.Tax = null;
        }, $scope.Tax);
    }

    $scope.update = function (myForm, isApprove) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        setPayerDetails($scope);
        if ($scope.Tax == null || angular.isUndefined($scope.Tax.ContactId) || $scope.Tax.ContactId == '') { alert("Please select name from dropdown"); return false; }
        if ($scope.Tax == null || angular.isUndefined($scope.Tax.RecurringTaxId) || $scope.Tax.RecurringTaxId == '') { alert("Please select tax from dropdown"); return false; }

        if ($scope.Tax != null && angular.isDefined($scope.Tax.Id) && $scope.Tax.Id > 0) {
            var updateurl = url + '/' + $scope.Tax.Id;
            $scope.Tax.IsApprove = isApprove;
            formatDateString($scope, utilityService);
            setPayerDetails($scope);
            repository.update(function () {
                alert('Record updated successfully');
                $scope.load(0);
            }, $scope.Tax, updateurl);
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
        var taxCon = '';
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
            //if (angular.isDefined($scope.Filter.Name) && $scope.Filter.Name != '') {
            //    groupCon = "(startswith(ContactName, '" + $scope.Filter.Name + "'))";
            //    groupCon = nameCon != '' || amountCon != '' ? " and " + groupCon : groupCon;
            //}
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
                    dateCon = "(ReceivedDate ge datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "' and ReceivedDate le datetime'" + utilityService.setSearchDate($scope.Filter.TDate) + "')";
                }
                else {
                    dateCon = "(ReceivedDate eq datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "')"
                }
                dateCon = nameCon != '' || amountCon != '' || groupCon != '' ? " and " + dateCon : dateCon;
            }

            if (angular.isDefined($scope.Filter.TaxName) && $scope.Filter.TaxName != '') {
                emailCon = "(startswith(TaxName, '" + $scope.Filter.TaxName + "'))";
                emailCon = nameCon != '' || amountCon != '' || groupCon != '' || dateCon != ''? " and " + emailCon : emailCon;
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

                $scope.totalItems = parseInt(results["odata.count"]);
                var taxids = '';
                if (results.value != null && angular.isDefined(results.value) && angular.isObject(results.value) && results.value.length > 0) {
                    angular.forEach(results.value, function (dta, index) {
                        if (taxids != '') {
                            var tx = ',' + dta.ContactId + '|' + dta.RecurringTaxId;
                            taxids += tx;
                        }
                        else {
                            var tx = dta.ContactId + '|' + dta.RecurringTaxId;
                            taxids += tx;
                        }
                    });
                }
                if (taxids != '') {
                    var taxAmt = repository.getWebApi(url + '/' + taxids).then(function (taxAmount) {
                        $scope.TaxTotalAmount = taxAmount;
                        $scope.taxs = results.value;
                    });
                }
                else
                {
                    $scope.taxs = results.value;
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
        var taxnameCon = '';

        if (angular.isDefined($scope.taxnamefilter) && angular.isDefined($scope.taxnamefilter.Text) && $scope.taxnamefilter.Text != '') {
            var options = '';
            if (angular.isUndefined($scope.taxnamefilter.Options)) {
                //set default value
                options = singleSearch[2].value;
            }
            else {
                options = $scope.taxnamefilter.Options;
            }
            taxnameCon = options.replace(/\plcholder/g, "'" + $scope.taxnamefilter.Text + "'");
            taxnameCon = taxnameCon.replace(/\plc/g, "TaxName");
            $('.taxnamefilter').addClass('filterSelection');
        }

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
            nameCon = taxnameCon != '' ? " and " + nameCon : nameCon;
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
            amountCon = taxnameCon != '' || nameCon != '' ? " and " + amountCon : amountCon;
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
            dateCon = taxnameCon != '' ||  nameCon != '' || amountCon != '' ? " and " + dateCon : dateCon;
            $('.dateFilter').addClass('filterSelection');
        }

        if (angular.isDefined($scope.descriptionFilter) && angular.isDefined($scope.descriptionFilter.Text) && $scope.descriptionFilter.Text != '') {
            var options = '';
            if (angular.isUndefined($scope.descriptionFilter.Options)) {
                //set default value
                options = singleSearch[2].value;
            }
            else {
                options = $scope.descriptionFilter.Options;
            }
            groupCon = options.replace(/\plcholder/g, "'" + $scope.descriptionFilter.Text + "'");
            groupCon = groupCon.replace(/\plc/g, "Description");
            groupCon =taxnameCon != '' || nameCon != '' || amountCon != '' || dateCon != '' ? " and " + groupCon : groupCon;
            $('.descriptionFilter').addClass('filterSelection');
        }


        if (taxnameCon != '' || nameCon != '' || amountCon != '' || dateCon != '' || groupCon != '') {
            condition = "&$filter=(" + taxnameCon + nameCon + amountCon + dateCon + groupCon + ")";
        }

        $scope.filterCondition = condition;

        var loadurl = odaturl + condition + "&$skip=0&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
        repository.get(function (results) {
            if (!angular.isObject(results.value)) {
                $window.location.reload();
            }
            $scope.totalItems = parseInt(results["odata.count"]);
            var taxids = '';
            if (results.value != null && angular.isDefined(results.value) && angular.isObject(results.value) && results.value.length > 0) {
                angular.forEach(results.value, function (dta, index) {
                    if (taxids != '') {
                        var tx = ',' + dta.ContactId + '|' + dta.RecurringTaxId;
                        taxids += tx;
                    }
                    else {
                        var tx = dta.ContactId + '|' + dta.RecurringTaxId;
                        taxids += tx;
                    }
                });
            }
            
            if (taxids != '') {
                var taxAmt = repository.getWebApi(url + '/' + taxids).then(function (taxAmount) {
                    $scope.TaxTotalAmount = taxAmount;
                    $scope.taxs = results.value;
                });
            }
            else {
                $scope.taxs = results.value;
            }
        }, loadurl);
    };

    $scope.clearNamefilter = function () {
        $scope.nameFilter = {};
        $('.namefilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearTaxNamefilter = function () {
        $scope.taxnamefilter = {};
        $('.taxnamefilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearAmountFilter = function () {
        $scope.amountFilter = {};
        $('.amountFilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearGroupFilter = function () {
        $scope.descriptionFilter = {};
        $('.descriptionFilter').removeClass('filterSelection');
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
        if ($scope.Tax != null && angular.isDefined($scope.Tax) && angular.isDefined($scope.Tax.ContactId)) {
            delete $scope.Tax.ContactId;
        }
    }

    $scope.changeTax = function () {
        if ($scope.taxDetail != null && angular.isDefined($scope.taxDetail) && angular.isDefined($scope.taxDetail.Id)) {
            delete $scope.taxDetail.Id;
        }
        if ($scope.Tax != null && angular.isDefined($scope.Tax) && angular.isDefined($scope.Tax.RecurringTaxId)) {
            delete $scope.Tax.RecurringTaxId;
        }
    }

    $scope.getAll = function (val) {
        return repository.getWebApi(typeaheadurl + '/' + val + '/all');
    };

    $scope.GetTaxes = function (val) {
        var loadurl = typeadhedTax + "&$filter=startswith(TaxName, '" + val + "') &$top=35&$inlinecount=allpages"
        return repository.getTypeAhead(loadurl);
    };

    $scope.exportToPdf = function () {
        //PDF headers
        var dispHead = ['Id', 'Tax Name', 'Name', 'Amount', 'Total Received', 'Balance Amt', 'Date', 'Approved'];

        var taxPdf = [];

        //PDF document configaruations
        var linebreakPos = 33;
        var pdfProperty = {
            cellWidth: 37,
            leftMargin: 0,
            topMargin: 2,
            rowHeight: 12,
            titlefontsize: 18,
            headerfontsize: 10,
            cellfontsize: 6.5,
            recordperpage: 12,
            name: 'TaxCollection.pdf',
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
                title: 'Tax List',
                subject: 'List of contacts',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        var total = 0;
        //Get the data and then generate Pdf
        repository.getTypeAhead(odaturl + $scope.filterCondition).then(function (pdfTax) {

            if (pdfTax != null && !angular.isUndefined(pdfTax)) {
                angular.forEach(pdfTax, function (tax, index) {
                    var pdfTax = {};
                    pdfTax.Id = " " + tax.Id + " ";
                    pdfTax.TaxName = tax.TaxName != null && !angular.isUndefined(tax.TaxName) && tax.TaxName != '' ? formatStringBreaking(tax.TaxName, linebreakPos) : ' ';
                    pdfTax.ContactName = tax.ContactName != null && !angular.isUndefined(tax.ContactName) && tax.ContactName != '' ? formatStringBreaking(tax.ContactName, linebreakPos) : '';
                    pdfTax.Amount = tax.Amount != null && !angular.isUndefined(tax.Amount) && tax.Amount != '' ? ' ' + tax.Amount + ' ' : ' ';
                    pdfTax.ReceivedTotal = ' ' + $scope.getReceived(tax.RecurringTaxId, tax.ContactId) + ' ';
                    pdfTax.Balance = ' ' + $scope.getBalance(tax.RecurringTaxId, tax.ContactId) + ' ';
                    pdfTax.ReceivedDate = tax.ReceivedDate != null && !angular.isUndefined(tax.ReceivedDate) && tax.ReceivedDate != '' ? utilityService.getDateFromOdata(tax.ReceivedDate) : ' ';
                    //pdfTax.Description = tax.Description != null && !angular.isUndefined(tax.Description) && tax.Description != '' ? formatStringBreaking(tax.Description, linebreakPos) : ' ';
                    pdfTax.IsApprove = tax.IsApprove != null && !angular.isUndefined(tax.IsApprove) && tax.IsApprove == true ? 'True' : 'False';
                    taxPdf.push(pdfTax);
                });
            }

            $scope.openPDF(taxPdf, dispHead, pdfProperty);
        });
    }

    $scope.exportToPdfSingle = function (id) {
        var taxPdf = [];

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
            name: 'Taxcollection.pdf',
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
                title: 'Recepit ',
                subject: 'List of contacts',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        //Get the data and then generate Pdf
        repository.getTypeAhead(pdfUrl + '&$filter=(Id eq ' + id + ')').then(function (pdfTax) {
            if (pdfTax != null && !angular.isUndefined(pdfTax) && pdfTax.length > 0) {
                var tax = pdfTax[0];
                taxPdf.push({ Name: "Id", Value: ' ' + tax.Id + ' ' });
                taxPdf.push({ Name: "Tax Name", Value: tax.TaxName != null && !angular.isUndefined(tax.TaxName) && tax.TaxName != '' ? tax.TaxName + ' -  ' + tax.RecurringTaxId : ' ' });
                taxPdf.push({ Name: "Name", Value: tax.ContactName != null && !angular.isUndefined(tax.ContactName) && tax.ContactName != '' ? tax.ContactName : ' ' });
                taxPdf.push({ Name: "Date", Value: tax.ReceivedDate != null && !angular.isUndefined(tax.ReceivedDate) && tax.ReceivedDate != '' ? utilityService.getDateFromOdata(tax.ReceivedDate) : ' ' });
                taxPdf.push({ Name: "Amount", Value: tax.Amount != null && !angular.isUndefined(tax.Amount) && tax.Amount != '' ? ' ' + tax.Amount : ' ' });
                taxPdf.push({ Name: "Total Received", Value: ' ' + $scope.getReceived(tax.RecurringTaxId, tax.ContactId) + ' ' });
                taxPdf.push({ Name: "Balance", Value: ' ' + $scope.getBalance(tax.RecurringTaxId, tax.ContactId) + ' ' });
                taxPdf.push({ Name: "Description", Value: tax.Description != null && !angular.isUndefined(tax.Description) && tax.Description != '' ? tax.Description : ' ' });
                taxPdf.push({ Name: "Approved", Value: tax.IsApprove != null && !angular.isUndefined(tax.IsApprove) && tax.IsApprove ? 'Approved' : 'Not approved' });
                taxPdf.push({ Name: "", Value: "" });
                taxPdf.push({ Name: "Receiver name", Value: " " });

                //if (tax.TaxExcludedMembers != null && angular.isDefined(tax.TaxExcludedMembers) && angular.isObject(tax.TaxExcludedMembers) && tax.TaxExcludedMembers.length > 0) {
                //    var excludedData = [];
                //    angular.forEach(tax.TaxExcludedMembers, function (excluded, index) {
                //        excludedData.push({
                //            Id: ' ' + excluded.Id + '',
                //            Name: excluded.ContactName != null && !angular.isUndefined(excluded.ContactName) && excluded.ContactName != '' ? excluded.ContactName : ' ',
                //            Amount: excluded.Amount != null && !angular.isUndefined(excluded.Amount) ? ' ' + excluded.Amount : ' ',
                //            Reason: excluded.Reason != null && !angular.isUndefined(excluded.Reason) && excluded.Reason != '' ? excluded.Reason : ' ',
                //        });
                //    });
                //    pdfProperty.chidTable = {
                //        title: "Excluded Members List",
                //        data: excludedData
                //    };
                //}

                $scope.openPDF(taxPdf, null, pdfProperty, null);
            }
        });
    }
}

//Helper function
function formatDateString(scope, utilityService)
{
    if (scope.Tax.ReceivedDate != null && angular.isDefined(scope.Tax.ReceivedDate) && scope.Tax.ReceivedDate != '') {
        scope.Tax.ReceivedDate = utilityService.getDate(scope.Tax.ReceivedDate);
    }
}

function formatDateStringinEdit(scope, utilityService) {
    if (scope.Tax.ReceivedDate != null && angular.isDefined(scope.Tax.ReceivedDate) && scope.Tax.ReceivedDate != '') {
        scope.Tax.ReceivedDate = utilityService.formatDate(scope.Tax.ReceivedDate);
    }
}

function setPayerDetails(scope) {
    if (scope.payerDetail != null && angular.isDefined(scope.payerDetail.ContactId) && scope.payerDetail.ContactId != "" && scope.payerDetail.ContactId > 0) {
        scope.Tax.ContactName = scope.payerDetail.Name;
        scope.Tax.ContactId = scope.payerDetail.ContactId;
    }
    else {
        scope.Tax.ContactName = scope.payerDetail;
    }
    if (scope.taxDetail != null && angular.isDefined(scope.taxDetail) && angular.isDefined(scope.taxDetail.Id) && scope.taxDetail.Id > 0) {
        scope.Tax.TaxName = scope.taxDetail.TaxName;
        scope.Tax.RecurringTaxId = scope.taxDetail.Id;
    }
    else {
        scope.Tax.ContactName = scope.payerDetail;
    }

}

function getPayerDetails(scope) {
    scope.payerDetail = {};
    scope.taxDetail = {};
    if (scope.Tax.ContactId != null && angular.isDefined(scope.Tax.ContactId) && scope.Tax.ContactId != "" && scope.Tax.ContactId > 0) {
        scope.payerDetail.Name = scope.Tax.ContactName;
        scope.payerDetail.ContactId = scope.Tax.ContactId;
    }
    else {
        scope.payerDetail = scope.Tax.ContactName;
    }

    if (scope.Tax.RecurringTaxId != null && angular.isDefined(scope.Tax.RecurringTaxId) && scope.Tax.RecurringTaxId != "" && scope.Tax.RecurringTaxId > 0) {
        scope.taxDetail.TaxName = scope.Tax.TaxName;
        scope.taxDetail.Id = scope.Tax.RecurringTaxId;
    }
    else {
        scope.taxDetail = scope.Tax.TaxName;
    }
}
