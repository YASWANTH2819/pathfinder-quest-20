import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { Language } from '@/types';

const AuthPage = () => {
  const { signIn, signUp, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!loginData.email || !loginData.password) {
      setError(t('auth.fillAllFields'));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signIn(loginData.email, loginData.password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setError(t('auth.fillAllFields'));
      setIsLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(signupData.email, signupData.password, signupData.name, language);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(t('auth.signupSuccess'));
        setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
        setTimeout(() => setActiveTab('login'), 2000);
      }
    } catch (err: any) {
      setError(err.message || t('auth.signupError'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetLanguageSelection = () => {
    localStorage.removeItem('pf_lang_selected');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 cyber-grid">
      <Card className="glass-card p-8 max-w-md w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold gradient-text">PathFinder</h1>
            <p className="text-muted-foreground">{t('auth.welcome')}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetLanguageSelection}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              {t('auth.changeLanguage')}
            </Button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-900">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Auth Forms */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                {t('auth.login')}
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                {t('auth.signup')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('auth.email')}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.passwordPlaceholder')}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('common.loading') : t('auth.loginButton')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t('auth.name')}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={t('auth.namePlaceholder')}
                    value={signupData.name}
                    onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('auth.email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.passwordPlaceholder')}
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="signup-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('common.loading') : t('auth.signupButton')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;