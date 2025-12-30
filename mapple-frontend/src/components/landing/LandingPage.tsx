
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Login } from "@/components/components/auth/Login";
import { Button } from "@/components/components/ui/Button";
import { useAppContext } from "@/context/AppContext";
import { DemoRequestModal } from "@/components/forms/DemoRequestModal";
import { LanguageSwitcher } from '@/components/components/ui/LanguageSwitcher';

export const LandingPage: React.FC = () => {
  const { landingPageConfig } = useAppContext();
  const { t } = useTranslation();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  if (!landingPageConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-sm text-slate-500 animate-pulse font-display">
          {t('loading')}
        </span>
      </div>
    );
  }

  const {
    logoHeaderUrl,
    heroTitle,
    heroSubtitle,
    heroBannerUrl
  } = landingPageConfig;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-body text-slate-900 selection:bg-electric-blue selection:text-white">
      
      {/* --- Organic Background Blobs --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-fresh-mint/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
      <div className="absolute top-[10%] right-[-10%] w-[45vw] h-[45vw] bg-mango-yellow/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[55vw] h-[55vw] bg-electric-blue/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>

      {/* --- Navigation --- */}
      <header className="absolute top-0 left-0 right-0 z-50 pt-6 px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             {logoHeaderUrl ? (
                <img src={logoHeaderUrl} alt="Mapple" className="h-10 w-auto" />
             ) : (
                <div className="text-2xl">🍎</div>
             )}
             <span className="font-display font-bold text-xl text-slate-800 tracking-tight">Mapple School</span>
          </div>
          
          <div className="flex items-center gap-4">
             <LanguageSwitcher className="hidden sm:block" />
             <Button 
                variant="secondary" 
                size="sm" 
                className="hidden sm:flex rounded-full bg-white/50 border border-white/50 backdrop-blur-sm shadow-sm hover:bg-white"
                onClick={() => setIsDemoModalOpen(true)}
             >
                {t('landing.requestDemo')}
             </Button>
          </div>
        </div>
      </header>

      {/* --- Main Content (Split Screen) --- */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20 lg:px-12 lg:py-0">
        <div className="grid w-full max-w-7xl gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Left Side: Hero Text & Illustration */}
          <div className="flex flex-col justify-center space-y-8 text-center lg:text-left pt-12 lg:pt-0">
             
             {/* Text Content */}
             <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-white/50 px-4 py-1.5 text-xs font-bold text-electric-blue shadow-sm backdrop-blur-sm mx-auto lg:mx-0">
                    <span className="flex h-2 w-2 rounded-full bg-electric-blue animate-pulse"></span>
                    {t('landing.headerSubtitle')}
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.1] text-slate-900 tracking-tight">
                  {heroTitle || t('landing.heroTitle')}
                </h1>
                
                <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {heroSubtitle || t('landing.heroSubtitle')}
                </p>
             </div>

             {/* 3D Illustration / Visual Element */}
             <div className="relative mx-auto lg:mx-0 w-full max-w-md lg:max-w-lg">
                {/* Floating Decor Elements */}
                <div className="absolute -top-12 -right-8 w-16 h-16 bg-white rounded-2xl shadow-soft rotate-12 flex items-center justify-center text-3xl animate-bounce duration-[3000ms] z-20">✏️</div>
                <div className="absolute bottom-12 -left-8 w-14 h-14 bg-white rounded-full shadow-soft -rotate-6 flex items-center justify-center text-2xl animate-bounce delay-700 z-20">📚</div>
                
                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-electric-blue/10 bg-gradient-to-b from-white/40 to-white/10 border border-white/40 backdrop-blur-sm p-2">
                    {heroBannerUrl ? (
                        <img 
                            src={heroBannerUrl} 
                            alt="Mapple Connection" 
                            className="w-full h-auto rounded-[2.5rem] object-cover transform transition-transform hover:scale-[1.02] duration-500" 
                        />
                    ) : (
                        // Fallback generic illustration style
                        <div className="w-full aspect-[4/3] bg-[#EBF2FF] rounded-[2.5rem] flex items-center justify-center relative overflow-hidden">
                             <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,#4D7CFE,transparent)]"></div>
                             <span className="text-9xl filter drop-shadow-lg transform hover:-translate-y-2 transition-transform duration-500 cursor-pointer">🍎</span>
                        </div>
                    )}
                </div>
             </div>
          </div>

          {/* Right Side: Floating Login Card */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
             <Login />
             
             {/* Footer Links below login for mobile, or simple copyright */}
             <div className="mt-8 text-center text-xs text-slate-400 font-medium">
                <p>© {new Date().getFullYear()} Mapple School Inc.</p>
                <div className="flex justify-center gap-4 mt-2">
                    <button className="hover:text-electric-blue transition-colors">Privacidad</button>
                    <button className="hover:text-electric-blue transition-colors">Términos</button>
                    <button className="hover:text-electric-blue transition-colors">Ayuda</button>
                </div>
             </div>
          </div>

        </div>
      </main>

      <DemoRequestModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
      
      {/* CSS for custom Blob Animation */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
