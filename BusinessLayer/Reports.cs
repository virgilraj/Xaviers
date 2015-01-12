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
    public class Reports
    {
        IRepository<Income> incomeRepository = null;
        IRepository<Expense> expenseRepository = null;
        IRepository<TaxCollection> taxcollectionRepository = null;
        IRepository<RecurringTaxCollection> recurringtaxcollectionRepository = null;
        IRepository<Loan> loanRepository = null;
        IRepository<LoanCollection> loanCollectionRepository = null;
        IRepository<SmallSavingsCollection> smallSavingRepository = null;
        IRepository<SmallSavingsSettlement> smallSavingSettlementRepository = null;
        Authentication auth = new Authentication();

        public Reports(IRepository<Income> IncomeRepository, IRepository<Expense> ExpenseRepository, IRepository<TaxCollection> TaxcollectionRepository, IRepository<RecurringTaxCollection> RecurringtaxcollectionRepository
            , IRepository<Loan> LoanRepository, IRepository<LoanCollection> LoanCollectionRepository, IRepository<SmallSavingsCollection> SmallSavingRepository, IRepository<SmallSavingsSettlement> SmallSavingSettlementRepository)
        {
            incomeRepository = IncomeRepository;
            expenseRepository = ExpenseRepository;
            taxcollectionRepository = TaxcollectionRepository;
            recurringtaxcollectionRepository = RecurringtaxcollectionRepository;
            loanRepository = LoanRepository;
            loanCollectionRepository = LoanCollectionRepository;
            smallSavingRepository = SmallSavingRepository;
            smallSavingSettlementRepository = SmallSavingSettlementRepository;
        }

        public ChartList GetIncomeExpenseChartData(int year)
        {
            ChartList chartList = new ChartList();
            List<ChartData> chatData = new List<ChartData>();
            List<ChartData> income = new List<ChartData>();
            List<ChartData> expense = new List<ChartData>();
            IEnumerable<AuditRepot> auditReport = GetAuditReport(year, true);
            List<AuditRepot> auditPreviousYear = GetAuditReport(year - 1, true).ToList();

            if (auditReport != null && auditReport.Count() > 0)
            {
                foreach(AuditRepot audit in auditReport)
                {
                    AuditRepot prevRep = null;
                    if (auditPreviousYear != null && auditPreviousYear.Count > 0)
                    {
                        prevRep = auditPreviousYear.Find(a => a.GroupName == audit.GroupName);
                    }


                    chatData.Add(new ChartData
                    {
                        Name = audit.GroupName,
                        Value1 = audit.IncomeExpense.Sum(a=> a.Expense),
                        Value2 = audit.IncomeExpense.Sum(a=>a.Income),
                        PrevValue1 = prevRep !=null ? prevRep.IncomeExpense.Sum(a=>a.Expense) : 0,
                        PrevValue2 = prevRep !=null ? prevRep.IncomeExpense.Sum(a=>a.Income) : 0
                    });

                    if (audit.IncomeExpense != null && audit.IncomeExpense.Count > 0)
                    {
                        foreach (Report rep in audit.IncomeExpense)
                        {
                            income.Add(new ChartData {
                                Name = rep.Description,
                                Value1 = rep.Income
                            });

                            expense.Add(new ChartData
                            {
                                Name = rep.Description,
                                Value1 = rep.Expense
                            });
                        }
                    }
                }
            }
            chartList.IncomeExpense = chatData;
            chartList.Income = income;
            chartList.Expense = expense;

            return chartList;
        }

        public IList<ChartData> GetIncomeChartData(int year)
        {
            List<ChartData> chatData = new List<ChartData>();
            IEnumerable<AuditRepot> auditReport = GetAuditReport(year, true);
            
            if (auditReport != null && auditReport.Count() > 0)
            {
                foreach (AuditRepot audit in auditReport)
                {
                    if (audit != null && audit.IncomeExpense != null && audit.IncomeExpense.Count > 0)
                    {
                        foreach (Report rep in audit.IncomeExpense)
                        {
                            chatData.Add(new ChartData
                            {
                                Name = rep.Description,
                                Value1 = rep.Income,
                                Value2 = rep.Expense
                            });
                        }
                        
                    }
                }
            }

            return chatData;
        }

        public IEnumerable<AuditRepot> GetAuditReport(int year, bool isRecurr)
        {
            List<AuditRepot> auditReport = new List<AuditRepot>();
            double incomeTotal = 0;
            double expenseTotal = 0;
            DateTime FDate = new DateTime(year, 4, 1);
            DateTime TDate = new DateTime(year + 1, 3, 31);

            Func<Income, Income> incomeSelector = sel => new Income { Amount = sel.Amount, Description = sel.Description, ReceivedDate = sel.ReceivedDate, CustomerId = sel.CustomerId, GroupName = sel.GroupName };
            Func<Income, bool> incomeExpr = exp => exp.ReceivedDate >= FDate && exp.ReceivedDate <= TDate && auth.LoggedinUser.CustomerId == exp.CustomerId;

            var incomes = incomeRepository.GetAll(incomeExpr, incomeSelector);

            Func<Expense, Expense> expenseSelector = sel => new Expense { Amount = sel.Amount, Reason = sel.Reason, GivenDate = sel.GivenDate, CustomerId = sel.CustomerId, GroupName = sel.GroupName };
            Func<Expense, bool> expenseExpr = exp => exp.GivenDate >= FDate && exp.GivenDate <= TDate && auth.LoggedinUser.CustomerId == exp.CustomerId;

            var expenses = expenseRepository.GetAll(expenseExpr, expenseSelector);

            Func<TaxCollection, TaxCollection> taxSelector = sel => new TaxCollection { Amount = sel.Amount, TaxId = sel.TaxId, ReceivedDate = sel.ReceivedDate, CustomerId = sel.CustomerId, TaxName = sel.TaxName };
            Func<TaxCollection, bool> taxCollectExpr = exp => exp.ReceivedDate >= FDate && exp.ReceivedDate <= TDate && auth.LoggedinUser.CustomerId == exp.CustomerId;

            var taxColl = taxcollectionRepository.GetAll(taxCollectExpr, taxSelector);

            Func<RecurringTaxCollection, RecurringTaxCollection> rectaxSelector = sel => new RecurringTaxCollection { Amount = sel.Amount, RecurringTaxId = sel.RecurringTaxId, ReceivedDate = sel.ReceivedDate, CustomerId = sel.CustomerId, TaxName = sel.TaxName };
            Func<RecurringTaxCollection, bool> rectaxCollectExpr = exp => exp.ReceivedDate >= FDate && exp.ReceivedDate <= TDate && auth.LoggedinUser.CustomerId == exp.CustomerId;

            var rectaxColl = recurringtaxcollectionRepository.GetAll(rectaxCollectExpr, rectaxSelector);

            Expression<Func<Loan, Nullable<double>>> loanSelector = loan => loan.Amount;
            Expression<Func<Loan, bool>> loanExpr = exp => exp.StartDate >= FDate && exp.StartDate <= TDate && auth.LoggedinUser.CustomerId == exp.CustomerId;

            double? loanAmount = loanRepository.GetSum(loanExpr, loanSelector);

            Expression<Func<LoanCollection, Nullable<double>>> loanColSelector = loan => loan.Amount;
            Expression<Func<LoanCollection, bool>> loanColExpr = exp => exp.Date >= FDate && exp.Date <= TDate && auth.LoggedinUser.CustomerId == exp.CustomerId;

            double? loancollectionAmount = loanCollectionRepository.GetSum(loanColExpr, loanColSelector);

            Expression<Func<SmallSavingsCollection, Nullable<double>>> ssSelector = ss => ss.Amount;
            Expression<Func<SmallSavingsCollection, bool>> ssExpr = exp => exp.Date >= FDate && exp.Date <= TDate && auth.LoggedinUser.CustomerId == exp.CustomerId;

            double? smallSavingAmounts = smallSavingRepository.GetSum(ssExpr, ssSelector);

            Expression<Func<SmallSavingsSettlement, Nullable<double>>> ssStSelector = ss => ss.Amount;
            Expression<Func<SmallSavingsSettlement, bool>> ssStExpr = exp => exp.Date >= FDate && exp.Date <= TDate && auth.LoggedinUser.CustomerId == exp.CustomerId;

            double? smallSavingsStAmount = smallSavingSettlementRepository.GetSum(ssStExpr, ssStSelector);


            var incomeGrp = incomes.GroupBy(a => a.GroupName).ToList();
            var expenseGrp = expenses.GroupBy(a => a.GroupName).ToList();
            var taxGrp = taxColl.GroupBy(a => a.TaxName)
                 .Select(tot =>
                                new
                                {
                                    TaxName = tot.Key,
                                    Amount = tot.Sum(w => w.Amount)
                                }).ToList();

            var rectaxGrp = rectaxColl.GroupBy(a => a.TaxName)
                 .Select(tot =>
                                new
                                {
                                    TaxName = tot.Key,
                                    Amount = tot.Sum(w => w.Amount)
                                }).ToList();

            
            //Income report
            List<AuditRepot> incomeAuditReport = new List<AuditRepot>();
            if (incomeGrp != null && incomeGrp.Count > 0)
            {
                foreach (var incme in incomeGrp)
                {
                    AuditRepot incmeAuditRpt = new AuditRepot();
                    incmeAuditRpt.GroupName = incme.Key;

                    var descGrp = incme.GroupBy(gr => gr.Description).ToList();
                    if (descGrp != null && descGrp.Count > 0)
                    {
                        List<Report> incmeReport = new List<Report>();
                        foreach (var desc in descGrp)
                        {
                            incmeReport.Add(new Report
                            {
                                Description = desc.Key,
                                Income = (double)desc.Sum(d => d.Amount)
                            });
                            incmeAuditRpt.IncomeExpense = incmeReport;
                        }
                    }

                    incomeAuditReport.Add(incmeAuditRpt);
                }
            }

            //Expense report

            List<AuditRepot> expenseAuditReport = new List<AuditRepot>();
            if (expenseGrp != null && expenseGrp.Count > 0)
            {
                foreach (var expnce in expenseGrp)
                {
                    AuditRepot incmeAuditRpt = new AuditRepot();
                    incmeAuditRpt.GroupName = expnce.Key;

                    var descGrp = expnce.GroupBy(gr => gr.Reason).ToList();
                    if (descGrp != null && descGrp.Count > 0)
                    {
                        List<Report> incmeReport = new List<Report>();
                        foreach (var desc in descGrp)
                        {
                            incmeReport.Add(new Report
                            {
                                Description = desc.Key,
                                Expense = (double)desc.Sum(d => d.Amount)
                            });
                            incmeAuditRpt.IncomeExpense = incmeReport;
                        }
                    }

                    expenseAuditReport.Add(incmeAuditRpt);
                }
            }



            //Merge
            if (incomeAuditReport != null && incomeAuditReport.Count > 0)
            {
                foreach (AuditRepot audit in incomeAuditReport)
                {
                    if (expenseAuditReport != null && expenseAuditReport.Count > 0)
                    {
                        AuditRepot expAudit = expenseAuditReport.Find(exp => exp.GroupName == audit.GroupName);
                        if (expAudit != null)
                        {
                            if (audit.IncomeExpense != null && audit.IncomeExpense.Count > 0)
                            {
                                //incomeTotal += audit.IncomeExpense.Sum(a=> a.Income);
                                foreach (Report rpt in audit.IncomeExpense)
                                {
                                    Report expRpt = expAudit.IncomeExpense.Find(a => a.Description == rpt.Description);
                                    if (expRpt != null)
                                    {
                                        rpt.Expense = expRpt.Expense;

                                        //Remove expense
                                        expAudit.IncomeExpense.Remove(expRpt);
                                    }
                                }

                                audit.IncomeExpense.AddRange(expAudit.IncomeExpense);
                            }

                            //Remove from expense
                            expenseAuditReport.Remove(expAudit);
                        }
                    }
                }

                incomeAuditReport.AddRange(expenseAuditReport);
            }
            else
            {
                auditReport = expenseAuditReport;
            }

            auditReport = incomeAuditReport;
            List<Report> taxCollectionList = new List<Report>();
            //Add tax collection
            if (taxGrp != null && taxGrp.Count > 0)
            {
                foreach (var txCol in taxGrp)
                {
                    taxCollectionList.Add(new Report {
                        Income = (double) txCol.Amount,
                        Description = txCol.TaxName
                    });
                }
            }

            //Add rectax collection
            if (rectaxGrp != null && rectaxGrp.Count > 0)
            {
                foreach (var txCol in rectaxGrp)
                {
                    taxCollectionList.Add(new Report
                    {
                        Income = (double)txCol.Amount,
                        Description = txCol.TaxName
                    });
                }
            }


            //check audit report has tax expense
            AuditRepot taxAudit = auditReport.Find(a => a.GroupName.ToLower() == "tax");
            if(taxAudit !=null)
            {
                taxAudit.IncomeExpense.AddRange(taxCollectionList);
            }
            else
            {
                auditReport.Add(new AuditRepot {
                    GroupName = "Tax",
                    IncomeExpense = taxCollectionList
                });
            }


            //Add small savings
            List<Report> savingRpt = new List<Report>();
            savingRpt.Add(new Report
            {
                Description = "Samall Savings",
                Expense = smallSavingsStAmount !=null ? (double)smallSavingsStAmount : 0,
                Income = smallSavingAmounts != null ? (double)smallSavingAmounts : 0
            });
            //Add Loan
            List<Report> LoanRpt = new List<Report>();
            LoanRpt.Add(new Report
            {
                Description = "Loans",
                Expense = loanAmount != null ? (double)loanAmount : 0,
                Income = loancollectionAmount != null ? (double)loancollectionAmount : 0
            });
            
            //Check audit report has samall savings
            AuditRepot savingAudit = auditReport.Find(a => a.GroupName.ToLower().StartsWith("samll saving"));
            if (savingAudit != null)
            {
                savingAudit.IncomeExpense.AddRange(savingRpt);
            }
            else
            {
                auditReport.Add(new AuditRepot
                {
                    GroupName = "Small Savings",
                    IncomeExpense = savingRpt
                });
            }

            //Check audit report has Loan
            AuditRepot loanAudit = auditReport.Find(a => a.GroupName.ToLower().StartsWith("loan"));
            if (loanAudit != null)
            {
                loanAudit.IncomeExpense.AddRange(LoanRpt);
            }
            else
            {
                auditReport.Add(new AuditRepot
                {
                    GroupName = "Loan",
                    IncomeExpense = LoanRpt
                });
            }

            //Add opening balance
            if (isRecurr)
            {
                List<Report> openingBal = new List<Report>();
                openingBal.Add(new Report
                {
                    Description = "Opening Balance",
                    Income = GetOpenningBalance(year),
                    Expense = 0
                });

                auditReport.Add(new AuditRepot
                {
                    GroupName = "Opening Balance",
                    IncomeExpense = openingBal
                });
            }
            //Get  income and Expense total
            if (auditReport != null && auditReport.Count > 0)
            {
                foreach (AuditRepot adiRpt in auditReport)
                {
                    if (adiRpt != null && adiRpt.IncomeExpense != null && adiRpt.IncomeExpense.Count > 0)
                    {
                        expenseTotal += adiRpt.IncomeExpense.Sum(a => a.Expense);
                        incomeTotal += adiRpt.IncomeExpense.Sum(a => a.Income);
                    }
                }
            }

            if (auditReport.Count > 0)
            {
                auditReport[0].ExpenseTotal = expenseTotal;
                auditReport[0].IncomeTotal = incomeTotal;
            }

            return auditReport;
        }

        public double GetOpenningBalance(int year)
        {
            double openingBalcance = 0;

            if((year - 1) == auth.LoggedinUser.StartFinanceYear)
            {
                return auth.LoggedinUser.OpeningBalance;
            }
            else
            {
                List<AuditRepot> auditReport = GetAuditReport(year - 1, false).ToList();
                if(auditReport !=null && auditReport.Count >0)
                {
                    return auditReport[0].IncomeTotal - auditReport[0].ExpenseTotal;
                }
            }
            return openingBalcance;
        }
    }
}
