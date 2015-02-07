using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Interfaces;
using RepositroryAndUnitOfWork.Implementations;
using BusinessLayer;

namespace Xaviers.Controllers.WebApi
{
    public class ExpenseController : ApiController
    {
        IRepository<Expense> expenseRepository = null;
        IRepository<IncomeExpenseGroup> incomeGroupRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();
        public ExpenseController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            expenseRepository = unitOfWork.GetRepository<Expense>();
            incomeGroupRepository = unitOfWork.GetRepository<IncomeExpenseGroup>();
        }

        // GET api/Expense
        public IEnumerable<Expense> GetExpenses()
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }
            return expenseRepository.GetAll();
        }

        // GET api/Expense/5
        [ResponseType(typeof(Expense))]
        public IHttpActionResult GetExpense(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            Expense expense = expenseRepository.Single(id);
            if (expense == null)
            {
                return NotFound();
            }

            return Ok(expense);
        }

        // PUT api/Expense/5
        public IHttpActionResult PutExpense(int id, Expense expense)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != expense.Id || auth.LoggedinUser == null)
            {
                return BadRequest();
            }

            try
            {
                expense.ModifyDate = DateTime.Now;
                expense.ModifyBy = auth.LoggedinUser.ContactId;
                //expense.ContactName = auth.LoggedinUser.ContactName;
                expense.CustomerId = auth.LoggedinUser.CustomerId;
                expenseRepository.Update(expense);
                unitOfWork.Save();
                //Save group name
                SaveGroup(expense);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!expenseRepository.Exists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST api/Expense
        [ResponseType(typeof(Expense))]
        public IHttpActionResult PostExpense(Expense expense)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                expense.ModifyDate = DateTime.Now;
                expense.ModifyBy = auth.LoggedinUser.ContactId;
                expense.CreatedDate = DateTime.Now;
                expense.CreatedBy = auth.LoggedinUser.ContactId;
                //expense.ContactName = auth.LoggedinUser.ContactName;
                expense.CustomerId = auth.LoggedinUser.CustomerId;
                expenseRepository.Add(expense);
                unitOfWork.Save();

                SaveGroup(expense);
            }
            catch (DbUpdateException)
            {
                if (expenseRepository.Exists(expense.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = expense.Id }, expense);
        }

        // DELETE api/Expense/5
        [ResponseType(typeof(Expense))]
        public IHttpActionResult DeleteExpense(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            try
            {
                Expense expense = expenseRepository.Single(id);
                expenseRepository.Delete(expense);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }
            return StatusCode(HttpStatusCode.NoContent);
        }

        private void SaveGroup(Expense expense)
        {
            if (!incomeGroupRepository.Exists(expense.GroupName))
            {
                IncomeExpenseGroup incomeExpenseGrp = new IncomeExpenseGroup { GroupName = expense.GroupName, CustomerId = auth.LoggedinUser.CustomerId };
                incomeGroupRepository.Add(incomeExpenseGrp);
                unitOfWork.Save();
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