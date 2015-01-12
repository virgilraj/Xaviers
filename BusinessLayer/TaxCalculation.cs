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
    public class TaxCalculation
    {
        IRepository<Tax> taxRepository = null;
        IRepository<TaxExcludedMember> excludeRepository = null;
        IRepository<Contact> contactRepository = null;
        IRepository<TaxCollection> collectionRepository = null;
        IRepository<RecurringTax> recurringRepository = null;
        IRepository<RecurringTaxCollection> recurCollectionRepository = null;
        Authentication auth = new Authentication();
        public TaxCalculation(IRepository<Tax> TaxRepository, IRepository<TaxExcludedMember> ExcludeRepository, IRepository<Contact> ContactRepository, IRepository<TaxCollection> CollectionRepository,
            IRepository<RecurringTax> ReurringRepository, IRepository<RecurringTaxCollection> RecurCollectionRepository)
        {
            taxRepository = TaxRepository;
            excludeRepository = ExcludeRepository;
            contactRepository = ContactRepository;
            collectionRepository = CollectionRepository;
            recurringRepository = ReurringRepository;
            recurCollectionRepository = RecurCollectionRepository;
        }

        public List<TaxBalanceAndReceived> GetTaxPendingList(Contact contact)
        {
            if (auth.LoggedinUser == null) { return null; }
            List<TaxBalanceAndReceived> taxbal = new List<TaxBalanceAndReceived>();
            Expression<Func<Tax, bool>> taxExp = taxEx => taxEx.CustomerId == auth.LoggedinUser.CustomerId;
            IEnumerable<Tax> taxList = taxRepository.GetAll(taxExp);
            if (taxList != null && taxList.Count() > 0)
            {
                foreach (Tax tax in taxList)
                {
                    bool isEligible = true;
                    double taxAmount = 0;
                    if (tax.TaxExcludedMembers != null && tax.TaxExcludedMembers.Count > 0)
                    {
                        TaxExcludedMember taxExclude = tax.TaxExcludedMembers.FirstOrDefault(a => a.ContactId == contact.ContactId && a.CustomerId == auth.LoggedinUser.CustomerId);
                        isEligible = taxExclude == null;
                    }
                    //check available member
                    if(contact.DOL !=null && tax.StartDate > contact.DOL)
                    {
                        isEligible = false;
                    }
                    if(contact.DOD !=null && tax.StartDate > contact.DOD)
                    {
                        isEligible = false;
                    }
                    if (contact != null && tax != null && isEligible)
                    {
                        taxAmount = getTaxAmount(contact.YearIncome, tax);

                        if (taxAmount > 0)
                        {
                            TaxBalanceAndReceived taxBalnce = new TaxBalanceAndReceived();
                            double collectedAmount = 0;
                            Expression<Func<TaxCollection, bool>> expr = taccollection => taccollection.TaxId == tax.Id && taccollection.ContactId == contact.ContactId && taccollection.CustomerId == auth.LoggedinUser.CustomerId;
                            Expression<Func<TaxCollection, Nullable<double>>> selector = taccollection => taccollection.Amount;
                            IEnumerable<TaxCollection> taxCol = tax.TaxCollections !=null && tax.TaxCollections.Count > 0 ? tax.TaxCollections.Where(col => col.TaxId == tax.Id && col.ContactId == contact.ContactId && col.CustomerId == auth.LoggedinUser.CustomerId) : null;
                            collectedAmount = Convert.ToDouble(taxCol != null && taxCol.Count() > 0 ? taxCol.Sum(a => a.Amount) : collectionRepository.GetSum(expr, selector));

                            taxAmount = Math.Round(taxAmount, 2);
                            collectedAmount = Math.Round(collectedAmount, 2);
                            if (taxAmount > collectedAmount)
                            {
                                taxBalnce.TaxAmount = Math.Round(taxAmount, 2);
                                taxBalnce.TotalReceivedAmount = Math.Round(collectedAmount, 2);
                                taxBalnce.BalanceAmount = Math.Round(taxAmount - collectedAmount);
                                taxBalnce.TaxId = tax.Id;
                                taxBalnce.TaxName = tax.TaxName;
                                taxBalnce.ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                                taxBalnce.ContactId = contact.ContactId;
                                taxbal.Add(taxBalnce);
                            }

                        }
                    }
                }
            }

            return taxbal;
        }

        public List<TaxBalanceAndReceived> GetTaxReceivedList(Contact contact)
        {
            if (auth.LoggedinUser == null) { return null; }
            List<TaxBalanceAndReceived> taxbal = new List<TaxBalanceAndReceived>();
            Expression<Func<Tax, bool>> taxExp = taxEx => taxEx.CustomerId == auth.LoggedinUser.CustomerId;
            IEnumerable<Tax> taxList = taxRepository.GetAll(taxExp);
            if (taxList != null && taxList.Count() > 0)
            {
                foreach (Tax tax in taxList)
                {
                    bool isEligible = true;
                    double taxAmount = 0;
                    
                    if (tax.TaxExcludedMembers != null && tax.TaxExcludedMembers.Count > 0)
                    {
                        TaxExcludedMember taxExclude = tax.TaxExcludedMembers.FirstOrDefault(a => a.ContactId == contact.ContactId);
                        isEligible = taxExclude == null;
                    }
                    //check available member
                    if (contact.DOL != null && tax.StartDate > contact.DOL)
                    {
                        isEligible = false;
                    }
                    if (contact.DOD != null && tax.StartDate > contact.DOD)
                    {
                        isEligible = false;
                    }
                    if (contact != null && tax != null && isEligible)
                    {
                        taxAmount = getTaxAmount(contact.YearIncome, tax);

                        if (taxAmount > 0)
                        {
                            TaxBalanceAndReceived taxBalnce = new TaxBalanceAndReceived();
                            double collectedAmount = 0;
                            Expression<Func<TaxCollection, bool>> expr = taccollection => taccollection.TaxId == tax.Id && taccollection.ContactId == contact.ContactId && taccollection.CustomerId == auth.LoggedinUser.CustomerId;
                            Expression<Func<TaxCollection, Nullable<double>>> selector = taccollection => taccollection.Amount;
                            
                            IEnumerable<TaxCollection> taxCol = tax.TaxCollections != null && tax.TaxCollections.Count > 0 ? tax.TaxCollections.Where(col => col.TaxId == tax.Id && col.ContactId == contact.ContactId && col.CustomerId == auth.LoggedinUser.CustomerId) : null;
                            collectedAmount = Convert.ToDouble(taxCol != null && taxCol.Count() > 0 ? taxCol.Sum(a => a.Amount) : collectionRepository.GetSum(expr, selector));

                            taxAmount = Math.Round(taxAmount, 2);
                            collectedAmount = Math.Round(collectedAmount, 2);
                            if (collectedAmount > 0)
                            {
                                taxBalnce.TaxAmount = Math.Round(taxAmount, 2);
                                taxBalnce.TotalReceivedAmount = Math.Round(collectedAmount, 2);
                                taxBalnce.BalanceAmount = Math.Round(taxAmount - collectedAmount);
                                taxBalnce.TaxId = tax.Id;
                                taxBalnce.TaxName = tax.TaxName;
                                taxBalnce.ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                                taxBalnce.ContactId = contact.ContactId;
                                taxbal.Add(taxBalnce);
                            }

                        }
                    }
                }
            }

            return taxbal;
        }

        

        public List<TaxBalanceAndReceived> GetTaxPendingList(IEnumerable<Contact> contacts, int taxid)
        {
            if (auth.LoggedinUser == null) { return null; }
            List<TaxBalanceAndReceived> taxbal = new List<TaxBalanceAndReceived>();
            foreach (Contact contact in contacts)
            {
                TaxBalanceAndReceived taxBalnce = new TaxBalanceAndReceived();
                bool isEligible = true;
                double taxAmount = 0;

                Tax tax = taxRepository.Single(taxid);
                if (tax.TaxExcludedMembers != null && tax.TaxExcludedMembers.Count > 0)
                {
                    TaxExcludedMember taxExclude = tax.TaxExcludedMembers.FirstOrDefault(a => a.ContactId == contact.ContactId);
                    isEligible = taxExclude == null;
                }
                //check available member
                if (contact.DOL != null && tax.StartDate > contact.DOL)
                {
                    isEligible = false;
                }
                if (contact.DOD != null && tax.StartDate > contact.DOD)
                {
                    isEligible = false;
                }

                if (contact != null && tax != null && isEligible)
                {
                    taxAmount = getTaxAmount(contact.YearIncome, tax);

                    if (taxAmount > 0)
                    {
                        double collectedAmount = 0;
                        Expression<Func<TaxCollection, bool>> expr = taccollection => taccollection.TaxId == taxid && taccollection.ContactId == contact.ContactId && taccollection.CustomerId == auth.LoggedinUser.CustomerId;
                        Expression<Func<TaxCollection, Nullable<double>>> selector = taccollection => taccollection.Amount;

                        IEnumerable<TaxCollection> taxCol = tax.TaxCollections != null && tax.TaxCollections.Count > 0 ? tax.TaxCollections.Where(col => col.TaxId == tax.Id && col.ContactId == contact.ContactId && col.CustomerId == auth.LoggedinUser.CustomerId) : null;
                        collectedAmount = Convert.ToDouble(taxCol != null && taxCol.Count() > 0 ? taxCol.Sum(a => a.Amount) : collectionRepository.GetSum(expr, selector));

                        taxAmount = Math.Round(taxAmount, 2);
                        collectedAmount = Math.Round(collectedAmount, 2);
                        if (taxAmount > collectedAmount)
                        {
                            taxBalnce.TaxAmount = Math.Round(taxAmount, 2);
                            taxBalnce.TotalReceivedAmount = Math.Round(collectedAmount, 2);
                            taxBalnce.BalanceAmount = Math.Round(taxAmount - collectedAmount);
                            taxBalnce.TaxId = taxid;
                            taxBalnce.TaxName = tax.TaxName;
                            taxBalnce.ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            taxBalnce.ContactId = contact.ContactId;
                            taxbal.Add(taxBalnce);
                        }

                    }
                }
            }
            return taxbal;
        }

        public List<TaxBalanceAndReceived> GetTaxReceivedList(IEnumerable<Contact> contacts, int taxid)
        {
            if (auth.LoggedinUser == null) { return null; }
            List<TaxBalanceAndReceived> taxbal = new List<TaxBalanceAndReceived>();
            foreach (Contact contact in contacts)
            {
                TaxBalanceAndReceived taxBalnce = new TaxBalanceAndReceived();
                bool isEligible = true;
                double taxAmount = 0;

                Tax tax = taxRepository.Single(taxid);
                if (tax.TaxExcludedMembers != null && tax.TaxExcludedMembers.Count > 0)
                {
                    TaxExcludedMember taxExclude = tax.TaxExcludedMembers.FirstOrDefault(a => a.ContactId == contact.ContactId);
                    isEligible = taxExclude == null;
                }
                //check available member
                if (contact.DOL != null && tax.StartDate > contact.DOL)
                {
                    isEligible = false;
                }
                if (contact.DOD != null && tax.StartDate > contact.DOD)
                {
                    isEligible = false;
                }
                if (contact != null && tax != null && isEligible)
                {
                    taxAmount = getTaxAmount(contact.YearIncome, tax);

                    if (taxAmount > 0)
                    {
                        double collectedAmount = 0;
                        Expression<Func<TaxCollection, bool>> expr = taccollection => taccollection.TaxId == taxid && taccollection.ContactId == contact.ContactId && taccollection.CustomerId == auth.LoggedinUser.CustomerId;
                        Expression<Func<TaxCollection, Nullable<double>>> selector = taccollection => taccollection.Amount;

                        IEnumerable<TaxCollection> taxCol = tax.TaxCollections != null && tax.TaxCollections.Count > 0 ? tax.TaxCollections.Where(col => col.TaxId == tax.Id && col.ContactId == contact.ContactId && col.CustomerId == auth.LoggedinUser.CustomerId) : null;
                        collectedAmount = Convert.ToDouble(taxCol != null && taxCol.Count() > 0 ? taxCol.Sum(a => a.Amount) : collectionRepository.GetSum(expr, selector));

                        taxAmount = Math.Round(taxAmount, 2);
                        collectedAmount = Math.Round(collectedAmount, 2);
                        if (collectedAmount > 0)
                        {
                            taxBalnce.TaxAmount = Math.Round(taxAmount, 2);
                            taxBalnce.TotalReceivedAmount = Math.Round(collectedAmount, 2);
                            taxBalnce.BalanceAmount = Math.Round(taxAmount - collectedAmount);
                            taxBalnce.TaxId = taxid;
                            taxBalnce.TaxName = tax.TaxName;
                            taxBalnce.ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            taxBalnce.ContactId = contact.ContactId;
                            taxbal.Add(taxBalnce);
                        }
                    }
                }
            }
            return taxbal;
        }

        

        public TaxTotalAmount GetExceptedAmount(IEnumerable<Contact> contacts, Tax tax)
        {

            if (auth.LoggedinUser == null) { return null; }
            double totalAmount = 0;
            double totCollectedAmount = 0;
            TaxTotalAmount taxTotalAmount = new TaxTotalAmount();
            if (tax.TaxAmount != null && tax.TaxAmount > 0)
            {
                totalAmount = (((double)tax.TaxAmount) * contacts.Count());

                foreach (Contact contact in contacts)
                {
                    Expression<Func<TaxCollection, bool>> expr = taccollection => taccollection.TaxId == tax.Id && taccollection.ContactId == contact.ContactId && taccollection.CustomerId == auth.LoggedinUser.CustomerId;
                    Expression<Func<TaxCollection, Nullable<double>>> selector = taccollection => taccollection.Amount;

                    IEnumerable<TaxCollection> taxCol = tax.TaxCollections != null && tax.TaxCollections.Count > 0 ? tax.TaxCollections.Where(col => col.TaxId == tax.Id && col.ContactId == contact.ContactId && col.CustomerId == auth.LoggedinUser.CustomerId) : null;
                    totCollectedAmount += Convert.ToDouble(taxCol != null && taxCol.Count() > 0 ? taxCol.Sum(a => a.Amount) : collectionRepository.GetSum(expr, selector));
                }
            }
            else if (tax.TaxNoOfDaysIncome != null && tax.TaxNoOfDaysIncome > 0 && contacts != null && contacts.Count() > 0)
            {
                foreach (Contact contact in contacts)
                {
                    Expression<Func<TaxCollection, bool>> expr = taccollection => taccollection.TaxId == tax.Id && taccollection.ContactId == contact.ContactId && taccollection.CustomerId == auth.LoggedinUser.CustomerId;
                    Expression<Func<TaxCollection, Nullable<double>>> selector = taccollection => taccollection.Amount;

                    IEnumerable<TaxCollection> taxCol = tax.TaxCollections != null && tax.TaxCollections.Count > 0 ? tax.TaxCollections.Where(col => col.TaxId == tax.Id && col.ContactId == contact.ContactId && col.CustomerId == auth.LoggedinUser.CustomerId) : null;
                    totCollectedAmount += Convert.ToDouble(taxCol != null && taxCol.Count() > 0 ? taxCol.Sum(a => a.Amount) : collectionRepository.GetSum(expr, selector));

                    double onedayIncome = contact.YearIncome != null && contact.YearIncome > 0 ? (((double)contact.YearIncome) / 365) : 0;
                    totalAmount += onedayIncome;
                }
            }
            else if (tax.TaxPercentBaseIncome != null && tax.TaxPercentBaseIncome > 0 && contacts != null && contacts.Count() > 0)
            {
                foreach (Contact contact in contacts)
                {
                    Expression<Func<TaxCollection, bool>> expr = taccollection => taccollection.TaxId == tax.Id && taccollection.ContactId == contact.ContactId && taccollection.CustomerId == auth.LoggedinUser.CustomerId;
                    Expression<Func<TaxCollection, Nullable<double>>> selector = taccollection => taccollection.Amount;

                    IEnumerable<TaxCollection> taxCol = tax.TaxCollections != null && tax.TaxCollections.Count > 0 ? tax.TaxCollections.Where(col => col.TaxId == tax.Id && col.ContactId == contact.ContactId && col.CustomerId == auth.LoggedinUser.CustomerId) : null;
                    totCollectedAmount += Convert.ToDouble(taxCol != null && taxCol.Count() > 0 ? taxCol.Sum(a => a.Amount) : collectionRepository.GetSum(expr, selector));

                    double onedayvalue = contact.YearIncome != null && contact.YearIncome > 0 ? (((double)contact.YearIncome * (double)tax.TaxPercentBaseIncome) / 100) : 0;
                    totalAmount += onedayvalue;
                }
            }

            double exclude = 0;
            if (tax.TaxExcludedMembers != null && tax.TaxExcludedMembers.Count > 0)
            {
                exclude = (double)tax.TaxExcludedMembers.Sum(ex => ex.Amount);
            }

            taxTotalAmount.ExceptedAmount = Math.Round((totalAmount - exclude), 2);
            taxTotalAmount.TotalReceivedAmount = Math.Round((double)totCollectedAmount, 2);
            taxTotalAmount.BalanceAmount = Math.Round((taxTotalAmount.ExceptedAmount - taxTotalAmount.TotalReceivedAmount), 2);
            taxTotalAmount.TaxId = tax.Id;
            return taxTotalAmount;
        }


        public TaxBalance GetBalanceAmount(Contact contact, Tax tax)
        {
            TaxBalance taxBalance = new TaxBalance();
            taxBalance.ContactId = contact.ContactId;
            taxBalance.TaxId = tax.Id;

            double totalAmount = 0;
            double totalcollection = 0;
            Expression<Func<TaxCollection, bool>> expr = collection => collection.TaxId == tax.Id && collection.ContactId == contact.ContactId && collection.CustomerId == auth.LoggedinUser.CustomerId;
            Expression<Func<TaxCollection, Nullable<double>>> selector = taccollection => taccollection.Amount;

            IEnumerable<TaxCollection> taxCol = tax.TaxCollections != null && tax.TaxCollections.Count > 0 ? tax.TaxCollections.Where(col => col.TaxId == tax.Id && col.ContactId == contact.ContactId && col.CustomerId == auth.LoggedinUser.CustomerId) : null;
            totalcollection = Convert.ToDouble(taxCol != null && taxCol.Count() > 0 ? taxCol.Sum(a => a.Amount) : collectionRepository.GetSum(expr, selector));

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

        public List<TaxBalanceAndReceived> GetRecurringTaxReceivedList(IEnumerable<Contact> contacts, int taxid)
        {
            if (auth.LoggedinUser == null) { return null; }
            List<TaxBalanceAndReceived> taxbal = new List<TaxBalanceAndReceived>();
            foreach (Contact contact in contacts)
            {
                TaxBalanceAndReceived taxBalnce = new TaxBalanceAndReceived();
                bool isEligible = true;
                double taxAmount = 0;

                RecurringTax tax = recurringRepository.Single(taxid);
                //check available member
                if (contact.DOL != null && tax.StartDate > contact.DOL)
                {
                    isEligible = false;
                }
                if (contact.DOD != null && tax.StartDate > contact.DOD)
                {
                    isEligible = false;
                }
                if (contact != null && tax != null && isEligible)
                {
                    TaxBalance taxBal = GetRecurBalanceAmount(contact, tax);
                    if (taxBal !=  null)
                    {
                        taxBalnce.TaxAmount = Math.Round(taxAmount, 2);
                        taxBalnce.TotalReceivedAmount = Math.Round(taxBal.TotalReceivedAmount, 2);
                        taxBalnce.BalanceAmount = Math.Round(taxBal.BalanceAmount, 2);
                        taxBalnce.TaxId = taxid;
                        taxBalnce.TaxName = tax.TaxName;
                        taxBalnce.ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                        taxBalnce.ContactId = contact.ContactId;
                        taxbal.Add(taxBalnce);
                    }
                }
            }
            return taxbal;
        }

        public List<TaxBalanceAndReceived> GetRecurringTaxBalanceList(IEnumerable<Contact> contacts, int taxid)
        {
            if (auth.LoggedinUser == null) { return null; }
            List<TaxBalanceAndReceived> taxbal = new List<TaxBalanceAndReceived>();
            foreach (Contact contact in contacts)
            {
                TaxBalanceAndReceived taxBalnce = new TaxBalanceAndReceived();
                bool isEligible = true;
                double taxAmount = 0;

                RecurringTax tax = recurringRepository.Single(taxid);
                //check available member
                if (contact.DOL != null && tax.StartDate > contact.DOL)
                {
                    isEligible = false;
                }
                if (contact.DOD != null && tax.StartDate > contact.DOD)
                {
                    isEligible = false;
                }
                if (contact != null && tax != null && isEligible)
                {
                    TaxBalance taxBal = GetRecurBalanceIncludeNotMadeSinglePayment(contact, tax);
                    if (taxBal != null)
                    {
                        taxBalnce.TaxAmount = Math.Round(taxAmount, 2);
                        taxBalnce.TotalReceivedAmount = Math.Round(taxBal.TotalReceivedAmount, 2);
                        taxBalnce.BalanceAmount = Math.Round(taxBal.BalanceAmount, 2);
                        taxBalnce.TaxId = taxid;
                        taxBalnce.TaxName = tax.TaxName;
                        taxBalnce.ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                        taxBalnce.ContactId = contact.ContactId;
                        taxBalnce.PayType = taxBal.PayType;
                        taxbal.Add(taxBalnce);
                    }
                }
            }
            return taxbal;
        }

        public List<TaxBalanceAndReceived> GetRecurringTaxReceivedList(Contact contact)
        {
            if (auth.LoggedinUser == null) { return null; }
            List<TaxBalanceAndReceived> taxbalList = new List<TaxBalanceAndReceived>();
            Expression<Func<RecurringTax, bool>> taxExp = taxEx => taxEx.CustomerId == auth.LoggedinUser.CustomerId;
            IEnumerable<RecurringTax> taxList = recurringRepository.GetAll(taxExp);
            if (taxList != null && taxList.Count() > 0)
            {
                foreach (RecurringTax tax in taxList)
                {
                    double taxAmount = 0;
                    
                    if (contact != null && tax != null)
                    {
                        TaxBalance taxBal = GetRecurBalanceAmount(contact, tax);
                        TaxBalanceAndReceived taxBalnce = new TaxBalanceAndReceived();

                        if (taxBal != null)
                        {
                            taxBalnce.TaxAmount = Math.Round(taxAmount, 2);
                            taxBalnce.TotalReceivedAmount = Math.Round(taxBal.TotalReceivedAmount, 2);
                            taxBalnce.BalanceAmount = Math.Round(taxBal.BalanceAmount, 2);
                            taxBalnce.TaxId = tax.Id;
                            taxBalnce.TaxName = tax.TaxName;
                            taxBalnce.ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            taxBalnce.ContactId = contact.ContactId;
                            taxbalList.Add(taxBalnce);
                        }
                    }
                }
            }

            return taxbalList;
        }

        public List<TaxBalanceAndReceived> GetRecurringTaxBalanceList(Contact contact)
        {
            if (auth.LoggedinUser == null) { return null; }
            List<TaxBalanceAndReceived> taxbalList = new List<TaxBalanceAndReceived>();
            Expression<Func<RecurringTax, bool>> taxExp = taxEx => taxEx.CustomerId == auth.LoggedinUser.CustomerId;
            IEnumerable<RecurringTax> taxList = recurringRepository.GetAll(taxExp);
            if (taxList != null && taxList.Count() > 0)
            {
                foreach (RecurringTax tax in taxList)
                {
                    double taxAmount = 0;

                    if (contact != null && tax != null)
                    {
                        TaxBalance taxBal = GetRecurBalanceIncludeNotMadeSinglePayment(contact, tax);
                        TaxBalanceAndReceived taxBalnce = new TaxBalanceAndReceived();

                        if (taxBal != null)
                        {
                            taxBalnce.TaxAmount = Math.Round(taxAmount, 2);
                            taxBalnce.TotalReceivedAmount = Math.Round(taxBal.TotalReceivedAmount, 2);
                            taxBalnce.BalanceAmount = Math.Round(taxBal.BalanceAmount, 2);
                            taxBalnce.TaxId = tax.Id;
                            taxBalnce.TaxName = tax.TaxName;
                            taxBalnce.ContactName = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId);
                            taxBalnce.ContactId = contact.ContactId;
                            taxbalList.Add(taxBalnce);
                        }
                    }
                }
            }

            return taxbalList;
        }

        public TaxBalance GetRecurBalanceAmount(Contact contact, RecurringTax tax)
        {
            TaxBalance taxBalance = new TaxBalance();
            taxBalance.ContactId = contact.ContactId;
            taxBalance.TaxId = tax.Id;

            double totalAmount = 0;
            double totalcollection = 0;
            Expression<Func<RecurringTaxCollection, bool>> expr = collection => collection.RecurringTaxId == tax.Id && collection.ContactId == contact.ContactId && collection.CustomerId == auth.LoggedinUser.CustomerId;

            IEnumerable<RecurringTaxCollection> taxCol = tax.RecurringTaxCollections != null && tax.RecurringTaxCollections.Count > 0 ? tax.RecurringTaxCollections.Where(col => col.RecurringTaxId == tax.Id && col.ContactId == contact.ContactId && col.CustomerId == auth.LoggedinUser.CustomerId) : null;
            IEnumerable<RecurringTaxCollection> recurCollection = taxCol != null && taxCol.Count() > 0 ? taxCol : recurCollectionRepository.GetAll(expr);

            if(recurCollection !=null && recurCollection.Count() > 0)
            {
                foreach(RecurringTaxCollection col in recurCollection)
                {
                    totalcollection += (double)col.Amount;
                    DateTime ? endDate = tax.EndDate != null && tax.EndDate <= DateTime.Now ? tax.EndDate : DateTime.Now;
                    switch(col.PayType)
                    {
                        case "M":
                            taxBalance.PayType = "M";
                            int monthdiff = getMonthDiff((DateTime)tax.StartDate, (DateTime)endDate);
                            totalAmount += (double)tax.MonthlyAmount * monthdiff;
                            break;
                        case "Y":
                            taxBalance.PayType = "Y";
                            int yearDiff = getYearDiff((DateTime)tax.StartDate, (DateTime)endDate);
                            totalAmount += (double)tax.YearlyAmount * yearDiff;
                            break;
                        case "L":
                            taxBalance.PayType = "L";
                            totalAmount = (double) tax.LifetimeAmount;
                            break;
                    }
                }
            }

            taxBalance.TotalReceivedAmount = totalcollection;
            totalAmount = totalAmount - totalcollection;
            taxBalance.BalanceAmount = Math.Round(totalAmount, 2);
            return taxBalance;
        }

        public TaxTotalAmount GetExceptedRecurringAmount(IEnumerable<Contact> contacts, RecurringTax tax)
        {
            if (auth.LoggedinUser == null) { return null; }
            TaxTotalAmount taxTotalAmount = new TaxTotalAmount();
            if(contacts != null && contacts.Count() > 0)
            {
                foreach(Contact contact in contacts)
                {
                    TaxBalance taxBal = GetRecurBalanceIncludeNotMadeSinglePayment(contact, tax);
                    if(taxBal != null){
                        taxTotalAmount.ExceptedAmount = Math.Round(taxBal.BalanceAmount + taxTotalAmount.TotalReceivedAmount,2);
                        taxTotalAmount.TotalReceivedAmount = Math.Round(taxBal.TotalReceivedAmount, 2);
                        taxTotalAmount.BalanceAmount = Math.Round(taxBal.BalanceAmount, 2);
                        taxTotalAmount.TaxId = tax.Id;
                    }
                }
            }

            return taxTotalAmount;
        }

        public TaxBalance GetRecurBalanceIncludeNotMadeSinglePayment(Contact contact, RecurringTax tax)
        {
            TaxBalance taxBalance = new TaxBalance();
            taxBalance.ContactId = contact.ContactId;
            taxBalance.TaxId = tax.Id;

            double totalAmount = 0;
            double totalcollection = 0;
            Expression<Func<RecurringTaxCollection, bool>> expr = collection => collection.RecurringTaxId == tax.Id && collection.ContactId == contact.ContactId && collection.CustomerId == auth.LoggedinUser.CustomerId;

            IEnumerable<RecurringTaxCollection> taxCol = tax.RecurringTaxCollections != null && tax.RecurringTaxCollections.Count > 0 ? tax.RecurringTaxCollections.Where(col => col.RecurringTaxId == tax.Id && col.ContactId == contact.ContactId && col.CustomerId == auth.LoggedinUser.CustomerId) : null;
            IEnumerable<RecurringTaxCollection> recurCollection = taxCol != null && taxCol.Count() > 0 ? taxCol : recurCollectionRepository.GetAll(expr);
            if (recurCollection != null && recurCollection.Count() > 0)
            {
                foreach (RecurringTaxCollection col in recurCollection)
                {
                    totalcollection += (double)col.Amount;
                    DateTime? endDate = tax.EndDate != null && tax.EndDate <= DateTime.Now ? tax.EndDate : DateTime.Now;
                    switch (col.PayType)
                    {
                        case "M":
                            taxBalance.PayType = "M";
                            int monthdiff = getMonthDiff((DateTime)tax.StartDate, (DateTime)endDate);
                            totalAmount += (double)tax.MonthlyAmount * monthdiff;
                            break;
                        case "Y":
                            taxBalance.PayType = "Y";
                            int yearDiff = getYearDiff((DateTime)tax.StartDate, (DateTime)endDate);
                            totalAmount += (double)tax.YearlyAmount * yearDiff;
                            break;
                        case "L":
                            taxBalance.PayType = "L";
                            totalAmount = (double)tax.LifetimeAmount;
                            break;
                    }
                }
            }
            else
            {
                totalAmount = (double)tax.LifetimeAmount;
            }

            taxBalance.TotalReceivedAmount = totalcollection;
            totalAmount = totalAmount - totalcollection;
            taxBalance.BalanceAmount = Math.Round(totalAmount, 2);
            return taxBalance;
        }
        private int getMonthDiff(DateTime sDate, DateTime eDate)
        {
            int diff = 0;
            if(sDate <= eDate)
            {
                int sMonth = sDate.Month;
                int eMonth = eDate.Month;
                int sYear = sDate.Year;
                int eYear = eDate.Year;

                if(sYear <= eYear)
                {
                    diff = (eYear - sYear) * 12;
                }

                diff += (eMonth - sMonth);
            }

            return diff;
        }

        private int getYearDiff(DateTime sDate, DateTime eDate)
        {
            int diff = 0;
            if (sDate <= eDate)
            {
                int sYear = sDate.Year;
                int eYear = eDate.Year;

                if (sYear <= eYear)
                {
                    diff = (eYear - sYear);
                }
            }

            return diff;
        }

        private double getTaxAmount(int? yearIncome, Tax tax)
        {
            double taxAmount = 0;
            if (tax.TaxAmount != null && tax.TaxAmount > 0)
            {
                taxAmount = (double)tax.TaxAmount;
            }
            else if (tax.TaxNoOfDaysIncome != null && tax.TaxNoOfDaysIncome > 0)
            {
                taxAmount = yearIncome != null && yearIncome > 0 ? (((double)yearIncome) / 365) : 0;
            }
            else if (tax.TaxPercentBaseIncome != null && tax.TaxPercentBaseIncome > 0)
            {
                taxAmount = yearIncome != null && yearIncome > 0 ? (((double)yearIncome * (double)tax.TaxPercentBaseIncome) / 100) : 0;
            }
            return taxAmount;
        }

       
    }
}
