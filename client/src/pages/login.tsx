import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, Input, Label, Button } from "@/components/ui";
import { BrainCircuit, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
      setLocation("/dashboard");
    } catch (err: any) {
      setError("Invalid credentials. Try admin@neurohire.com / password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617]">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10 px-4"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-6"
          >
            <BrainCircuit className="w-12 h-12 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-white mb-3">Welcome to <span className="text-gradient">NeuroHire</span></h1>
          <p className="text-muted-foreground text-lg">Next-generation cognitive assessment</p>
        </div>

        <Card className="p-8 backdrop-blur-2xl bg-white/5 border-white/10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="candidate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20 border-white/10 focus:border-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20 border-white/10 focus:border-primary/50"
                required
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" className="w-full h-12 text-base font-semibold glow-primary">
              Sign In <Sparkles className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-xs text-muted-foreground">Demo Accounts:</p>
              <p className="text-xs text-muted-foreground">admin@neurohire.com | user@neurohire.com</p>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
