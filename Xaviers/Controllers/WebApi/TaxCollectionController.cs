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
    public class TaxCollectionController : ApiController
    {
        IRepository<TaxCollection> collectionRepository = null;
        IRepository<Contact> contactRepository = null;
        IRepository<Tax> taxRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();
        public TaxCollectionController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            collectionRepository = unitOfWork.GetRepository<TaxCollection>();
            contactRepository = unitOfWork.GetRepository<Contact>();
            taxRepository = unitOfWork.GetRepository<Tax>();
        }

        // GET api/TaxCollection
        //[System.Web.Http.AcceptVerbs("GET")]
        //[System.Web.Http.HttpGet]
        //[Route("api/TaxCollection")]
        //public IEnumerable<TaxCollection> GetTaxCollections()
        //{
        //    return collectionRepository.GetAll();
        //}


        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/TaxCollection/{keyword}")]
        public IEnumerable<IBusinessModel> GetTaxCollections(string keyword)
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
                    Tax tax = taxRepository.Single(id);
                    if(contact !=null && tax !=null)
                    {
                        TaxCalculation taxCalculation = new TaxCalculation(taxRepository, null, contactRepository, collectionRepository, null, null);
                        balances.Add(taxCalculation.GetBalanceAmount(contact, tax));
                    }
                }
            }
            return balances;
        }

        // GET api/TaxCollection/5
        [ResponseType(typeof(TaxCollection))]
        [Route("api/TaxCollection/{id:int}")]
        public IHttpActionResult GetTaxCollection(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            TaxCollection taxcollection = collectionRepository.Single(id);
            if (taxcollection == null)
            {
                return NotFound();
            }

            return Ok(taxcollection);
        }

        // PUT api/TaxCollection/5

        [System.Web.Http.AcceptVerbs("PUT")]
        [System.Web.Http.HttpPut]
        [Route("api/TaxCollection/{id:int}")]
        public IHttpActionResult PutTaxCollection(int id, TaxCollection taxcollection)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != taxcollection.Id || auth.LoggedinUser == null)
            {
                return BadRequest();
            }

            try
            {
                taxcollection.ModifyDate = DateTime.Now;
                taxcollection.ModifyBy = auth.LoggedinUser.ContactId;
                taxcollection.ReceiverName = auth.LoggedinUser.Name;
                taxcollection.CustomerId = auth.LoggedinUser.CustomerId;
                collectionRepository.Update(taxcollection);
                unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!collectionRepository.Exists(id))
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

        // POST api/TaxCollection
        [ResponseType(typeof(TaxCollection))]
        [System.Web.Http.AcceptVerbs("POST")]
        [System.Web.Http.HttpPost]
        public IHttpActionResult PostTaxCollection(TaxCollection taxcollection)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }
            taxcollection.ModifyDate = DateTime.Now;
            taxcollection.ModifyBy = auth.LoggedinUser.ContactId;
            taxcollection.CreatedDate = DateTime.Now;
            taxcollection.CreatedBy = auth.LoggedinUser.ContactId;
            taxcollection.ReceiverName = auth.LoggedinUser.Name;
            taxcollection.CustomerId = auth.LoggedinUser.CustomerId;
            collectionRepository.Add(taxcollection);
            unitOfWork.Save();

            return CreatedAtRoute("DefaultApi", new { controller = "Taxcollection", id = taxcollection.Id }, taxcollection);
        }

        // DELETE api/TaxCollection/5
        [ResponseType(typeof(TaxCollection))]
        [System.Web.Http.AcceptVerbs("DELETE")]
        [System.Web.Http.HttpDelete]
        [Route("api/TaxCollection/{id:int}")]
        public IHttpActionResult DeleteTaxCollection(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            try
            {
                TaxCollection taxcollection = collectionRepository.Single(id);
                collectionRepository.Delete(taxcollection);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }


        private TaxBalance GetBalanceAmount(Contact contact, Tax tax)
        {
            TaxBalance taxBalance = new TaxBalance();
            taxBalance.ContactId = contact.ContactId;
            taxBalance.TaxId = tax.Id;

            double totalAmount = 0;
            double totalcollection = 0;
            Expression<Func<TaxCollection, bool>> expr = collection => collection.TaxId == tax.Id && collection.ContactId == contact.ContactId && collection.CustomerId == auth.LoggedinUser.CustomerId;
            Expression<Func<TaxCollection, Nullable<double>>> selector = taccollection => taccollection.Amount;
            totalcollection = Convert.ToDouble(collectionRepository.GetSum(expr, selector));

            taxBalance.TotalReceivedAmount = totalcollection;
 
            if (tax.TaxAmount != null && tax.TaxAmount > 0)
            {
                totalAmount = (double)tax.TaxAmount;
            }
            else if (tax.TaxNoOfDaysIncome != null && tax.TaxNoOfDaysIncome > 0)
            {
                double onedayIncome = contact.YearIncome != null && contact.YearIncome > 0 ? (((double)contact.YearIncome) / 365) : 0;
                totalAmount += onedayIncome;
            }
            else if (tax.TaxPercentBaseIncome != null && tax.TaxPercentBaseIncome > 0)
            {
                double onedayvalue = contact.YearIncome != null && contact.YearIncome > 0 ? (((double)contact.YearIncome * (double)tax.TaxPercentBaseIncome) / 100) : 0;
                totalAmount += onedayvalue;
            }

            totalAmount = totalAmount - totalcollection;
            taxBalance.BalanceAmount = Math.Round(totalAmount, 2);
            return taxBalance;
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