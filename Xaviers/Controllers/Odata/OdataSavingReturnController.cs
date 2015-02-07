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
using BusinessLayer;
using RepositroryAndUnitOfWork.Implementations;
using System.Linq.Expressions;

namespace Xaviers.Controllers.Odata
{
   
    public class OdataSavingReturnController : ODataController
    {
        IRepository<SmallSavingsSettlement> savingReturnRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();
        public OdataSavingReturnController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            savingReturnRepository = unitOfWork.GetRepository<SmallSavingsSettlement>();
        }

        // GET odata/OdataSavingReturn
        [Queryable]
        public IQueryable<SmallSavingsSettlement> GetOdataSavingReturn()
        {
            if (auth.LoggedinUser != null)
            {
                Expression<Func<SmallSavingsSettlement, bool>> expr = contact => contact.CustomerId == auth.LoggedinUser.CustomerId;
                return savingReturnRepository.GetData(expr);
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
