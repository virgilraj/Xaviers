var url = '/api/Contacts';
var odaturl = '/odata/OdataContacts?$select=ContactId,CustomerId,Title,FirstName,LastName,Address1,Address2,City,YearIncome,IsEligibleForTax,IsMember,PhoneNumber,DOB,Email,HasImage&$orderby=ContactId desc';
var pdfUrl = '/odata/OdataContacts?$select=ContactId,CustomerId,Title,FirstName,LastName,Address1,Address2,City,PhoneNumber,YearIncome,IsEligibleForTax,IsMember,DOB,Email,SpouseName,BaptismDate,Eucharist,Reconciliation,Confirmation,Marriage,HolyOrders,AnointingoftheSick,FatherName,MotherName,HasImage';
var typeaheadurl = "/odata/OdataContacts?$select=ContactId,Title,FirstName,LastName";
var loanurl ='/api/Loan'

function contactCtrl($scope, repository, $http, fileUpload, utilityService, $window) {
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
    $scope.onItemSelected = function () {
        alert($scope.FirstName + '||' + $scope.model);
    };
    
    $scope.Gender = 'Male';
    $scope.Eligible = 'Yes';
    $scope.Member = 'Yes';
    $scope.daydatepicker = new Date().getDate();
    $scope.OldName = '';

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.maxSize = pagesize;
    $scope.itemsPerPage = itemperpage;
    $scope.fNme = 'First Name';
    $scope.lNme = 'Last Name';
    $scope.isCompany = false;

    $scope.addContact= function()
    {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = false;
        $scope.isView = false;
        if ($scope.Contact == null || angular.isUndefined($scope.Contact)) {
            $scope.Contact = {};
            $scope.Contact.Title = "Mr";
            $scope.Contact.State = "Tamil Nadu";
            $scope.Contact.Country = "India";
        }
        $scope.myFile = null;
        $scope.OldName = '';
    }
    $scope.showContact = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = true;
    }
    $scope.pageChange = function (pageno) {
        $scope.load(pageno);
    }

    $scope.titleChange = function () {
        $scope.fNme = 'First Name';
        $scope.lNme = 'Last Name';
        $scope.isCompany = false;
        if (angular.isDefined($scope.Contact) && angular.isDefined($scope.Contact.Title) && $scope.Contact.Title == 'Company') {
            $scope.fNme = 'Company Name';
            $scope.lNme = 'Proprietor / Contact Name';
            $scope.isCompany = true;
        }
    }

    $scope.load = function (pageno) {
        var skipnum = parseInt($scope.itemsPerPage) * parseInt(pageno - 1);
        var loadurl = odaturl + "&$skip=" + skipnum + "&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
        repository.get(function (results) {
            if (!angular.isObject(results.value)) {
                $window.location.reload();
            }
            $scope.contacts = results.value;
            $scope.totalItems = parseInt(results["odata.count"]);
        }, loadurl);

    }

    $scope.getNames = function () {
        repository.get(function (results) {
            return results;
        });
    }

    $scope.reset = function () {
        $scope.Contact = null;
        $scope.Gender = "Male";
        $scope.Eligible = 'Yes';
        $scope.Member = 'Yes';
    }
    
    $scope.edit = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.Contact = results.length > 0 ? results[0] : results;
            formatDateStringinEdit($scope, utilityService);
            getSpouseandParent($scope);
            $scope.Gender = $scope.Contact.Gender;
            $scope.Eligible = $scope.Contact.IsEligibleForTax !=null && $scope.Contact.IsEligibleForTax ? 'Yes' : 'No';
            $scope.Member = $scope.Contact.IsMember != null && $scope.Contact.IsMember ? 'Yes' : 'No';

            $scope.isCompany = $scope.Contact.Title == 'Company' ? true : false;
            $scope.OldName = $scope.Contact.FirstName + $scope.Contact.LastName;
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = false;
    }

    $scope.loadMember = function () {
        var urlsplit = location.href.split('/');
        var id = urlsplit.length > 1 ? urlsplit[urlsplit.length - 1] : '';
        if (id == '') { return false; }

        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.Contact = results.length > 0 ? results[0] : results;
            formatDateStringinEdit($scope, utilityService);
            getSpouseandParent($scope);
            $scope.Gender = $scope.Contact.Gender;
            $scope.Eligible = $scope.Contact.IsEligibleForTax != null && $scope.Contact.IsEligibleForTax ? 'Yes' : 'No';
            $scope.Member = $scope.Contact.IsMember != null && $scope.Contact.IsMember ? 'Yes' : 'No';
            $scope.isCompany = $scope.Contact.Title == 'Company' ? true : false;
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
            $scope.Contact = results.length > 0 ? results[0] : results;
            formatDateStringinEdit($scope, utilityService);
            getSpouseandParent($scope);
            $scope.Gender = $scope.Contact.Gender;
            $scope.Eligible = $scope.Contact.IsEligibleForTax != null && $scope.Contact.IsEligibleForTax ? 'Yes' : 'No';
            $scope.Member = $scope.Contact.IsMember != null && $scope.Contact.IsMember ? 'Yes' : 'No';
            $scope.isCompany = $scope.Contact.Title == 'Company' ? true : false;
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = true;
    }

    $scope.delete = function (id) {
        var isdelete = confirm("Do you want to delete this contact?");
        if (!isdelete) { return false;}
        var deleteurl = url + '/' + id;
        repository.delete(function (res) {
            if (angular.isObject(res) && angular.isDefined(res) && angular.isDefined(res.content) && res.content == 'USED')
            {
                alert('Contact can not be deleted since used in other modules');
                return false;
            }
            alert('Contact deleted successfully');
            $scope.load($scope.currentPage);
        }, deleteurl);
    }

    $scope.save = function (myForm) {
        $scope.Contact.HasImage = angular.isDefined($scope.myFile) && angular.isObject($scope.myFile) ? true : false;
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        if (angular.isDefined($scope.myFile) && angular.isObject($scope.myFile)) {
            if (!(/\.(gif|jpg|jpeg|tiff|png)$/i).test($scope.myFile.name)) {
                alert('Invalid image type. Please select valid image types like gif, jpg, jpeg, tiff or png.');
                return false;
            }
        }
        $scope.isUpdate = false;
        setSpouseandParent($scope);
        formatDateString($scope, utilityService);
        $scope.Contact.Gender = $scope.Gender;
        $scope.Contact.IsEligibleForTax = $scope.Eligible == 'Yes' ? true : false;
        $scope.Contact.IsMember = $scope.Member == 'Yes' ? true : false;
        repository.insert(function () {
            alert('Contact saved successfully');
            $scope.load(0);
            $scope.isList = true;
            $scope.Contact = null;
        }, $scope.Contact,
         function (resp) {
             if (resp != null && angular.isDefined(resp) && angular.isDefined(resp.data)) {
                 $scope.uploadFile(resp.data.ContactId);
             }
         });
    }

    $scope.update = function (myForm) {
        $scope.Contact.HasImage = $scope.Contact.HasImage || angular.isDefined($scope.myFile) && angular.isObject($scope.myFile) ? true : false;
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        if (angular.isDefined($scope.myFile) && angular.isObject($scope.myFile)) {
            if (!(/\.(gif|jpg|jpeg|tiff|png)$/i).test($scope.myFile.name)) {
                alert('Invalid image type. Please select valid image types like gif, jpg, jpeg, tiff or png.');
                return false;
            }
        }
        if ($scope.Contact != null && angular.isDefined($scope.Contact.ContactId) && $scope.Contact.ContactId > 0) {
            var updateurl = url + '/' + $scope.Contact.ContactId;
            setSpouseandParent($scope);
            formatDateString($scope, utilityService);
            $scope.Contact.Gender = $scope.Gender;
            $scope.Contact.IsEligibleForTax = $scope.Eligible == 'Yes' ? true : false;
            $scope.Contact.IsMember = $scope.Member == 'Yes' ? true : false;
            $scope.Contact.IsNameChanged = !($scope.OldName == ($scope.Contact.FirstName + $scope.Contact.LastName));
            repository.update(function () {
                alert('Contact updated successfully');
                $scope.load(0);
            }, $scope.Contact, updateurl);
            if ($scope.Contact != null && angular.isDefined($scope.Contact)) {
                $scope.uploadFile($scope.Contact.ContactId);
            }
        }
        else
        {
            alert("Invalid information for edit contact")
        }
    }

    $scope.uploadFile = function (id) {
        if (angular.isDefined($scope.myFile) && angular.isObject($scope.myFile)) {
            var file = $scope.myFile;
            var uploadUrl = "/api/FileUpload/contact_" + id;
            fileUpload.uploadFileToUrl(file, uploadUrl);
        }
    };

    $scope.claerTopFilter = function()
    {
        $scope.Filter = null;
        $scope.filter();
    }

    $scope.topfilter = function()
    {
        var condition = '';
        var nameCon = '';
        var addressCon = '';
        var phoneCon = '';
        var emailCon = '';
        var dateCon = '';
        var other = ''
        
        
        if($scope.Filter !=null && angular.isDefined($scope.Filter))
        {
            if(angular.isDefined($scope.Filter.Name) && $scope.Filter.Name !='')
            {
                nameCon = "(startswith(FirstName, '" + $scope.Filter.Name + " ') or startswith(LastName, '" + $scope.Filter.Name + "'))";
            }
            if (angular.isDefined($scope.Filter.Address) && $scope.Filter.Address != '') {
                addressCon = "(startswith(Address1, '" + $scope.Filter.Address + " ') or startswith(Address2, '" + $scope.Filter.Address + "') or  startswith(City, '" + $scope.Filter.City + "'))";
                addressCon = nameCon != '' ? " and " + addressCon : addressCon;
            }
            if (angular.isDefined($scope.Filter.Phone) && $scope.Filter.Phone != '') {
                phoneCon = "(startswith(PhoneNumber, '" + $scope.Filter.Phone + " ') or startswith(MobileNumber, '" + $scope.Filter.Phone + "'))";
                phoneCon = nameCon != '' || addressCon != '' ? " and " + phoneCon : phoneCon;
            }
            if (angular.isDefined($scope.Filter.Email) && $scope.Filter.Email != '') {
                emailCon = "(startswith(Email, '" + $scope.Filter.Email + "'))";
            }

            if ($scope.Filter.Other != null && angular.isDefined($scope.Filter.Other))
            {
                if($scope.Filter.Other == 'Male')
                {
                    other = "(Gender eq 'Male')"
                }
                else if ($scope.Filter.Other == 'Female') {
                    other = "(Gender eq 'Female')"
                }
                else if ($scope.Filter.Other == 'Member') {
                    other = "(IsMember eq true)"
                }
                else if ($scope.Filter.Other == 'Tax payer') {
                    other = "(IsEligibleForTax eq true)"
                }
                else if ($scope.Filter.Other == 'Female') {
                    other = "(Title eq 'Company')"
                }
            }

            if (nameCon != '' || addressCon != '' || phoneCon != '' || dateCon != '' || emailCon != '' || other !='') {
                condition = "&$filter=(" + nameCon + addressCon + phoneCon + dateCon + emailCon + other + ")";
            }


            $scope.filterCondition = condition;

            var loadurl = odaturl + condition + "&$skip=0&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
            repository.get(function (results) {
                if (!angular.isObject(results.value)) {
                    $window.location.reload();
                }
                $scope.contacts = results.value;
                $scope.totalItems = parseInt(results["odata.count"]);
            }, loadurl);
        }
    }

    $scope.filter = function () {
        var condition = '';
        var nameCon = '';
        var addressCon = '';
        var phoneCon = '';
        var emailCon = '';
        var dateCon = '';
        var amountCon = '';

        if (angular.isDefined($scope.nameFilter) && angular.isDefined($scope.nameFilter.Text) && $scope.nameFilter.Text != '') {
            var options = '';
            if (angular.isUndefined($scope.nameFilter.Options)) {
                //set default value
                options = doubleSearch[2].value;
            }
            else {
                options = $scope.nameFilter.Options;
            }
            nameCon = options.replace(/\plcholder/g, "'" + $scope.nameFilter.Text + "'");
            nameCon = nameCon.replace(/\plc1/g, "LastName").replace(/\plc/g, "FirstName");
            $('.namefilter').addClass('filterSelection');
        }

        if (angular.isDefined($scope.addressFilter) && angular.isDefined($scope.addressFilter.Text) && $scope.addressFilter.Text != ''){
            var options = '';
            if (angular.isUndefined($scope.addressFilter.Options)) {
                //set default value
                options = tripleSearch[2].value;
            }
            else {
                options = $scope.addressFilter.Options;
            }
            addressCon = options.replace(/\plcholder/g, "'" + $scope.addressFilter.Text + "'");
            addressCon = addressCon.replace(/\plc2/g, "Address1").replace(/\plc1/g, "City").replace(/\plc/g, "State");
            addressCon = nameCon != '' ? " and " + addressCon : addressCon;
            $('.addressFilter').addClass('filterSelection');
        }

        if (angular.isDefined($scope.phoneFilter) && angular.isDefined($scope.phoneFilter.Text) && $scope.phoneFilter.Text != ''){
            var options = '';
            if (angular.isUndefined($scope.phoneFilter.Options)) {
                //set default value
                options = doubleSearch[2].value;
            }
            else {
                options = $scope.phoneFilter.Options;
            }
            phoneCon = options.replace(/\plcholder/g, "'" + $scope.phoneFilter.Text + "'");
            phoneCon = phoneCon.replace(/\plc1/g, "PhoneNumber").replace(/\plc/g, "MobileNumber");
            phoneCon = nameCon != '' || addressCon != '' ? " and " + phoneCon : phoneCon;
            $('.phoneFilter').addClass('filterSelection');
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
            amountCon = amountCon.replace(/\plc/g, "YearIncome");
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
                dateCon = "(DOB ge datetime'" + utilityService.setSearchDate($scope.dateFilter.Text) + "' and DOB le datetime'" + utilityService.setSearchDate($scope.dateFilter.Text1) + "')";
            }
            else {
                dateCon = options.replace(/\plcholder/g, "datetime'" + utilityService.setSearchDate($scope.dateFilter.Text) + "'");
                dateCon = dateCon.replace(/\plc/g, "DOB");
            }
            dateCon = nameCon != '' || addressCon != '' || phoneCon != '' ? " and " + dateCon : dateCon;
            $('.dateFilter').addClass('filterSelection');
        }

        if (angular.isDefined($scope.emailFilter) && angular.isDefined($scope.emailFilter.Text) && $scope.emailFilter.Text != ''){
            var options = '';
            if (angular.isUndefined($scope.emailFilter.Options)) {
                //set default value
                options = singleSearch[2].value;
            }
            else {
                options = $scope.emailFilter.Options;
            }
            emailCon = options.replace(/\plcholder/g, "'" + $scope.emailFilter.Text + "'");
            emailCon = emailCon.replace(/\plc/g, "Email");
            emailCon = nameCon != '' || addressCon != '' || phoneCon != '' || dateCon != '' ? " and " + emailCon : emailCon;
            $('.emailFilter').addClass('filterSelection');
        }


        if (nameCon != '' || addressCon != '' || phoneCon != '' || dateCon != '' || emailCon != '' || amountCon !='') {
            condition = "&$filter=(" + nameCon + addressCon + phoneCon + dateCon + emailCon + amountCon + ")";
        }

        $scope.filterCondition = condition;

        var loadurl = odaturl + condition + "&$skip=0&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
        repository.get(function (results) {
            if (!angular.isObject(results.value)) {
                $window.location.reload();
            }
            
            $scope.contacts = results.value;
            $scope.totalItems = parseInt(results["odata.count"]);
        }, loadurl);
    };

    $scope.clearNamefilter = function()
    {
        $scope.nameFilter = {};
        $('.namefilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearAddressfilter = function () {
        $scope.addressFilter = {};
        $('.addressFilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearPhonefilter = function () {
        $scope.phoneFilter = {};
        $('.phoneFilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearEmailfilter = function () {
        $scope.emailFilter = {};
        $('.emailFilter').removeClass('filterSelection');
        $scope.filter();
    }
    $scope.clearDatefilter = function () {
        $scope.dateFilter = {};
        $('.dateFilter').removeClass('filterSelection');
        $scope.filter();
    }

    $scope.clearAmountFilter = function () {
        $scope.amountFilter = {};
        $('.amountFilter').removeClass('filterSelection');
        $scope.filter();
    }

    $scope.getFemales = function (val) {
        var gender = 'Female';
        if ($scope.Gender == 'Female')
        {
            gender = 'Male';
        }
        var loadurl = url + '/' + val + '/' + gender;
        return repository.getWebApi(loadurl);
    };

    $scope.getMales = function (val) {
        var loadurl = url + '/' + val + '/Male';
        return repository.getWebApi(loadurl);
    };

    $scope.getAll = function (val) {
        var loadurl = url + '/' + val +'/all' ;
        return repository.getWebApi(loadurl);
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
        repository.getWebApi(url + '/' + id + '-' + typ).then(function (pdfTax) {

            if (pdfTax != null && !angular.isUndefined(pdfTax) && pdfTax.length > 0) {
                angular.forEach(pdfTax, function (tax, index) {
                    var pdfTax = {};
                    pdfTax.Name = tax.TaxName != null && !angular.isUndefined(tax.TaxName) && tax.TaxName != '' ? formatStringBreaking(tax.TaxName, linebreakPos) + '.' : '';
                    pdfTax.TaxAmount = tax.TaxAmount != null && !angular.isUndefined(tax.TaxAmount) && tax.TaxAmount != '' ? ' ' + tax.TaxAmount + ' ' : '0';
                    pdfTax.TotalReceivedAmount = tax.TotalReceivedAmount != null && !angular.isUndefined(tax.TotalReceivedAmount) && tax.TotalReceivedAmount != '' ? ' ' + tax.TotalReceivedAmount + ' ' : '0';
                    pdfTax.BalanceAmount = tax.BalanceAmount != null && !angular.isUndefined(tax.BalanceAmount) && tax.BalanceAmount != '' ? ' ' + tax.BalanceAmount + ' ' : '0';

                    taxPdf.push(pdfTax);
                });

                //pdfProperty.splField = "Total : " + total;

                $scope.openPDF(taxPdf, dispHead, pdfProperty);
            }
            else {
                alert('No records found');
                return false;
            }
        });
    }

    $scope.exportToPdf = function () {
        //PDF headers
        var dispHead = ['Id', 'Name', 'Address', 'Phone', 'Mobile', 'Email', 'Gender', 'Date of Birth', 'Spouse', 'Father', 'Mother', 'Sacraments'];

        var cotactPdf = [];

        //PDF document configaruations
        var linebreakPos = 28;
        var pdfProperty = {
            cellWidth: 36,
            leftMargin: 0,
            topMargin: 2,
            rowHeight: 12,
            titlefontsize: 18,
            headerfontsize: 12,
            cellfontsize: 6.5,
            recordperpage: 10,
            name: 'contacts.pdf',
            l: {
                orientation: 'l',
                unit: 'mm',
                format: 'a3',
                compress: true,
                fontSize: 8,
                lineHeight: 1,
                autoSize: true,
                printHeaders: true
            },
            prop: {
                title: 'Contact List',
                subject: 'List of contacts',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        //Get the data and then generate Pdf
        repository.getTypeAhead(pdfUrl + $scope.filterCondition).then(function (pdfcontacts) {

            if (pdfcontacts != null && !angular.isUndefined(pdfcontacts)) {
                angular.forEach(pdfcontacts, function (person, index) {
                    var pdfContact = {};
                    pdfContact.Id = " " + person.ContactId + " ";
                    pdfContact.Name = person.Title != null && !angular.isUndefined(person.Title) && person.Title != '' ? person.Title + '.' : '';
                    pdfContact.Name += person.FirstName != null && !angular.isUndefined(person.FirstName) && person.FirstName != '' ? ' ' + person.FirstName : ' ';
                    pdfContact.Name += person.LastName != null && !angular.isUndefined(person.LastName) && person.LastName != '' ? ' ' + person.LastName : '';
                    pdfContact.Name = formatStringBreaking(pdfContact.Name, linebreakPos);
                    pdfContact.Address = person.Address1 != null && !angular.isUndefined(person.Address1) && person.Address1 != '' ? person.Address1 : '';
                    pdfContact.Address += person.Address2 != null && !angular.isUndefined(person.Address2) && person.Address2 != '' ? ', ' + person.Address2 : ' ';
                    pdfContact.Address += person.City != null && !angular.isUndefined(person.City) && person.City != '' ? '\n' + person.City : '';
                    pdfContact.Address += person.State != null && !angular.isUndefined(person.State) && person.State != '' ? '\n' + person.State : '';
                    pdfContact.Address += person.Country != null && !angular.isUndefined(person.Country) && person.Country != '' ? '\n' + person.Country : '';
                    pdfContact.Address += person.Pin != null && !angular.isUndefined(person.Pin) && person.Pin != '' ? '\n' + person.Pin : '';
                    pdfContact.Address = formatStringBreaking(pdfContact.Address, linebreakPos);
                    pdfContact.Phone = person.PhoneNumber != null && !angular.isUndefined(person.PhoneNumber) && person.PhoneNumber != '' ? person.PhoneNumber : ' ';
                    pdfContact.Mobile = person.MobileNumber != null && !angular.isUndefined(person.MobileNumber) && person.MobileNumber != '' ? person.MobileNumber : ' ';
                    pdfContact.Email = person.Email != null && !angular.isUndefined(person.Email) && person.Email != '' ? person.Email : ' ';
                    pdfContact.Email = formatStringBreaking(pdfContact.Email, linebreakPos);
                    pdfContact.Gender = person.Gender != null && !angular.isUndefined(person.Gender) && person.Gender != '' ? person.Gender : ' ';
                    pdfContact.DOB = person.DOB != null && !angular.isUndefined(person.DOB) && person.DOB != '' ? utilityService.getDateFromOdata(person.DOB) : ' ';
                    pdfContact.Spouse = person.SpouseName != null && !angular.isUndefined(person.SpouseName) && person.SpouseName != '' ? person.SpouseName : ' ';
                    pdfContact.Father = person.FatherName != null && !angular.isUndefined(person.FatherName) && person.FatherName != '' ? person.FatherName : ' ';
                    pdfContact.Mother = person.MotherName != null && !angular.isUndefined(person.MotherName) && person.MotherName != '' ? person.MotherName : ' ';
                   // pdfContact.Guardian = person.GuardianName != null && !angular.isUndefined(person.GuardianName) && person.GuardianName != '' ? person.GuardianName : ' ';

                    pdfContact.Spouse = formatStringBreaking(pdfContact.Spouse, linebreakPos);
                    pdfContact.Father = formatStringBreaking(pdfContact.Father, linebreakPos);
                    pdfContact.Mother = formatStringBreaking(pdfContact.Mother, linebreakPos);
                   // pdfContact.Guardian = formatStringBreaking(pdfContact.Guardian, linebreakPos);

                    pdfContact.Sacraments = person.BaptismDate != null && !angular.isUndefined(person.BaptismDate) && person.BaptismDate != '' ? 'Baptism Date: ' + utilityService.getDateFromOdata(person.BaptismDate) : ' ';
                    pdfContact.Sacraments += person.Eucharist != null && !angular.isUndefined(person.Eucharist) && person.Eucharist != '' ? '\n Eucharist Date: ' + utilityService.getDateFromOdata(person.Eucharist) : '';
                    pdfContact.Sacraments += person.Reconciliation != null && !angular.isUndefined(person.Reconciliation) && person.Reconciliation != '' ? '\n Reconciliation Date: ' + utilityService.getDateFromOdata(person.Reconciliation) : '';
                    pdfContact.Sacraments += person.Confirmation != null && !angular.isUndefined(person.Confirmation) && person.Confirmation != '' ? '\n Confirmation Date: ' + utilityService.getDateFromOdata(person.Confirmation) : '';
                    pdfContact.Sacraments += person.Marriage != null && !angular.isUndefined(person.Marriage) && person.Marriage != '' ? '\n Marriage Date: ' + utilityService.getDateFromOdata(person.Marriage) : '';
                    pdfContact.Sacraments += person.HolyOrders != null && !angular.isUndefined(person.HolyOrders) && person.HolyOrders != '' ? '\n HolyOrders Date: ' + utilityService.getDateFromOdata(person.HolyOrders) : '';
                    pdfContact.Sacraments += person.AnointingoftheSick != null && !angular.isUndefined(person.AnointingoftheSick) && person.AnointingoftheSick != '' ? '\n AnointingoftheSick Date: ' + utilityService.getDateFromOdata(person.AnointingoftheSick) : '';

                    pdfContact.Sacraments = formatStringBreaking(pdfContact.Sacraments, linebreakPos);
                    pdfContact.Sacraments = pdfContact.Sacraments == '' ? '  ' : pdfContact.Sacraments;

                    cotactPdf.push(pdfContact);
                });
            }

            $scope.openPDF(cotactPdf, dispHead, pdfProperty);
        });
    }

    $scope.exportToPdfSingle = function (id) {
        var cotactPdf = [];

        //PDF document configaruations
        var linebreakPos = 28;
        var pdfProperty = {
            cellWidth: 100,
            leftMargin: 0,
            topMargin: 1,
            rowHeight: 10,
            titlefontsize: 18,
            headerfontsize: 10,
            cellfontsize: 8,
            recordperpage: 15,
            name: 'contacts.pdf',
            l: {
                orientation: 'l',
                unit: 'mm',
                format: 'a4',
                compress: true,
                fontSize: 7,
                lineHeight: 1,
                autoSize: true,
                printHeaders: true
            },
            prop: {
                title: 'Contact Details',
                subject: 'List of contacts',
                author: 'Xaviers',
                keywords: 'generated, javascript, web 2.0, ajax',
                creator: 'Xaviers',
            }
        };

        //Get the data and then generate Pdf
        repository.getTypeAhead(pdfUrl + '&$filter=(ContactId eq ' + id + ')').then(function (pdfcontacts) {
            var imgUrl = '';
            if (pdfcontacts != null && !angular.isUndefined(pdfcontacts) && pdfcontacts.length > 0) {
                var person = pdfcontacts[0];
                imgUrl = (person.HasImage != null && angular.isDefined(person.HasImage) && person.HasImage) ? "/memberImages/" + custid + "/" + person.ContactId + "_medium.png" : "/memberImages/no_medium.png";
                getImageFromUrl(imgUrl, function (imgData) {
                    cotactPdf.push({ Name: "Contact Id", Value: ' ' + person.ContactId + ' ' });
                    cotactPdf.push({ Name: "Title", Value: person.Title != null && !angular.isUndefined(person.Title) && person.Title != '' ? person.Title + '.' : '' });
                    cotactPdf.push({ Name: "First Name", Value: person.FirstName != null && !angular.isUndefined(person.FirstName) && person.FirstName != '' ? ' ' + person.FirstName : ' ' });
                    cotactPdf.push({ Name: "Last Name", Value: person.LastName != null && !angular.isUndefined(person.LastName) && person.LastName != '' ? ' ' + person.LastName : ' ' });
                    cotactPdf.push({ Name: "Address1", Value: person.Address1 != null && !angular.isUndefined(person.Address1) && person.Address1 != '' ? person.Address1 : ' ' });
                    cotactPdf.push({ Name: "Address2", Value: person.Address2 != null && !angular.isUndefined(person.Address2) && person.Address2 != '' ? ', ' + person.Address2 : ' ' });
                    cotactPdf.push({ Name: "City", Value: person.City != null && !angular.isUndefined(person.City) && person.City != '' ? person.City : ' ' });
                    cotactPdf.push({ Name: "State", Value: person.State != null && !angular.isUndefined(person.State) && person.State != '' ? person.State : ' ' });
                    cotactPdf.push({ Name: "Country", Value: person.Country != null && !angular.isUndefined(person.Country) && person.Country != '' ? person.Country : ' ' });
                    cotactPdf.push({ Name: "Pin", Value: person.Pin != null && !angular.isUndefined(person.Pin) && person.Pin != '' ? person.Pin : ' ' });
                    cotactPdf.push({ Name: "Phone Number", Value: person.PhoneNumber != null && !angular.isUndefined(person.PhoneNumber) && person.PhoneNumber != '' ? person.PhoneNumber : ' ' });
                    cotactPdf.push({ Name: "Mobile Number", Value: person.MobileNumber != null && !angular.isUndefined(person.MobileNumber) && person.MobileNumber != '' ? person.MobileNumber : ' ' });
                    cotactPdf.push({ Name: "Email", Value: person.Email != null && !angular.isUndefined(person.Email) && person.Email != '' ? person.Email : ' ' });
                    cotactPdf.push({ Name: "Gender", Value: person.Gender != null && !angular.isUndefined(person.Gender) && person.Gender != '' ? person.Gender : ' ' });
                    cotactPdf.push({ Name: "Eligible For Tax", Value: person.IsEligibleForTax != null && !angular.isUndefined(person.IsEligibleForTax) && person.IsEligibleForTax ? 'Yes' : 'No' });
                    cotactPdf.push({ Name: "Member", Value: person.Member != null && !angular.isUndefined(person.Member) && person.Member ? 'Yes' : 'No' });
                    cotactPdf.push({ Name: "Annual Income", Value: person.YearIncome != null && !angular.isUndefined(person.YearIncome) && person.YearIncome != '' ? '' + person.YearIncome + ' ' : ' ' });
                    cotactPdf.push({ Name: "Spouse Name", Value: person.SpouseName != null && !angular.isUndefined(person.SpouseName) && person.SpouseName != '' ? person.SpouseName : ' ' });
                    cotactPdf.push({ Name: "Father Name", Value: person.FatherName != null && !angular.isUndefined(person.FatherName) && person.FatherName != '' ? person.FatherName : ' ' });
                    cotactPdf.push({ Name: "Mother Name", Value: person.MotherName != null && !angular.isUndefined(person.MotherName) && person.MotherName != '' ? person.MotherName : ' ' });
                    cotactPdf.push({ Name: "Baptism Date", Value: person.BaptismDate != null && !angular.isUndefined(person.BaptismDate) && person.BaptismDate != '' ? utilityService.getDateFromOdata(person.BaptismDate) : ' ' });
                    cotactPdf.push({ Name: "Eucharist Date", Value: person.Eucharist != null && !angular.isUndefined(person.Eucharist) && person.Eucharist != '' ? utilityService.getDateFromOdata(person.Eucharist) : ' ' });
                    cotactPdf.push({ Name: "Reconciliation Date", Value: person.Reconciliation != null && !angular.isUndefined(person.Reconciliation) && person.Reconciliation != '' ? utilityService.getDateFromOdata(person.Reconciliation) : ' ' });
                    cotactPdf.push({ Name: "Confirmation Date", Value: person.Confirmation != null && !angular.isUndefined(person.Confirmation) && person.Confirmation != '' ? utilityService.getDateFromOdata(person.Confirmation) : ' ' });
                    cotactPdf.push({ Name: "Marriage Date", Value: person.Marriage != null && !angular.isUndefined(person.Marriage) && person.Marriage != '' ? utilityService.getDateFromOdata(person.Marriage) : ' ' });
                    cotactPdf.push({ Name: "HolyOrders Date", Value: person.HolyOrders != null && !angular.isUndefined(person.HolyOrders) && person.HolyOrders != '' ? utilityService.getDateFromOdata(person.HolyOrders) : ' ' });
                    cotactPdf.push({ Name: "AnointingoftheSick Date", Value: person.AnointingoftheSick != null && !angular.isUndefined(person.AnointingoftheSick) && person.AnointingoftheSick != '' ? utilityService.getDateFromOdata(person.AnointingoftheSick) : ' ' });

                    $scope.openPDF(cotactPdf, null, pdfProperty, imgData);
                });
            }
        });
    }

    $scope.pendingList = function (id, name) {
        //PDF headers
        var dispHead = ['Loan', 'Principal Amt', 'Interest Amt', 'Late Fee', 'Due Month/Year'];

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
        repository.getWebApi(loanurl + '/' + id + '/contact').then(function (pdfTax) {

            if (pdfTax != null && !angular.isUndefined(pdfTax) && pdfTax.length > 0) {
                angular.forEach(pdfTax, function (tax, index) {
                    var pdfLoan = {};
                    pdfLoan.Name = tax.Desciption != null && !angular.isUndefined(tax.Desciption) && tax.Desciption != '' ? tax.LoanId + ' ' + formatStringBreaking(tax.Desciption, linebreakPos) + '' : tax.LoanId;
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
}


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
//Helper function
function formatDateString(scope, utilityService)
{
    if (scope.Contact.DOB != null && angular.isDefined(scope.Contact.DOB) && scope.Contact.DOB != '') {
        scope.Contact.DOB = utilityService.getDate(scope.Contact.DOB);
    }
    if (scope.Contact.DOD != null && angular.isDefined(scope.Contact.DOD) && scope.Contact.DOD != '') {
        scope.Contact.DOD = utilityService.getDate(scope.Contact.DOD);
    }
    if (scope.Contact.DOL != null && angular.isDefined(scope.Contact.DOL) && scope.Contact.DOL != '') {
        scope.Contact.DOL = utilityService.getDate(scope.Contact.DOL);
    }
    if (scope.Contact.BaptismDate != null && angular.isDefined(scope.Contact.BaptismDate) && scope.Contact.BaptismDate != '') {
        scope.Contact.BaptismDate = utilityService.getDate(scope.Contact.BaptismDate);
    }

    if (scope.Contact.Eucharist != null && angular.isDefined(scope.Contact.Eucharist) && scope.Contact.Eucharist != '') {
        scope.Contact.Eucharist = utilityService.getDate(scope.Contact.Eucharist);
    }
    if (scope.Contact.Reconciliation != null && angular.isDefined(scope.Contact.Reconciliation) && scope.Contact.Reconciliation != '') {
        scope.Contact.Reconciliation = utilityService.getDate(scope.Contact.Reconciliation);
    }
    if (scope.Contact.Confirmation != null && angular.isDefined(scope.Contact.Confirmation) && scope.Contact.Confirmation != '') {
        scope.Contact.Confirmation = utilityService.getDate(scope.Contact.Confirmation);
    }
    if (scope.Contact.Marriage != null && angular.isDefined(scope.Contact.Marriage) && scope.Contact.Marriage != '') {
        scope.Contact.Marriage = utilityService.getDate(scope.Contact.Marriage);
    }
    if (scope.Contact.HolyOrders != null && angular.isDefined(scope.Contact.HolyOrders) && scope.Contact.HolyOrders != '') {
        scope.Contact.HolyOrders = utilityService.getDate(scope.Contact.HolyOrders);
    }
    if (scope.Contact.AnointingoftheSick != null && angular.isDefined(scope.Contact.AnointingoftheSick) && scope.Contact.AnointingoftheSick != '') {
        scope.Contact.AnointingoftheSick = utilityService.getDate(scope.Contact.AnointingoftheSick);
    }
}

function formatDateStringinEdit(scope, utilityService) {
    if (scope.Contact.DOB != null && angular.isDefined(scope.Contact.DOB) && scope.Contact.DOB != '') {
        scope.Contact.DOB = utilityService.formatDate(scope.Contact.DOB);
    }
    if (scope.Contact.DOD != null && angular.isDefined(scope.Contact.DOD) && scope.Contact.DOD != '') {
        scope.Contact.DOD = utilityService.formatDate(scope.Contact.DOD);
    }
    if (scope.Contact.DOL != null && angular.isDefined(scope.Contact.DOL) && scope.Contact.DOL != '') {
        scope.Contact.DOL = utilityService.formatDate(scope.Contact.DOL);
    }
    if (scope.Contact.BaptismDate != null && angular.isDefined(scope.Contact.BaptismDate) && scope.Contact.BaptismDate != '') {
        scope.Contact.BaptismDate = utilityService.formatDate(scope.Contact.BaptismDate);
    }

    if (scope.Contact.Eucharist != null && angular.isDefined(scope.Contact.Eucharist) && scope.Contact.Eucharist != '') {
        scope.Contact.Eucharist = utilityService.formatDate(scope.Contact.Eucharist);
    }
    if (scope.Contact.Reconciliation != null && angular.isDefined(scope.Contact.Reconciliation) && scope.Contact.Reconciliation != '') {
        scope.Contact.Reconciliation = utilityService.formatDate(scope.Contact.Reconciliation);
    }
    if (scope.Contact.Confirmation != null && angular.isDefined(scope.Contact.Confirmation) && scope.Contact.Confirmation != '') {
        scope.Contact.Confirmation = utilityService.formatDate(scope.Contact.Confirmation);
    }
    if (scope.Contact.Marriage != null && angular.isDefined(scope.Contact.Marriage) && scope.Contact.Marriage != '') {
        scope.Contact.Marriage = utilityService.formatDate(scope.Contact.Marriage);
    }
    if (scope.Contact.HolyOrders != null && angular.isDefined(scope.Contact.HolyOrders) && scope.Contact.HolyOrders != '') {
        scope.Contact.HolyOrders = utilityService.formatDate(scope.Contact.HolyOrders);
    }
    if (scope.Contact.AnointingoftheSick != null && angular.isDefined(scope.Contact.AnointingoftheSick) && scope.Contact.AnointingoftheSick != '') {
        scope.Contact.AnointingoftheSick = utilityService.formatDate(scope.Contact.AnointingoftheSick);
    }
}

function setSpouseandParent(scope)
{
    if (scope.spouseDetail != null && angular.isDefined(scope.spouseDetail.ContactId) && scope.spouseDetail.ContactId != "" && scope.spouseDetail.ContactId > 0) {
        scope.Contact.SpouseName = scope.spouseDetail.Name;
        scope.Contact.SpouseId = scope.spouseDetail.ContactId;
    }
    else {
        scope.Contact.SpouseName = scope.spouseDetail;
    }

    if (scope.fatherDetail != null && angular.isDefined(scope.fatherDetail.ContactId) && scope.fatherDetail.ContactId != "" && scope.fatherDetail.ContactId > 0) {
        scope.Contact.FatherName = scope.fatherDetail.Name;
        scope.Contact.FatherId = scope.fatherDetail.ContactId;
    }
    else {
        scope.Contact.FatherName = scope.fatherDetail;
    }

    if (scope.motherDetail != null && angular.isDefined(scope.motherDetail.ContactId) && scope.motherDetail.ContactId != "" && scope.motherDetail.ContactId > 0) {
        scope.Contact.MotherName = scope.motherDetail.Name;
        scope.Contact.MotherId = scope.motherDetail.ContactId;
    }
    else {
        scope.Contact.MotherName = scope.motherDetail;
    }

    if (scope.guardianDetail != null && angular.isDefined(scope.guardianDetail.ContactId) && scope.guardianDetail.ContactId != "" && scope.guardianDetail.ContactId > 0) {
        scope.Contact.GuardianName = scope.guardianDetail.Name;
        scope.Contact.GuardianId = scope.guardianDetail.ContactId;
    }
    else {
        scope.Contact.GuardianName = scope.guardianDetail;
    }
}

function getSpouseandParent(scope) {
    scope.spouseDetail = {};
    scope.fatherDetail = {};
    scope.motherDetail = {};
    scope.guardianDetail = {};
    if (scope.Contact.SpouseId != null && angular.isDefined(scope.Contact.SpouseId) && scope.Contact.SpouseId != "" && scope.Contact.SpouseId > 0) {
        scope.spouseDetail.Name = scope.Contact.SpouseName;
        scope.spouseDetail.ContactId = scope.Contact.SpouseId;
    }
    else {
        scope.spouseDetail = scope.Contact.SpouseName;
    }

    if (scope.Contact.FatherId != null && angular.isDefined(scope.Contact.FatherId) && scope.Contact.FatherId != "" && scope.Contact.FatherId > 0) {
        scope.fatherDetail.Name = scope.Contact.FatherName;
        scope.fatherDetail.ContactId = scope.Contact.FatherId;
    }
    else {
        scope.fatherDetail = scope.Contact.FatherName;
    }

    if (scope.Contact.MotherId != null && angular.isDefined(scope.Contact.MotherId) && scope.Contact.MotherId != "" && scope.Contact.MotherId > 0) {
        scope.motherDetail.Name = scope.Contact.MotherName;
        scope.motherDetail.ContactId = scope.Contact.MotherId;
    }
    else {
        scope.motherDetail = scope.Contact.MotherName;
    }

    if (scope.Contact.GuardianId != null && angular.isDefined(scope.Contact.GuardianId) && scope.Contact.GuardianId != "" && scope.Contact.GuardianId > 0) {
        scope.guardianDetail.Name = scope.Contact.GuardianName;
        scope.guardianDetail.ContactId = scope.Contact.GuardianId;
    }
    else {
        scope.guardianDetail = scope.Contact.GuardianName;
    }
}
function checkSameNameOdataQuery(scope)
{
    return scope.Contact!=null && angular.isDefined(scope.Contact) && angular.isDefined(scope.Contact.FirstName) && scope.Contact.FirstName != "" ? " and FirstName ne '" + scope.Contact.FirstName + "'" : "";
}