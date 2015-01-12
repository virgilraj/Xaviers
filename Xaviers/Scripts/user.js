var url = '/api/User';
var odaturl = '/odata/OdataUser';
var typeaheadurl = "/api/Contacts";
function userCtrl($scope, repository, $http, utilityService) {

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

    $scope.addUser = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = false;
        $scope.isView = false;
        $scope.User = null;
    }
    $scope.showUser = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = true;
    }
    $scope.pageChange = function (pageno) {
        $scope.load(pageno);
    }

    $scope.load = function (pageno) {
        var skipnum = parseInt($scope.itemsPerPage) * parseInt(pageno - 1);
        var loadurl = odaturl + "?$skip=" + skipnum + "&$top=" + $scope.itemsPerPage + "&$inlinecount=allpages";
        repository.get(function (results) {
            if (!angular.isObject(results.value)) {
                $window.location.reload();
            }
            $scope.users = results.value;
            $scope.totalItems = parseInt(results["odata.count"]);
        }, loadurl);

    }

    $scope.getEmail = function () {
        if ($scope.payerDetail != null && angular.isDefined($scope.payerDetail.ContactId) && $scope.payerDetail.ContactId != "" && $scope.payerDetail.ContactId > 0) {
            if ($scope.User == null || angular.isUndefined($scope.User)) { $scope.User = {}; }
            $scope.User.Email = $scope.payerDetail.Email;
        }
    }

   
    $scope.reset = function () {
        $scope.User = null;
    }

    $scope.edit = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.User = results;
            $scope.User.oldEmail = $scope.User.Email;
            getPayerDetails($scope);
            $scope.User.Password = '';
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
            $scope.User = results;
            getPayerDetails($scope);
            $scope.User.Password = '';

        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = true;
    }

    $scope.delete = function (id) {
        var isdelete = confirm("Do you want to delete this user");
        if (!isdelete) { return false; }
        var deleteurl = url + '/' + id;
        repository.delete(function () {
            alert('Record deleted successfully');
            $scope.load($scope.currentPage);
        }, deleteurl);
    }

    $scope.save = function (myForm) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        setPayerDetails($scope);
        if ($scope.User == null || angular.isUndefined($scope.User.ContactId) || $scope.User.ContactId == '') { alert("Please select name from dropdown"); return false; }
        $scope.isUpdate = false;
        repository.insert(function (response) {
            if (response != null && angular.isDefined(response) && angular.isDefined(response.Id) && response.Id <= 0) {
                alert('Email already registered.');
                $scope.User = response;
                return false;
            }
            alert('Record saved successfully');
            $scope.load(0);
            $scope.isList = true;
            $scope.User = null;
        }, $scope.User);
    }

    $scope.update = function (myForm) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        setPayerDetails($scope);
        if ($scope.User == null || angular.isUndefined($scope.User.ContactId) || $scope.User.ContactId == '') { alert("Please select name from dropdown"); return false; }
        if ($scope.User != null && angular.isDefined($scope.User.Id) && $scope.User.Id > 0) {
            var updateurl = url + '/' + $scope.User.Id;
            repository.update(function (response) {
                if (response != null && angular.isDefined(response) && angular.isDefined(response.Id) && response.Id <= 0) {
                    alert('Email already registered.');
                    return false;
                }
                alert('Record updated successfully');
                $scope.load(0);
            }, $scope.User, updateurl);
        }
        else {
            alert("Invalid information for edit contact")
        }
    }

    $scope.claerTopFilter = function () {
        $scope.Filter = null;
        $scope.filter();
    }

    $scope.changeName = function () {
        if ($scope.payerDetail != null && angular.isDefined($scope.payerDetail) && angular.isDefined($scope.payerDetail.ContactId)) {
            delete $scope.payerDetail.ContactId;
        }
        if ($scope.User != null && angular.isDefined($scope.User) && angular.isDefined($scope.User.ContactId)) {
            delete $scope.User.ContactId;
        }
    }

    $scope.getAll = function (val) {
        return repository.getWebApi(typeaheadurl + '/' + val + '/all');
    };
}


function setPayerDetails(scope)
{
    if (scope.payerDetail != null && angular.isDefined(scope.payerDetail.ContactId) && scope.payerDetail.ContactId != "" && scope.payerDetail.ContactId > 0) {
        scope.User.ContactName = scope.payerDetail.Name;
        scope.User.ContactId = scope.payerDetail.ContactId;
    }
    else {
        scope.User.ContactName = scope.payerDetail;
    }
}

function getPayerDetails(scope) {
    scope.payerDetail = {};
    if (scope.User.ContactId != null && angular.isDefined(scope.User.ContactId) && scope.User.ContactId != "" && scope.User.ContactId > 0) {
        scope.payerDetail.Name = scope.User.ContactName;
        scope.payerDetail.ContactId = scope.User.ContactId;
    }
    else {
        scope.payerDetail = scope.User.ContactName;
    }
}
