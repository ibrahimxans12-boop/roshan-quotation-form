import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Plane, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsPending(true);
    try {
      await apiRequest("POST", "/api/login", data);
      
      // Invalidate auth cache and redirect
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Roshan Tours</h1>
            <p className="text-sm text-muted-foreground">& Travels</p>
          </div>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the quotation management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin"
                          {...field}
                          data-testid="input-username"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          data-testid="input-password"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending}
                  data-testid="button-login-submit"
                >
                  {isPending ? "Signing in..." : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>

            {/* Demo Credentials */}
            <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium text-foreground">Demo Credentials:</p>
              <p className="text-muted-foreground">Username: admin</p>
              <p className="text-muted-foreground">Password: admin@123</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Roshan Tours & Travels. All rights reserved.
        </p>
      </div>
    </div>
  );
}
