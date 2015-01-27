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
    public class RecurringTaxCollectionController : ApiController
    {
        IRepository<RecurringTaxCollection> recurringRepository = null;
        IRepository<Contact> contactRepository = null;
        IRepository<RecurringTax> taxRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();

        public RecurringTaxCollectionController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            recurringRepository = unitOfWork.GetRepository<RecurringTaxCollection>();
            contactRepository = unitOfWork.GetRepository<Contact>();
            taxRepository = unitOfWork.GetRepository<RecurringTax>();
        }

        // GET api/RecurringTaxCollection
        //[System.Web.Http.AcceptVerbs("GET")]
        //[System.Web.Http.HttpGet]
        //[Route("api/RecurringTaxCollection")]
        //public IEnumerable<RecurringTaxCollection> GetRecurringTaxCollections()
        //{
        //    return recurringRepository.GetAll();
        //}

        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/RecurringTaxCollection/{keyword}")]
        public IEnumerable<IBusinessModel> GetRecurringTaxCollections(string keyword)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }
            //split contact id and tax id
            List<TaxBalance> balances = new List<TaxBalance>();

            if (string.IsNullOrEmpty(keyword)) return balances;
            foreach (string taxid in keyword.Split(','))
            {
                TaxBalance taxbalance = new TaxBalance();
                if (taxid.Contains("|"))
                {
                    int contactid = Convert.ToInt32(taxid.Split('|')[0]);
                    int id = Convert.ToInt32(taxid.Split('|')[1]);
                    Contact contact = contactRepository.Single(contactid);
                    RecurringTax tax = taxRepository.Single(id);
                    if (contact != null && tax != null)
                    {
                        TaxCalculation taxCalculation = new TaxCalculation(null, null, contactRepository, null, taxRepository, recurringRepository);
                        balances.Add(taxCalculation.GetRecurBalanceAmount(contact, tax));
                    }
                }
            }
            return balances;
        }

        // GET api/RecurringTaxCollection/5

        [ResponseType(typeof(RecurringTaxCollection))]
        [Route("api/RecurringTaxCollection/{id:int}")]
        public IHttpActionResult GetRecurringTaxCollection(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            RecurringTaxCollection recurringtaxcollection = recurringRepository.Single(id);
            if (recurringtaxcollection == null)
            {
                return NotFound();
            }

            return Ok(recurringtaxcollection);
        }

        // PUT api/RecurringTaxCollection/5
        [System.Web.Http.AcceptVerbs("PUT")]
        [System.Web.Http.HttpPut]
        [Route("api/RecurringTaxCollection/{id:int}")]
        public IHttpActionResult PutRecurringTaxCollection(int id, RecurringTaxCollection recurringtaxcollection)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != recurringtaxcollection.Id)
            {
                return BadRequest();
            }

            
            try
            {
                recurringtaxcollection.ModifyDate = DateTime.Now;
                recurringtaxcollection.ModifyBy = auth.LoggedinUser.ContactId;
                recurringtaxcollection.CustomerId = auth.LoggedinUser.CustomerId;
                recurringRepository.Update(recurringtaxcollection);
                unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!recurringRepository.Exists(id))
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

        // POST api/RecurringTaxCollection
        [ResponseType(typeof(RecurringTaxCollection))]
        public IHttpActionResult PostRecurringTaxCollection(RecurringTaxCollection recurringtaxcollection)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            recurringtaxcollection.ModifyDate = DateTime.Now;
            recurringtaxcollection.ModifyBy = auth.LoggedinUser.ContactId;
            recurringtaxcollection.CreatedDate = DateTime.Now;
            recurringtaxcollection.CreatedBy = auth.LoggedinUser.ContactId;
            recurringtaxcollection.CustomerId = auth.LoggedinUser.CustomerId;
            recurringRepository.Add(recurringtaxcollection);
            unitOfWork.Save();

            return CreatedAtRoute("DefaultApi", new { id = recurringtaxcollection.Id }, recurringtaxcollection);
        }

        // DELETE api/RecurringTaxCollection/5
        
        [ResponseType(typeof(RecurringTaxCollection))]
        [System.Web.Http.AcceptVerbs("DELETE")]
        [System.Web.Http.HttpDelete]
        [Route("api/RecurringTaxCollection/{id:int}")]
        public IHttpActionResult DeleteRecurringTaxCollection(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            RecurringTaxCollection recurringtaxcollection = null;
            try
            {
                recurringtaxcollection = recurringRepository.Single(id);
                recurringRepository.Delete(recurringtaxcollection);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }

            return Ok(recurringtaxcollection);
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