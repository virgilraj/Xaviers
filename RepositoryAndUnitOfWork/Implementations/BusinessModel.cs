using DatabaseDataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RepositoryAndUnitOfWork.Implementations
{
    public class MiniContact : RepositoryAndUnitOfWork.Interfaces.IBusinessModel
    {
        public int ContactId { get; set; }
        public string Name { get; set; }

        public string Email { get; set; }
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
        public string Email { get; set; }
        public string DisplayGroupName { get; set; }
        public bool? HasLogo { get; set; }
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
}
