var url = '/api/MailCampaigns';
var odaturl = '/odata/OdataMailGroup?';
var typeaheadurl = "/api/MailGroup";
var pdfUrl = "/odata/OdataMailGroup?$expand=MailContacts"
var odaturl = '/odata/OdataMailGroup?&$filter=startswith(GroupName,\'plcholder\')';
function mailCtrl($scope, repository, $http, utilityService) {
    
    $scope.send = function (myForm, isApprove) {
        var EMAIL_REGEXP = /^([\w]+)(.[\w]+)*@([\w-]+\.){1,5}([A-Za-z]){2,4}$/i;
        
        var htmlData = CKEDITOR.instances.editor1.getData();
        if ($scope.Mail == null || angular.isUndefined($scope.Mail)) { alert("Please enter valid inputs"); return false; }
        if (($scope.Mail.Emails != null && angular.isDefined($scope.Mail.Emails) && $scope.Mail.Emails != '') ||
            ($scope.MailGroup != null && angular.isDefined($scope.MailGroup) && $scope.MailGroup.Id != '')) {
            if ($scope.Mail.Emails != null && angular.isDefined($scope.Mail.Emails) && $scope.Mail.Emails != '') {
                if (!EMAIL_REGEXP.test($scope.Mail.Emails.trim())) {
                    alert('Please enter valid emails');
                    return false;
                }
            }
            $scope.Mail.Campaign = htmlData;
            $scope.Mail.MailGroupId = ($scope.MailGroup != null && angular.isDefined($scope.MailGroup) && $scope.MailGroup.Id != '') ? $scope.MailGroup.Id : 0;
            repository.insert(function () {
                alert('Mail has been sent successfully');
                $scope.Mail = null;
                CKEDITOR.instances.editor1.setData('');
            }, $scope.Mail,
             function (resp) {

             });
        } else {
            alert("Please enter emails or select mail group");
            return false;
        }
    }

    $scope.getAll = function (val) {
        return repository.getWebApi(typeaheadurl + '/' + val );
    };
}
