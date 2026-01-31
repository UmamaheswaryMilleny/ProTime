import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../services/auth/authService";
import { Button } from "./User/Button";
import { Input } from "./User/input";
import { Label } from "@radix-ui/react-label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./User/Card";
import { Eye, EyeOff } from "lucide-react";

import { useSignupMutation } from "../hooks/auth/auth";
import { registerSchema } from "../validations/register-schema";
import {
  useResendOtpMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "../hooks/auth/useOtp";
import { OTPModal } from "./OtpModal";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

export function UserSignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { mutate: sendOtp } = useSendOtpMutation();
  const { mutate: verifyOtp } = useVerifyOtpMutation();
  const { mutate: resendOtp } = useResendOtpMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isPending } = useSignupMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role: "client",
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const fieldName = err.path[0] as string;
        fieldErrors[fieldName] = err.message;
      });

      setErrors(fieldErrors);
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setErrors({});
    try {
      // 1️⃣ REGISTER TEMP USER
      await authApi.registerService(result.data);

      // 2️⃣ SEND OTP
      sendOtp(
        { email },
        {
          onSuccess: () => {
            toast.success("OTP sent");
            setIsOtpModalOpen(true);
          },
          onError: (error: unknown) => {
            const errorMessage =
              (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || "failed to send otp";
            toast.error(errorMessage);
          },
        },
      );
    } catch (error: unknown) {
      toast.error("Register failed");
      console.log(error);
    }
    // sendOtp(
    //   { email},
    //   {
    //     onSuccess: (respoznse) => {
    //       toast.success(response.data?.message || "Otp send successfully");
    //       setIsOtpModalOpen(true);
    //     },
    //     onError: (error: unknown) => {
    //       const errorMessage =
    //         (error as { response?: { data?: { message?: string } } })?.response
    //           ?.data?.message || "failed to send otp";
    //       toast.error(errorMessage);
    //     },
    //   }
    // );'\
  };

  // signup(result.data, {
  //   onSuccess: (response) => {
  //     toast.success(response.message || "Account created successfully");
  //   },

  const handleVerifyOtp = (otp: string) => {
    verifyOtp(
      {
        email,
        otp,
        // userData: {
        //   firstName,
        //   lastName,
        //   email,
        //   password,
        //   role: "client",
        // }
        // ,
      },
      {
        onSuccess: (response) => {
          toast.success(
            response.data?.message || "Account created successfully",
          );
          setIsOtpModalOpen(false);
          navigate("/login");
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            toast.error(error.response?.data?.message || "Signup failed");
          } else {
            toast.error("Something went wrong");
          }
        },
      },
    );
  };

  return (
    <Card className="border-border shadow-lg max-w-md mx-auto">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold">
          Create User Account
        </CardTitle>
        <CardDescription>Sign up to start using ProTime</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-2"></div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:underline">
          Sign in
        </a>
      </CardFooter>
      <OTPModal
        isOpen={isOtpModalOpen}
        email={email}
        onVerify={handleVerifyOtp}
        onResend={() => resendOtp(email)}
        onClose={() => setIsOtpModalOpen(false)}
      />
    </Card>
  );
}
