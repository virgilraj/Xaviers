using BusinessLayer;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Implementations;
using RepositroryAndUnitOfWork.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace Xaviers.Controllers
{
    public class ContactController : Authentication
    {
        IRepository<Contact> contactRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();
        public ContactController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            contactRepository = unitOfWork.GetRepository<Contact>();
        }
        // GET: /Contact/
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

        // GET: /Member/
        public ActionResult Member()
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


        // GET: /Contact/ContactPDF/5
        public ActionResult ContactPDF(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Contact contact = contactRepository.Single(id);
            if (contact == null)
            {
                return HttpNotFound();
            }
            
            return new RazorPDF.PdfResult(contact, "ContactPDF"); 
        }
	}
}