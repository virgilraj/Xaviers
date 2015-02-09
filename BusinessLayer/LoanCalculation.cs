using DatabaseDataModel;
using RepositroryAndUnitOfWork.Interfaces;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer
{
     public class LoanCalculation
    {
         IRepository<Loan> loanRepository = null;
        IRepository<Contact> contactRepository = null;
        IRepository<LoanCollection> loancollectionRepository = null;

        public LoanCalculation(IRepository<Loan> LoanRepository, IRepository<Contact> ContactRepository, IRepository<LoanCollection> LoancollectionRepository)
        {
            loanRepository = LoanRepository;
            contactRepository = ContactRepository;
            loancollectionRepository = LoancollectionRepository;
        }

        public List<ContactAndLoan> GetLoansForContacts(string keyword, int customerid)
        {
            List<ContactAndLoan> contactLoans = new List<ContactAndLoan>();

            Func<Contact, Contact> selector = sel => new Contact { ContactId = sel.ContactId, Email = sel.Email, FirstName = sel.FirstName, LastName = sel.LastName, CustomerId = sel.CustomerId };
            Func<Contact, bool> expr = contact => contact.CustomerId == customerid && (contact.FirstName.ToLower().StartsWith(keyword.ToLower()) || contact.LastName.ToLower().StartsWith(keyword.ToLower()));

            IEnumerable<Contact> searchContact = contactRepository.GetAll(expr, selector);
            foreach (Contact contact in searchContact)
            {
                Expression<Func<Loan, bool>> lonExpr = ln => ln.ContactId == contact.ContactId && ln.CustomerId == customerid;
                IList<Loan> loans = loanRepository.GetAll(lonExpr).ToList();

                if (loans != null && loans.Count > 0)
                {
                    ContactAndLoan contactloan = new ContactAndLoan
                    {
                        ContactId = contact.ContactId,
                        Email = contact.Email,
                        Name = string.Format("{0} {1} - {2}", contact.FirstName, contact.LastName, contact.ContactId)
                    };

                    List<LoanList> loanList = new List<LoanList>();

                    foreach (Loan loan in loans)
                    {
                        loanList.Add(new LoanList
                        {
                            loanAmount = (double)loan.Amount,
                            LoanId = loan.Id,
                            LoanName = string.Format("{0} {1}", loan.Id, loan.Description)
                        });
                    }

                    contactloan.LoanList = loanList;
                    contactLoans.Add(contactloan);
                }
            }

            return contactLoans;
        }

        public List<ContactAndLoan> GetLoansForContact(int contactId, int customerid)
        {
            List<ContactAndLoan> contactLoans = new List<ContactAndLoan>();
                Expression<Func<Loan, bool>> lonExpr = ln => ln.ContactId == contactId && ln.CustomerId == customerid;
                IList<Loan> loans = loanRepository.GetAll(lonExpr).ToList();

                if (loans != null && loans.Count > 0)
                {
                    ContactAndLoan contactloan = new ContactAndLoan
                    {
                        ContactId = contactId
                    };

                    List<LoanList> loanList = new List<LoanList>();

                    foreach (Loan loan in loans)
                    {
                        //get total amount need to close the loan
                        LoanInfo lnInfo = GetLoanInfo(loan.Id, customerid);
                        loanList.Add(new LoanList
                        {
                            loanAmount = lnInfo.TotalAmountRequiredToClose,
                            LoanId = loan.Id,
                            LoanName = string.Format("{0} {1}", loan.Id, loan.Description)
                        });
                    }

                    contactloan.LoanList = loanList;
                    contactLoans.Add(contactloan);
                }
            
            return contactLoans;
        }

        public LoanInfo GetLoanInfo(int loanId, int customerid)
        {
            LoanInfo loaninfo = new LoanInfo();
            Loan loan = loanRepository.Single(loanId);

            if(loan !=null)
            {
                Expression<Func<LoanCollection, bool>> expr = collect => collect.CustomerId == customerid && collect.LoanId == loanId;
                Expression<Func<LoanCollection, Nullable<double>>> selAmnt = loanCal => loanCal.Amount;
                Expression<Func<LoanCollection, Nullable<double>>> selInterest = loanCal => loanCal.Interest;
                Expression<Func<LoanCollection, Nullable<double>>> selLateFee = loanCal => loanCal.LateFee;

                loaninfo.LoanId = loanId;
                loaninfo.TotalPrincipalPaid = Convert.ToDouble(loan.LoanCollections != null && loan.LoanCollections.Count > 0 ? loan.LoanCollections.Sum(a => a.Amount) : loancollectionRepository.GetSum(expr, selAmnt));
                loaninfo.TotalInterestPaid = Convert.ToDouble(loan.LoanCollections != null && loan.LoanCollections.Count > 0 ? loan.LoanCollections.Sum(a => a.Interest) : loancollectionRepository.GetSum(expr, selInterest));
                loaninfo.TotalLateFeepaid = Convert.ToDouble(loan.LoanCollections != null && loan.LoanCollections.Count > 0 ? loan.LoanCollections.Sum(a => a.LateFee) : loancollectionRepository.GetSum(expr, selLateFee));

                //Get current installment details
                if (loan.StartDate != null && DateTime.Now > loan.StartDate)
                {
                    if(loan.InstalmentPeriod !=null  && loan.InstalmentPeriod > 0)
                    {
                        double interestYear = ((double)loan.Amount * (double)loan.InterestRate) / 100;
                        double interestMonth = interestYear / 12;
                        double latefee = loan.LateFee != null ? (double)loan.LateFee : 0;
                        switch (loan.LoanType)
                        {
                            case "M":
                                
                                double totInterest = interestMonth * (int)loan.InstalmentPeriod;
                                double totAmtToPay = (double)loan.Amount + totInterest;
                                double curEmi = totAmtToPay / (int)loan.InstalmentPeriod;
                                curEmi = curEmi - Math.Round(curEmi) > 0 ? curEmi + 1 : curEmi;
                                int monthDiff = (DateTime.Now.Year * 12 + DateTime.Now.Month) - (loan.StartDate.Value.Year * 12 + loan.StartDate.Value.Month);
                                double curNeedToPay = monthDiff > (int)loan.InstalmentPeriod ? curEmi * (int)loan.InstalmentPeriod : curEmi * monthDiff;
                                bool isOverDate = monthDiff > (int)loan.InstalmentPeriod;
                                
                                //double curNeedToPay = curEmi * (DateTime.Now.Month - loan.StartDate.Value.Month);
                                double pendinglateFee = 0;

                                loaninfo.Total = totAmtToPay;
                                //check previous balance
                                if (curNeedToPay  >  (loaninfo.TotalPrincipalPaid + loaninfo.TotalInterestPaid + curEmi))
                                {
                                    pendinglateFee = monthDiff * latefee;
                                    curEmi = curNeedToPay + pendinglateFee - (loaninfo.TotalPrincipalPaid + loaninfo.TotalInterestPaid + curEmi);
                                }

                                //late fee aplicable
                                if(loan.InstalmentDueDay !=null && loan.InstalmentDueDay > 0 && loan.InstalmentDueDay < DateTime.Now.Day)
                                {
                                    pendinglateFee += latefee;
                                }

                                loaninfo.CurrentPrincipal = curEmi - interestMonth - loaninfo.TotalPrincipalPaid;
                                loaninfo.CurrentInterest = interestMonth - loaninfo.TotalInterestPaid;
                                loaninfo.CurrentLateFee = pendinglateFee;
                                loaninfo.TotalAmountRequiredToClose = (loaninfo.Total + pendinglateFee) - (loaninfo.TotalPrincipalPaid + loaninfo.TotalInterestPaid);

                                if (isOverDate)
                                {
                                    loaninfo.CurrentPrincipal = loaninfo.TotalAmountRequiredToClose;
                                    loaninfo.CurrentInterest = 0;
                                }

                                break;
                            case "Y":
                                double totYEmi = interestYear * (int)loan.InstalmentPeriod;
                                double totYAmtToPay = (double)loan.Amount + totYEmi;
                                double curYEmi = totYAmtToPay / (int)loan.InstalmentPeriod;
                                curYEmi = curYEmi - Math.Round(curYEmi) > 0 ? curYEmi + 1 : curYEmi;
                                double curYNeedToPay = curYEmi * (DateTime.Now.Year - loan.StartDate.Value.Year);
                                double pendingYlateFee = 0;

                                loaninfo.Total = totYAmtToPay;
                                if (curYNeedToPay > (loaninfo.TotalPrincipalPaid + loaninfo.TotalInterestPaid + curYEmi))
                                {
                                    pendingYlateFee = (DateTime.Now.Year - loan.StartDate.Value.Year) * latefee;
                                    curYEmi = curYNeedToPay - (loaninfo.TotalPrincipalPaid + loaninfo.TotalInterestPaid + curYEmi);
                                }

                                //late fee aplicable
                                if(loan.InstalmentDueDay !=null && loan.InstalmentDueDay > 0 && loan.InstalmentDueDay < DateTime.Now.Month)
                                {
                                    pendingYlateFee += latefee;
                                }

                                loaninfo.CurrentPrincipal = curYEmi - interestYear - loaninfo.TotalPrincipalPaid;
                                loaninfo.CurrentInterest = interestYear - loaninfo.TotalInterestPaid;
                                loaninfo.CurrentLateFee = pendingYlateFee;
                                loaninfo.TotalAmountRequiredToClose = loaninfo.Total - (loaninfo.TotalPrincipalPaid + loaninfo.TotalInterestPaid);
                                break;
                            
                        }

                    }
                    else //No end date loan
                    {
                        double interestYear = ((double)loan.Amount * (double)loan.InterestRate) / 100;
                        double interestPerDay = interestYear / 365;
                        int dayDiif = (DateTime.Now - loan.StartDate.Value).Days;
                        double interest = dayDiif * interestPerDay;
                        loaninfo.Total = interest + (double)loan.Amount;
                        loaninfo.TotalAmountRequiredToClose = loaninfo.Total - (loaninfo.TotalPrincipalPaid + loaninfo.TotalInterestPaid);
                        loaninfo.CurrentPrincipal = (double)loan.Amount - loaninfo.TotalPrincipalPaid;
                        loaninfo.CurrentInterest = interest - loaninfo.TotalInterestPaid;
                        
                    }
                }
            }
            return loaninfo;
        }

        public List<LoanInfo> GetLoanPendingList(int loanId, int customerid)
        {
            List<LoanInfo> loanList = new List<LoanInfo>();
             
            Loan loan = loanRepository.Single(loanId);
            loanList = GetPendings(loan);
            return loanList;
        }

        public List<LoanInfo> GetLoanPendingListForContact(int contactId, int customerid)
        {
            List<LoanInfo> loanList = new List<LoanInfo>();
            Expression<Func<Loan, bool>> expr = ln => ln.CustomerId == customerid && ln.ContactId==contactId && ln.LoanStatus != "C";
            IList<Loan> loans = loanRepository.GetAll(expr).ToList();

            if(loans !=null && loans.Count > 0)
            {
                foreach(Loan loan in loans)
                {
                    loanList.AddRange(GetPendings(loan));
                }
            }

            return loanList;
        }

        
        public List<LoanCollection> GetLoanReceivedList(int loanid, int customerid)
        {
            List<LoanCollection> loanCollection = new List<LoanCollection>();
            Expression<Func<LoanCollection, bool>> expr = collect => collect.CustomerId == customerid && collect.LoanId == loanid;
            loanCollection = loancollectionRepository.GetAll(expr).ToList();
            
            return loanCollection;
        }

        public List<LoanCollection> GetLoanReceivedListForContact(int contactId, int customerid)
        {
            List<LoanCollection> loanCollection = new List<LoanCollection>();
            Expression<Func<Loan, bool>> expr = ln => ln.CustomerId == customerid && ln.ContactId == contactId;
            IList<Loan> loans = loanRepository.GetAll(expr).ToList();

            if (loans != null && loans.Count > 0)
            {
                foreach (Loan loan in loans)
                {
                    loanCollection.AddRange(GetLoanReceivedList(loan.Id, customerid));
                }
            }

            return loanCollection;
        }

        private List<LoanInfo> GetPendings(Loan loan)
        {
            List<LoanInfo> loanList = new List<LoanInfo>();


            if (loan != null)
            {
                Expression<Func<LoanCollection, bool>> expr = collect => collect.CustomerId == loan.CustomerId && collect.LoanId == loan.Id;
                Expression<Func<LoanCollection, Nullable<double>>> selAmnt = loanCal => loanCal.Amount;
                Expression<Func<LoanCollection, Nullable<double>>> selInterest = loanCal => loanCal.Interest;
                Expression<Func<LoanCollection, Nullable<double>>> selLateFee = loanCal => loanCal.LateFee;


                double totalPrincipalPaid = Convert.ToDouble(loan.LoanCollections != null && loan.LoanCollections.Count > 0 ? loan.LoanCollections.Sum(a => a.Amount) : loancollectionRepository.GetSum(expr, selAmnt));
                double totalInterestPaid = Convert.ToDouble(loan.LoanCollections != null && loan.LoanCollections.Count > 0 ? loan.LoanCollections.Sum(a => a.Interest) : loancollectionRepository.GetSum(expr, selInterest));
                double totalLateFeepaid = Convert.ToDouble(loan.LoanCollections != null && loan.LoanCollections.Count > 0 ? loan.LoanCollections.Sum(a => a.LateFee) : loancollectionRepository.GetSum(expr, selLateFee));

                //Get current installment details
                if (loan.StartDate != null && DateTime.Now > loan.StartDate)
                {
                    if (loan.InstalmentPeriod != null && loan.InstalmentPeriod > 0)
                    {
                        double interestYear = ((double)loan.Amount * (double)loan.InterestRate) / 100;
                        double interestMonth = interestYear / 12;
                        double lateFee = loan.LateFee != null ? (double)loan.LateFee : 0;
                        switch (loan.LoanType)
                        {
                            case "M":

                                double totInterest = interestMonth * (int)loan.InstalmentPeriod;
                                double totAmtToPay = (double)loan.Amount + totInterest;
                                double curEmi = totAmtToPay / (int)loan.InstalmentPeriod;
                                curEmi = curEmi - Math.Round(curEmi) > 0 ? curEmi + 1 : curEmi;
                                int monthDiff = (DateTime.Now.Year * 12 + DateTime.Now.Month) - (loan.StartDate.Value.Year * 12 + loan.StartDate.Value.Month);
                                double curNeedToPay = monthDiff > (int)loan.InstalmentPeriod ? curEmi * (int)loan.InstalmentPeriod + (monthDiff * lateFee) : curEmi * monthDiff;
                                int overDueMonths = monthDiff > (int)loan.InstalmentPeriod ? monthDiff - (int)loan.InstalmentPeriod : 0;
                                //check previous balance
                                int period =loan.InstalmentPeriod !=null ?  (int)loan.InstalmentPeriod : 0;
                                if (curNeedToPay > (totalPrincipalPaid + totalInterestPaid + curEmi))
                                {
                                    for (int i = 0; i < (int)loan.InstalmentPeriod; i++)
                                    {
                                        loanList.Add(new LoanInfo
                                        {
                                            CurrentLateFee = lateFee,
                                            LoanId = loan.Id,
                                            CurrentInterest = interestMonth,
                                            CurrentPrincipal = curEmi - interestMonth,
                                            MonthOrYear = string.Format("{0} {1}", DateTime.Now.AddMonths(-(monthDiff - i)).ToString("MMMM", CultureInfo.InvariantCulture), DateTime.Now.AddMonths(-(monthDiff - i)).Year),
                                            Desciption = loan.Description,
                                            Name = loan.ContactName
                                        });
                                    }

                                    if (lateFee > 0)
                                    {
                                        for (int i = 0; i < overDueMonths; i++)
                                        {
                                            loanList.Add(new LoanInfo
                                            {
                                                CurrentLateFee = lateFee,
                                                LoanId = loan.Id,
                                                MonthOrYear = string.Format("{0} {1}", DateTime.Now.AddMonths(-(monthDiff - period - i)).ToString("MMMM", CultureInfo.InvariantCulture), DateTime.Now.AddMonths(-(monthDiff - period - i)).Year),
                                                Desciption = loan.Description,
                                                Name = loan.ContactName
                                            });
                                        }
                                    }
                                }

                                break;
                            case "Y":
                                double totYEmi = interestYear * (int)loan.InstalmentPeriod;
                                double totYAmtToPay = (double)loan.Amount + totYEmi;
                                double curYEmi = totYAmtToPay / (int)loan.InstalmentPeriod;
                                curYEmi = curYEmi - Math.Round(curYEmi) > 0 ? curYEmi + 1 : curYEmi;
                                int yearDiff = (DateTime.Now.Year - loan.StartDate.Value.Year);
                                double curYNeedToPay = curYEmi * yearDiff;
                                int overDueyears = yearDiff > (int)loan.InstalmentPeriod ? yearDiff - (int)loan.InstalmentPeriod : 0;
                                if (curYNeedToPay > (totalPrincipalPaid + totalInterestPaid + curYEmi))
                                {
                                    for (int i = 0; i < (int)loan.InstalmentPeriod; i++)
                                    {
                                        loanList.Add(new LoanInfo
                                        {
                                            CurrentLateFee = loan.LateFee !=null ? (double)loan.LateFee : 0,
                                            LoanId = loan.Id,
                                            CurrentInterest = interestYear,
                                            CurrentPrincipal = curYEmi - interestYear,
                                            MonthOrYear = string.Format("{0}", DateTime.Now.AddYears(-i).Year),
                                            Desciption = loan.Description,
                                            Name = loan.ContactName
                                        });
                                    }

                                    if (loan.LateFee != null)
                                    {
                                        for (int i = 0; i < overDueyears; i++)
                                        {
                                            loanList.Add(new LoanInfo
                                            {
                                                CurrentLateFee = (double)loan.LateFee,
                                                LoanId = loan.Id,
                                                MonthOrYear = string.Format("{0}", DateTime.Now.AddYears(-i).Year),
                                                Desciption = loan.Description,
                                                Name = loan.ContactName
                                            });
                                        }
                                    }
                                }

                                break;
                        }
                    }
                    else
                    {
                        double interestYear = ((double)loan.Amount * (double)loan.InterestRate) / 100;
                        double interestPerDay = interestYear / 365;
                        int dayDiif = (DateTime.Now - loan.StartDate.Value).Days;
                        double interest = dayDiif * interestPerDay;
                        loanList.Add(new LoanInfo
                        {
                            CurrentLateFee = 0,
                            LoanId = loan.Id,
                            CurrentInterest = interest,
                            CurrentPrincipal = (double)loan.Amount,
                            Desciption = loan.Description,
                            Name = loan.ContactName
                        });

                    }
                }

            }

            return loanList;
        }
    }
}
