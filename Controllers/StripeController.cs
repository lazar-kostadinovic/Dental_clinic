using Microsoft.AspNetCore.Mvc;
using Stripe;
using System.Threading.Tasks;

namespace StomatoloskaOrdinacija.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StripeController(IConfiguration configuration) : ControllerBase
    {
        private readonly IConfiguration _configuration = configuration;

        [HttpPost("create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] PaymentIntentRequest request)
        {
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];

            try
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(request.Amount * 100),
                    Currency = request.Currency,
                    PaymentMethodTypes = new List<string> { "card" }
                };

                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options);

                return Ok(new { clientSecret = paymentIntent.ClientSecret });
            }
            catch (StripeException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    public class PaymentIntentRequest
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "usd";
    }
}
