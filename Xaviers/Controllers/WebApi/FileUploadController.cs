using BusinessLayer;
using ImageResizer;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace Xaviers.Controllers.WebApi
{
    public class FileUploadController : ApiController
    {
        Authentication auth = new Authentication();
        // GET api/FileUpload
        public void GetFileUploads()
        {
            //Expression<Func<Contact, bool>> expr = contact => contact.FirstName == "Virgil raj" && contact.Country == "India";
            //return contactRepository.GetAll(expr);
        }

        [System.Web.Http.AcceptVerbs("POST")]
        [System.Web.Http.HttpPost]
        public void UploadFile(string id)
        {
            if (!Request.Content.IsMimeMultipartContent("form-data"))
            {
                throw new HttpResponseException
                 (Request.CreateResponse(HttpStatusCode.UnsupportedMediaType));
            }

            string type = string.Empty;
            string typid = string.Empty;
            string[] typ = id.Split('_');
            if (typ.Length > 1)
            {
                type = typ[0];
                typid = typ[1];
            }

            if (!string.IsNullOrEmpty(type) && !string.IsNullOrEmpty(typid))
            {
                Dictionary<string, string> versions = new Dictionary<string, string>();
                if (type == "contact")
                {
                    //Define the versions to generate
                    versions.Add("_mobthumb", "width=50&height=50&crop=auto&format=png"); //Crop to square thumbnail
                    versions.Add("_thumb", "width=100&height=100&crop=auto&format=png"); //Crop to square thumbnail
                    versions.Add("_medium", "maxwidth=250&maxheight=250&format=png"); //Fit inside 400x400 area, jpeg
                    versions.Add("_icon", "maxwidth=25&maxheight=25&format=png"); //Fit inside 1900x1200 area
                }
                else if (type == "customer") {
                    versions.Add("_icon", "maxwidth=40&maxheight=40&format=png");
                }
                else if (type == "expense")
                {
                    versions.Add("_medium", "maxwidth=400&maxheight=400&format=png");
                }
                //Loop through each uploaded file
                foreach (string fileKey in HttpContext.Current.Request.Files.Keys)
                {
                    HttpPostedFile file = HttpContext.Current.Request.Files[fileKey];
                    if (file.ContentLength <= 0) continue; //Skip unused file controls.

                    string uploadFolder = string.Empty;
                    //Get the physical path for the uploads folder and make sure it exists
                    if (type == "contact")
                    {
                        if (auth.LoggedinUser == null) continue;
                        uploadFolder = HttpContext.Current.Server.MapPath("~/memberImages/" + auth.LoggedinUser.CustomerId.ToString() + "/");
                        if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);
                    }
                    else if (type == "customer")
                    {
                        uploadFolder = HttpContext.Current.Server.MapPath("~/customerLogo/");
                        if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);
                    }
                    else if (type == "expense")
                    {
                        if (auth.LoggedinUser == null) continue;
                        uploadFolder = HttpContext.Current.Server.MapPath("~/expenseBills/" + auth.LoggedinUser.CustomerId.ToString() + "/ ");
                        if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);
                    }

                    //Generate each version
                    foreach (string suffix in versions.Keys)
                    {
                        //Generate a filename (GUIDs are best).
                        string fileName = Path.Combine(uploadFolder, typid.ToString() + suffix);

                        //Let the image builder add the correct extension based on the output file type
                        ImageBuilder.Current.Build(new ImageJob
                        {
                            Source = file,
                            Dest = fileName,
                            Settings = new ResizeSettings(versions[suffix]),
                            DisposeSourceObject = true,
                            AddFileExtension = true

                        });
                    }

                }
            }
        }
    }
}
