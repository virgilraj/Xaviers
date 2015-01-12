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

namespace Xaviers.Controllers.WebApi
{
    public class SmallSavingController : ApiController
    {
        IRepository<SmallSavingsCollection> savingsRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();

        public SmallSavingController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            savingsRepository = unitOfWork.GetRepository<SmallSavingsCollection>();
        }

        // GET api/SmallSaving
        public IEnumerable<SmallSavingsCollection> GetSmallSavingsCollections()
        {
            if (auth.LoggedinUser == null) { return null; }
            Expression<Func<SmallSavingsCollection, bool>> expr = saving => saving.CustomerId == auth.LoggedinUser.CustomerId;
            return savingsRepository.GetAll(expr);
        }

        // GET api/SmallSaving/5
        [ResponseType(typeof(SmallSavingsCollection))]
        public IHttpActionResult GetSmallSavingsCollection(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            SmallSavingsCollection smallsavingscollection = savingsRepository.Single(id);
            if (smallsavingscollection == null)
            {
                return NotFound();
            }

            return Ok(smallsavingscollection);
        }

        // PUT api/SmallSaving/5
        public IHttpActionResult PutSmallSavingsCollection(int id, SmallSavingsCollection smallsavingscollection)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != smallsavingscollection.Id || auth.LoggedinUser == null)
            {
                return BadRequest();
            }


            try
            {
                smallsavingscollection.ModifyDate = DateTime.Now;
                smallsavingscollection.ModifyBy = auth.LoggedinUser.ContactId;
                smallsavingscollection.ReceiverId = auth.LoggedinUser.ContactId;
                smallsavingscollection.ReceiverName = string.Format("{0} - {1}", auth.LoggedinUser.Name, auth.LoggedinUser.ContactId);
                smallsavingscollection.CustomerId = auth.LoggedinUser.CustomerId;
                savingsRepository.Update(smallsavingscollection);
                unitOfWork.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!savingsRepository.Exists(id))
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

        // POST api/SmallSaving
        [ResponseType(typeof(SmallSavingsCollection))]
        public IHttpActionResult PostSmallSavingsCollection(SmallSavingsCollection smallsavingscollection)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                smallsavingscollection.ModifyDate = DateTime.Now;
                smallsavingscollection.ModifyBy = auth.LoggedinUser.ContactId;
                smallsavingscollection.CreatedDate = DateTime.Now;
                smallsavingscollection.CreatedBy = auth.LoggedinUser.ContactId;
                smallsavingscollection.CustomerId = auth.LoggedinUser.CustomerId;
                smallsavingscollection.ReceiverId = auth.LoggedinUser.ContactId;
                smallsavingscollection.ReceiverName = string.Format("{0} - {1}", auth.LoggedinUser.Name, auth.LoggedinUser.ContactId);
                savingsRepository.Add(smallsavingscollection);
                unitOfWork.Save();
            }
            catch (DbUpdateException)
            {
                if (savingsRepository.Exists(smallsavingscollection.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = smallsavingscollection.Id }, smallsavingscollection);
        }

        // DELETE api/SmallSaving/5
        [ResponseType(typeof(SmallSavingsCollection))]
        public IHttpActionResult DeleteSmallSavingsCollection(int id)
        {
            if (auth.LoggedinUser == null) { return null; }
            try
            {
                SmallSavingsCollection smallsavingscollection = savingsRepository.Single(id);
                savingsRepository.Delete(smallsavingscollection);
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