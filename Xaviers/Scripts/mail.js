var url = '/api/MailGroup';
var odaturl = '/odata/OdataMailGroup?&$filter=startswith(GroupName,\'plcholder\')';
var typeaheadurl = "/api/Contacts";
var pdfUrl = "/odata/OdataMailGroup?$expand=MailContacts"
function mailCtrl($scope, repository, $http, utilityService) {
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

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = pagesize;
    $scope.itemsPerPage = 25;

    $scope.MailContacts = [];
    $scope.TaxTotalAmount = [];
    $scope.OldName = '';
    $scope.IsSA = rle == 'SA';

    $scope.addMailGroup = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = false;
        $scope.Excluded = null;
        $scope.payerDetail = null;
        $scope.isView = false;
        $scope.MailGroup = null;
        $scope.MailContacts = [];
    }
    $scope.showMailGroup = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = true;
    }
    $scope.pageChange = function (pageno) {
        $scope.load(pageno);
    }

    $scope.addContacts = function ()
    {
        if ($scope.MailGroup == null || angular.isUndefined($scope.MailGroup) || !angular.isObject($scope.MailGroup) || angular.isUndefined($scope.MailGroup.GroupName) ) {
            alert("Please enter group name first");
            return false;
        }
        if ($scope.Excluded != null && angular.isDefined($scope.Excluded) && angular.isObject($scope.Excluded) && $scope.Excluded.payerDetail != null && angular.isDefined($scope.Excluded.payerDetail.ContactId)
            && $scope.Excluded.payerDetail.ContactId != "" && $scope.Excluded.payerDetail.ContactId > 0 ) {
            var members = $.grep($scope.MailContacts, function (member) { return (member.ContactId == $scope.Excluded.payerDetail.ContactId) });
            if (members != null && angular.isDefined(members) && angular.isObject(members) && members.length > 0)
            {
                alert("Contact already added. Please select different contact");
                return false;
            }

            $scope.MailContacts.push({
                MailGroupId: $scope.isUpdate && $scope.Tax != null && angular.isDefined($scope.Tax) && angular.isDefined($scope.Tax.MailGroupId) && $scope.Tax.MailGroupId > 0 ? $scope.Tax.MailGroupId : 0,
                ContactId: $scope.Excluded.payerDetail.ContactId,
                ContactName: $scope.Excluded.payerDetail.Name,
                Email: $scope.Excluded.payerDetail.Email
            });

            $scope.Excluded = null;
        } else {
            alert("Please select member from dropdow");
            return false;
        }

    }

    $scope.deleteContacts = function (id)
    {
        var members = null;
        if (id > 0) {
            members = $.grep($scope.MailContacts, function (member) { return (member.ContactId != id) });
        }

        if (members != null && angular.isDefined(members) && angular.isObject(members))
        {
            $scope.MailContacts = members;
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
            $scope.mailgroups = results.value;
        }, loadurl);

    }

    $scope.reset = function () {
        $scope.GroupName = null;
    }

    $scope.view = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.MailGroup = results;
            $scope.MailContacts = $scope.MailGroup.MailContacts != null && angular.isDefined($scope.MailGroup.MailContacts) && angular.isObject($scope.MailGroup.MailContacts) ? $scope.MailGroup.MailContacts : [];
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
            $scope.MailGroup = results;
            $scope.MailContacts = $scope.MailGroup.MailContacts != null && angular.isDefined($scope.MailGroup.MailContacts) && angular.isObject($scope.MailGroup.MailContacts) ? $scope.MailGroup.MailContacts : [];
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = false;
    }

    $scope.delete = function (id) {
        var isdelete = confirm("Do you want to delete this mail group?");
        if (!isdelete) { return false; }
        var deleteurl = url + '/' + id;
        repository.delete(function (res) {
            if (angular.isObject(res) && angular.isDefined(res) && angular.isDefined(res.content) && res.content == 'USED') {
                alert('Mail group can not be deleted since used in mail group collection module');
                return false;
            }
            alert('Record deleted successfully');
            $scope.load($scope.currentPage);
        }, deleteurl);
    }

    $scope.save = function (myForm, isApprove) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        $scope.isUpdate = false;
        $scope.MailGroup.MailContacts = [];
        $scope.MailGroup.MailContacts = angular.isDefined($scope.MailContacts) && angular.isObject($scope.MailContacts) && $scope.MailContacts.length > 0 ? $scope.MailContacts : [];
        repository.insert(function () {
            alert('Record saved successfully');
            $scope.load(0);
            $scope.isList = true;
            $scope.MailGroup = null;
        }, $scope.MailGroup,
         function (resp) {
            
         });
    }

    $scope.update = function (myForm, isApprove) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        if ($scope.MailGroup != null && angular.isDefined($scope.MailGroup.Id) && $scope.MailGroup.Id > 0) {
            var updateurl = url + '/' + $scope.MailGroup.Id;
            $scope.MailGroup.MailContacts = [];
            $scope.MailGroup.MailContacts = angular.isDefined($scope.MailContacts) && angular.isObject($scope.MailContacts) && $scope.MailContacts.length > 0 ? $scope.MailContacts : [];
            repository.update(function () {
                alert('Record updated successfully');
                $scope.load(0);
            }, $scope.MailGroup, updateurl);

        }
        else {
            alert("Invalid information for edit contact")
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
            nameCon = nameCon.replace(/\plc/g, "GroupName");
            $('.namefilter').addClass('filterSelection');
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
            $scope.mailgroups = results.value;
        }, loadurl);
    };

    $scope.clearNamefilter = function () {
        $scope.nameFilter = {};
        $('.namefilter').removeClass('filterSelection');
        $scope.filter();
    }

    $scope.changeName = function () {
        if ($scope.payerDetail != null && angular.isDefined($scope.payerDetail) && angular.isDefined($scope.payerDetail.ContactId)) {
            delete $scope.payerDetail.ContactId;
        }
        if ($scope.MailGroup != null && angular.isDefined($scope.MailGroup) && angular.isDefined($scope.MailGroup.ContactId)) {
            delete $scope.MailGroup.ContactId;
        }
    }


    //$scope.getAll = function (val) {
    //    var geturl = odaturl.replace(/\plcholder/g, val);
    //    alert(geturl);
    //    return repository.get(geturl);
    //};
    $scope.Group = function (val) {
        var loadurl = typeaheadGroupurl + "&$filter=startswith(GroupName, '" + val + "') &$top=35&$inlinecount=allpages"
        return repository.getTypeAhead(loadurl);
    };
    $scope.getAll = function (val) {
        var geturl = odaturl.replace(/\plcholder/g, val);
        return repository.getWebApi(geturl);
    };

    $scope.exportToPdf = function () {
        //PDF headers
        var dispHead = ['Id', 'Mail group name'];

        var taxPdf = [];

        //PDF document configaruations
        var linebreakPos = 100;
        var pdfProperty = {
            cellWidth: 100,
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
                title: 'Group List',
                subject: 'Mail group',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        var total = 0;
        //Get the data and then generate Pdf
        repository.getTypeAhead(odaturl + $scope.filterCondition).then(function (pdfTax) {

            if (pdfTax != null && !angular.isUndefined(pdfTax)) {
                angular.forEach(pdfTax, function (mailgroup, index) {
                    var pdfTax = {};
                    pdfTax.Id = " " + mailgroup.Id + " ";
                    pdfTax.TaxName = mailgroup.GroupName != null && !angular.isUndefined(mailgroup.GroupName) && mailgroup.GroupName != '' ? formatStringBreaking(mailgroup.GroupName, linebreakPos) + '' : '';
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
        var linebreakPos = 100;
        var pdfProperty = {
            cellWidth: 100,
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
                taxPdf.push({ Name: "Group Name", Value: tax.GroupName != null && !angular.isUndefined(tax.GroupName) && tax.GroupName != '' ? tax.GroupName : ' ' });
                taxPdf.push({ Name: "", Value: "" });
                if (tax.MailContacts != null && angular.isDefined(tax.MailContacts) && angular.isObject(tax.MailContacts) && tax.MailContacts.length > 0) {
                    var excludedData = [];
                    excludedData.push({
                        Id: 'Id',
                        Name: 'Name',
                        Reason: 'Email'
                    });
                    angular.forEach(tax.MailContacts, function (excluded, index) {
                        excludedData.push({
                            Id: ' ' + excluded.Id + '',
                            Name: excluded.ContactName != null && !angular.isUndefined(excluded.ContactName) && excluded.ContactName != '' ? excluded.ContactName : ' ',
                            Reason: excluded.Email != null && !angular.isUndefined(excluded.Email) && excluded.Email != '' ? excluded.Email : ' ',
                        });
                    });
                    pdfProperty.chidTable = {
                        title: "Contacts",
                        data: excludedData
                    };
                }

                $scope.openPDF(taxPdf, null, pdfProperty, null);
            }
        });
    }
}

//Helper function

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
