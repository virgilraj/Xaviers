using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using System.Web.Http.OData;
using System.Web.Http.OData.Routing;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Interfaces;
using RepositroryAndUnitOfWork.Implementations;
using BusinessLayer;
using System.Linq.Expressions;

namespace Xaviers.Controllers.Odata
{
    public class OdataIncomeExpenseGroupController : ODataController
    {
        IRepository<IncomeExpenseGroup> incomeGroupRepository = null;
        IUnitOfWork unitOfWork = null;

        public OdataIncomeExpenseGroupController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            incomeGroupRepository = unitOfWork.GetRepository<IncomeExpenseGroup>();
        }

        // GET odata/OdataIncomeExpenseGroup
        [Queryable]
        public IQueryable<IncomeExpenseGroup> GetOdataIncomeExpenseGroup()
        {
            Authentication auth = new Authentication();
            if (auth.LoggedinUser != null)
            {
                Expression<Func<IncomeExpenseGroup, bool>> expr = exp => exp.CustomerId == auth.LoggedinUser.CustomerId;
                return incomeGroupRepository.GetData(expr);
            }
            else
            {
                return null;
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                unitOfWork.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
