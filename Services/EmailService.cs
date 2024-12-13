using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

public class EmailService
{
    private readonly string _smtpServer = "smtp.gmail.com"; 
    private readonly int _smtpPort = 587; 
    private readonly string _emailFrom = "kostadinovicl999@gmail.com";
    private readonly string _emailPassword = "zjse qzes zdin eymj";

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var smtpClient = new SmtpClient(_smtpServer)
        {
            Port = _smtpPort, 
            Credentials = new NetworkCredential(_emailFrom,_emailPassword),
            EnableSsl = true, 
        };


        var mailMessage = new MailMessage
        {
            From = new MailAddress(_emailFrom),
            Subject = subject,
            Body = body,
            IsBodyHtml = true,
        };
        mailMessage.To.Add(toEmail);

        await smtpClient.SendMailAsync(mailMessage);
    }
}
