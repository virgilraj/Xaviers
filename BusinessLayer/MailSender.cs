using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer
{
    public class MailSender
    {
        public static int SendMail(IEnumerable<MessageModel> mailMessages)
        {

            // Modify this to suit your business case:
            string mailUser = ConfigurationManager.AppSettings["MailId"]; // "gamilid";
            string mailUserPwd = ConfigurationManager.AppSettings["MailPwd"];
            SmtpClient client = new SmtpClient(ConfigurationManager.AppSettings["SMTP"]);
            int port = 0;
            int.TryParse(ConfigurationManager.AppSettings["MailPort"], out port);
            client.Port = port;
            client.DeliveryMethod = SmtpDeliveryMethod.Network;
            client.UseDefaultCredentials = false;
            System.Net.NetworkCredential credentials =
                new System.Net.NetworkCredential(mailUser, mailUserPwd);
            client.EnableSsl = true;
            client.Credentials = credentials;

            foreach (var msg in mailMessages)
            {
                var mail = new MailMessage(msg.FromEmail.Trim(), msg.ToEmail.Trim());
                mail.Subject = msg.Subject;
                mail.Body = msg.MessageBody;
                mail.IsBodyHtml = true;
                try
                {
                    client.Send(mail);
                    
                }
                catch (Exception ex)
                {
                    return 0;
                    //throw ex;
                    // Or, more likely, do some logging or something
                }
            }

            return 1;
        }
    }
}
