using DatabaseDataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer
{
    public class MiniContact : RepositoryAndUnitOfWork.Interfaces.IBusinessModel
    {
        public int ContactId { get; set; }
        public string Name { get; set; }

        public string Email { get; set; }
    }

    public class ContactAndLoan : RepositoryAndUnitOfWork.Interfaces.IBusinessModel
    {
        public int ContactId { get; set; }
        public string Name { get; set; }

        public string Email { get; set; }
        public List<LoanList> LoanList { get; set; }
    }

    public class LoanInfo : RepositoryAndUnitOfWork.Interfaces.IBusinessModel
    {
        public int LoanId { get; set; }
        public double TotalPrincipalPaid { get; set; }
        public double TotalInterestPaid { get; set; }
        public double TotalLateFeepaid { get; set; }
        public double CurrentPrincipal { get; set; }
        public double ExtraPrincipal { get; set; }
        public double CurrentInterest { get; set; }
        public double CurrentLateFee { get; set; }
        public double TotalAmountRequiredToClose { get; set; }
        public string Name { get; set; }

        public string MonthOrYear { get; set; }
        public string Desciption { get; set; }
        public double Total { get; set; }

    }
    public class LoanList : RepositoryAndUnitOfWork.Interfaces.IBusinessModel
    {
        public int LoanId { get; set; }
        public string LoanName { get; set; }

        public double loanAmount { get; set; }
    }

    public class TaxTotalAmount : RepositoryAndUnitOfWork.Interfaces.IBusinessModel
    {
        public int TaxId { get; set; }
        public double ExceptedAmount { get; set; }
        public double BalanceAmount { get; set; }
        public double TotalReceivedAmount { get; set; }
    }

    public class TaxBalance : RepositoryAndUnitOfWork.Interfaces.IBusinessModel
    {
        public int TaxId { get; set; }
        public int ContactId { get; set; }
        public double BalanceAmount { get; set; }
        public double TotalReceivedAmount { get; set; }

        public string PayType { get; set; }
    }

    public class TaxBalanceAndReceived : TaxBalance, RepositoryAndUnitOfWork.Interfaces.IBusinessModel
    {
        public double TaxAmount { get; set; }
        public string TaxName { get; set; }
        public string ContactName { get; set; }
    }

    public class RoleAndController
    {
        public List<string> Controllers { get; set; }
        public string Role { get; set; }
    }

    public class LoginUser : User
    {
        public string Name { get; set; }
        public string Phone { get; set; }
        public string DisplayGroupName { get; set; }
        public bool? HasLogo { get; set; }
        public string CurrentSartFinanceYearDatae { get; set; }
        public string CurrentEndFinanceYearDatae { get; set; }
        public string CommonGroupName { get; set; }
        public int CurrentFinanceYear { get; set; }

        public int StartFinanceYear { get; set; }

        public double OpeningBalance { get; set; }
    }

    public class ChangePassword
    {
        public string OldPwd { get; set; }
        public string NewPwd { get; set; }
        public string CnfPwd { get; set; }
    }

    public class ForgotPassword
    {
        public string Email { get; set; }
    }

    public class Report
    {
        public string Description { get; set; }
        public double Income { get; set; }
        public DateTime IncomeDate { get; set; }
        public double Expense { get; set; }
        public DateTime ExpenseDate { get; set; }
    }

    public class AuditRepot
    {
        public string GroupName { get; set; }
        public List<Report> IncomeExpense { get; set; }
        public double ExpenseTotal { get; set; }
        public double IncomeTotal { get; set; }
    }

    public class ChartList : RepositoryAndUnitOfWork.Interfaces.IBusinessModel
    {
        public List<ChartData> IncomeExpense { get; set; }
        public List<ChartData> Income { get; set; }

        public List<ChartData> Expense { get; set; }
    }

    public class ChartData : RepositoryAndUnitOfWork.Interfaces.IBusinessModel
    {
        public string Name { get; set; }
        public double Value1 { get; set; }
        public double Value2 { get; set; }

        public double PrevValue1 { get; set; }
        public double PrevValue2 { get; set; }
    }

    public class MailCampaign
    {
        public string Emails { get; set; }
        public int MailGroupId { get; set; }
        public string Subject { get; set; }
        public string Campaign { get; set; }
    }
}
