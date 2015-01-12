using DatabaseDataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.SessionState;
using System.Web.Mvc;

namespace BusinessLayer
{
    public class Authentication : Controller
    {
        List<RoleAndController> roleControllers = new List<RoleAndController>();
        public Authentication()
        {
            List<string> adminControllers = new List<string>();
            adminControllers.Add("contact");
            adminControllers.Add("tax");
            adminControllers.Add("income");
            adminControllers.Add("expense");
            adminControllers.Add("report");
            adminControllers.Add("tax-taxcollection");
            adminControllers.Add("customer-users");

            adminControllers.Add("customer-unauthorized");
            adminControllers.Add("customer-changepassword");
            adminControllers.Add("customer-changepasswordsuccess");
            adminControllers.Add("smallsavings");
            adminControllers.Add("loan");

            List<string> userControllers = new List<string>();
            userControllers.Add("contact");
            userControllers.Add("customer-unauthorized");
            userControllers.Add("customer-changepassword");
            userControllers.Add("customer-changepasswordsuccess");

            List<string> superAdminControllers = new List<string>();
            superAdminControllers.Add("contact");
            superAdminControllers.Add("tax");
            superAdminControllers.Add("income");
            superAdminControllers.Add("expense");
            superAdminControllers.Add("report");
            superAdminControllers.Add("tax-taxcollection");
            superAdminControllers.Add("customer-users");
            superAdminControllers.Add("customer-unauthorized");
            superAdminControllers.Add("customer-changepassword");
            superAdminControllers.Add("customer-changepasswordsuccess");
            superAdminControllers.Add("customer-updatecustomer");
            superAdminControllers.Add("smallsavings");
            superAdminControllers.Add("loan");

            roleControllers.Add(new RoleAndController
            {
                Controllers = adminControllers,
                Role = "A"
            });

            roleControllers.Add(new RoleAndController
            {
                Controllers = userControllers,
                Role = "U"
            });

            roleControllers.Add(new RoleAndController
            {
                Controllers = superAdminControllers,
                Role = "SA"
            });

            var session = System.Web.HttpContext.Current.Session["LoginSesion"];

            if (session == null)
            {
                //System.Web.HttpContext.Current.Response.Flush();
                System.Web.HttpContext.Current.Response.Redirect("/Home/Login");
                //RedirectToLogin();
            }
            else
            {
                LoggedinUser = (LoginUser)session;
                //LoggedinUser = (new System.Collections.Generic.List<DatabaseDataModel.User>(((System.Collections.Generic.List<DatabaseDataModel.User>)(session))))[0];
            }
        }

        public LoginUser LoggedinUser { get; set; }

        public ActionResult RedirectToLogin()
        {
            return RedirectToAction("Login", "Home");
        }
        public bool HasValidUserForThePage(string actionName, string controllerName)
        {

            bool isValid = false;
            if (LoggedinUser != null && !string.IsNullOrEmpty(LoggedinUser.Role))
            {
                RoleAndController rc = roleControllers.Find(controler => controler.Role == LoggedinUser.Role);
                if (rc != null)
                {
                    if (rc.Controllers != null && rc.Controllers.Count > 0)
                    {
                        if (rc.Controllers.Contains(controllerName.ToLower()) || rc.Controllers.Contains(string.Format("{0}-{1}", controllerName.ToLower(), actionName.ToLower())))
                        {
                            return true;
                        }
                    }
                }
            }
            return isValid;
        }

        protected override void Initialize(System.Web.Routing.RequestContext requestContext)
        {
            base.Initialize(requestContext);

            // set to viewbag
            ViewBag.UserData = LoggedinUser;
        }

    }

}
