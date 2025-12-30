
import { useState } from "react";
import { useTranslation } from "react-i18next";

/* Context */
import { useAppContext } from "@/context/AppContext";

/* UI */
import { Input } from "@/components/components/ui/Input";
import { Button } from "@/components/components/ui/Button";


export const Login: React.FC = () => {
  const { login, landingPageConfig } = useAppContext();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Use logo from config
  const logoUrl = landingPageConfig?.logoHeroUrl || landingPageConfig?.logoHeaderUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        const success = await login(email, password);

        if (!success) {
          setError(t('auth.errorLogin'));
          setIsLoading(false);
        }
    } catch (err) {
        console.error(err);
        setError(t('auth.errorGeneric'));
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      {/* Glassmorphism Card */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-8 py-10 sm:px-10 sm:py-12">
        
        <div className="flex flex-col items-center mb-8">
          {logoUrl ? (
            <div className="h-20 w-20 rounded-2xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-white mb-4 transform hover:scale-105 transition-transform duration-300">
              <img
                src={logoUrl}
                alt="Mapple School"
                className="h-14 w-auto object-contain"
              />
            </div>
          ) : (
             <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-electric-blue to-blue-400 flex items-center justify-center text-3xl shadow-lg shadow-blue-200 mb-4 text-white">
                🍎
             </div>
          )}
          <h2 className="text-2xl font-display font-bold text-slate-800 text-center">
            {t('auth.title')}
          </h2>
          <p className="text-sm font-body text-slate-500 text-center mt-2">
            {t('auth.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-600 flex gap-2 items-center animate-pulse">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-slate-600 font-bold ml-1">
              {t('auth.email')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="familia@colegio.com"
              className="h-12 rounded-2xl border-transparent bg-white/70 focus:bg-white shadow-sm focus:ring-2 focus:ring-electric-blue/50 text-slate-700 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1 mr-1">
                <Label htmlFor="password" className="text-sm text-slate-600 font-bold">
                {t('auth.password')}
                </Label>
                <button
                type="button"
                className="text-xs text-electric-blue hover:text-blue-600 font-bold transition-colors"
                >
                {t('auth.forgotPassword')}
                </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-12 rounded-2xl border-transparent bg-white/70 focus:bg-white shadow-sm focus:ring-2 focus:ring-electric-blue/50 text-slate-700 pr-10 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-12 mt-4 rounded-full bg-electric-blue hover:bg-blue-600 text-white font-display font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('auth.validating')}</span>
                </div>
            ) : (
                t('auth.submit')
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 mb-2 text-center uppercase tracking-wider">{t('auth.testUsers')}</p>
          <div className="flex flex-wrap justify-center gap-2">
             {['admin@mapple.com', 'school@demo.com', 'teacher@demo.com', 'parent@demo.com'].map(u => (
                 <span key={u} className="px-2 py-1 bg-slate-100 rounded-md text-[10px] text-slate-500 font-mono cursor-pointer hover:bg-slate-200" onClick={() => setEmail(u)}>
                     {u}
                 </span>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
