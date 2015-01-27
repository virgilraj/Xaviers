using System.Linq;
using System.Web.Http;
using System.Web.Http.OData;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Interfaces;
using RepositroryAndUnitOfWork.Implementations;
using BusinessLayer;
using System.Linq.Expressions;
using System;

namespace Xaviers.Controllers.Odata
{
    public class OdataContactsController : ODataController
    {
        IRepository<Contact> contactRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();
        public OdataContactsController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            contactRepository = unitOfWork.GetRepository<Contact>();
        }

        // GET odata/OdataContacts
        [Queryable]
        public IQueryable<Contact> GetOdataContacts()
        {
            if (auth.LoggedinUser != null)
            {
                Expression<Func<Contact, bool>> expr = contact => contact.CustomerId == auth.LoggedinUser.CustomerId;
                return contactRepository.GetData(expr);
            }
            else
            {
                return null;
            }
        }

        // GET odata/OdataContacts(5)
        //[Queryable]
        //public SingleResult<Contact> GetContact([FromODataUri] int key)
        //{
        //    return SingleResult.Create(db.Contacts.Where(contact => contact.ContactId == key));
        //}

        //// PUT odata/OdataContacts(5)
        //public IHttpActionResult Put([FromODataUri] int key, Contact contact)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    if (key != contact.ContactId)
        //    {
        //        return BadRequest();
        //    }

        //    db.Entry(contact).State = EntityState.Modified;

        //    try
        //    {
        //        db.SaveChanges();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!ContactExists(key))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return Updated(contact);
        //}

        //// POST odata/OdataContacts
        //public IHttpActionResult Post(Contact contact)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    db.Contacts.Add(contact);

        //    try
        //    {
        //        db.SaveChanges();
        //    }
        //    catch (DbUpdateException)
        //    {
        //        if (ContactExists(contact.ContactId))
        //        {
        //            return Conflict();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return Created(contact);
        //}

        //// PATCH odata/OdataContacts(5)
        //[AcceptVerbs("PATCH", "MERGE")]
        //public IHttpActionResult Patch([FromODataUri] int key, Delta<Contact> patch)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    Contact contact = db.Contacts.Find(key);
        //    if (contact == null)
        //    {
        //        return NotFound();
        //    }

        //    patch.Patch(contact);

        //    try
        //    {
        //        db.SaveChanges();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!ContactExists(key))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return Updated(contact);
        //}

        //// DELETE odata/OdataContacts(5)
        //public IHttpActionResult Delete([FromODataUri] int key)
        //{
        //    Contact contact = db.Contacts.Find(key);
        //    if (contact == null)
        //    {
        //        return NotFound();
        //    }

        //    db.Contacts.Remove(contact);
        //    db.SaveChanges();

        //    return StatusCode(HttpStatusCode.NoContent);
        //}

        //// GET odata/OdataContacts(5)/Qualifications
        //[Queryable]
        //public IQueryable<Qualification> GetQualifications([FromODataUri] int key)
        //{
        //    return db.Contacts.Where(m => m.ContactId == key).SelectMany(m => m.Qualifications);
        //}

        //// GET odata/OdataContacts(5)/WorkExperiences
        //[Queryable]
        //public IQueryable<WorkExperience> GetWorkExperiences([FromODataUri] int key)
        //{
        //    return db.Contacts.Where(m => m.ContactId == key).SelectMany(m => m.WorkExperiences);
        //}

        //protected override void Dispose(bool disposing)
        //{
        //    if (disposing)
        //    {
        //        db.Dispose();
        //    }
        //    base.Dispose(disposing);
        //}

        //private bool ContactExists(int key)
        //{
        //    return db.Contacts.Count(e => e.ContactId == key) > 0;
        //}

        protected override void Dispose(bool disposing)
        {
            //if (disposing)
            //{
            //    unitOfWork.Dispose();
            //}
            unitOfWork.Dispose();
            base.Dispose(disposing);
        }
    }
}
