using DatabaseDataModel;
using RepositroryAndUnitOfWork.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer
{
    public class SmallSavingsCalculation
    {
        IRepository<SmallSavingsSettlement> savingsReturnRepository = null;
        IRepository<Contact> contactRepository = null;
        IRepository<SmallSavingsCollection> savingsRepository = null;

        public SmallSavingsCalculation(IRepository<SmallSavingsSettlement> SavingsReturnRepository, IRepository<Contact> ContactRepository, IRepository<SmallSavingsCollection> SavingsRepository)
        {
            savingsReturnRepository = SavingsReturnRepository;
            contactRepository = ContactRepository;
            savingsRepository = SavingsRepository;
        }

        public List<TaxBalanceAndReceived> GetSmallSavingBalance(string keyword, int customerid)
        {
            List<TaxBalanceAndReceived> savingbal = new List<TaxBalanceAndReceived>();
            Func<Contact, Contact> selector = sel => new Contact { ContactId = sel.ContactId, Email = sel.Email, FirstName = sel.FirstName, LastName = sel.LastName, CustomerId = sel.CustomerId };
            Func<Contact, bool> expr = contact => contact.CustomerId == customerid && (contact.FirstName.ToLower().StartsWith(keyword.ToLower()) || contact.LastName.ToLower().StartsWith(keyword.ToLower()));
            
            IEnumerable<Contact> searchContact = contactRepository.GetAll(expr, selector);
            foreach (Contact contact in searchContact)
            {
                
                Expression<Func<SmallSavingsCollection, bool>> colExpr = sav => sav.ContactId == contact.ContactId && sav.CustomerId == customerid;
                IList<SmallSavingsCollection> savingCollection = savingsRepository.GetAll(colExpr).ToList();

                Expression<Func<SmallSavingsSettlement, bool>> settleExpr = sav => sav.ContactId == contact.ContactId && sav.CustomerId == customerid;
                IList<SmallSavingsSettlement> savingSettlement = savingsReturnRepository.GetAll(settleExpr).ToList();

                double totalReceived = 0;
                double totalPaid = 0;
                if(savingCollection !=null && savingCollection.Count > 0)
                {
                    totalReceived = savingCollection.Sum(a => a.Amount);
                }

                if (savingSettlement != null && savingSettlement.Count > 0)
                {
                    totalPaid = savingSettlement.Sum(a => a.Amount);
                }

                if(totalReceived > totalPaid)
                {
                    TaxBalanceAndReceived returnBalnce = new TaxBalanceAndReceived();
                    returnBalnce.ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                    returnBalnce.ContactId = contact.ContactId;
                    returnBalnce.BalanceAmount = Math.Round(totalReceived - totalPaid, 2);
                    savingbal.Add(returnBalnce);
                }

            }

            return savingbal;
        }
    }
}
