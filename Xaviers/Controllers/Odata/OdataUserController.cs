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
    builder.EntitySet<User>("OdataUser");
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    public class OdataUserController : ODataController
    {
        IRepository<User> userRepository = null;
        IUnitOfWork unitOfWork = null;
        public OdataUserController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            userRepository = unitOfWork.GetRepository<User>();
        }

        // GET odata/OdataUser
        [Queryable]
        public IQueryable<User> GetOdataUser()
        {
            Authentication auth = new Authentication();
            if (auth.LoggedinUser != null)
            {
                Expression<Func<User, bool>> expr = exp => exp.CustomerId == auth.LoggedinUser.CustomerId;
                return userRepository.GetData(expr);
            }
            else
            {
                return null;
            }
        }
    }
}
