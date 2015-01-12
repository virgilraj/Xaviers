using System.Linq;
using System.Web.Http;
using System.Web.Http.OData;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Interfaces;
using RepositroryAndUnitOfWork.Implementations;
using BusinessLayer;
using System.Linq.Expressions;
using System;

namespace Xaviers.Controllers.Odata
{
    
    public class OdataExpenseController : ODataController
    {
        IRepository<Expense> expenseRepository = null;
        IUnitOfWork unitOfWork = null;
        public OdataExpenseController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            expenseRepository = unitOfWork.GetRepository<Expense>();
        }

        // GET odata/OdataExpense
        [Queryable]
        public IQueryable<Expense> GetOdataExpense()
        {
            Authentication auth = new Authentication();
            if (auth.LoggedinUser != null)
            {
                Expression<Func<Expense, bool>> expr = exp => exp.CustomerId == auth.LoggedinUser.CustomerId;
                return expenseRepository.GetData(expr);
            }
            else
            {
                return null;
            }
        }
    }
}
