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
    public class OdataLoanCollectionController : ODataController
    {
        IRepository<LoanCollection> loanCollectionRepository = null;
        IUnitOfWork unitOfWork = null;
        public OdataLoanCollectionController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            loanCollectionRepository = unitOfWork.GetRepository<LoanCollection>();
        }

        // GET odata/OdataLoanCollection
        [Queryable]
        public IQueryable<LoanCollection> GetOdataLoanCollection()
        {
            Authentication auth = new Authentication();
            if (auth.LoggedinUser != null)
            {
                Expression<Func<LoanCollection, bool>> expr = exp => exp.CustomerId == auth.LoggedinUser.CustomerId;
                return loanCollectionRepository.GetData(expr);
            }
            else
            {
                return null;
            }
        }
    }
}
