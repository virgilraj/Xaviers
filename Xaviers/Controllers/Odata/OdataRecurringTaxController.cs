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
   
    public class OdataRecurringTaxController : ODataController
    {
        IRepository<RecurringTax> recurringRepository = null;
        IUnitOfWork unitOfWork = null;


        public OdataRecurringTaxController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            recurringRepository = unitOfWork.GetRepository<RecurringTax>();
        }

        // GET odata/OdataRecurringTax
        [Queryable]
        public IQueryable<RecurringTax> GetOdataRecurringTax()
        {
            Authentication auth = new Authentication();
            if (auth.LoggedinUser != null)
            {
                Expression<Func<RecurringTax, bool>> expr = exp => exp.CustomerId == auth.LoggedinUser.CustomerId;
                return recurringRepository.GetData(expr);
            }
            else
            {
                return null;
            }
        }

    }
}
