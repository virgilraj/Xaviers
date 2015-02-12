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
using RequestEngine;
using System.Linq.Expressions;
using RepositoryAndUnitOfWork.Interfaces;
using BusinessLayer;
using System.Data.SqlClient;
using System.Configuration;

namespace Xaviers.Controllers
{
    public class ContactsController : ApiController
    {
        IRepository<Tax> taxRepository = null;
        IRepository<TaxExcludedMember> excludeRepository = null;
        IRepository<Contact> contactRepository = null;
        IRepository<TaxCollection> collectionRepository = null;
        IRepository<RecurringTax> recurringTaxRepository = null;
        IRepository<RecurringTaxCollection> recurringCollectionRepository = null;

        IRepository<Expense> espenseRepository = null;
        IRepository<Income> incomeRepository = null;
        IRepository<Loan> loanRepository = null;
        IRepository<LoanCollection> loancollectionRepository = null;
        IRepository<RecurringTaxCollection> recurringTaxCollectionRepository = null;
        IRepository<SmallSavingsCollection> smallSavingsCollectionRepository = null;
        IRepository<SmallSavingsSettlement> smallSavingsSettlementRepository = null;
        IRepository<MailGroup> mailgroupRepository = null;
        IRepository<MailContact> mailContactRepository = null;

        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();
        
        public ContactsController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            taxRepository = unitOfWork.GetRepository<Tax>();
            excludeRepository = unitOfWork.GetRepository<TaxExcludedMember>();
            contactRepository = unitOfWork.GetRepository<Contact>();
            collectionRepository = unitOfWork.GetRepository<TaxCollection>();
            recurringTaxRepository = unitOfWork.GetRepository<RecurringTax>();
            recurringCollectionRepository = unitOfWork.GetRepository<RecurringTaxCollection>();

            espenseRepository = unitOfWork.GetRepository<Expense>();
            incomeRepository = unitOfWork.GetRepository<Income>();
            loanRepository = unitOfWork.GetRepository<Loan>();
            loancollectionRepository = unitOfWork.GetRepository<LoanCollection>();
            smallSavingsCollectionRepository = unitOfWork.GetRepository<SmallSavingsCollection>();
            smallSavingsSettlementRepository = unitOfWork.GetRepository<SmallSavingsSettlement>();
            mailgroupRepository = unitOfWork.GetRepository<MailGroup>();
            mailContactRepository = unitOfWork.GetRepository<MailContact>();
        }

        // GET api/ContactsApi
        public IEnumerable<Contact> GetContacts()
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }
            Expression<Func<Contact, bool>> expr = contact => contact.FirstName == "Virgil raj" && contact.Country == "India";
            return contactRepository.GetAll(expr);
        }

        // GET api/ContactsApi/keyword
        [System.Web.Http.AcceptVerbs("GET")]
        [System.Web.Http.HttpGet]
        [Route("api/Contacts/{keyword}")]
        public IEnumerable<IBusinessModel> GetContacts(string keyword)
        {
            if (auth.LoggedinUser == null)
            {
                return null;
            }

            if (string.IsNullOrEmpty(keyword) || !keyword.Contains("-")) { return null; }

            int contactId = 0;
            int.TryParse(keyword.Split('-')[0], out contactId);
            string type = keyword.Split('-')[1];
            Contact contact = contactRepository.Single(contactId);
            List<TaxBalanceAndReceived> taxes = new List<TaxBalanceAndReceived>();
            
            if(contact !=null)
            {
                TaxCalculation taxCalculation = new TaxCalculation(taxRepository, excludeRepository, contactRepository, collectionRepository,recurringTaxRepository, recurringCollectionRepository);
                taxes = !string.IsNullOrEmpty(type) && type.ToLower() == "bal" ? taxCalculation.GetTaxPendingList(contact) : !string.IsNullOrEmpty(type) && type.ToLower() == "rec" ? taxCalculation.GetTaxReceivedList(contact) :
                    !string.IsNullOrEmpty(type) && type.ToLower() == "rbal" ?  taxCalculation.GetRecurringTaxBalanceList(contact) : taxCalculation.GetRecurringTaxReceivedList(contact);
            }


            return taxes;
        }

        // GET api/ContactsApi/keyword/gender

        public IEnumerable<IBusinessModel> GetContacts(string keyword, string gender)
        {
            if (auth.LoggedinUser == null) { return null; }
            int totalRecords = 0;
            List<MiniContact> mincontacts = new List<MiniContact>();
            Func<Contact, object> orderby = sel => new { FirstName = sel.FirstName , LastName = sel.LastName};
            Func<Contact, Contact> selector = sel => new Contact { ContactId = sel.ContactId, Gender=sel.Gender, Email = sel.Email, FirstName = sel.FirstName, LastName = sel.LastName, CustomerId = sel.CustomerId };
            Func<Contact, bool> expr = null;

            if (gender != "all")
            {
                expr = contact => (contact.CustomerId == auth.LoggedinUser.CustomerId && contact.Gender == gender) && (contact.FirstName.ToLower().StartsWith(keyword.ToLower()) || contact.LastName.ToLower().StartsWith(keyword.ToLower()));
            }
            else
            {
                expr = contact => contact.CustomerId == auth.LoggedinUser.CustomerId && (contact.FirstName.ToLower().StartsWith(keyword.ToLower()) || contact.LastName.ToLower().StartsWith(keyword.ToLower()));
            }

            IEnumerable<Contact> searchContact = contactRepository.GetAll(expr,selector, true, 0, 35, out totalRecords);
            if (null != searchContact && searchContact.Count() > 0)
            {
                foreach (Contact contact in searchContact)
                {
                    mincontacts.Add(new MiniContact
                    {
                        ContactId = contact.ContactId,
                        Name = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId),
                        Email = contact.Email
                    });
                }
            }
            return mincontacts;
        }

        // GET api/ContactsApi/5
        [ResponseType(typeof(Contact))]
        [Route("api/Contacts/{id:int}")]
        public IHttpActionResult GetContact(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return BadRequest();
            }
            Contact contact = contactRepository.Single(id);
            if (contact == null)
            {
                return NotFound();
            }

            return Ok(contact);
        }

        // PUT api/ContactsApi/5
        [HttpPut]
        [Route("api/Contacts/{id:int}")]
        public IHttpActionResult PutContact(int id, Contact contact)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != contact.ContactId || auth.LoggedinUser == null)
            {
                return BadRequest();
            }

            try
            {
                if (!string.IsNullOrEmpty(contact.Title) && contact.Title.ToLower() == "company")
                {
                    contact.IsEligibleForTax = false;
                    contact.IsMember = false;
                    contact.YearIncome = 0;
                }

                contact.ModifyDate = DateTime.Now;
                contact.ModifyBy = auth.LoggedinUser.ContactId;
                contact.CustomerId = auth.LoggedinUser.CustomerId;
                contactRepository.Update(contact);
                unitOfWork.Save();

                //using (XaviersEntities db = new XaviersEntities())
                //{
                //    db.UpdateContactName(contact.ContactId, contact.CustomerId, string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId));
                //}

                //Need to rework
                if (contact.IsNameChanged)
                {
                    Expression<Func<TaxCollection, bool>> taxExpr = sel => sel.CustomerId == auth.LoggedinUser.CustomerId && (sel.ContactId == contact.ContactId || sel.ReceiverId == contact.ContactId);
                    List<TaxCollection> taxCol = collectionRepository.GetAll(taxExpr).ToList();
                    if (taxCol != null && taxCol.Count > 0)
                    {
                        foreach (TaxCollection txCl in taxCol)
                        {
                            TaxCollection collection = collectionRepository.Single(txCl.Id);
                            if (collection.ContactId == contact.ContactId)
                            {
                                collection.ContactName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            if (collection.ReceiverId == contact.ContactId)
                            {
                                collection.ReceiverName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            collectionRepository.Update(collection);
                        }
                    }

                    Expression<Func<RecurringTaxCollection, bool>> recurExpr = sel => sel.CustomerId == auth.LoggedinUser.CustomerId && (sel.ContactId == contact.ContactId || sel.ReceiverId == contact.ContactId);
                    List<RecurringTaxCollection> recurCol = recurringCollectionRepository.GetAll(recurExpr).ToList();
                    if (recurCol != null && recurCol.Count > 0)
                    {
                        foreach (RecurringTaxCollection rectxCl in recurCol)
                        {
                            RecurringTaxCollection recurcollection = recurringCollectionRepository.Single(rectxCl.Id);
                            if (recurcollection.ContactId == contact.ContactId)
                            {
                                recurcollection.ContactName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            if (recurcollection.ReceiverId == contact.ContactId)
                            {
                                recurcollection.ReceiverName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            recurringCollectionRepository.Update(recurcollection);
                        }
                    }

                    Expression<Func<Expense, bool>> expExpr = sel => sel.CustomerId == auth.LoggedinUser.CustomerId && (sel.ContactId == contact.ContactId || sel.ReceiverId == contact.ContactId);
                    List<Expense> expCol = espenseRepository.GetAll(expExpr).ToList();
                    if (expCol != null && expCol.Count > 0)
                    {
                        foreach (Expense exCl in expCol)
                        {
                            Expense expecollection = espenseRepository.Single(exCl.Id);
                            if (expecollection.ContactId == contact.ContactId)
                            {
                                expecollection.ContactName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            espenseRepository.Update(expecollection);
                        }
                    }

                    Expression<Func<Income, bool>> inExpr = sel => sel.CustomerId == auth.LoggedinUser.CustomerId && (sel.ContactId == contact.ContactId || sel.ReceiverId == contact.ContactId);
                    List<Income> inCol = incomeRepository.GetAll(inExpr).ToList();
                    if (inCol != null && inCol.Count > 0)
                    {
                        foreach (Income inCl in inCol)
                        {
                            Income incollection = incomeRepository.Single(inCl.Id);
                            if (incollection.ContactId == contact.ContactId)
                            {
                                incollection.ContactName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            if (incollection.ReceiverId == contact.ContactId)
                            {
                                incollection.ReceiverName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            incomeRepository.Update(incollection);
                        }
                    }

                    Expression<Func<Loan, bool>> lnExpr = sel => sel.CustomerId == auth.LoggedinUser.CustomerId && (sel.ContactId == contact.ContactId );
                    List<Loan> loanCol = loanRepository.GetAll(lnExpr).ToList();
                    if (loanCol != null && loanCol.Count > 0)
                    {
                        foreach (Loan lnCl in loanCol)
                        {
                            Loan loan = loanRepository.Single(lnCl.Id);
                            if (loan.ContactId == contact.ContactId)
                            {
                                loan.ContactName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }

                            loanRepository.Update(loan);
                        }
                    }

                    Expression<Func<LoanCollection, bool>> lcExpr = sel => sel.CustomerId == auth.LoggedinUser.CustomerId && (sel.ContactId == contact.ContactId || sel.ReceiverId == contact.ContactId);
                    List<LoanCollection> lcCol = loancollectionRepository.GetAll(lcExpr).ToList();
                    if (lcCol != null && lcCol.Count > 0)
                    {
                        foreach (LoanCollection lcCl in lcCol)
                        {
                            LoanCollection lccollection = loancollectionRepository.Single(lcCl.Id);
                            if (lccollection.ContactId == contact.ContactId)
                            {
                                lccollection.ContactName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            if (lccollection.ReceiverId == contact.ContactId)
                            {
                                lccollection.ReceiverName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            loancollectionRepository.Update(lccollection);
                        }
                    }

                    Expression<Func<SmallSavingsCollection, bool>> ssExpr = sel => sel.CustomerId == auth.LoggedinUser.CustomerId && (sel.ContactId == contact.ContactId || sel.ReceiverId == contact.ContactId);
                    List<SmallSavingsCollection> ssCol = smallSavingsCollectionRepository.GetAll(ssExpr).ToList();
                    if (ssCol != null && ssCol.Count > 0)
                    {
                        foreach (SmallSavingsCollection sCl in ssCol)
                        {
                            SmallSavingsCollection sscollection = smallSavingsCollectionRepository.Single(sCl.Id);
                            if (sscollection.ContactId == contact.ContactId)
                            {
                                sscollection.ContactName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            if (sscollection.ReceiverId == contact.ContactId)
                            {
                                sscollection.ReceiverName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }
                            smallSavingsCollectionRepository.Update(sscollection);
                        }
                    }

                    Expression<Func<SmallSavingsSettlement, bool>> sstExpr = sel => sel.CustomerId == auth.LoggedinUser.CustomerId && (sel.ContactId == contact.ContactId);
                    List<SmallSavingsSettlement> sstCol = smallSavingsSettlementRepository.GetAll(sstExpr).ToList();
                    if (sstCol != null && sstCol.Count > 0)
                    {
                        foreach (SmallSavingsSettlement stCl in sstCol)
                        {
                            SmallSavingsSettlement sscollection = smallSavingsSettlementRepository.Single(stCl.Id);
                            if (sscollection.ContactId == contact.ContactId)
                            {
                                sscollection.ContactName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            }

                            smallSavingsSettlementRepository.Update(sscollection);
                        }
                    }

                    unitOfWork.Save();
                }

                AddUpdateMailGroup(contact);

                Expression<Func<MailContact, bool>> expr = sel => sel.ContactId == contact.ContactId;
                List<MailContact> mailContacts = mailContactRepository.GetAll(expr).ToList();
                if (mailContacts != null && mailContacts.Count > 0)
                {
                    foreach (MailContact mailContact in mailContacts)
                    {
                        MailContact contactcollection = mailContactRepository.Single(mailContact.Id);
                        if (contactcollection.Id == contact.ContactId)
                        {
                            contactcollection.ContactName = string.Format("{0}  {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            contactcollection.Email = contact.Email;
                        }
                        mailContactRepository.Update(contactcollection);
                        unitOfWork.Save();
                    }
                }
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

        // POST api/ContactsApi
        [ResponseType(typeof(Contact))]
        [System.Web.Http.AcceptVerbs("POST")]
        [System.Web.Http.HttpPost]
        public IHttpActionResult PostContact(Contact contact)
        {
            if (!ModelState.IsValid || auth.LoggedinUser == null)
            {
                return BadRequest(ModelState);
            }

            try
            {
                if (!string.IsNullOrEmpty(contact.Title) && contact.Title.ToLower() == "company")
                {
                    contact.IsEligibleForTax = false;
                    contact.IsMember = false;
                    contact.YearIncome = 0;
                }
                contact.ModifyDate = DateTime.Now;
                contact.ModifyBy = auth.LoggedinUser.ContactId;
                contact.CreatedDate = DateTime.Now;
                contact.CreatedBy = auth.LoggedinUser.ContactId;
                contact.CustomerId = auth.LoggedinUser.CustomerId;
                contactRepository.Add(contact);
                unitOfWork.Save();

                AddUpdateMailGroup(contact);
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

        // DELETE api/ContactsApi/5
        [ResponseType(typeof(Contact))]
        [System.Web.Http.AcceptVerbs("DELETE")]
        [System.Web.Http.HttpDelete]
        [Route("api/Contacts/{id:int}")]
        public HttpResponseMessage DeleteContact(int id)
        {
            if (auth.LoggedinUser == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            ValidateUsage valUsage = new ValidateUsage(contactRepository, espenseRepository, incomeRepository, loanRepository, loancollectionRepository, recurringTaxRepository,
                recurringCollectionRepository, smallSavingsCollectionRepository, smallSavingsSettlementRepository, taxRepository, collectionRepository);
            if (valUsage.IsContactAlreadyUsed(id))
            {
                return this.Request.CreateResponse(HttpStatusCode.OK, new { content = "USED" });
            }  
            try
            {
                Contact contact = contactRepository.Single(id);
                contactRepository.Delete(contact);
                unitOfWork.Save();
            }
            catch (Exception)
            {
                throw;
            }
            return this.Request.CreateResponse(HttpStatusCode.NoContent);
        }


        //Add/update mail group
        private void AddUpdateMailGroup(Contact contact)
        {
            List<MailContact> grpContacts = new List<MailContact>();
            grpContacts.Add(new MailContact
            {
                ContactId = contact.ContactId,
                ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId),
                Email = contact.Email
            });

            if (contact.GroupId !=null && contact.GroupId > 0 && !string.IsNullOrEmpty(contact.GroupName))
            {
                MailGroup grp = mailgroupRepository.Single(contact.GroupId);
                if (grp != null && grp.GroupName == contact.GroupName)
                {
                    if (grp != null && grp.MailContacts != null && grp.MailContacts.Count > 0)
                    {
                        grp.MailContacts.Add(new MailContact
                        {
                            ContactId = contact.ContactId,
                            ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId),
                            Email = contact.Email
                        });
                    }
                    else
                    {
                        grp.MailContacts = grpContacts;
                    }
                    mailgroupRepository.Update(grp);
                    unitOfWork.Save();
                }
                else
                {
                    SaveGroup(contact, grpContacts);
                }
            }
            else if(!string.IsNullOrEmpty(contact.GroupName))
            {
                SaveGroup(contact, grpContacts);
            }
            else if(contact.OldGrpId > 0) //delete from group
            {
                MailGroup grp = mailgroupRepository.Single(contact.GroupId);
                if (grp != null)
                {
                    if (grp != null && grp.MailContacts != null && grp.MailContacts.Count > 0)
                    {
                        var mailContact = grp.MailContacts.Where(a => a.ContactId == contact.ContactId && a.Id == contact.OldGrpId).ToList();
                        if (mailContact != null && mailContact.Count > 0)
                        {
                            grp.MailContacts.Remove((MailContact)mailContact[0]);
                        }
                    }
                    
                    mailgroupRepository.Update(grp);
                    unitOfWork.Save();
                }
            }
        }

        private void SaveGroup(Contact contact, List<MailContact> grpContacts)
        {
            MailGroup grp = new MailGroup
            {
                GroupName = contact.GroupName,
                CustomerId = contact.CustomerId,
                Type = 1, // Annbiyam - group
                CreatedBy = contact.ContactId,
                ModifyBy = contact.CustomerId,
                CreatedDate = DateTime.Now,
                ModifyDate = DateTime.Now
            };

            grp.MailContacts = grpContacts;

            mailgroupRepository.Add(grp);
            unitOfWork.Save();
        }

        protected override void Dispose(bool disposing)
        {
            //if (disposing)
            //{vcx
            //    unitOfWork.Dispose();
            //}
            unitOfWork.Dispose();
            base.Dispose(disposing);
        }
    }
}