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
    public class LoanCollectionController : ApiController
    {
        IRepository<Contact> contactRepository = null;
        IRepository<Loan> loanRepository = null;
        IRepository<LoanCollection> loanCollectionRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();
        public LoanCollectionController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            loanCollectionRepository = unitOfWork.GetRepository<LoanCollection>();
            contactRepository = unitOfWork.GetRepository<Contact>();
            loanRepository = unitOfWork.GetRepository<Loan>();
        }

        // GET api/LoanCollection
        //public IEnumerable<LoanCollection> GetLoanCollections()
        //{
        //    if (auth.LoggedinUser == null)
        //    {
        //        return null;
        //    }
        //    return loanCollectionRepository.GetAll();
        //}

        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/LoanCollection/{keyword}")]
        public IEnumerable<IBusinessModel> GetLoanCollections(string keyword)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }

            if (string.IsNullOrEmpty(keyword)) { return null; }

            List<MiniContact> loans = new List<MiniContact>();
            int customerid = 0;
            int.TryParse(auth.LoggedinUser.CustomerId.ToString(), out customerid);
            LoanCalculation loanCal = new LoanCalculation(loanRepository, contactRepository, loanCollectionRepository);
            return loanCal.GetLoansForContacts(keyword, customerid);
        }

        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/LoanCollection/{keyword}/{gender}")]
        public IEnumerable<IBusinessModel> GetLoanCollections(string keyword, string gender)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }

            if (string.IsNullOrEmpty(keyword)) { return null; }
            LoanCalculation loancalculation = new LoanCalculation(loanRepository, contactRepository, loanCollectionRepository);

            List<LoanInfo> loans = new List<LoanInfo>();
            if (gender.ToLower() == "all")
            {
                foreach (string loanid in keyword.Split(','))
                {
                    
                    int id = 0;
                    int.TryParse(loanid, out id);
                    LoanInfo loaninfo = loancalculation.GetLoanInfo(id, (int)auth.LoggedinUser.CustomerId);
                    if (loaninfo != null)
                    {
                        loans.Add(loaninfo);
                    }
                }
            }
            else
            {
                int contactid = 0;
                int.TryParse(keyword, out contactid);
                return loancalculation.GetLoansForContact(contactid, (int)auth.LoggedinUser.CustomerId);
            }

            return loans;
        }

        // GET api/LoanCollection/5
        [ResponseType(typeof(LoanCollection))]
        [Route("api/LoanCollection/{id:int}")]
        public IHttpActionResult GetLoanCollection(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            LoanCollection loancollection = loanCollectionRepository.Single(id);
            if (loancollection == null)
            {
                return NotFound();
            }

            return Ok(loancollection);
        }

        // PUT api/LoanCollection/5
        [HttpPut]
        [Route("api/LoanCollection/{id:int}")]
        public IHttpActionResult PutLoanCollection(int id, LoanCollection loancollection)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != loancollection.Id || auth.LoggedinUser == null)
            {
                return BadRequest();
            }

            try
            {
                double amount = (double)loancollection.Amount;
                //make empty all amount column
                loancollection.Amount = 0;
                loancollection.Interest =0;
                loancollection.LateFee = 0;
                loanCollectionRepository.Update(loancollection);
                unitOfWork.Save();

                //Then calculate the amounts and update again
                LoanCalculation loancalculation = new LoanCalculation(loanRepository, contactRepository, loanCollectionRepository);
                LoanInfo loaninfo = loancalculation.GetLoanInfo(loancollection.LoanId, (int)auth.LoggedinUser.CustomerId);

                loancollection.ModifyDate = DateTime.Now;
                loancollection.ModifyBy = auth.LoggedinUser.ContactId;
                loancollection.CustomerId = auth.LoggedinUser.CustomerId;
                loancollection.ReceiverId = auth.LoggedinUser.ContactId;
                loancollection.ReceiverName = auth.LoggedinUser.Name;

                if (loaninfo.TotalAmountRequiredToClose == amount)
                {
                    Loan loan = loanRepository.Single(loancollection.LoanId);
                    loan.LoanStatus = "C";
                    loanRepository.Update(loan);
                    unitOfWork.Save();
                }
                if (loaninfo != null)
                {
                    loancollection.Amount = amount - loaninfo.CurrentInterest - loaninfo.CurrentLateFee;
                    loancollection.Interest = loaninfo.CurrentInterest;
                    loancollection.LateFee = loaninfo.CurrentLateFee;
                }
                loanCollectionRepository.Update(loancollection);
                unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!loanCollectionRepository.Exists(id))
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

        // POST api/LoanCollection
        [ResponseType(typeof(LoanCollection))]
        [HttpPost]
        public IHttpActionResult PostLoanCollection(LoanCollection loancollection)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                LoanCalculation loancalculation = new LoanCalculation(loanRepository, contactRepository, loanCollectionRepository);
                LoanInfo loaninfo = loancalculation.GetLoanInfo(loancollection.LoanId, (int)auth.LoggedinUser.CustomerId);
                
                loancollection.ModifyDate = DateTime.Now;
                loancollection.ModifyBy = auth.LoggedinUser.ContactId;
                loancollection.CreatedDate = DateTime.Now;
                loancollection.CreatedBy = auth.LoggedinUser.ContactId;
                loancollection.CustomerId = auth.LoggedinUser.CustomerId;
                loancollection.ReceiverId = auth.LoggedinUser.ContactId;
                loancollection.ReceiverName = auth.LoggedinUser.Name;

                if(loaninfo.TotalAmountRequiredToClose  == loancollection.Amount)
                {
                    Loan loan = loanRepository.Single(loancollection.LoanId);
                    loan.LoanStatus = "C";
                    loanRepository.Update(loan);
                    unitOfWork.Save();
                }
                if (loaninfo !=null)
                {
                    loancollection.Amount = loancollection.Amount - loaninfo.CurrentInterest - loaninfo.CurrentLateFee;
                    loancollection.Interest = loaninfo.CurrentInterest;
                    loancollection.LateFee = loaninfo.CurrentLateFee;
                }
                loanCollectionRepository.Add(loancollection);
                unitOfWork.Save();
            }
            catch (DbUpdateException e)
            {
                if (loanCollectionRepository.Exists(loancollection.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = loancollection.Id }, loancollection);
        }

        // DELETE api/LoanCollection/5
        [ResponseType(typeof(LoanCollection))]
        [HttpDelete]
        [Route("api/LoanCollection/{id:int}")]
        public IHttpActionResult DeleteLoanCollection(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            try
            {
                LoanCollection loancollection = loanCollectionRepository.Single(id);
                loanCollectionRepository.Delete(loancollection);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }
            return StatusCode(HttpStatusCode.NoContent);
        }
    }
}