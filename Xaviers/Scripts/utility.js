
angular.module('utilityServices', []).
factory('utilityService', function ($window) {
    var utilityService = {};

    utilityService.getDate = function (val) {
        var valArr = val.split('-');
        var valArr1 = val.split('/');
        if (valArr.length > 2) {
            val = appendZero(valArr[1]) + '-' + appendZero(valArr[0]) + '-' + appendZero(valArr[2]);
        }
        else if (valArr1.length > 2) {
            val = appendZero(valArr1[1]) + '-' + appendZero(valArr1[0]) + '-' + appendZero(valArr1[2]);
        }
        return val;
    }
    utilityService.formatDate = function (val) {
        var valArr = val.split('-');
        var valArr1 = val.split('/');
        if (valArr.length > 2) {
            val = appendZero(valArr[2].substr(0, 2)) + '-' + appendZero(valArr[1]) + '-' + appendZero(valArr[0]);
        }
        else if (valArr1.length > 2) {
            val = appendZero(valArr1[2].substr(0, 2)) + '-' + appendZero(valArr1[1]) + '-' + appendZero(valArr1[0]);
        }

        return val;
    }

    utilityService.getDateFromOdata = function (val) {
        var valArr = val.split('-');
        var valArr1 = val.split('/');
        if (valArr.length > 2) {
            val = appendZero(valArr[2].substr(0, 2)) + '-' + appendZero(valArr[1]) + '-' + appendZero(valArr[0]);
        }
        if (valArr1.length > 2) {
            val = appendZero(valArr1[2].substr(0, 2)) + '-' + appendZero(valArr1[1]) + '-' + appendZero(valArr1[0]);
        }
        return val;
    }

    utilityService.setSearchDate = function (val) {
        var valArr = val.split('-');
        var valArr1 = val.split('/');
        if (valArr.length > 2) {
            val = appendZero(valArr[2]) + '-' + appendZero(valArr[1]) + '-' + appendZero(valArr[0]);
        }
        if (valArr1.length > 2) {
            val = appendZero(valArr1[2]) + '-' + appendZero(valArr1[1]) + '-' + appendZero(valArr1[0]);
        }
        return val;
    }

    utilityService.getUniqueItems = function (data, key) {
        var result = [];
        angular.forEach(function (obj, index) {
            var value = data[index][key];
            if (result.indexOf(value) == -1) {
                result.push(obj);
            }
        })
        //for (var i = 0; i < data.length; i++) {
        //    var value = data[i][key];
        //    if (result.indexOf(value) == -1) {
        //        result.push({ key: value });
        //    }
        //}
        return result;
    };

    utilityService.formatStringBreaking = function (str, position) {
        if (angular.isUndefined(str)) return false;
        var newStr = '';
        var chararry = str.split('');
        for (var i = 0; i < chararry.length; i++) {
            newStr += (position / i) == 1 ? "\n" : "";
            newStr += chararry[i];
        }
        return newStr;
    }

    utilityService.validateDate = function (val) {
        if (Date.parse(val) === NaN || Date.parse(val) == 'NaN')
        {
            return false;
        }
        
        return true;
    }

    //Private methods
    function appendZero(val)
    {
        if (val.length == 1)
            return '0' + val;
        else
            return val;
    }

    

    return utilityService;
});
