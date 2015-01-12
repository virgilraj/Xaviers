using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using System.Web.Http.OData;
using System.Web.Http.OData.Routing;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Interfaces;
using RepositroryAndUnitOfWork.Implementations;
using System.Linq.Expressions;
using BusinessLayer;

namespace Xaviers.Controllers.Odata
{
    
    public class TaxOdataController : ODataController
    {
        //private XaviersEntities db = new XaviersEntities();

        IRepository<Tax> taxRepository = null;
        IRepository<Contact> contactRepository = null;
        IUnitOfWork unitOfWork = null;
        
        public TaxOdataController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            taxRepository = unitOfWork.GetRepository<Tax>();
            contactRepository = unitOfWork.GetRepository<Contact>();
        }

        // GET odata/TaxOdata
        [Queryable]
        public IQueryable<Tax> GetTaxOdata()
        {
            Authentication auth = new Authentication();
            if (auth.LoggedinUser != null)
            {
                Expression<Func<Tax, bool>> expr = exp => exp.CustomerId == auth.LoggedinUser.CustomerId;
                return taxRepository.GetData(expr);
            }
            else
            {
                return null;
            }

            //Expression<Func<Contact, bool>> expr = contact => contact.IsEligibleForTax == true && contact.IsMember == true &&contact.YearIncome > 0;
            //var contacts = contactRepository.GetAll(expr);
            //var taxes = taxRepository.GetData().ToList();

            //if (taxes != null && taxes.Count() > 0)
            //{
            //    foreach (Tax tax in taxes)
            //    {
            //        tax.ExceptedAmount = GetExceptedAmount(contacts, tax);
            //    }
            //}
            //return taxes;
            //return taxRepository.GetData();
        }

        private double GetExceptedAmount(IEnumerable<Contact> contacts, Tax tax)
        {
            double totalAmount = 0;

            if(tax.TaxAmount !=null && tax.TaxAmount > 0)
            {
                totalAmount = (((double)tax.TaxAmount) * contacts.Count());
            }
            else if(tax.TaxNoOfDaysIncome !=null && tax.TaxNoOfDaysIncome > 0 && contacts !=null && contacts.Count() > 0)
            {
                foreach(Contact contact in contacts)
                {
                    double onedayIncome = contact.YearIncome != null && contact.YearIncome > 0 ? (((double)contact.YearIncome) / 365) : 0;
                    totalAmount += onedayIncome;
                }
            }
            else if (tax.TaxPercentBaseIncome != null && tax.TaxPercentBaseIncome > 0 && contacts != null && contacts.Count() > 0)
            {
                foreach (Contact contact in contacts)
                {
                    double onedayvalue = contact.YearIncome != null && contact.YearIncome > 0 ? (((double)contact.YearIncome * (double)tax.TaxPercentBaseIncome ) / 100) : 0;
                    totalAmount += onedayvalue;
                }
            }

            return Math.Round(totalAmount, 2);
        }

        //// GET odata/TaxOdata(5)
        //[Queryable]
        //public SingleResult<Tax> GetTax([FromODataUri] int key)
        //{
        //    return SingleResult.Create(db.Taxes.Where(tax => tax.Id == key));
        //}

        //// PUT odata/TaxOdata(5)
        //public IHttpActionResult Put([FromODataUri] int key, Tax tax)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    if (key != tax.Id)
        //    {
        //        return BadRequest();
        //    }

        //    db.Entry(tax).State = EntityState.Modified;

        //    try
        //    {
        //        db.SaveChanges();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!TaxExists(key))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return Updated(tax);
        //}

        //// POST odata/TaxOdata
        //public IHttpActionResult Post(Tax tax)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    db.Taxes.Add(tax);
        //    db.SaveChanges();

        //    return Created(tax);
        //}

        //// PATCH odata/TaxOdata(5)
        //[AcceptVerbs("PATCH", "MERGE")]
        //public IHttpActionResult Patch([FromODataUri] int key, Delta<Tax> patch)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    Tax tax = db.Taxes.Find(key);
        //    if (tax == null)
        //    {
        //        return NotFound();
        //    }

        //    patch.Patch(tax);

        //    try
        //    {
        //        db.SaveChanges();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!TaxExists(key))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return Updated(tax);
        //}

        //// DELETE odata/TaxOdata(5)
        //public IHttpActionResult Delete([FromODataUri] int key)
        //{
        //    Tax tax = db.Taxes.Find(key);
        //    if (tax == null)
        //    {
        //        return NotFound();
        //    }

        //    db.Taxes.Remove(tax);
        //    db.SaveChanges();

        //    return StatusCode(HttpStatusCode.NoContent);
        //}

        //// GET odata/TaxOdata(5)/TaxCollections
        //[Queryable]
        //public IQueryable<TaxCollection> GetTaxCollections([FromODataUri] int key)
        //{
        //    return db.Taxes.Where(m => m.Id == key).SelectMany(m => m.TaxCollections);
        //}

        //// GET odata/TaxOdata(5)/TaxExcludedMembers
        //[Queryable]
        //public IQueryable<TaxExcludedMember> GetTaxExcludedMembers([FromODataUri] int key)
        //{
        //    return db.Taxes.Where(m => m.Id == key).SelectMany(m => m.TaxExcludedMembers);
        //}

        //protected override void Dispose(bool disposing)
        //{
        //    if (disposing)
        //    {
        //        db.Dispose();
        //    }
        //    base.Dispose(disposing);
        //}

        //private bool TaxExists(int key)
        //{
        //    return db.Taxes.Count(e => e.Id == key) > 0;
        //}
    }
}
