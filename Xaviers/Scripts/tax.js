var url = '/api/Tax';
var odaturl = '/odata/TaxOdata?$select=Id,TaxName,Description,StartDate,TaxAmount,TaxPercentBaseIncome,TaxNoOfDaysIncome,IsApprove&$orderby=StartDate desc';
var typeaheadurl = "/api/Contacts";
var pdfUrl = "/odata/TaxOdata?$expand=TaxExcludedMembers&$orderby=StartDate desc"
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
    $scope.amountText = 'Enter tax amount';

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

    $scope.changeAmountField = function () {
        if ($scope.amount == 'F') {
            $scope.amountText = 'Enter tax amount';
        } else if ($scope.amount == 'D') {
            $scope.amountText = 'Enter number of days';
        }
        else if ($scope.amount == 'P') {
            $scope.amountText = 'Enter tax percentage';
        }
    }

    $scope.addExcludedMember = function()
    {
        if ($scope.Tax == null || angular.isUndefined($scope.Tax) || !angular.isObject($scope.Tax) || angular.isUndefined($scope.Tax.TaxName) || angular.isUndefined($scope.Tax.StartDate)
            || $scope.Tax.TaxName == '' || $scope.Tax.StartDate == '') {
            alert("Please enter tax details first");
            return false;
        }
        if ($scope.Excluded != null && angular.isDefined($scope.Excluded) && angular.isObject($scope.Excluded) && $scope.Excluded.payerDetail != null && angular.isDefined($scope.Excluded.payerDetail.ContactId)
            && $scope.Excluded.payerDetail.ContactId != "" && $scope.Excluded.payerDetail.ContactId > 0 ) {
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
            alert("Please select member from dropdow");
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
            $scope.ExcludedMembers = $scope.Tax.TaxExcludedMembers != null && angular.isDefined($scope.Tax.TaxExcludedMembers) && angular.isObject($scope.Tax.TaxExcludedMembers) ? $scope.Tax.TaxExcludedMembers : [];
            //getMember($scope.Tax.ExcludedMembers);
            if ($scope.Tax.TaxAmount != null && $scope.Tax.TaxAmount > 0) {
                $scope.amount = "F"
                $scope.Tax.Amount = $scope.Tax.TaxAmount;
            }
            else if ($scope.Tax.TaxPercentBaseIncome != null && $scope.Tax.TaxPercentBaseIncome > 0) {
                $scope.amount = "P"
                $scope.Tax.Amount = $scope.Tax.TaxPercentBaseIncome;
            }
            else if ($scope.Tax.TaxNoOfDaysIncome != null && $scope.Tax.TaxNoOfDaysIncome > 0) {
                $scope.amount = "D"
                $scope.Tax.Amount = $scope.Tax.TaxNoOfDaysIncome;
            }

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
            $scope.ExcludedMembers = $scope.Tax.TaxExcludedMembers != null && angular.isDefined($scope.Tax.TaxExcludedMembers) && angular.isObject($scope.Tax.TaxExcludedMembers) ? $scope.Tax.TaxExcludedMembers : [];
            //getMember($scope.Tax.ExcludedMembers);
            if ($scope.Tax.TaxAmount != null && $scope.Tax.TaxAmount > 0)
            {
                $scope.amount = "F"
                $scope.Tax.Amount = $scope.Tax.TaxAmount;
            }
            else if ($scope.Tax.TaxPercentBaseIncome != null && $scope.Tax.TaxPercentBaseIncome > 0)
            {
                $scope.amount = "P"
                $scope.Tax.Amount = $scope.Tax.TaxPercentBaseIncome;
            }
            else if ($scope.Tax.TaxNoOfDaysIncome != null && $scope.Tax.TaxNoOfDaysIncome > 0) {
                $scope.amount = "D"
                $scope.Tax.Amount = $scope.Tax.TaxNoOfDaysIncome;
            }
            
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
                alert('Tax can not be deleted since used in tax collection module');
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
        $scope.Tax.TaxExcludedMembers = [];
        $scope.Tax.TaxExcludedMembers = angular.isDefined($scope.ExcludedMembers) && angular.isObject($scope.ExcludedMembers) && $scope.ExcludedMembers.length > 0 ? $scope.ExcludedMembers : [];
        //setMember($scope.Excluded);
        if ($scope.amount == "F") {
            $scope.Tax.TaxAmount = $scope.Tax.Amount;
            $scope.Tax.TaxPercentBaseIncome = 0;
            $scope.Tax.TaxNoOfDaysIncome = 0;
        }
        else if ($scope.amount == "P") {
            if ($scope.Tax.Amount > 100)
            {
                alert("Tax percentage should be less than 100");
                return false;
            }
            $scope.Tax.TaxAmount = 0;
            $scope.Tax.TaxPercentBaseIncome = $scope.Tax.Amount;
            $scope.Tax.TaxNoOfDaysIncome = 0;
        }
        else if ($scope.amount == "D") {
            $scope.Tax.TaxAmount = 0;
            $scope.Tax.TaxPercentBaseIncome =0;
            $scope.Tax.TaxNoOfDaysIncome = $scope.Tax.Amount;
        }

        repository.insert(function () {
            alert('Record saved successfully');
            $scope.load(0);
            $scope.isList = true;
            $scope.Tax = null;
        }, $scope.Tax,
         function (resp) {
             //if (resp != null && angular.isDefined(resp) && angular.isDefined(resp.data)) {
             //    $scope.uploadFile(resp.data.ContactId);
             //}
         });
    }

    $scope.update = function (myForm, isApprove) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        if ($scope.Tax != null && angular.isDefined($scope.Tax.Id) && $scope.Tax.Id > 0) {
            var updateurl = url + '/' + $scope.Tax.Id;
            $scope.Tax.IsApprove = isApprove;
            formatDateString($scope, utilityService);
            $scope.Tax.TaxExcludedMembers = [];
            $scope.Tax.IsNameChanged = !($scope.OldName == $scope.Tax.TaxName);
            $scope.Tax.TaxExcludedMembers = angular.isDefined($scope.ExcludedMembers) && angular.isObject($scope.ExcludedMembers) && $scope.ExcludedMembers.length > 0 ? $scope.ExcludedMembers : [];
            //setMember($scope.Excluded);
            if ($scope.amount == "F") {
                $scope.Tax.TaxAmount = $scope.Tax.Amount;
                $scope.Tax.TaxPercentBaseIncome = 0;
                $scope.Tax.TaxNoOfDaysIncome = 0;
            }
            else if ($scope.amount == "P") {
                $scope.Tax.TaxAmount = 0;
                $scope.Tax.TaxPercentBaseIncome = $scope.Tax.Amount;
                $scope.Tax.TaxNoOfDaysIncome = 0;
            }
            else if ($scope.amount == "D") {
                $scope.Tax.TaxAmount = 0;
                $scope.Tax.TaxPercentBaseIncome = 0;
                $scope.Tax.TaxNoOfDaysIncome = $scope.Tax.Amount;
            }
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
        if ($scope.Filter != null && angular.isDefined($scope.Filter)) {
            if (angular.isDefined($scope.Filter.Name) && $scope.Filter.Name != '') {
                nameCon = "(startswith(TaxName, '" + $scope.Filter.Name + "'))";
            }
            if (angular.isDefined($scope.Filter.Amount) && $scope.Filter.Amount != '') {
                amountCon = "(TaxAmount eq " + $scope.Filter.Amount + " or TaxNoOfDaysIncome eq " + $scope.Filter.Amount + " or TaxPercentBaseIncome eq " + $scope.Filter.Amount + ")";
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
                    dateCon = "(StartDate ge datetime'" + utilityService.setSearchDate($scope.Filter.FDate) + "' and StartDate le datetime'" + utilityService.setSearchDate($scope.Filter.TDate) + "')";
                }
                else {
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

        if (angular.isDefined($scope.amountFilter) && angular.isDefined($scope.amountFilter.Text) && $scope.amountFilter.Text != '') {
            var options = '';
            if (angular.isUndefined($scope.amountFilter.Options)) {
                //set default value
                options = numDateSearch1[0].value;
            }
            else {
                options = $scope.amountFilter.Options;
            }
            amountCon = options.replace(/\plcholder/g, "" + $scope.amountFilter.Text + "");
            amountCon = amountCon.replace(/\plc2/g, "TaxAmount").replace(/\plc1/g, "TaxNoOfDaysIncome").replace(/\plc/g, "TaxPercentBaseIncome");;
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
            groupCon = nameCon != '' || amountCon != '' || dateCon != '' ? " and " + groupCon : groupCon;
            $('.descriptionFilter').addClass('filterSelection');
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

    $scope.getAll = function (val) {
        return repository.getWebApi(typeaheadurl + '/' + val + '/all');
    };

    $scope.Group = function (val) {
        var loadurl = typeaheadGroupurl + "&$filter=startswith(GroupName, '" + val + "') &$top=35&$inlinecount=allpages"
        return repository.getTypeAhead(loadurl);
    };

    $scope.pendingAndreceivedList = function (typ, id, name) {
        //PDF headers
        var dispHead = ['Name', 'Amount', 'Received Amt', 'Balance Amt'];

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
                    pdfTax.TaxAmount = tax.TaxAmount != null && !angular.isUndefined(tax.TaxAmount) && tax.TaxAmount != '' ? ' ' + tax.TaxAmount + ' ' : '0';
                    pdfTax.TotalReceivedAmount = tax.TotalReceivedAmount != null && !angular.isUndefined(tax.TotalReceivedAmount) && tax.TotalReceivedAmount != '' ? ' ' + tax.TotalReceivedAmount + ' ' : '0';
                    pdfTax.BalanceAmount = tax.BalanceAmount != null && !angular.isUndefined(tax.BalanceAmount) && tax.BalanceAmount != '' ? ' ' + tax.BalanceAmount + ' ' : '0';

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
        var dispHead = ['Id', 'Tax Name', 'Description', 'Start Date', 'Approved', 'Amount', 'Excepted Amount', 'Received Amt', 'Balance Amt'];

        var taxPdf = [];

        //PDF document configaruations
        var linebreakPos = 35;
        var pdfProperty = {
            cellWidth: 33,
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
                    pdfTax.IsApprove = tax.IsApprove != null && !angular.isUndefined(tax.IsApprove) && tax.IsApprove == true ? 'True' : 'False';
                    pdfTax.Amount = $scope.getAmount(tax);
                    pdfTax.ExceptedAmount = ' ' + $scope.getTotal(tax.Id, 'tot') + ' ';
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
                taxPdf.push({ Name: "Amount", Value: $scope.getAmount(tax) });
                taxPdf.push({ Name: "Excepted Amount", Value: ' ' + $scope.getTotal(tax.Id, 'tot') + ' ' });
                taxPdf.push({ Name: "Received Amount", Value: ' ' + $scope.getTotal(tax.Id, 'rec') + ' ' });
                taxPdf.push({ Name: "Balance Amount", Value: ' ' + $scope.getTotal(tax.Id, 'bal') + ' ' });
                taxPdf.push({ Name: "", Value: "" });
                if (tax.TaxExcludedMembers != null && angular.isDefined(tax.TaxExcludedMembers) && angular.isObject(tax.TaxExcludedMembers) && tax.TaxExcludedMembers.length > 0) {
                    var excludedData = [];
                    excludedData.push({
                        Id: 'Id',
                        Name: 'Name',
                        Reason: 'Reason'
                    });
                    angular.forEach(tax.TaxExcludedMembers, function (excluded, index) {
                        excludedData.push({
                            Id: ' ' + excluded.Id + '',
                            Name: excluded.ContactName != null && !angular.isUndefined(excluded.ContactName) && excluded.ContactName != '' ? excluded.ContactName : ' ',
                            Reason: excluded.Reason != null && !angular.isUndefined(excluded.Reason) && excluded.Reason != '' ? excluded.Reason : ' ',
                        });
                    });
                    pdfProperty.chidTable = {
                        title: "Excluded Members List",
                        data: excludedData
                    };
                }

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
}

function formatDateStringinEdit(scope, utilityService) {
    if (scope.Tax.StartDate != null && angular.isDefined(scope.Tax.StartDate) && scope.Tax.StartDate != '') {
        scope.Tax.StartDate = utilityService.formatDate(scope.Tax.StartDate);
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
