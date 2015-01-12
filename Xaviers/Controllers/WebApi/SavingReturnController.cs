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
using System.Linq.Expressions;
using RepositoryAndUnitOfWork.Interfaces;

namespace Xaviers.Controllers.WebApi
{
    public class SavingReturnController : ApiController
    {
        IRepository<SmallSavingsSettlement> savingsReturnRepository = null;
        IRepository<Contact> contactRepository = null;
        IRepository<SmallSavingsCollection> savingsRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();

        public SavingReturnController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            savingsReturnRepository = unitOfWork.GetRepository<SmallSavingsSettlement>();
            contactRepository = unitOfWork.GetRepository<Contact>();
            savingsRepository = unitOfWork.GetRepository<SmallSavingsCollection>();
        }

        // GET api/SavingReturn
        //public IEnumerable<SmallSavingsSettlement> GetSmallSavingsSettlements()
        //{
        //    if (auth.LoggedinUser == null) { return null; }
        //    Expression<Func<SmallSavingsSettlement, bool>> expr = saving => saving.CustomerId == auth.LoggedinUser.CustomerId;
        //    return savingsReturnRepository.GetAll(expr);
        //}

        // GET api/ContactsApi/keyword
        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/SavingReturn/{keyword}")]
        public IEnumerable<IBusinessModel> GetSmallSavingsSettlements(string keyword)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }

            if (string.IsNullOrEmpty(keyword)) { return null; }

            List<TaxBalanceAndReceived> taxes = new List<TaxBalanceAndReceived>();
            int customerid = 0;
            int.TryParse(auth.LoggedinUser.CustomerId.ToString(), out customerid);
            SmallSavingsCalculation savingCalculation = new SmallSavingsCalculation(savingsReturnRepository, contactRepository, savingsRepository);
            taxes = savingCalculation.GetSmallSavingBalance(keyword, customerid);

            return taxes;
        }

        // GET api/SavingReturn/5
        [ResponseType(typeof(SmallSavingsSettlement))]
        [Route("api/SavingReturn/{id:int}")]
        public IHttpActionResult GetSmallSavingsSettlement(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            SmallSavingsSettlement smallsavingssettlement = savingsReturnRepository.Single(id);
            if (smallsavingssettlement == null)
            {
                return NotFound();
            }

            return Ok(smallsavingssettlement);
        }

        // PUT api/SavingReturn/5
        [HttpPut]
        [Route("api/SavingReturn/{id:int}")]
        public IHttpActionResult PutSmallSavingsSettlement(int id, SmallSavingsSettlement smallsavingssettlement)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != smallsavingssettlement.Id || auth.LoggedinUser == null)
            {
                return BadRequest();
            }

            try
            {
                smallsavingssettlement.ModifyDate = DateTime.Now;
                smallsavingssettlement.ModifyBy = auth.LoggedinUser.ContactId;
                smallsavingssettlement.CustomerId = auth.LoggedinUser.CustomerId;
                smallsavingssettlement.GivenId = auth.LoggedinUser.ContactId;
                smallsavingssettlement.GivenName = string.Format("{0} - {1}", auth.LoggedinUser.Name, auth.LoggedinUser.ContactId);
                savingsReturnRepository.Update(smallsavingssettlement);
                unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!savingsReturnRepository.Exists(id))
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

        // POST api/SavingReturn
        [ResponseType(typeof(SmallSavingsSettlement))]
        public IHttpActionResult PostSmallSavingsSettlement(SmallSavingsSettlement smallsavingssettlement)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                smallsavingssettlement.ModifyDate = DateTime.Now;
                smallsavingssettlement.ModifyBy = auth.LoggedinUser.ContactId;
                smallsavingssettlement.CreatedDate = DateTime.Now;
                smallsavingssettlement.CreatedBy = auth.LoggedinUser.ContactId;
                smallsavingssettlement.CustomerId = auth.LoggedinUser.CustomerId;
                smallsavingssettlement.GivenId = auth.LoggedinUser.ContactId;
                smallsavingssettlement.GivenName = string.Format("{0} - {1}", auth.LoggedinUser.Name, auth.LoggedinUser.ContactId);
                savingsReturnRepository.Add(smallsavingssettlement);
                unitOfWork.Save();
            }
            catch (DbUpdateException)
            {
                if (savingsReturnRepository.Exists(smallsavingssettlement.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = smallsavingssettlement.Id }, smallsavingssettlement);
        }

        // DELETE api/SavingReturn/5
        [ResponseType(typeof(SmallSavingsSettlement))]
        [HttpDelete]
        [Route("api/SavingReturn/{id:int}")]
        public IHttpActionResult DeleteSmallSavingsSettlement(int id)
        {
            if (auth.LoggedinUser == null) { return BadRequest(); }
            try
            {
                SmallSavingsSettlement smallsavingscollection = savingsReturnRepository.Single(id);
                savingsReturnRepository.Delete(smallsavingscollection);
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