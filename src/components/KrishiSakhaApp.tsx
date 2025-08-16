import { useState } from "react";
import { Dashboard } from "./Dashboard";
import { getStringTranslation } from "@/utils/translations";
export const KrishiSakhaApp = () => {
  const [language, setLanguage] = useState("en");

  return <Dashboard language={language} onLanguageChange={setLanguage} />;
};
