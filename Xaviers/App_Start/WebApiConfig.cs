using DatabaseDataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.OData.Builder;

namespace Xaviers
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services
            // Web API routes
            config.MapHttpAttributeRoutes();

            //XaviersController project
            //config.Routes.MapHttpRoute(name: "XaviersController", routeTemplate: "{XaviersApi}/{action}/{id}",
            //    defaults: new { controller = "Contact", id = RouteParameter.Optional });

            ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
           
            builder.EntitySet<Contact>("OdataContacts");
            builder.EntitySet<Qualification>("Qualification");
            builder.EntitySet<WorkExperience>("WorkExperience");
            builder.EntitySet<Income>("OdataIncome");
            builder.EntitySet<Expense>("OdataExpense");
            builder.EntitySet<IncomeExpenseGroup>("OdataIncomeExpenseGroup");
            builder.EntitySet<Tax>("TaxOdata");
            builder.EntitySet<TaxExcludedMember>("TaxExcludedMember");
            builder.EntitySet<TaxCollection>("OdataTaxCollection");
            builder.EntitySet<User>("OdataUser");
            builder.EntitySet<RecurringTax>("OdataRecurringTax");
            builder.EntitySet<RecurringTaxCollection>("OdataRecurringTaxCollection");
            builder.EntitySet<SmallSavingsCollection>("OdataSmallSaving");
            builder.EntitySet<SmallSavingsSettlement>("OdataSavingReturn");
            builder.EntitySet<Loan>("OdataLoan");
            builder.EntitySet<LoanCollection>("OdataLoanCollection");
            builder.EntitySet<MailGroup>("OdataMailGroup");
            builder.EntitySet<MailContact>("MailContacts");

            builder.Namespace = "OdataServices";
            config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
                name: "SearchGenderApi",
                routeTemplate: "api/{controller}/{keyword}/{gender}",
                defaults: new { keyword = RouteParameter.Optional, gender = RouteParameter.Optional }
            );
        }
    }
}
