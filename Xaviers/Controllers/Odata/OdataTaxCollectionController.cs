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
    /*
    To add a route for this controller, merge these statements into the Register method of the WebApiConfig class. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using DatabaseDataModel;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<TaxCollection>("OdataTaxCollection");
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    public class OdataTaxCollectionController : ODataController
    {
        IRepository<TaxCollection> collectionRepository = null;
        IUnitOfWork unitOfWork = null;
        public OdataTaxCollectionController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            collectionRepository = unitOfWork.GetRepository<TaxCollection>();
        }

        // GET odata/OdataTaxCollection
        [Queryable]
        public IQueryable<TaxCollection> GetOdataTaxCollection()
        {
            Authentication auth = new Authentication();
            if (auth.LoggedinUser != null)
            {
                Expression<Func<TaxCollection, bool>> expr = exp => exp.CustomerId == auth.LoggedinUser.CustomerId;
                return collectionRepository.GetData(expr);
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
