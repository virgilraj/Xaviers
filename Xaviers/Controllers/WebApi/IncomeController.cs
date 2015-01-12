using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Interfaces;
using RepositroryAndUnitOfWork.Implementations;
using System.Linq.Expressions;
using System.Linq;
using BusinessLayer;

namespace Xaviers.Controllers.WebApi
{
    public class IncomeController : ApiController
    {
        IRepository<Income> incomeRepository = null;
        IRepository<IncomeExpenseGroup> incomeGroupRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();
        public IncomeController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            incomeRepository = unitOfWork.GetRepository<Income>();
            incomeGroupRepository = unitOfWork.GetRepository<IncomeExpenseGroup>();
        }

        // GET api/Income
        public IEnumerable<Income> GetIncomes()
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }
            return incomeRepository.GetAll();
        }

        


        // GET api/Income/5
        [ResponseType(typeof(Income))]
        public IHttpActionResult GetIncome(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            Income income = incomeRepository.Single(id);
            if (income == null)
            {
                return NotFound();
            }

            return Ok(income);
        }

        // PUT api/Income/5
        public IHttpActionResult PutIncome(int id, Income income)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != income.Id || auth.LoggedinUser == null)
            {
                return BadRequest();
            }

            try
            {
                income.ModifyDate = DateTime.Now;
                income.ModifyBy = auth.LoggedinUser.ContactId;
                income.ReceiverId = auth.LoggedinUser.ContactId;
                income.ReceiverName = auth.LoggedinUser.Name;
                income.CustomerId = auth.LoggedinUser.CustomerId;
                incomeRepository.Update(income);
                unitOfWork.Save();

                //Save group name
                SaveGroup(income);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!incomeRepository.Exists(id))
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

        // POST api/Income
        [ResponseType(typeof(Income))]
        public IHttpActionResult PostIncome(Income income)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                income.ModifyDate = DateTime.Now;
                income.ModifyBy = auth.LoggedinUser.ContactId;
                income.CreatedDate = DateTime.Now;
                income.CreatedBy = auth.LoggedinUser.ContactId;
                income.ReceiverId = auth.LoggedinUser.ContactId;
                income.ReceiverName = auth.LoggedinUser.Name;
                income.CustomerId = auth.LoggedinUser.CustomerId;
                incomeRepository.Add(income);
                unitOfWork.Save();

                //Save group name
                SaveGroup(income);
            }
            catch (DbUpdateException)
            {
                if (incomeRepository.Exists(income.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = income.Id }, income);
        }

        // DELETE api/Income/5
        [ResponseType(typeof(Income))]
        public IHttpActionResult DeleteIncome(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            try
            {
                Income income = incomeRepository.Single(id);
                incomeRepository.Delete(income);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }
            return StatusCode(HttpStatusCode.NoContent);
        }

        private void SaveGroup(Income income)
        {
            if (!incomeGroupRepository.Exists(income.GroupName))
            {
                IncomeExpenseGroup incomeExpenseGrp = new IncomeExpenseGroup { GroupName = income.GroupName, CustomerId = auth.LoggedinUser.CustomerId };
                incomeGroupRepository.Add(incomeExpenseGrp);
                unitOfWork.Save();
            }
        }

    }
}