using BusinessLayer;
using DatabaseDataModel;
using RepositroryAndUnitOfWork.Implementations;
using RepositroryAndUnitOfWork.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;

namespace Xaviers.Controllers.WebApi
{
    public class MailCampaignsController : ApiController
    {
        IRepository<MailGroup> mailgroupRepository = null;
        IUnitOfWork unitOfWork = null;
        Authentication auth = new Authentication();

        public MailCampaignsController()
        {
            unitOfWork = new UnitOfWork<XaviersEntities>();
            mailgroupRepository = unitOfWork.GetRepository<MailGroup>();
        }

        [ResponseType(typeof(MailCampaign))]
        [System.Web.Http.AcceptVerbs("POST")]
        [System.Web.Http.HttpPost]
        public IHttpActionResult PostMail(MailCampaign mail)
        {
            if(!string.IsNullOrEmpty(mail.Emails))
            {
                foreach (string toid in mail.Emails.Split(','))
                {
                    List<MessageModel> msg = new List<MessageModel>();
                    msg.Add(new MessageModel
                    {
                        FromEmail = "info@pugal.in",
                        ToEmail = toid,
                        Subject = mail.Subject,
                        MessageBody = mail.Campaign
                    });

                    int result = MailSender.SendMail(msg);
                }
            }
            if(mail.MailGroupId  > 0)
            {
                MailGroup mailgroup = mailgroupRepository.Single(mail.MailGroupId);
                if (mailgroup != null && mailgroup.MailContacts != null && mailgroup.MailContacts.Count > 0) 
                {
                    foreach (MailContact contact in mailgroup.MailContacts)
                    {
                        List<MessageModel> msg = new List<MessageModel>();
                        msg.Add(new MessageModel
                        {
                            FromEmail = "info@pugal.in",
                            ToEmail = contact.Email,
                            Subject = mail.Subject,
                            MessageBody = mail.Campaign
                        });

                        int result = MailSender.SendMail(msg);
                    }
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = mail.Emails }, mail);
        }
    }
}
