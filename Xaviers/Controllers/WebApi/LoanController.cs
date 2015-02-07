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
using BusinessLayer;
using RepositroryAndUnitOfWork.Implementations;
using RepositoryAndUnitOfWork.Interfaces;

namespace Xaviers.Controllers.WebApi
{
    public class LoanController : ApiController
    {
        IRepository<Contact> contactRepository = null;
        IRepository<Loan> loanRepository = null;
        IRepository<LoanCollection> loanCollectionRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();
        public LoanController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            loanCollectionRepository = unitOfWork.GetRepository<LoanCollection>();
            contactRepository = unitOfWork.GetRepository<Contact>();
            loanRepository = unitOfWork.GetRepository<Loan>();
        }

        // GET api/Loan
        //public IEnumerable<Loan> GetLoans()
        //{
        //    if (auth.LoggedinUser == null)
        //    {
        //        return null;
        //    }
        //    return loanRepository.GetAll();
        //}

        // GET api/Loan/5
        [ResponseType(typeof(Loan))]
        [Route("api/Loan/{id:int}")]
        public IHttpActionResult GetLoan(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            Loan loan = loanRepository.Single(id);
            if (loan == null)
            {
                return NotFound();
            }

            return Ok(loan);
        }

        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/Loan/{keyword}/{gender}")]
        public IEnumerable<IBusinessModel> GetLoans(string keyword, string gender)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }

            if (string.IsNullOrEmpty(keyword)) { return null; }
            LoanCalculation loancalculation = new LoanCalculation(loanRepository, contactRepository, loanCollectionRepository);

            if (gender.ToLower() == "loan")
            {
                int id = 0;
                int.TryParse(keyword, out id);
                return loancalculation.GetLoanPendingList(id, (int)auth.LoggedinUser.CustomerId);
            }
            else
            {
                int contactid = 0;
                int.TryParse(keyword, out contactid);
                return loancalculation.GetLoanPendingListForContact(contactid, (int)auth.LoggedinUser.CustomerId);
            }
        }

        // PUT api/Loan/5
        [Route("api/Loan/{id:int}")]
        public IHttpActionResult PutLoan(int id, Loan loan)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != loan.Id || auth.LoggedinUser == null)
            {
                return BadRequest();
            }

           
            try
            {
                loan.ModifyDate = DateTime.Now;
                loan.ModifyBy = auth.LoggedinUser.ContactId;
                loan.CustomerId = auth.LoggedinUser.CustomerId;
                loanRepository.Update(loan);
                unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!loanRepository.Exists(id))
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

        // POST api/Loan
        [ResponseType(typeof(Loan))]
        [HttpPost]
        public IHttpActionResult PostLoan(Loan loan)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                loan.ModifyDate = DateTime.Now;
                loan.ModifyBy = auth.LoggedinUser.ContactId;
                loan.CreatedDate = DateTime.Now;
                loan.CreatedBy = auth.LoggedinUser.ContactId;
                //expense.ContactName = auth.LoggedinUser.ContactName;
                loan.CustomerId = auth.LoggedinUser.CustomerId;
                loanRepository.Add(loan);
                unitOfWork.Save();

            }
            catch (DbUpdateException)
            {
                if (loanRepository.Exists(loan.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = loan.Id }, loan);
        }

        // DELETE api/Loan/5
        [ResponseType(typeof(Loan))]
        [HttpDelete]
        [Route("api/Loan/{id:int}")]
        public HttpResponseMessage DeleteLoan(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            ValidateUsage valUsage = new ValidateUsage(null, null, null, null, loanCollectionRepository, null,
                null, null, null, null, null);
            if (valUsage.IsLoanAlreadyUsed(id))
            {
                return this.Request.CreateResponse(HttpStatusCode.OK, new { content = "USED" });
            }  
            try
            {
                Loan loan = loanRepository.Single(id);
                loanRepository.Delete(loan);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }
            return this.Request.CreateResponse(HttpStatusCode.NoContent); 
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