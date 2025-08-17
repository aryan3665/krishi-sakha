import { useState } from "react";
import { Dashboard } from "./Dashboard";
import { getStringTranslation } from "@/utils/translations";
export const KrishiSakhaApp = () => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('krishi-sakha-language') || 'en';
  });

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('krishi-sakha-language', newLanguage);
  };

  return <Dashboard language={language} onLanguageChange={handleLanguageChange} />;
};
