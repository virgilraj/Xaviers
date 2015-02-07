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
    
    public class OdataSmallSavingController : ODataController
    {
        IRepository<SmallSavingsCollection> savingsRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();

        public OdataSmallSavingController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            savingsRepository = unitOfWork.GetRepository<SmallSavingsCollection>();
        }

        // GET odata/OdataSmallSaving
        [Queryable]
        public IQueryable<SmallSavingsCollection> GetOdataSmallSaving()
        {
            if (auth.LoggedinUser != null)
            {
                Expression<Func<SmallSavingsCollection, bool>> expr = contact => contact.CustomerId == auth.LoggedinUser.CustomerId;
                return savingsRepository.GetData(expr);
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
