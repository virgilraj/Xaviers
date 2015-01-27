using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Interfaces;
using RepositroryAndUnitOfWork.Implementations;
using BusinessLayer;
using System.Linq.Expressions;

namespace Xaviers.Controllers.WebApi
{
    public class IncomeExpenseGroupController : ApiController
    {
        IRepository<Income> incomeRepository = null;
        IRepository<Expense> expenseRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();

        public IncomeExpenseGroupController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            incomeRepository = unitOfWork.GetRepository<Income>();
            expenseRepository = unitOfWork.GetRepository<Expense>();
        }


        // GET api/IncomeExpenseGroup
        //public IEnumerable<IncomeExpenseGroup> GetIncomeExpenseGroups()
        //{
        //    return incomeGroupRepository.GetAll();
        //}

        // GET api/IncomeExpenseGroup/5
        public List<IncomeExpenseGroup> GetIncomeExpenseGroup(string id)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }
            List<IncomeExpenseGroup> group = new List<IncomeExpenseGroup>();
            Func<Income, Income> selector = sel => new Income {Description = sel.Description, CustomerId = sel.CustomerId};
            Func<Income, bool> expr = grp => grp.CustomerId == auth.LoggedinUser.CustomerId && !string.IsNullOrEmpty(grp.Description) && grp.Description.ToLower().StartsWith(id.ToLower());
            IEnumerable<Income> incomes = incomeRepository.GetAll(expr); //, selector);

            if (incomes != null && incomes.Count() > 0)
            {
                foreach(Income income in incomes)
                {
                   if(!group.Exists(gp => gp.GroupName == income.Description))
                   {
                       group.Add(new IncomeExpenseGroup { GroupName = income.Description });
                   }
                }
            }


            Func<Expense, Expense> selector1 = sel => new Expense { Reason = sel.Reason, CustomerId=sel.CustomerId };
            Func<Expense, bool> expr1 = grp => grp.CustomerId == auth.LoggedinUser.CustomerId && grp.Reason.ToLower().StartsWith(id.ToLower());
            IEnumerable<Expense> expenses = expenseRepository.GetAll(expr1); //, selector1);

            if (expenses != null && expenses.Count() > 0)
            {
                foreach (Expense expense in expenses)
                {
                    if (!group.Exists(gp => gp.GroupName == expense.Reason))
                    {
                        group.Add(new IncomeExpenseGroup { GroupName = expense.Reason });
                    }
                }
            }

            return group;
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