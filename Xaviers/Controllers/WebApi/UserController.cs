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
using BusinessLayer;
using System.Linq.Expressions;

namespace Xaviers.Controllers.WebApi
{
    public class UserController : ApiController
    {
        IRepository<User> userRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();
        // GET api/User
        public UserController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            userRepository = unitOfWork.GetRepository<User>();
        }

        // GET api/User
        public IEnumerable<User> GetUser()
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }
            return userRepository.GetAll();
        }

        // GET api/User/5
        [ResponseType(typeof(Customer))]
        public IHttpActionResult GetUser(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            User user = userRepository.Single(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // PUT api/Customer/5
        public IHttpActionResult PutUser(int id, User user)
        {
            if (user.Email != user.OldEmail)
            {
                Expression<Func<User, bool>> expr = cust => cust.Email == user.Email;
                var usrs = userRepository.GetAll(expr);
                if (usrs != null && usrs.Count() > 0)
                {
                    user.Id = 0;
                    return CreatedAtRoute("DefaultApi", new { id = 0 }, user);
                }
            }
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            if (id != user.Id)
            {
                return BadRequest();
            }

            try
            {
                user.ModifyDate = DateTime.Now;
                user.CustomerId = auth.LoggedinUser.CustomerId;
                user.Password = BusinessUtility.Encrypt(user.Password);
                userRepository.Update(user);
                unitOfWork.Save();
                
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!userRepository.Exists(id))
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

        // POST api/Customer
        [ResponseType(typeof(Expense))]
        public IHttpActionResult PostUser(User user)
        {
            //Check customer already exist
            Expression<Func<User, bool>> expr = cust => cust.Email == user.Email;
            var usrs = userRepository.GetAll(expr);
            if (usrs != null && usrs.Count() > 0)
            {
                return CreatedAtRoute("DefaultApi", new { id = 0 }, user);
            }
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }
            try
            {
                user.CreatedDate = DateTime.Now;
                user.ModifyDate = DateTime.Now;
                user.CustomerId = auth.LoggedinUser.CustomerId;
                user.Password = BusinessUtility.Encrypt(user.Password);
                userRepository.Add(user);
                unitOfWork.Save();
            }
            catch (DbUpdateException)
            {
                if (userRepository.Exists(user.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = user.Id }, user);
        }

        // DELETE api/Customer/5
        [ResponseType(typeof(Expense))]
        public IHttpActionResult DeleteUser(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            try
            {
                User user = userRepository.Single(id);
                userRepository.Delete(user);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }
            return StatusCode(HttpStatusCode.NoContent);
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