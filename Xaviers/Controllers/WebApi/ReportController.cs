using BusinessLayer;
using DatabaseDataModel;
using RepositoryAndUnitOfWork.Interfaces;
using RepositroryAndUnitOfWork.Implementations;
using RepositroryAndUnitOfWork.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Xaviers.Controllers.WebApi
{
    public class ReportController : ApiController
    {
        IRepository<Income> incomeRepository = null;
        IRepository<Expense> expenseRepository = null;
        IRepository<TaxCollection> taxcollectionRepository = null;
        IRepository<RecurringTaxCollection> recurringtaxcollectionRepository = null;
        IRepository<Loan> loanRepository = null;
        IRepository<LoanCollection> loanCollectionRepository = null;
        IRepository<SmallSavingsCollection> smallSavingRepository = null;
        IRepository<SmallSavingsSettlement> smallSavingSettlementRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();

        public ReportController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            incomeRepository = unitOfWork.GetRepository<Income>();
            expenseRepository = unitOfWork.GetRepository<Expense>();
            taxcollectionRepository = unitOfWork.GetRepository<TaxCollection>();
            recurringtaxcollectionRepository = unitOfWork.GetRepository<RecurringTaxCollection>();
            loanRepository = unitOfWork.GetRepository<Loan>();
            loanCollectionRepository = unitOfWork.GetRepository<LoanCollection>();
            smallSavingRepository = unitOfWork.GetRepository<SmallSavingsCollection>();
            smallSavingSettlementRepository = unitOfWork.GetRepository<SmallSavingsSettlement>();
        }

        
        // GET api/Report
        /// <summary>
        /// id : finansial year
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        
        [Route("api/Report/{id:int}")]
        public IEnumerable<AuditRepot> GetIncomes(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }
            Reports report = new Reports(incomeRepository, expenseRepository, taxcollectionRepository, recurringtaxcollectionRepository, loanRepository, loanCollectionRepository, smallSavingRepository, smallSavingSettlementRepository);
            return report.GetAuditReport(id, true);
        }

        // GET api/Report
        /// <summary>
        /// id : finansial year
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/Report/{keyword}/{gender}")]
        public IBusinessModel GetIncomes(string keyword, string gender)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }
            if(keyword == null) {return null;}
            int id = 0;
            int.TryParse(keyword, out id);
            if (gender == "IE")
            {
                Reports report = new Reports(incomeRepository, expenseRepository, taxcollectionRepository, recurringtaxcollectionRepository, loanRepository, loanCollectionRepository, smallSavingRepository, smallSavingSettlementRepository); 
                return report.GetIncomeExpenseChartData(id);
            }
            return null;
            //else
            //{
            //    Reports report = new Reports(incomeRepository, expenseRepository, taxcollectionRepository, recurringtaxcollectionRepository);
            //    return report.GetIncomeChartData(id);
            //}
        }
    }
}
