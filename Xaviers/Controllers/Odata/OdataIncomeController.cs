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
    public class OdataIncomeController : ODataController
    {
        IRepository<Income> incomeRepository = null;
        IUnitOfWork unitOfWork = null;

        public OdataIncomeController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            incomeRepository = unitOfWork.GetRepository<Income>();
        }

        // GET odata/OdataIncome
        [Queryable]
        public IQueryable<Income> GetOdataIncome()
        {
            Authentication auth = new Authentication();
            if (auth.LoggedinUser != null)
            {
                Expression<Func<Income, bool>> expr = exp => exp.CustomerId == auth.LoggedinUser.CustomerId;
                return incomeRepository.GetData(expr);
            }
            else
            {
                return null;
            }
        }
       
    }
}
