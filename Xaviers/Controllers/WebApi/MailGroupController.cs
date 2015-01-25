using BusinessLayer;
using DatabaseDataModel;
using RepositoryAndUnitOfWork.Interfaces;
using RepositroryAndUnitOfWork.Implementations;
using RepositroryAndUnitOfWork.Interfaces;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;

namespace Xaviers.Controllers.WebApi
{
    public class MailGroupController : ApiController
    {
        IRepository<MailGroup> mailgroupRepository = null;
        IRepository<MailContact> mailcontactRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();

        public MailGroupController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            mailgroupRepository = unitOfWork.GetRepository<MailGroup>();
            mailcontactRepository = unitOfWork.GetRepository<MailContact>();
        }
        // GET: api/MailGroup
        //public IEnumerable<MailGroup> Get()
        //{
        //    return mailgroupRepository.GetAll();
        //}

        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/MailGroup/{keyword}")]
        public IEnumerable<MailGroup> GetTax(string keyword)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }

            Expression<Func<MailGroup, bool>> expr = group => group.CustomerId == auth.LoggedinUser.CustomerId && group.GroupName.ToLower().StartsWith(keyword.ToLower()); ;
            return mailgroupRepository.GetAll(expr);
        }

        // GET: api/MailGroup/5
        [ResponseType(typeof(MailGroup))]
        [Route("api/MailGroup/{id:int}")]
        public IHttpActionResult Get(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            MailGroup mailgroup = mailgroupRepository.Single(id);
            if (mailgroup == null)
            {
                return NotFound();
            }

            return Ok(mailgroup);
        }

        // POST: api/MailGroup
        [ResponseType(typeof(MailGroup))]
        [System.Web.Http.AcceptVerbs("POST")]
        [System.Web.Http.HttpPost]
        public IHttpActionResult PostMailGroup(MailGroup mailgroup)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                if (mailgroup.MailContacts != null && mailgroup.MailContacts.Count > 0)
                {
                    foreach (MailContact mailcontact in mailgroup.MailContacts)
                    {
                        mailcontact.MailGroupId = mailgroup.Id;
                        mailcontactRepository.Add(mailcontact);
                    }
                }

                mailgroup.ModifyDate = DateTime.Now;
                mailgroup.ModifyBy = auth.LoggedinUser.ContactId;
                mailgroup.CreatedDate = DateTime.Now;
                mailgroup.CreatedBy = auth.LoggedinUser.ContactId;

                mailgroup.CustomerId = auth.LoggedinUser.CustomerId;
                mailgroupRepository.Add(mailgroup);
                unitOfWork.Save();
            }
            catch (DbUpdateException)
            {
                if (mailgroupRepository.Exists(mailgroup.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = mailgroup.Id }, mailgroup);
        }

        // PUT: api/MailGroup/5
        [System.Web.Http.AcceptVerbs("PUT")]
        [System.Web.Http.HttpPut]
        [Route("api/MailGroup/{id:int}")]
        public IHttpActionResult PutMailGroup(int id, MailGroup mailgroup)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != mailgroup.Id || auth.LoggedinUser == null)
            {
                return BadRequest();
            }

            try
            {
                //Remove all contacts first
                DeleteMailContacts(mailgroup.Id);

                //Adding tax id to  Exclude member while updating
                if (mailgroup.MailContacts != null && mailgroup.MailContacts.Count > 0)
                {
                    foreach (MailContact mailcontact in mailgroup.MailContacts)
                    {
                        mailcontact.MailGroupId = mailgroup.Id;
                        mailcontactRepository.Add(mailcontact);
                    }
                }

                mailgroup.ModifyDate = DateTime.Now;
                mailgroup.ModifyBy = auth.LoggedinUser.ContactId;
                mailgroup.CustomerId = auth.LoggedinUser.CustomerId;
                mailgroupRepository.Update(mailgroup);
                unitOfWork.Save();

            }
            catch (DbUpdateConcurrencyException)
            {
                if (!mailgroupRepository.Exists(id))
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

        // DELETE: api/MailGroup/5
        [ResponseType(typeof(MailGroup))]
        [System.Web.Http.AcceptVerbs("DELETE")]
        [System.Web.Http.HttpDelete]
        [Route("api/MailGroup/{id:int}")]
        public HttpResponseMessage Delete(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            try
            {
                //Remove all contacts first
                DeleteMailContacts(id);

                MailGroup mailgroup = mailgroupRepository.Single(id);
                mailgroupRepository.Delete(mailgroup);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }

            return this.Request.CreateResponse(HttpStatusCode.NoContent);
        }

        public void DeleteMailContacts(int id)
        {
            try
            {
                Expression<Func<MailContact, bool>> expr = mail => mail.MailGroupId == id;
                var allcontact = mailcontactRepository.GetAll(expr);
                if (allcontact != null && allcontact.Count() > 0)
                {
                    foreach (MailContact mailcontact in allcontact)
                    {
                        MailContact exclude = mailcontactRepository.Single(mailcontact.Id);
                        mailcontactRepository.Delete(exclude);
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
