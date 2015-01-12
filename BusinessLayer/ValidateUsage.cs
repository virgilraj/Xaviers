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

    public class ValidateUsage
    {
        IRepository<Contact> contactRepository = null;
        IRepository<Expense> espenseRepository = null;
        IRepository<Income> incomeRepository = null;
        IRepository<Loan> loanRepository = null;
        IRepository<LoanCollection> loancollectionRepository = null;
        IRepository<RecurringTax> recurringTaxRepository = null;
        IRepository<RecurringTaxCollection> recurringCollectionRepository = null;
        IRepository<SmallSavingsCollection> smallSavingsCollectionRepository = null;
        IRepository<SmallSavingsSettlement> smallSavingsSettlementRepository = null;
        IRepository<Tax> taxRepository = null;
        IRepository<TaxCollection> taxCollectionRepository = null;

        public ValidateUsage(IRepository<Contact> ContactRepository, IRepository<Expense> EspenseRepository, IRepository<Income> IncomeRepository, IRepository<Loan> LoanRepository,
           IRepository<LoanCollection> LoancollectionRepository, IRepository<RecurringTax> RecurringTaxRepository, IRepository<RecurringTaxCollection> RecurringCollectionRepository,
            IRepository<SmallSavingsCollection> SmallSavingsCollectionRepository, IRepository<SmallSavingsSettlement> SmallSavingsSettlementRepository, IRepository<Tax> TaxRepository,
            IRepository<TaxCollection> TaxCollectionRepository)
        {
            contactRepository = ContactRepository;
            espenseRepository = EspenseRepository;
            incomeRepository = IncomeRepository;
            loanRepository = LoanRepository;
            loancollectionRepository = LoancollectionRepository;
            recurringTaxRepository = RecurringTaxRepository;
            recurringCollectionRepository = RecurringCollectionRepository;
            smallSavingsCollectionRepository = SmallSavingsCollectionRepository;
            smallSavingsSettlementRepository = SmallSavingsSettlementRepository;
            taxRepository = TaxRepository;
            taxCollectionRepository = TaxCollectionRepository;
        }

        public bool IsContactAlreadyUsed(int contactId)
        {
            bool isUsed = false;
            Expression<Func<Contact, bool>> contactExpr = sel => sel.CreatedBy == contactId || sel.ModifyBy == contactId;
            int contactCount = contactRepository.GetAll(contactExpr).Count();
            if (contactCount > 0) { return true; }

            Expression<Func<Expense, bool>> eexpExpr = sel => sel.CreatedBy == contactId || sel.ModifyBy == contactId || sel.ContactId == contactId || sel.ReceiverId == contactId;
            int expCount = espenseRepository.GetAll(eexpExpr).Count();
            if (expCount > 0) { return true; }

            Expression<Func<Tax, bool>> txExpr = sel => sel.CreatedBy == contactId || sel.ModifyBy == contactId;
            int txCount = taxRepository.GetAll(txExpr).Count();
            if (txCount > 0) { return true; }

            Expression<Func<SmallSavingsSettlement, bool>> stExpr = sel => sel.CreatedBy == contactId || sel.ModifyBy == contactId || sel.ContactId == contactId;
            int stCount = smallSavingsSettlementRepository.GetAll(stExpr).Count();
            if (stCount > 0) { return true; }

            Expression<Func<Income, bool>> incmExpr = sel => sel.CreatedBy == contactId || sel.ModifyBy == contactId || sel.ContactId == contactId || sel.ReceiverId == contactId;
            int incmCount = incomeRepository.GetAll(incmExpr).Count();
            if (incmCount > 0) { return true; }

            Expression<Func<TaxCollection, bool>> txcExpr = sel => sel.CreatedBy == contactId || sel.ModifyBy == contactId || sel.ContactId == contactId || sel.ReceiverId == contactId;
            int txcCount = taxCollectionRepository.GetAll(txcExpr).Count();
            if (txcCount > 0) { return true; }

            Expression<Func<Loan, bool>> lnExpr = sel => sel.CreatedBy == contactId || sel.ModifyBy == contactId || sel.ContactId == contactId;
            int lnCount = loanRepository.GetAll(lnExpr).Count();
            if (lnCount > 0) { return true; }

            Expression<Func<RecurringTaxCollection, bool>> rcExpr = sel => sel.CreatedBy == contactId || sel.ModifyBy == contactId || sel.ContactId == contactId || sel.ReceiverId == contactId;
            int rcCount = recurringCollectionRepository.GetAll(rcExpr).Count();
            if (rcCount > 0) { return true; }

            Expression<Func<SmallSavingsCollection, bool>> ssExpr = sel => sel.CreatedBy == contactId || sel.ModifyBy == contactId || sel.ContactId == contactId || sel.ReceiverId == contactId;
            int ssCount = smallSavingsCollectionRepository.GetAll(ssExpr).Count();
            if (ssCount > 0) { return true; }

            Expression<Func<LoanCollection, bool>> lcExpr = sel => sel.CreatedBy == contactId || sel.ModifyBy == contactId || sel.ContactId == contactId || sel.ReceiverId == contactId;
            int lcCount = loancollectionRepository.GetAll(lcExpr).Count();
            if (lcCount > 0) { return true; }
            
            return isUsed;
        }

        public bool IsTaxAlreadyUsed(int taxId)
        {
            bool isUsed = false;
            Expression<Func<TaxCollection, bool>> taxColExpr = sel => sel.TaxId == taxId;
            int taxColCount = taxCollectionRepository.GetAll(taxColExpr).Count();
            if (taxColCount > 0) { return true; }

            return isUsed;
        }

        public bool IsRecurringTaxAlreadyUsed(int taxId)
        {
            bool isUsed = false;
            Expression<Func<RecurringTaxCollection, bool>> taxColExpr = sel => sel.RecurringTaxId == taxId;
            int taxColCount = recurringCollectionRepository.GetAll(taxColExpr).Count();
            if (taxColCount > 0) { return true; }

            return isUsed;
        }

        public bool IsLoanAlreadyUsed(int loanid)
        {
            bool isUsed = false;
            Expression<Func<LoanCollection, bool>> taxColExpr = sel => sel.LoanId == loanid;
            int taxColCount = loancollectionRepository.GetAll(taxColExpr).Count();
            if (taxColCount > 0) { return true; }

            return isUsed;
        }
    }
}
