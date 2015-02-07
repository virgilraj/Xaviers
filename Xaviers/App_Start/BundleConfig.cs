using System.Web;
using System.Web.Optimization;

namespace Xaviers
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-1.10.2.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            bundles.Add(new ScriptBundle("~/bundles/app").Include(
                    "~/Scripts/jquery-1.10.2.js",
                    "~/Scripts/datepicker/zebra_datepicker.js",
                    "~/Scripts/JsPdf/base64.js",
                    "~/Scripts/JsPdf/sprintf.js",
                    "~/Scripts/JsPdf/jspdf.js"
                    ));

            bundles.Add(new ScriptBundle("~/bundles/Angular").Include(
                    "~/Scripts/angular.js",
                    "~/Scripts/angular-resource.js",
                    "~/Scripts/angular-cookies.js",
                    "~/Scripts/angular-wysiwyg.js",
                   // "~/Scripts/TextAngular/textAngular.js",
                    //"~/Scripts/TextAngular/textAngularSetup.js",
                    "~/Scripts/utility.js"));

            bundles.Add(new StyleBundle("~/Content/AppStyles").Include(
                       "~/Content/styles.css",
                       "~/Content/datepicker/default.css"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            #region Foundation Bundles

            bundles.Add(Foundation.Styles());

            bundles.Add(Foundation.Scripts());

            #endregion
        }
    }
}