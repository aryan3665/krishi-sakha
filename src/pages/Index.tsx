import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { KrishiSakhaApp } from "@/components/KrishiSakhaApp";
import { AuthForm } from "@/components/AuthForm";
import { LandingPage } from "@/components/LandingPage";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('krishi-sakha-language') || 'en';
  });

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('krishi-sakha-language', newLanguage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="text-green-700 dark:text-green-300 font-medium">Loading Krishi Sakha...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main app
  if (user) {
    return <KrishiSakhaApp />;
  }

  // If user is not authenticated and wants to see auth form
  if (showAuth) {
    return <AuthForm onBackToLanding={() => setShowAuth(false)} />;
  }

  // Show landing page by default for unauthenticated users
  return (
    <LandingPage
      onGetStarted={() => setShowAuth(true)}
      language={language}
      onLanguageChange={handleLanguageChange}
    />
  );
};

export default Index;
