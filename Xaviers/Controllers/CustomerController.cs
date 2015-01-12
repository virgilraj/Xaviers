using BusinessLayer;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Implementations;
using RepositroryAndUnitOfWork.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;

namespace Xaviers.Controllers
{
    public class CustomerController : Authentication
    {
        IRepository<User> userRepository = null;
        IRepository<Customer> customerRepository = null;
        IUnitOfWork unitOfWork = null;

        // GET api/User
        public CustomerController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            userRepository = unitOfWork.GetRepository<User>();
            customerRepository = unitOfWork.GetRepository<Customer>();
        }

        

        public ActionResult Users()
        {
            Authentication auth = new Authentication();
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

        

        [HttpGet]
        public ActionResult Unauthorized()
        {
            Authentication auth = new Authentication();
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

        [HttpGet]
        public ActionResult ChangePassword()
        {
            Authentication auth = new Authentication();
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

        [HttpGet]
        public ActionResult ChangePasswordSuccess()
        {
            Authentication auth = new Authentication();
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
        
        [HttpGet]
        public ActionResult Logout()
        {
            System.Web.HttpContext.Current.Session.Abandon();

            return RedirectToAction("Login", "Home");
        }

        [HttpGet]
        public ActionResult UpdateCustomer()
        {
            Authentication auth = new Authentication();
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

        

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]

        public ActionResult ChangePassword(ChangePassword model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                Authentication auth = new Authentication();
                if (auth.LoggedinUser == null)
                {
                    return RedirectToAction("Login", "Home");
                }

                User usr = userRepository.Single(auth.LoggedinUser.Id);
                if (usr.Password != BusinessUtility.Encrypt(model.OldPwd))
                {
                    ModelState.AddModelError("", "Please enter valid old passowrd.");
                }
                else if (model.NewPwd != model.CnfPwd)
                {
                    ModelState.AddModelError("", "New password and confirm password is mismatched.");
                }
                else
                {
                    try
                    {
                        usr.Password = BusinessUtility.Encrypt(model.NewPwd);
                        userRepository.Update(usr);
                        unitOfWork.Save();
                    }
                    catch (Exception e)
                    {
                        ModelState.AddModelError("", "Technical error. Please contact your administrator.");
                    }
                }
            }
            return View(model);
        }

	}
}