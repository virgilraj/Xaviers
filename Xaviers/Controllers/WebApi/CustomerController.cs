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
using BusinessLayer;
using System.Text;

namespace Xaviers.Controllers.WebApi
{
    public class CustomerController : ApiController
    {
       IRepository<Customer> customerRepository = null;
       IRepository<Contact> contactRepository = null;
       IRepository<User> userRepository = null;
       IUnitOfWork unitOfWork = null;
        public CustomerController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            customerRepository = unitOfWork.GetRepository<Customer>();
            contactRepository = unitOfWork.GetRepository<Contact>();
            userRepository = unitOfWork.GetRepository<User>();
        }

        // GET api/Customer
        public IEnumerable<Customer> GetCustomer()
        {
            return customerRepository.GetAll();
        }

        // GET api/Customer/5
        [ResponseType(typeof(Customer))]
        public IHttpActionResult GetCustomer(int id)
        {
            Customer customer = customerRepository.Single(id);
            if (customer == null)
            {
                return NotFound();
            }

            return Ok(customer);
        }

        // PUT api/Customer/5
        public IHttpActionResult PutCustomer(int id, Customer customer)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != customer.Id)
            {
                return BadRequest();
            }

            try
            {
                customerRepository.Update(customer);
                unitOfWork.Save();
                
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!customerRepository.Exists(id))
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
        public IHttpActionResult PostCustomer(Customer customer)
        {
            //Check customer already exist
            Expression<Func<Customer, bool>> expr = cust => cust.Email == customer.Email;
            var customers = customerRepository.GetAll(expr);
            if(customers != null && customers.Count() > 0)
            {
                return CreatedAtRoute("DefaultApi", new { id = 0 }, customer);
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                customer.StartFinaceYer = DateTime.Now.Month > 3 ? DateTime.Now.Year : DateTime.Now.Year - 1;
                customer.CurrentFinanceyear = DateTime.Now.Month > 3 ? DateTime.Now.Year : DateTime.Now.Year - 1;
                customerRepository.Add(customer);
                unitOfWork.Save();

                Contact contact = new Contact
                {
                    Title = customer.Title,
                    FirstName = customer.FirstName,
                    LastName = customer.LastName,
                    Email = customer.Email,
                    Address1 = customer.Address1,
                    Address2 = customer.Address2,
                    City = customer.City,
                    State = customer.State,
                    Country = customer.Country,
                    PinCode = customer.PinCode,
                    CustomerId = customer.Id,
                    PhoneNumber = customer.PhoneNumber,
                    IsEligibleForTax = true,
                    IsMember = true
                };



                if (contact != null && !string.IsNullOrEmpty(contact.Email))
                {
                    contact.ModifyDate = DateTime.Now;
                    contact.ModifyBy = customer.Id;
                    contact.CreatedDate = DateTime.Now;
                    contact.CreatedBy = customer.Id;
                    contactRepository.Add(contact);
                    unitOfWork.Save();
                }

                User user = new User
                {
                    CustomerId = customer.Id,
                    ContactId = contact.ContactId,
                    Email = customer.Email,
                    Password = BusinessUtility.Encrypt(customer.Password),
                    Role = "SA",
                    ContactName = string.Format("{0} {1}", customer.FirstName, customer.LastName),
                    CreatedDate = DateTime.Now,
                    ModifyDate = DateTime.Now
                };
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    userRepository.Add(user);
                    unitOfWork.Save();

                    List<MessageModel> msg = new List<MessageModel>();
                    StringBuilder str = new StringBuilder();
                    str.AppendFormat("Dear <b>{0}</b>,<br><br>", customer.FirstName);
                    str.AppendFormat("<b>You have been registered successfully!!!</b><br><br>");
                    str.AppendFormat("Regards, <br><br><b>Team alanchypugal.com</b> <br>");
                    msg.Add(new MessageModel
                    {
                        FromEmail = "info@alanchypugal.com",
                        ToEmail = customer.Email,
                        Subject = "Registration Confirmation",
                        MessageBody = str.ToString()
                    });

                    int result = MailSender.SendMail(msg);
                    if (result == 1)
                    {
                    }
                    else
                    {
                    }
                }

            }
            catch (DbUpdateException)
            {
                if (customerRepository.Exists(customer.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = customer.Id }, customer);
        }

        // DELETE api/Customer/5
        [ResponseType(typeof(Expense))]
        public IHttpActionResult DeleteCustomer(int id)
        {
            try
            {
                Customer customer = customerRepository.Single(id);
                customerRepository.Delete(customer);
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