import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [value, setValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailInfo, setEmailInfo] = useState({ email: "", isAdmin: false });

  // Generate a random 6-digit code for verification
  const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  useEffect(() => {
    if (!localStorage.getItem("verificationCode")) {
      localStorage.setItem("verificationCode", generateVerificationCode());
    }

    const params = new URLSearchParams(location.search);
    const email = params.get("email") || "";
    const isAdmin = params.get("isAdmin") === "true";

    setEmailInfo({ email, isAdmin });
  }, [location.search]);

  const verificationCode = localStorage.getItem("verificationCode") || "";

  const handleVerify = () => {
    setIsVerifying(true);

    setTimeout(() => {
      if (value === verificationCode) {
        setIsSuccess(true);
        toast({
          title: "Email verified successfully",
          description: "Your email has been verified. Redirecting...",
        });

        // Save verification status
        const userKey = emailInfo.isAdmin ? "adminProfile" : "customerProfile";
        const userProfile = JSON.parse(localStorage.getItem(userKey) || "{}");
        userProfile.isEmailVerified = true;
        localStorage.setItem(userKey, JSON.stringify(userProfile));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", emailInfo.email);
        localStorage.setItem("isAdmin", emailInfo.isAdmin ? "true" : "false");

        setTimeout(() => {
          navigate(emailInfo.isAdmin ? "/admin/dashboard" : "/events");
        }, 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: "The code you entered is incorrect. Try again.",
        });
        setIsVerifying(false);
      }
    }, 1000);
  };

  const resendCode = () => {
    const newCode = generateVerificationCode();
    localStorage.setItem("verificationCode", newCode);
    toast({
      title: "New code sent",
      description: `A new verification code has been sent to ${emailInfo.email}`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {isSuccess ? <CheckCircle2 className="h-8 w-8 text-primary" /> : <Mail className="h-8 w-8 text-primary" />}
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            {isSuccess
              ? "Your email has been successfully verified!"
              : `We've sent a 6-digit code to ${emailInfo.email || "your email"}. Enter it below.`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!isSuccess && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={value} onChange={setValue} disabled={isVerifying || isSuccess}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                For demo purposes, the code is: <span className="font-bold">{verificationCode}</span>
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium mb-2">Verification successful!</p>
              <p className="text-sm text-muted-foreground">Redirecting shortly...</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {!isSuccess && (
            <>
              <Button className="w-full" onClick={handleVerify} disabled={value.length !== 6 || isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Email"}
                {!isVerifying && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <div className="text-center pt-2">
                <Button variant="link" onClick={resendCode} disabled={isVerifying}>
                  Didn't receive a code? Resend
                </Button>
              </div>
            </>
          )}

          {isSuccess && (
            <Button
              onClick={() => navigate(emailInfo.isAdmin ? "/admin/dashboard" : "/events")}
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
