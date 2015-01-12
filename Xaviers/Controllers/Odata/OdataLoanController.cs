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
    
    public class OdataLoanController : ODataController
    {
        IRepository<Loan> loanRepository = null;
        IUnitOfWork unitOfWork = null;
        public OdataLoanController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            loanRepository = unitOfWork.GetRepository<Loan>();
        }

        // GET odata/OdataLoan
        [Queryable]
        public IQueryable<Loan> GetOdataLoan()
        {
            Authentication auth = new Authentication();
            if (auth.LoggedinUser != null)
            {
                Expression<Func<Loan, bool>> expr = exp => exp.CustomerId == auth.LoggedinUser.CustomerId;
                return loanRepository.GetData(expr);
            }
            else
            {
                return null;
            }
        }

    }
}
