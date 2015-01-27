using BusinessLayer;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Implementations;
using RepositroryAndUnitOfWork.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace Xaviers.Controllers
{
    public class HomeController : Controller
    {
        IRepository<User> userRepository = null;
        IRepository<Customer> customerRepository = null;
        IUnitOfWork unitOfWork = null;

        // GET api/User
        public HomeController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            userRepository = unitOfWork.GetRepository<User>();
            customerRepository = unitOfWork.GetRepository<Customer>();
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Contacts()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        [HttpGet]
        public ActionResult Login()
        {
            //List<MessageModel> msg = new List<MessageModel>();
            //msg.Add(new MessageModel
            //{
            //    FromEmail = "adasd@test.com",
            //    ToEmail = "virgilraj@gmail.com",
            //    Subject = "Testing",
            //    MessageBody = "Welcome!!!!!!!!!!!!!!!"
            //});

            //MailSender.SendMail(msg);
            return View();
        }

        // GET: /Customer/
        public ActionResult Register()
        {
            return View();
        }

        public ActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult ForgotPassword(ForgotPassword model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                    Expression<Func<User, bool>> usrExpr = sel => sel.Email == model.Email;
                    List<User> users = userRepository.GetAll(usrExpr).ToList();
                    if (users != null && users.Count > 0)
                    {
                        List<MessageModel> msg = new List<MessageModel>();
                        StringBuilder str = new StringBuilder();
                        str.AppendFormat("Dear <b>{0}</b>,<br><br>", users[0].ContactName);
                        str.AppendFormat("Kindly note your password <br><br>");
                        str.AppendFormat("Your password is : <b>{0}</b> <br><br><br>", BusinessLayer.BusinessUtility.Decrypt(users[0].Password));
                        str.AppendFormat("Regards, <br><br><b>Team alanchypugal.com</b> <br>");
                        msg.Add(new MessageModel
                        {
                            FromEmail = "info@alanchypugal.com",
                            ToEmail = model.Email,
                            Subject = "Request to password",
                            MessageBody = str.ToString()
                        });

                        int result = MailSender.SendMail(msg);
                        if (result == 1)
                        {
                            ViewBag.result = "Password has been sent to your mail!";
                        }
                        else
                        {
                            ViewBag.result = "Error!";
                        }
                    }
                else
                    {
                        ViewBag.result = "Please enter valid email!";
                    }
                
            }
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult Login(User model, string returnUrl)
        {
            LoginUser loginuser = new LoginUser();

            if (ModelState.IsValid)
            {
                string pwd = BusinessUtility.Encrypt(model.Password);
                string role = string.Empty;
                Expression<Func<User, bool>> expr = usr => usr.Email == model.Email && usr.Password == pwd;

                IEnumerable<User> user = userRepository.GetAll(expr);
                if (user != null && user.Count() > 0)
                {
                    Customer customer = new Customer();
                    foreach (User usr in user)
                    {
                        loginuser.ContactId = usr.ContactId;
                        loginuser.CustomerId = usr.CustomerId;
                        loginuser.Email = usr.Email;
                        loginuser.Id = usr.Id;
                        loginuser.IsDelete = usr.IsDelete;
                        loginuser.Role = usr.Role;
                        role = usr.Role;
                        
                        customer = customerRepository.Single(usr.CustomerId);
                        if (customer != null)
                        {
                            loginuser.StartFinanceYear = (int)customer.StartFinaceYer;
                            loginuser.Name = string.Format("{0} {1}", customer.FirstName, customer.LastName);
                            loginuser.Phone = customer.PhoneNumber;
                            loginuser.HasLogo = customer.HasLogo;
                            loginuser.DisplayGroupName = customer.DisplayName;
                            loginuser.CommonGroupName = customer.Purpose;

                            if(customer.CurrentFinanceyear !=null && customer.CurrentFinanceyear > 0)
                            {
                                loginuser.CurrentSartFinanceYearDatae = string.Format("{0}-{1}-{2}", "01", "04", customer.CurrentFinanceyear);
                                loginuser.CurrentEndFinanceYearDatae = string.Format("{0}-{1}-{2}", "31", "03", customer.CurrentFinanceyear + 1);
                                loginuser.CurrentFinanceYear = (int) customer.CurrentFinanceyear;
                            //}else if(customer.StartFinaceYer !=null && customer.StartFinaceYer > 0)
                            //{
                            //    loginuser.CurrentSartFinanceYearDatae = string.Format("{0}-{1}-{2}", "01", "04", customer.StartFinaceYer);
                            //    loginuser.CurrentEndFinanceYearDatae = string.Format("{0}-{1}-{2}",  "31", "03", customer.StartFinaceYer + 1);
                            //    loginuser.CurrentFinanceYear = (int)customer.StartFinaceYer;
                            }
                            else if(DateTime.Now.Month > 3)
                            {
                                loginuser.CurrentSartFinanceYearDatae = string.Format("{0}-{1}-{2}", "01", "04", DateTime.Now.Year - 1);
                                loginuser.CurrentEndFinanceYearDatae = string.Format("{0}-{1}-{2}", "31", "03", DateTime.Now.Year);
                                loginuser.CurrentFinanceYear = (int)DateTime.Now.Year - 1;
                            }
                            else
                            {
                                loginuser.CurrentSartFinanceYearDatae = string.Format("{0}-{1}-{2}", "01", "04", DateTime.Now.Year);
                                loginuser.CurrentEndFinanceYearDatae = string.Format("{0}-{1}-{2}", "01", "31", DateTime.Now.Year + 1);
                                loginuser.CurrentFinanceYear = (int)DateTime.Now.Year;
                            }

                            int startFinYear = (int)customer.StartFinaceYer;
                            if ((loginuser.CurrentFinanceYear - 1) ==  startFinYear)
                            {
                                loginuser.OpeningBalance = (double)customer.OpeningBalance;
                            }
                            else
                            {
                                //Get opening balance in the login
                                IUnitOfWork unitOfWork = new UnitOfWork<XaviersEntities>(); ;
                                IRepository<AccountBalance> balanceRepository = unitOfWork.GetRepository<AccountBalance>();
                                Expression<Func<AccountBalance, bool>> balexpr = balance => balance.CustomerId == customer.Id && balance.FinanceYear == loginuser.CurrentFinanceYear - 1;
                                IList<AccountBalance> auditreports = balanceRepository.GetAll(balexpr).ToList();
                                if (auditreports != null && auditreports.Count() > 0)
                                {
                                    loginuser.OpeningBalance = (double)auditreports[0].ClosingBlance;
                                }
                            }

                        }
                        break;
                    }

                    if (customer != null)
                    {

                    }

                    System.Web.HttpContext.Current.Session["LoginSesion"] = loginuser;
                    if (role == "U")
                    {
                        return RedirectToAction("Member", "Contact", new { id = loginuser.ContactId });
                    }
                    return RedirectToAction("Index", "Contact");
                }
                else
                {
                    ModelState.AddModelError("", "Invalid username or password.");
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
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