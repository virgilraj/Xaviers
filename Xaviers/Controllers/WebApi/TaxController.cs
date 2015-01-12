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
using System.Linq.Expressions;
using RepositoryAndUnitOfWork.Interfaces;
using BusinessLayer;

namespace Xaviers.Controllers.WebApi
{
    public class TaxController : ApiController
    {
        IRepository<Tax> taxRepository = null;
        IRepository<TaxExcludedMember> excludeRepository = null;
        IRepository<Contact> contactRepository = null;
        IRepository<TaxCollection> collectionRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();

        public TaxController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            taxRepository = unitOfWork.GetRepository<Tax>();
            excludeRepository = unitOfWork.GetRepository<TaxExcludedMember>();
            contactRepository = unitOfWork.GetRepository<Contact>();
            collectionRepository = unitOfWork.GetRepository<TaxCollection>();
        }

        //public IEnumerable<Tax> GetTaxes()
        //{
        //    return taxRepository.GetAll();
        //}
        // GET api/ContactsApi/keyword/gender
        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        public IEnumerable<IBusinessModel> GetTax(string keyword, string gender)
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
                TaxCalculation taxCalculation = new TaxCalculation(taxRepository, excludeRepository, contactRepository, collectionRepository, null, null);
                taxes = !string.IsNullOrEmpty(gender) && gender.ToLower() == "bal" ? taxCalculation.GetTaxPendingList(contacts, taxid) : taxCalculation.GetTaxReceivedList(contacts, taxid);
            }
            return taxes;
        }

        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/Tax/{keyword}")]
        public IEnumerable<IBusinessModel> GetTax(string keyword)
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
                    Tax tax = taxRepository.Single(Convert.ToInt32(taxid));
                    double exclude = 0;
                    if (tax.TaxExcludedMembers != null && tax.TaxExcludedMembers.Count > 0)
                    {
                        exclude = (double)tax.TaxExcludedMembers.Sum(ex => ex.Amount);
                    }

                    if (tax != null)
                    {
                        TaxCalculation taxCalculation = new TaxCalculation(taxRepository, excludeRepository, contactRepository, collectionRepository, null, null);
                        taxes.Add(taxCalculation.GetExceptedAmount(contacts, tax));
                    }
                }
            }
            return taxes;
        }

        // GET api/Tax/5
        [ResponseType(typeof(Tax))]
        [Route("api/Tax/{id:int}")]
        public IHttpActionResult GetTax(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            Tax tax = taxRepository.Single(id);
            if (tax == null)
            {
                return NotFound();
            }

            return Ok(tax);
        }

        // PUT api/Tax/5
        [System.Web.Http.AcceptVerbs("PUT")]
        [System.Web.Http.HttpPut]
        [Route("api/Tax/{id:int}")]
        public IHttpActionResult PutTax(int id, Tax tax)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != tax.Id || auth.LoggedinUser == null)
            {
                return BadRequest();
            }

            try
            {
                //Remove all excluded member first
                DeleteTaxExcludeMember(tax.Id);

                //Adding tax id to  Exclude member while updating
                if (tax.TaxExcludedMembers != null && tax.TaxExcludedMembers.Count > 0)
                {
                    foreach (TaxExcludedMember excluded in tax.TaxExcludedMembers)
                    {
                        excluded.TaxId = tax.Id;
                        excluded.Id = 0;
                        excludeRepository.Add(excluded);
                    }
                }

                tax.ModifyDate = DateTime.Now;
                tax.ModifyBy = auth.LoggedinUser.ContactId;
                tax.CustomerId = auth.LoggedinUser.CustomerId;
                taxRepository.Update(tax);
                unitOfWork.Save();

                if (tax.IsNameChanged)
                {
                    Expression<Func<TaxCollection, bool>> taxExpr = sel => sel.CustomerId == auth.LoggedinUser.CustomerId && (sel.TaxId == tax.Id);
                    List<TaxCollection> taxCol = collectionRepository.GetAll(taxExpr).ToList();
                    if (taxCol != null && taxCol.Count > 0)
                    {
                        foreach (TaxCollection txCl in taxCol)
                        {
                            TaxCollection collection = collectionRepository.Single(txCl.Id);
                            collection.TaxName = tax.TaxName;
                            collectionRepository.Update(collection);
                        }
                        unitOfWork.Save();
                    }
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!taxRepository.Exists(id))
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

        // POST api/Tax
        [ResponseType(typeof(Tax))]
        [System.Web.Http.AcceptVerbs("POST")]
        [System.Web.Http.HttpPost]
        public IHttpActionResult PostTax(Tax tax)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                if (tax.TaxExcludedMembers != null && tax.TaxExcludedMembers.Count > 0)
                {
                    foreach (TaxExcludedMember excluded in tax.TaxExcludedMembers)
                    {
                        excluded.CreatedBy = auth.LoggedinUser.ContactId;
                        excluded.CreatedDate = DateTime.Now;
                        excluded.TaxId = tax.Id;
                        excludeRepository.Add(excluded);
                    }
                }

                tax.ModifyDate = DateTime.Now;
                tax.ModifyBy = auth.LoggedinUser.ContactId;
                tax.CreatedDate = DateTime.Now;
                tax.CreatedBy = auth.LoggedinUser.ContactId;

                tax.CustomerId = auth.LoggedinUser.CustomerId;
                taxRepository.Add(tax);
                unitOfWork.Save();
            }
            catch (DbUpdateException)
            {
                if (taxRepository.Exists(tax.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = tax.Id }, tax);
        }

        // DELETE api/Tax/5
        [ResponseType(typeof(Tax))]
        [System.Web.Http.AcceptVerbs("DELETE")]
        [System.Web.Http.HttpDelete]
        [Route("api/Tax/{id:int}")]
        public HttpResponseMessage DeleteTax(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            ValidateUsage valUsage = new ValidateUsage(null, null, null, null, null, null,
                null, null, null, null, collectionRepository);
            if (valUsage.IsTaxAlreadyUsed(id))
            {
                return this.Request.CreateResponse(HttpStatusCode.OK, new { content = "USED" });
            }
            try
            {
                Tax tax = taxRepository.Single(id);
                taxRepository.Delete(tax);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }

            return this.Request.CreateResponse(HttpStatusCode.NoContent);
        }

        public void DeleteTaxExcludeMember(int id)
        {
            try
            {
                Expression<Func<TaxExcludedMember, bool>> expr = tax => tax.TaxId == id;
                var alltax = excludeRepository.GetAll(expr);
                if (alltax != null && alltax.Count() > 0)
                {
                    foreach (TaxExcludedMember txexcluded in alltax)
                    {
                        TaxExcludedMember exclude = excludeRepository.Single(txexcluded.Id);
                        excludeRepository.Delete(exclude);
                        unitOfWork.Save();
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        
    }
}