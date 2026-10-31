"use client";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInSchema } from "@/validators/authValidators";
import { useForm } from "react-hook-form";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormFieldset,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";

import { signIn, useSession } from "@/lib/auth-client";
import { sanitizeReturnUrl } from "@/lib/dashboard-route";
import { FormError } from "../../../../components/FormError";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

type SignInValues = yup.InferType<typeof signInSchema>;

const SigninForm = () => {
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const search = useSearchParams() ?? new URLSearchParams();
  const returnUrl = sanitizeReturnUrl(
    search.get("returnUrl") || search.get("callbackUrl"),
  );
  const { status } = useSession();

  const form = useForm<SignInValues>({
    resolver: yupResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    setFormError("");
    const dismiss = toast.loading("Signing you in...");
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      toast.dismiss(dismiss);

      if (res?.ok && !res.error) {
        toast.success("Login successful");

        // Checkout continuity has the highest priority after authentication.
        const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin");
        const pendingCheckout = sessionStorage.getItem("pendingCheckout");

        if (redirectAfterLogin === "/ecommerce/checkout" && pendingCheckout) {
          try {
            const cartItems = JSON.parse(pendingCheckout);

            if (Array.isArray(cartItems) && cartItems.length > 0) {
              // Checkout consumes this snapshot only after its idempotent
              // guest-cart sync succeeds. Clearing it here makes retries use
              // the additive cart endpoint and can multiply the quantity.
              router.replace("/ecommerce/checkout");
              router.refresh();
              return;
            }

            sessionStorage.removeItem("pendingCheckout");
            sessionStorage.removeItem("redirectAfterLogin");
          } catch {
            sessionStorage.removeItem("pendingCheckout");
            sessionStorage.removeItem("redirectAfterLogin");
          }
        }

        // Resolve the final dashboard on the server after the auth cookie is
        // committed. This avoids a client-side session race immediately after
        // credentials sign-in and lets Business Network membership participate
        // in the default route decision reliably.
        const postLoginUrl = returnUrl
          ? `/post-login?returnUrl=${encodeURIComponent(returnUrl)}`
          : "/post-login";
        router.replace(postLoginUrl);
        router.refresh();
        return;
      }

      const message =
        res?.error === "CredentialsSignin"
          ? "Invalid email or password. Please try again."
          : "Unable to sign in. Please try again in a moment.";
      setFormError(message);
      toast.error(message);
    } catch (err: unknown) {
      toast.dismiss(dismiss);
      const message =
        (err instanceof Error ? err.message : String(err)) ||
        "Something went wrong while signing in.";
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <Card className="boed-auth-form border border-border bg-card text-card-foreground shadow-md max-w-md mx-auto">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-ring to-destructive rounded-t-xl" />

      <CardHeader className="boed-auth-form-heading">
        <span className="boed-auth-eyebrow mb-3">AURA BOED ACCOUNT</span>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account. Your world is waiting.</CardDescription>
      </CardHeader>

      <CardContent className="boed-auth-form-body">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormFieldset className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Email
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          autoComplete="email"
                          className="input-theme pr-10"
                          {...field}
                        />
                      </FormControl>
                      <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-foreground">
                        Password
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          autoComplete="current-password"
                          className="input-theme pr-10"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </FormFieldset>

            <FormError message={formError} />

            <Button
              type="submit"
              className="mt-2 w-full rounded-lg btn-primary text-sm font-medium py-2.5 shadow-sm hover:shadow-md transition-all duration-200"
              disabled={status === "loading" || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mt-3 text-center text-sm">
          <span className="text-muted-foreground">
            Don&apos;t have an account?{" "}
          </span>
          <Link
            href={returnUrl ? `/sign-up?returnUrl=${encodeURIComponent(returnUrl)}` : "/sign-up"}
            className="font-medium text-foreground hover:underline"
          >
            Create an account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SigninForm;
