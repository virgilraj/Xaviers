using BusinessLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Xaviers.Controllers
{
    public class LoanController : Authentication
    {
        Authentication auth = new Authentication();
        //
        // GET: /Loan/
        public ActionResult Index()
        {
            string controllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
            string actionName = this.ControllerContext.RouteData.Values["action"].ToString();
            if (!auth.HasValidUserForThePage(actionName, controllerName))
            {
                return RedirectToAction("Unauthorized", "Customer");
            }
            else
            {
                return View();
            }
        }

        public ActionResult LoanCollection()
        {
            string controllerName = this.ControllerContext.RouteData.Values["controller"].ToString();
            string actionName = this.ControllerContext.RouteData.Values["action"].ToString();
            if (!auth.HasValidUserForThePage(actionName, controllerName))
            {
                return RedirectToAction("Unauthorized", "Customer");
            }
            else
            {
                return View();
            }
        }
	}
}