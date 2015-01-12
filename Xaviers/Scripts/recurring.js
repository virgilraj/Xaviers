var url = '/api/RecurringTax';
var odaturl = '/odata/OdataRecurringTax?$orderby=StartDate desc';
var typeaheadurl = "/api/Contacts";
var pdfUrl = "/odata/OdataRecurringTax?$orderby=StartDate desc"
function taxCtrl($scope, repository, $http, utilityService) {
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
    $scope.isUpdate = false;
    $scope.isView = false;
    $scope.name = ''; // This will hold the selected item
    $scope.filterCondition = '';
    $scope.daydatepicker = new Date().getDate();

    $scope.amount = 'F';

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = pagesize;
    $scope.itemsPerPage = 25;

    $scope.ExcludedMembers = [];
    $scope.TaxTotalAmount = [];
    $scope.OldName = '';
    $scope.IsSA = rle == 'SA';

    $scope.addTax = function () {
        $scope.amount = 'F';
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = false;
        $scope.Excluded = null;
        $scope.payerDetail = null;
        $scope.isView = false;
    }
    $scope.showTax = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = true;
    }
    $scope.pageChange = function (pageno) {
        $scope.load(pageno);
    }

    $scope.addExcludedMember = function()
    {
        if ($scope.Tax == null || angular.isUndefined($scope.Tax) || !angular.isObject($scope.Tax) || angular.isUndefined($scope.Tax.TaxName) || angular.isUndefined($scope.Tax.StartDate)
            || $scope.Tax.TaxName == '' || $scope.Tax.StartDate == '') {
            alert("Please enter tax details first");
            return false;
        }
        if ($scope.Excluded != null && angular.isDefined($scope.Excluded) && angular.isObject($scope.Excluded) && $scope.Excluded.payerDetail != null && angular.isDefined($scope.Excluded.payerDetail.ContactId)
            && $scope.Excluded.payerDetail.ContactId != "" && $scope.Excluded.payerDetail.ContactId > 0 && angular.isDefined($scope.Excluded.Amount) && $scope.Excluded.Amount !='') {
            var members = $.grep($scope.ExcludedMembers, function (member) { return (member.ContactId == $scope.Excluded.payerDetail.ContactId) });
            if (members != null && angular.isDefined(members) && angular.isObject(members) && members.length > 0)
            {
                alert("Member already added. Please select different member");
                return false;
            }

            $scope.ExcludedMembers.push({
                TaxId: $scope.isUpdate && $scope.Tax != null && angular.isDefined($scope.Tax) && angular.isDefined($scope.Tax.TaxId) && $scope.Tax.TaxId > 0 ? $scope.Tax.TaxId : 0,
                ContactId: $scope.Excluded.payerDetail.ContactId,
                ContactName: $scope.Excluded.payerDetail.Name, Amount: $scope.Excluded.Amount,
                Reason: $scope.Excluded.Reason
            });

            $scope.Excluded = null;
        } else {
            alert("Please select member from dropdow and enter amount");
            return false;
        }

    }

    $scope.deleteExcludedMembers = function(id)
    {
        var members = null;
        if (id > 0) {
            members = $.grep($scope.ExcludedMembers, function (member) { return (member.ContactId != id) });
        }

        if (members != null && angular.isDefined(members) && angular.isObject(members))
        {
            $scope.ExcludedMembers = members;
        }
    }

    $scope.getTotal = function (id, typ) {
        var taxTot = 0;
        if (id > 0 && angular.isDefined($scope.TaxTotalAmount) && $scope.TaxTotalAmount.length > 0) {
            var tot = $.grep($scope.TaxTotalAmount, function (tax) { return (tax.TaxId == id) });
            if (tot != null && angular.isDefined(tot) && tot.length > 0) {
                if (typ == 'tot') {
                    taxTot = tot[0].ExceptedAmount;
                }else if(typ == 'rec')
                {
                    taxTot = tot[0].TotalReceivedAmount;
                }else if(typ == 'bal')
                {
                    taxTot = tot[0].BalanceAmount;
                }
            }
        }
        return taxTot;
    }

    
    $scope.load = function (pageno) {
        var skipnum = parseInt($scope.itemsPerPage) * parseInt(pageno - 1);
        var loadurl = odaturl + "&$skip=" + skipnum + "&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
        repository.get(function (results) {
            if (!angular.isObject(results.value)) {
                $window.location.reload();
            }
            $scope.totalItems = parseInt(results["odata.count"]);
            //$scope.taxs = results.value;
            var taxids = '';
            if (results.value != null && angular.isDefined(results.value) && angular.isObject(results.value) && results.value.length > 0) {
                angular.forEach(results.value, function (dta, index) {
                    //taxids += taxids != '' ? ',' + dta.Id : dta.Id;
                    taxids += ',' + dta.Id;
                });
            }
            if (taxids != '') {
                var taxAmt = repository.getWebApi(url + '/' + taxids).then(function (taxAmount) {
                    $scope.TaxTotalAmount = taxAmount;
                    $scope.taxs = results.value;
                });
            }
        }, loadurl);

    }

    $scope.reset = function () {
        $scope.amount = 'F';
        $scope.Tax = null;
    }

    $scope.view = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.Tax = results;
            formatDateStringinEdit($scope, utilityService);

        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = true;
    }

    $scope.edit = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.Tax = results;
            formatDateStringinEdit($scope, utilityService);
            $scope.OldName = $scope.Tax.TaxName;
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = false;
    }

    $scope.delete = function (id) {
        var isdelete = confirm("Do you want to delete this tax?");
        if (!isdelete) { return false; }
        var deleteurl = url + '/' + id;
        repository.delete(function (res) {
            if (angular.isObject(res) && angular.isDefined(res) && angular.isDefined(res.content) && res.content == 'USED') {
                alert('Tax can not be deleted since used in collection module');
                return false;
            }
            alert('Record deleted successfully');
            $scope.load($scope.currentPage);
        }, deleteurl);
    }

    $scope.save = function (myForm, isApprove) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
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
        if ($scope.Tax != null && angular.isDefined($scope.Tax.Id) && $scope.Tax.Id > 0) {
            var updateurl = url + '/' + $scope.Tax.Id;
            $scope.Tax.IsApprove = isApprove;
            formatDateString($scope, utilityService);
            $scope.Tax.IsNameChanged = !($scope.OldName == $scope.Tax.TaxName);
            repository.update(function () {
                alert('Record updated successfully');
                $scope.load(0);
            }, $scope.Tax, updateurl);

        }
        else {
            alert("Invalid information for edit contact")
        }
    }

    $scope.getAmount = function(obj)
    {
        
        if(obj !=null && angular.isObject(obj))
        {
            if(obj.TaxAmount !=null && obj.TaxAmount > 0)
            {
                return "Amount: " + obj.TaxAmount;
            }
            else if (obj.TaxPercentBaseIncome != null && obj.TaxPercentBaseIncome > 0) {
                return "Percentage: " + obj.TaxPercentBaseIncome + "%";
            }
            if (obj.TaxNoOfDaysIncome != null && obj.TaxNoOfDaysIncome > 0) {
                return "No. of Days: " + obj.TaxNoOfDaysIncome;
            }
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
        var date1Con = '';
        if ($scope.Filter != null && angular.isDefined($scope.Filter)) {
            if (angular.isDefined($scope.Filter.Name) && $scope.Filter.Name != '') {
                nameCon = "(startswith(TaxName, '" + $scope.Filter.Name + "'))";
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
                    dateCon = "(StartDate ge datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "' and StartDate le datetime'" + utilityService.setSearchDate($scope.Filter.TDate) + "')";
                }
                else {
                    dateCon = "(StartDate eq datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "')"
                }
                dateCon = nameCon != '' || amountCon != '' || groupCon != '' ? " and " + dateCon : dateCon;
            }

            if (angular.isDefined($scope.Filter.FEDate) && $scope.Filter.FEDate != '') {
                if (isNaN(Date.parse(utilityService.setSearchDate($scope.Filter.FEDate)))) {
                    alert('Please enter valid date');
                    return false;
                }
                if (angular.isDefined($scope.Filter.TEDate) && $scope.Filter.TEDate != '') {
                    if (isNaN(Date.parse(utilityService.setSearchDate($scope.Filter.TEDate)))) {
                        alert('Please enter valid date');
                        return false;
                    }
                    date1Con = "(EndDate ge datetime'" + utilityService.setSearchDate($scope.Filter.FEDate) + "' and EndDate le datetime'" + utilityService.setSearchDate($scope.Filter.TEDate) + "')";
                }
                else {
                    date1Con = "(EndDate eq datetime'" + utilityService.setSearchDate($scope.Filter.FEDate) + "')"
                }
                date1Con = nameCon != '' || dateCon != '' || groupCon != '' ? " and " + date1Con : date1Con;
            }



            if (nameCon != '' || amountCon != '' || groupCon != '' || dateCon != '' || date1Con != '') {
                condition = "&$filter=(" + nameCon + amountCon + groupCon + dateCon + date1Con + ")";
            }

            $scope.filterCondition = condition;

            var loadurl = odaturl + condition + "&$skip=0&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
            repository.get(function (results) {
                if (!angular.isObject(results.value)) {
                    $window.location.reload();
                }
                //$scope.taxs = results.value;
                $scope.totalItems = parseInt(results["odata.count"]);
                var taxids = '';
                if (results.value != null && angular.isDefined(results.value) && angular.isObject(results.value) && results.value.length > 0) {
                    angular.forEach(results.value, function (dta, index) {
                        //taxids += taxids != '' ? ',' + dta.Id : dta.Id;
                        taxids += ',' + dta.Id;
                    });
                }
                if (taxids != '') {
                    var taxAmt = repository.getWebApi(url + '/' + taxids).then(function (taxAmount) {
                        $scope.TaxTotalAmount = taxAmount;
                        $scope.taxs = results.value;
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
            nameCon = nameCon.replace(/\plc/g, "TaxName");
            $('.namefilter').addClass('filterSelection');
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

        if (angular.isDefined($scope.endDateFilter) && angular.isDefined($scope.endDateFilter.Text) && $scope.endDateFilter.Text != '') {
            if (isNaN(Date.parse(utilityService.setSearchDate($scope.endDateFilter.Text)))) {
                alert('Please enter valid date');
                return false;
            }
            var options = '';
            if (angular.isUndefined($scope.endDateFilter.Options)) {
                //set default value
                options = numDateSearch[0].value;
            }
            else {
                options = $scope.endDateFilter.Options;
            }

            if (angular.isDefined($scope.endDateFilter) && angular.isDefined($scope.endDateFilter.Text1) && $scope.endDateFilter.Text1 != '') {
                if (isNaN(Date.parse(utilityService.setSearchDate($scope.endDateFilter.Text1)))) {
                    alert('Please enter valid date');
                    return false;
                }
                groupCon = "(EndDate ge datetime'" + utilityService.setSearchDate($scope.endDateFilter.Text) + "' and EndDate le datetime'" + utilityService.setSearchDate($scope.endDateFilter.Text1) + "')";
            }
            else {
                groupCon = options.replace(/\plcholder/g, "datetime'" + utilityService.setSearchDate($scope.endDateFilter.Text) + "'");
                groupCon = groupCon.replace(/\plc/g, "EndDate");
            }
            groupCon = nameCon != '' || amountCon != '' ? " and " + groupCon : groupCon;
            $('.dateFilter').addClass('filterSelection');
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
            //$scope.taxs = results.value;
            $scope.totalItems = parseInt(results["odata.count"]);
            var taxids = '';
            if (results.value != null && angular.isDefined(results.value) && angular.isObject(results.value) && results.value.length > 0) {
                angular.forEach(results.value, function (dta, index) {
                    //taxids += taxids != '' ? ',' + dta.Id : dta.Id;
                    taxids += ',' + dta.Id;
                });
            }
            if (taxids != '') {
                var taxAmt = repository.getWebApi(url + '/' + taxids).then(function (taxAmount) {
                    $scope.TaxTotalAmount = taxAmount;
                    $scope.taxs = results.value;
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
    $scope.clearendDateFilter = function () {
        $scope.endDateFilter = {};
        $('.endDateFilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearDatefilter = function () {
        $scope.dateFilter = {};
        $('.dateFilter').removeClass('filterSelection');
        $scope.filter();
    }

    

    
    $scope.pendingAndreceivedList = function (typ, id, name) {
        //PDF headers
        var dispHead = ['Name', 'Received Amt', 'Balance Amt', 'Payment Mode'];

        var taxPdf = [];

        //PDF document configaruations
        var linebreakPos = 35;
        var pdfProperty = {
            cellWidth: 40,
            leftMargin: 0,
            topMargin: 2,
            rowHeight: 12,
            titlefontsize: 18,
            headerfontsize: 10,
            cellfontsize: 6.5,
            recordperpage: 12,
            name: 'Tax.pdf',
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
                title: name,
                subject: 'List of contacts',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        var total = 0;
        //Get the data and then generate Pdf
        repository.getWebApi(url + '/' + id + '/' + typ).then(function (pdfTax) {

            if (pdfTax != null && !angular.isUndefined(pdfTax) && pdfTax.length > 0) {
                angular.forEach(pdfTax, function (tax, index) {
                    var pdfTax = {};
                    pdfTax.Name = tax.ContactName != null && !angular.isUndefined(tax.ContactName) && tax.ContactName != '' ? formatStringBreaking(tax.ContactName, linebreakPos) + '.' : '';
                    //pdfTax.TaxAmount = tax.TaxAmount != null && !angular.isUndefined(tax.TaxAmount) && tax.TaxAmount != '' ? ' ' + tax.TaxAmount + ' ' : '0';
                    pdfTax.TotalReceivedAmount = tax.TotalReceivedAmount != null && !angular.isUndefined(tax.TotalReceivedAmount) && tax.TotalReceivedAmount != '' ? ' ' + tax.TotalReceivedAmount + ' ' : '0';
                    pdfTax.BalanceAmount = tax.BalanceAmount != null && !angular.isUndefined(tax.BalanceAmount) && tax.BalanceAmount != '' ? ' ' + tax.BalanceAmount + ' ' : '0';
                    pdfTax.PayType = " ";
                    if (tax.PayType != null && !angular.isUndefined(tax.PayType) && tax.PayType != '')
                    {
                        if (tax.PayType == "M")
                            pdfTax.PayType = "Monthly";
                        if (tax.PayType == "Y")
                            pdfTax.PayType = "Yearly";
                        if (tax.PayType = "L")
                            pdfTax.PayType = "Lifetime";
                    }
                    taxPdf.push(pdfTax);
                });

                //pdfProperty.splField = "Total : " + total;

                $scope.openPDF(taxPdf, dispHead, pdfProperty);
            }
            else
            {
                alert('No records found');
                return false;
            }
        });
    }


    $scope.exportToPdf = function () {
        //PDF headers
        var dispHead = ['Id', 'Tax Name', 'Description', 'Start Date','End Date', 'Monthly', 'Yearly', 'Lifetime', 'Approved', 'Received Amt', 'Balance Amt'];

        var taxPdf = [];

        //PDF document configaruations
        var linebreakPos = 30;
        var pdfProperty = {
            cellWidth: 27,
            leftMargin: 0,
            topMargin: 2,
            rowHeight: 12,
            titlefontsize: 20,
            headerfontsize: 10,
            cellfontsize: 6.5,
            recordperpage: 12,
            name: 'Tax.pdf',
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
                    pdfTax.TaxName = tax.TaxName != null && !angular.isUndefined(tax.TaxName) && tax.TaxName != '' ? formatStringBreaking(tax.TaxName, linebreakPos) + '' : '';
                    pdfTax.Description = tax.Description != null && !angular.isUndefined(tax.Description) && tax.Description != '' ? formatStringBreaking(tax.Description, linebreakPos) : ' ';
                    pdfTax.StartDate = tax.StartDate != null && !angular.isUndefined(tax.StartDate) && tax.StartDate != '' ? utilityService.getDateFromOdata(tax.StartDate) : ' ';
                    pdfTax.EndDate = tax.EndDate != null && !angular.isUndefined(tax.EndDate) && tax.EndDate != '' ? utilityService.getDateFromOdata(tax.EndDate) : ' ';
                    pdfTax.MonthlyAmount = tax.MonthlyAmount != null && !angular.isUndefined(tax.MonthlyAmount) && tax.MonthlyAmount > 0 ? tax.MonthlyAmount + ' ' : ' ';
                    pdfTax.YearlyAmount = tax.YearlyAmount != null && !angular.isUndefined(tax.YearlyAmount) && tax.YearlyAmount > 0 ? tax.YearlyAmount + ' ' : ' ';
                    pdfTax.LifetimeAmount = tax.LifetimeAmount != null && !angular.isUndefined(tax.LifetimeAmount) && tax.LifetimeAmount > 0 ? tax.LifetimeAmount + ' ' : ' ';
                    pdfTax.IsApprove = tax.IsApprove != null && !angular.isUndefined(tax.IsApprove) && tax.IsApprove == true ? 'True' : 'False';
                    pdfTax.TotalReceivedAmount = ' ' + $scope.getTotal(tax.Id, 'rec') + ' ';
                    pdfTax.BalanceAmount = ' ' + $scope.getTotal(tax.Id, 'bal') + ' ';
                    //total += parseFloat(tax.Amount);
                    taxPdf.push(pdfTax);
                });
            }
            //pdfProperty.splField = "Total : " + total;

            $scope.openPDF(taxPdf, dispHead, pdfProperty);
        });
    }

    $scope.exportToPdfSingle = function (id) {
        var taxPdf = [];

        //PDF document configaruations
        var linebreakPos = 28;
        var pdfProperty = {
            cellWidth: 70,
            leftMargin: 0,
            topMargin: 1,
            rowHeight: 10,
            titlefontsize: 18,
            headerfontsize: 13,
            cellfontsize: 9,
            recordperpage: 15,
            name: 'Tax.pdf',
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
                title: 'Tax',
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
                taxPdf.push({ Name: "Name", Value: tax.TaxName != null && !angular.isUndefined(tax.TaxName) && tax.TaxName != '' ? tax.TaxName : ' ' });
                
                taxPdf.push({ Name: "Start Date", Value: tax.StartDate != null && !angular.isUndefined(tax.StartDate) && tax.StartDate != '' ? utilityService.getDateFromOdata(tax.StartDate) : ' ' });
                taxPdf.push({ Name: "Description", Value: tax.Description != null && !angular.isUndefined(tax.Description) && tax.Description != '' ? tax.Description : ' ' });
                taxPdf.push({ Name: "Approved", Value: tax.IsApprove != null && !angular.isUndefined(tax.IsApprove) && tax.IsApprove ? 'Approved' : 'Not approved' });
                taxPdf.push({ Name: "Received Amount", Value: ' ' + $scope.getTotal(tax.Id, 'rec') + ' ' });
                taxPdf.push({ Name: "Balance Amount", Value: ' ' + $scope.getTotal(tax.Id, 'bal') + ' ' });
                var paytyp = ' ';
                if (tax.PayType != null && !angular.isUndefined(tax.PayType) && tax.PayType != '') {
                    if (tax.PayType == "M")
                        paytyp = "Monthly";
                    if (tax.PayType == "Y")
                        paytyp = "Yearly";
                    if (tax.PayType == "L")
                        paytyp = "Lifetime";
                }
                taxPdf.push({ Name: "Payment Mode", Value: paytyp });

                $scope.openPDF(taxPdf, null, pdfProperty, null);
            }
        });
    }
}

//Helper function
function formatDateString(scope, utilityService)
{
    if (scope.Tax.StartDate != null && angular.isDefined(scope.Tax.StartDate) && scope.Tax.StartDate != '') {
        scope.Tax.StartDate = utilityService.getDate(scope.Tax.StartDate);
    }

    if (scope.Tax.EndDate != null && angular.isDefined(scope.Tax.EndDate) && scope.Tax.EndDate != '') {
        scope.Tax.EndDate = utilityService.getDate(scope.Tax.EndDate);
    }
}

function formatDateStringinEdit(scope, utilityService) {
    if (scope.Tax.StartDate != null && angular.isDefined(scope.Tax.StartDate) && scope.Tax.StartDate != '') {
        scope.Tax.StartDate = utilityService.formatDate(scope.Tax.StartDate);
    }

    if (scope.Tax.EndDate != null && angular.isDefined(scope.Tax.EndDate) && scope.Tax.EndDate != '') {
        scope.Tax.EndDate = utilityService.formatDate(scope.Tax.EndDate);
    }
}

function setMember(scope)
{
    if (scope != null && angular.isDefined(scope) && scope.length > 0)
    {
        angular.forEach(scope, function (member, index) {
            if (member.payerDetail != null && angular.isDefined(member.payerDetail.ContactId) && member.payerDetail.ContactId != "" && member.payerDetail.ContactId > 0) {
                member.ContactName = scope.payerDetail.Name;
                member.ContactId = scope.payerDetail.ContactId;
            }
            else {
                member.ContactName = scope.payerDetail;
            }
        });
    }
}

function getMember(scope) {
    scope.payerDetail = {};
    if (scope != null && angular.isDefined(scope) && scope.length > 0) {
        angular.forEach(scope, function (member, index) {
            if (member.ContactId != null && angular.isDefined(member.ContactId) && member.ContactId != "" && member.ContactId > 0) {
                scope.payerDetail.Name = member.ContactName;
                scope.payerDetail.ContactId = member.ContactId;
            }
            else {
                scope.payerDetail = member.ContactName;
            }

        });
    }
}
