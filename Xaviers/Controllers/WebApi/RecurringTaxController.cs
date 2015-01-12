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
using System.Linq.Expressions;

namespace Xaviers.Controllers.WebApi
{
    public class RecurringTaxController : ApiController
    {
        IRepository<RecurringTax> recurringRepository = null;
        IRepository<Contact> contactRepository = null;
        IRepository<RecurringTaxCollection> recurCollectionRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();

        public RecurringTaxController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            recurringRepository = unitOfWork.GetRepository<RecurringTax>();
            contactRepository = unitOfWork.GetRepository<Contact>();
            recurCollectionRepository = unitOfWork.GetRepository<RecurringTaxCollection>();
        }

        // GET api/RecurringTax
        //public IEnumerable<RecurringTax> GetRecurringTaxes()
        //{
        //    return recurringRepository.GetAll();
        //}

        // GET api/RecurringTax/keyword/gender
        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        public IEnumerable<IBusinessModel> GetRecurringTaxes(string keyword, string gender)
        {
            if (auth.LoggedinUser == null) { return null; }
            Func<Contact, Contact> selector = sel => new Contact
            {
                IsEligibleForTax = sel.IsEligibleForTax,
                IsMember = sel.IsMember,
                YearIncome = sel.YearIncome,
                CustomerId = sel.CustomerId,
                ContactId = sel.ContactId,
                FirstName = sel.FirstName,
                LastName = sel.LastName
            };
            Func<Contact, bool> expr = contact => contact.IsEligibleForTax == true && contact.IsMember == true && contact.YearIncome > 0 && contact.CustomerId == auth.LoggedinUser.CustomerId;
            var contacts = contactRepository.GetAll(expr, selector);
            List<TaxBalanceAndReceived> taxes = new List<TaxBalanceAndReceived>();
            int taxid = 0;
            int.TryParse(keyword, out taxid);

            if (contacts != null && contacts.Count() > 0 && taxid > 0)
            {
                TaxCalculation taxCalculation = new TaxCalculation(null, null, contactRepository, null, recurringRepository, recurCollectionRepository);
                taxes = !string.IsNullOrEmpty(gender) && gender.ToLower() == "bal" ? taxCalculation.GetRecurringTaxBalanceList(contacts, taxid) : taxCalculation.GetRecurringTaxReceivedList(contacts, taxid);
            }
            return taxes;
        }

        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/RecurringTax/{keyword}")]
        public IEnumerable<IBusinessModel> GetRecurringTaxes(string keyword)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }
            Func<Contact, Contact> selector = sel => new Contact
            {
                IsEligibleForTax = sel.IsEligibleForTax,
                IsMember = sel.IsMember,
                YearIncome = sel.YearIncome,
                CustomerId = sel.CustomerId,
                ContactId = sel.ContactId,
                FirstName = sel.FirstName,
                LastName = sel.LastName
            };
            Func<Contact, bool> expr = contact => contact.IsEligibleForTax == true && contact.IsMember == true && contact.YearIncome > 0 && contact.CustomerId == auth.LoggedinUser.CustomerId;
            var contacts = contactRepository.GetAll(expr, selector);
            List<TaxTotalAmount> taxes = new List<TaxTotalAmount>();
            foreach (string taxid in keyword.Split(','))
            {
                if (!string.IsNullOrEmpty(taxid))
                {
                    RecurringTax tax = recurringRepository.Single(Convert.ToInt32(taxid));

                    if (tax != null)
                    {
                        TaxCalculation taxCalculation = new TaxCalculation(null, null, contactRepository, null, recurringRepository, recurCollectionRepository);
                        taxes.Add(taxCalculation.GetExceptedRecurringAmount(contacts, tax));
                    }
                }
            }
            return taxes;
        }

        // GET api/RecurringTax/5
        [ResponseType(typeof(RecurringTax))]
        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/RecurringTax/{id:int}")]
        public IHttpActionResult GetRecurringTax(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            RecurringTax recurringtax = recurringRepository.Single(id);
            if (recurringtax == null)
            {
                return NotFound();
            }

            return Ok(recurringtax);
        }

        // PUT api/RecurringTax/5
        [System.Web.Http.AcceptVerbs("PUT")]
        [System.Web.Http.HttpPut]
        [Route("api/RecurringTax/{id:int}")]
        public IHttpActionResult PutRecurringTax(int id, RecurringTax recurringtax)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != recurringtax.Id || auth.LoggedinUser == null)
            {
                return BadRequest();
            }

            try
            {
                recurringtax.ModifyDate = DateTime.Now;
                recurringtax.ModifyBy = auth.LoggedinUser.ContactId;
                recurringtax.CustomerId = auth.LoggedinUser.CustomerId;
                recurringRepository.Update(recurringtax);
                unitOfWork.Save();

                if (recurringtax.IsNameChanged)
                {
                    Expression<Func<RecurringTaxCollection, bool>> taxExpr = sel => sel.CustomerId == auth.LoggedinUser.CustomerId && (sel.RecurringTaxId == recurringtax.Id);
                    List<RecurringTaxCollection> taxCol = recurCollectionRepository.GetAll(taxExpr).ToList();
                    if (taxCol != null && taxCol.Count > 0)
                    {
                        foreach (RecurringTaxCollection txCl in taxCol)
                        {
                            RecurringTaxCollection collection = recurCollectionRepository.Single(txCl.Id);
                            collection.TaxName = recurringtax.TaxName;
                            recurCollectionRepository.Update(collection);
                        }
                        unitOfWork.Save();
                    }
                }
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

        // POST api/RecurringTax
        [ResponseType(typeof(RecurringTax))]
        [System.Web.Http.AcceptVerbs("POST")]
        [System.Web.Http.HttpPost]
        public IHttpActionResult PostRecurringTax(RecurringTax recurringtax)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            recurringtax.ModifyDate = DateTime.Now;
            recurringtax.ModifyBy = auth.LoggedinUser.ContactId;
            recurringtax.CreatedDate = DateTime.Now;
            recurringtax.CreatedBy = auth.LoggedinUser.ContactId;
            recurringtax.CustomerId = auth.LoggedinUser.CustomerId;
            recurringRepository.Add(recurringtax);
            unitOfWork.Save();

            return CreatedAtRoute("DefaultApi", new { id = recurringtax.Id }, recurringtax);
        }

        // DELETE api/RecurringTax/5
        [ResponseType(typeof(RecurringTax))]
        [HttpDelete]
        [Route("api/RecurringTax/{id:int}")]
        public HttpResponseMessage DeleteRecurringTax(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            ValidateUsage valUsage = new ValidateUsage(null, null, null, null, null, null,
                recurCollectionRepository, null, null, null, null);
            if (valUsage.IsRecurringTaxAlreadyUsed(id))
            {
                return this.Request.CreateResponse(HttpStatusCode.OK, new { content = "USED" });
            }  

            RecurringTax recurringtax = null;
            try
            {
                recurringtax = recurringRepository.Single(id);
                recurringRepository.Delete(recurringtax);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }

            return this.Request.CreateResponse(HttpStatusCode.NoContent);
        }
    }
}