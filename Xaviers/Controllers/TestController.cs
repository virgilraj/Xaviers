using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Interfaces;
using RepositroryAndUnitOfWork.Implementations;

namespace Xaviers.Controllers
{
    public class TestController : ApiController
    {
        IRepository<Contact> contactRepository = null;
        IUnitOfWork unitOfWork = null;
        public TestController(){
            unitOfWork = new UnitOfWork<XaviersEntities>();
            contactRepository = unitOfWork.GetRepository<Contact>();
        }

        // GET api/Test
        public IEnumerable<Contact> GetContacts()
        {
            int count = 0;
            return contactRepository.GetAll();
        }

        //public IEnumerable<Contact> GetContacts(Filter filter, int id)
        //{
        //    int count = 0;
        //    return contactRepository.GetAll(filter.pageNumber, filter.pageSize, out count);
        //}

        // GET api/Test/5
        [ResponseType(typeof(Contact))]
        public IHttpActionResult GetContact(int id)
        {
           //Expression<Func<Contact, IEnumerable<Contact>>> selector = sel => new IEnumerable<Contact> { new Contect { ContactId = sel.ContactId } };
            Expression<Func<Contact, bool>> expr = contact => contact.ContactId == id;
            IEnumerable<Contact> singleContact = contactRepository.GetAll(expr);
            if (singleContact == null && singleContact.Count() == 0)
            {
                return NotFound();
            }

            return Ok(singleContact);
        }

        // PUT api/Test/5
        public IHttpActionResult PutContact(int id, Contact contact)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != contact.ContactId)
            {
                return BadRequest();
            }

            try
            {
                contactRepository.Update(contact);
                unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!contactRepository.Exists(id))
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

        // POST api/Test
        [ResponseType(typeof(Contact))]
        public IHttpActionResult PostContact(Contact contact)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                contactRepository.Add(contact);
                unitOfWork.Save();
            }
            catch (DbUpdateException)
            {
                if (contactRepository.Exists(contact.ContactId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = contact.ContactId }, contact);
        }

        // DELETE api/Test/5
        [ResponseType(typeof(Contact))]
        public IHttpActionResult DeleteContact(Contact contact)
        {
            if (!contactRepository.Exists(contact.ContactId))
            {
                return NotFound();
            }
            try
            {
                contactRepository.Delete(contact);
                unitOfWork.Save();

            }catch(Exception e)
            {
                throw;
            }
            return Ok(contact);
        }

    }
}