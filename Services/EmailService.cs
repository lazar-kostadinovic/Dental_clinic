using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

public class EmailService
{
    private readonly string _smtpServer = "smtp.gmail.com"; // SMTP server vašeg provajdera
    private readonly int _smtpPort = 587; // Port za SMTP
    private readonly string _emailFrom = "lazarpro19@gmail.com"; // Vaša email adresa
    private readonly string _emailPassword = "jojl zymq tvre qhdz"; // Lozinka za email

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var smtpClient = new SmtpClient("smtp.gmail.com")
        {
            Port = 587, // Za TLS
            Credentials = new NetworkCredential("lazarpro19@gmail.com", "jojl zymq tvre qhdz"),
            EnableSsl = true, // Omogućite sigurnu vezu
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
