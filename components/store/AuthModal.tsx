'use client';

import { useState } from 'react';
import { User, Lock, Mail, AlertCircle, Sparkles, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);
    const res = await signIn(loginEmail, loginPassword);
    setLoginLoading(false);

    if (!res.success) {
      setLoginError(res.error || 'Invalid email or password.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Please complete all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setRegLoading(true);
    const res = await signUp(regName, regEmail, regPassword);
    setRegLoading(false);

    if (!res.success) {
      setRegError(res.error || 'Registration failed. Email may already be registered.');
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
      <DialogContent className="sm:max-w-md bg-ivory border border-gold/30 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-2 text-center bg-burgundy text-ivory">
          <div className="inline-flex items-center justify-center gap-2 mb-1 text-gold-light">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em] font-light">
              Indian Heritage Couture
            </span>
          </div>
          <DialogTitle className="font-serif-display text-3xl font-semibold tracking-wide">
            MIRĀYA
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')}>
            <TabsList className="grid grid-cols-2 w-full bg-gold/10 border border-gold/20 mb-6">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-burgundy data-[state=active]:text-ivory text-brown text-xs uppercase tracking-wider font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-burgundy data-[state=active]:text-ivory text-brown text-xs uppercase tracking-wider font-medium"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: SIGN IN */}
            <TabsContent value="signin" className="mt-0">
              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs uppercase tracking-wide text-brown">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="login-email"
                      type="email"
                      required
                      placeholder="ananya@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-9 bg-ivory-50 border-gold/20 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-xs uppercase tracking-wide text-brown">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="login-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-9 bg-ivory-50 border-gold/20 text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-burgundy hover:bg-burgundy-dark text-ivory h-11 font-medium tracking-wide rounded-sm mt-2"
                >
                  {loginLoading ? 'Signing In...' : 'Sign In to MIRĀYA'}
                </Button>
              </form>
            </TabsContent>

            {/* TAB 2: CREATE ACCOUNT */}
            <TabsContent value="signup" className="mt-0">
              {regError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="reg-name" className="text-xs uppercase tracking-wide text-brown">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="reg-name"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="pl-9 bg-ivory-50 border-gold/20 text-sm h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reg-email" className="text-xs uppercase tracking-wide text-brown">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="ananya@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-9 bg-ivory-50 border-gold/20 text-sm h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="reg-pass" className="text-xs uppercase tracking-wide text-brown">
                      Password *
                    </Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      required
                      placeholder="Min 6 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="bg-ivory-50 border-gold/20 text-sm h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-confirm" className="text-xs uppercase tracking-wide text-brown">
                      Confirm *
                    </Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      required
                      placeholder="Repeat pass"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="bg-ivory-50 border-gold/20 text-sm h-9"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-burgundy hover:bg-burgundy-dark text-ivory h-11 font-medium tracking-wide rounded-sm mt-3"
                >
                  {regLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
