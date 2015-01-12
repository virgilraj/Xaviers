var url = '/api/Report';
var urlchart = '/api/Report';
var odaturl = '/odata/OdataUser';
var typeaheadurl = "/api/Contacts";
function reportCtrl($scope, repository, $http, utilityService, $window) {

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
    $scope.yearList = [];
    $scope.selYear = '';
    $scope.Year = CFYer;

    $scope.addUser = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = false;
        $scope.isView = false;
    }
    $scope.showUser = function () {
        $scope.isUpdate = false;
        $scope.reset();
        $scope.isList = true;
    }
    $scope.pageChange = function (pageno) {
        $scope.load(pageno, false);
    }

    $scope.load = function (pageno, val) {
        if (val) {
            $scope.selYear = CFYer + ' - ' + parseInt(CFYer + 1);
        }
        for (var i = SFYer; i <= CFYer; i++) {
            $scope.yearList.push(i + ' - ' + parseInt(i + 1));
        }

        var skipnum = parseInt($scope.itemsPerPage) * parseInt(pageno - 1);
        var loadurl = url + '/' + $scope.Year;
        repository.get(function (results) {
            if (!angular.isObject(results)) {
                $window.location.reload();
            }
            $scope.reports = results;
            $scope.totalItems = parseInt(results["odata.count"]);
        }, loadurl);

    }

    $scope.getReport = function () {
        $scope.Year = parseInt($scope.selYear.split('-')[0]);
        $scope.load();
    }

    $scope.getExpenseTotal = function()
    {
        if($scope.reports !=null && $scope.reports.length > 0)
        {
            return $scope.reports[0].ExpenseTotal;
        }

        return 0;
    }

    $scope.getIncomeTotal = function()
    {
        if ($scope.reports != null && $scope.reports.length > 0) {
            return $scope.reports[0].IncomeTotal;
        }

        return 0;
    }

    $scope.chart = function()
    {
        $scope.selYear = CFYer + ' - ' + parseInt(CFYer + 1);
        for (var i = SFYer; i <= CFYer; i++)
        {
            $scope.yearList.push(i + ' - ' + parseInt(i + 1));
        }

        $scope.loadChart();
    }

    $scope.getCharts = function()
    {
        $scope.Year = parseInt($scope.selYear.split('-')[0]);
        $scope.loadChart();
    }

    $scope.loadChart = function()
    {
        var loadurl = urlchart + '/' + $scope.Year + '/IE';
        
            var xmlhttp;
            if (window.XMLHttpRequest)	// code for IE7+, Firefox, Chrome, Opera, Safari
            {
                xmlhttp = new XMLHttpRequest();
            }
            else				// code for IE6, IE5
            {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }

            var jsonData = {};
            $.ajax({
                type: 'GET',
                url: loadurl,
                async: false, //Make synchronous calls
                data: {},

                complete: function (xhr, textStatus) {
                    jsonData = $.parseJSON(xhr.responseText);
                }
            });


            //var data = new google.visualization.DataTable();
            var chartdata = [];
            chartdata.push(['Name', $scope.Year + ' Expense ', $scope.Year + ' Income', parseInt($scope.Year - 1) + ' Expense', parseInt($scope.Year - 1) + ' Income'])

            if (jsonData.IncomeExpense != null && jsonData.IncomeExpense.length > 0) {
                angular.forEach(jsonData.IncomeExpense, function (dta, index) {
                    chartdata.push([dta.Name, dta.Value1, dta.Value2, dta.PrevValue1, dta.PrevValue2]);
                });
            }


            var data = google.visualization.arrayToDataTable(chartdata);

            var options = {
                title: 'Income Expense Report for the year of ' + $scope.selYear,
                is3D: true
            };

            var chart = new google.visualization.BarChart(document.getElementById('incomeexpense'));

            chart.draw(data, options);

            var incomedata = [];
            incomedata.push(['Income', 'Current'])

            if (jsonData.Income != null && jsonData.Income.length > 0) {
                angular.forEach(jsonData.Income, function (dta, index) {
                    incomedata.push([dta.Name, dta.Value1]);
                });
            }


            var dataincome = google.visualization.arrayToDataTable(incomedata);

            var options1 = {
                title: 'Income for this year of ' + $scope.selYear,
                is3D: true
            };

            var chart1 = new google.visualization.PieChart(document.getElementById('income'));

            chart1.draw(dataincome, options1);

            var expensedata = [];
            expensedata.push(['Expense', 'Current'])

            if (jsonData.Expense != null && jsonData.Expense.length > 0) {
                angular.forEach(jsonData.Expense, function (dta, index) {
                    expensedata.push([dta.Name, dta.Value1]);
                });
            }


            var dataexpense = google.visualization.arrayToDataTable(expensedata);

            var options2 = {
                title: 'Expense for this year of ' + $scope.selYear,
                is3D: true
            };

            var chart1 = new google.visualization.PieChart(document.getElementById('expense'));

            chart1.draw(dataexpense, options2);
    }
}

