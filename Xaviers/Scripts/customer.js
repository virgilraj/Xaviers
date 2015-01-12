var url = '/api/Customer';
function customerCtrl($scope, repository, $http, fileUpload, utilityService, $location) {

    if ($scope.Customer == null || angular.isUndefined(Customer.Contact)) {
        $scope.Customer = {};
        $scope.Customer.Title = "Mr";
    }

    $scope.reset = function () {
        $scope.Password = null;
        $scope.Gender = "Male";
        $scope.Eligible = 'Yes';
        $scope.Member = 'Yes';
    }
    
    $scope.edit = function () {
        var urlsplit = location.href.split('/');
        var id = urlsplit.length > 1 ? urlsplit[urlsplit.length - 1] : '';
        if (id == '') { return false; }

        var editUrl = url + '/' + id;
        repository.get(function (results) {
            $scope.Customer = results.length > 0 ? results[0] : results;
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = false;
    }

    $scope.view = function (id) {
        var editUrl = url + '/' + id;
        repository.get(function (results) {
            $scope.Customer = results.length > 0 ? results[0] : results;
            
        }, editUrl);
        $scope.isUpdate = true;
        $scope.isList = false;
        $scope.isView = true;
    }

    $scope.delete = function (id) {
        var isdelete = confirm("Do you want to delete this customer");
        if (!isdelete) { return false;}
        var deleteurl = url + '/' + id;
        repository.delete(function () {
            alert('Customer deleted successfully');
            $scope.load($scope.currentPage);
        }, deleteurl);
    }

    $scope.save = function (myForm) {
        
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        if ($scope.Customer.CurrentFinanceyear < $scope.Customer.StartFinaceYer)
        {

            alert("Current financial year should not be less than starting financial year. Please enter valid current financial year.");
            return false;
        }
        $scope.Customer.HasLogo = angular.isDefined($scope.myFile) && angular.isObject($scope.myFile) ? true : false;
        $scope.isUpdate = false;
        repository.insert(function (response) {
            if (response != null && angular.isDefined(response) && angular.isDefined(response.Id) && response.Id <= 0) {
                alert('Email already registered. \nPlease use forget password to activaate you account.');
                $scope.Customer = response;
                return false;
            }
            else {
                alert('Registration completed successfully.')
                location.href = '/Home/Login';
            }
        }, $scope.Customer,
         function (resp) {
             if (resp != null && angular.isDefined(resp) && angular.isDefined(resp.data) && resp.data.HasLogo) {
                 $scope.uploadFile(resp.data.Id);
             }
         });
        
        $scope.isList = true;
    }

    $scope.update = function (myForm) {
        if (!myForm.$valid) { alert("Please enter valid inputs"); return false; }
        if ($scope.Customer != null && angular.isDefined($scope.Customer.Id) && $scope.Customer.Id > 0) {
            var updateurl = url + '/' + $scope.Customer.Id;
            repository.update(function () {
                alert('Customer updated successfully');
                $scope.addCustomer();
            }, $scope.Customer, updateurl);

            if ($scope.Customer != null && angular.isDefined($scope.Customer)) {
                $scope.uploadFile($scope.Customer.Id);
            }
        }
        else
        {
            alert("Invalid information for edit customer")
        }
    }

    $scope.uploadFile = function (id) {
        if (angular.isDefined($scope.myFile) && angular.isObject($scope.myFile)) {
            var file = $scope.myFile;
            var uploadUrl = "/api/FileUpload/customer_" + id;
            fileUpload.uploadFileToUrl(file, uploadUrl);
        }
    };
}

