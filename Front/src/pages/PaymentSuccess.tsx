import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { CheckCircle, Loader2, Home } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);

  const navigate = useNavigate();

  const quoteId = searchParams.get("quote_id");

  useEffect(() => {
    // Simulate payment verification
    if (!quoteId) {

      return;
    }
    const timer = setTimeout(() => {

      setIsVerifying(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [quoteId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {isVerifying ? (
          <div className="animate-fade-in">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
            <h1 className="font-heading text-2xl font-bold mb-2">Verifying Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </div>
        ) : (
          <div className="animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="font-heading text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your deposit. I've received your payment and will begin working on your project shortly.
              You'll receive an email confirmation with next steps.
            </p>

            <div className="p-6 rounded-2xl bg-gradient-card border border-border/50 mb-8">
              <h2 className="font-heading font-semibold mb-4">What's Next?</h2>
              <ul className="text-left text-sm text-muted-foreground space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs shrink-0">1</span>
                  <span>I'll review your project requirements in detail</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs shrink-0">2</span>
                  <span>You'll receive a detailed project timeline within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs shrink-0">3</span>
                  <span>Development begins with regular progress updates</span>
                </li>
              </ul>
            </div>

            <Button variant="hero" size="lg" onClick={() => navigate("/")}>
              <Home className="w-5 h-5" />
              Back to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
