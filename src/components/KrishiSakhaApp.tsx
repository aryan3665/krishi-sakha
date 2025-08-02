import { useState } from "react";
import { QueryInput } from "./QueryInput";
import { AdviceCard } from "./AdviceCard";
import { QueryHistory } from "./QueryHistory";
import { BottomNavigation } from "./BottomNavigation";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, Leaf, Sun, History as HistoryIcon, HelpCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTranslation, getStringTranslation } from "@/utils/translations";

interface HistoryItem {
  id: string;
  query: string;
  advice: string;
  language: string;
  timestamp: Date;
  source: string;
}

export const KrishiSakhaApp = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAdvice, setCurrentAdvice] = useState<{
    advice: string;
    explanation: string;
    source: string;
  } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  // Mock AI advice generation
  const generateAdvice = async (query: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock responses based on query keywords
    const mockAdvice = getMockAdvice(query);
    
    setCurrentAdvice(mockAdvice);
    
    // Add to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      query,
      advice: mockAdvice.advice,
      language,
      timestamp: new Date(),
      source: mockAdvice.source,
    };
    
    setHistory(prev => [historyItem, ...prev]);
    setIsLoading(false);
    
    toast({
      title: getStringTranslation(language, 'adviceGenerated'),
      description: getStringTranslation(language, 'adviceGeneratedDesc'),
    });
  };

  const getMockAdvice = (query: string) => {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes("wheat") || queryLower.includes("गेहूं")) {
      return {
        advice: "Use balanced NPK fertilizer (120:60:40 kg/ha) and ensure proper irrigation during grain filling stage.",
        explanation: "Wheat requires balanced nutrition for optimal yield. Nitrogen promotes vegetative growth, phosphorus helps root development, and potassium improves grain quality. Apply fertilizer in split doses and maintain soil moisture at 70-80% field capacity during critical growth stages.",
        source: "ICAR Guidelines"
      };
    }
    
    if (queryLower.includes("rice") || queryLower.includes("चावल")) {
      return {
        advice: "Plant rice during monsoon season (June-July) with 21-day old seedlings at 20cm x 15cm spacing.",
        explanation: "Rice planting timing is crucial for optimal yield. Monsoon provides natural irrigation, reducing costs. Young seedlings (21 days) have better survival rate and tillering capacity. Proper spacing ensures adequate nutrition and light penetration for healthy growth.",
        source: "Department of Agriculture"
      };
    }
    
    if (queryLower.includes("pest") || queryLower.includes("कीट")) {
      return {
        advice: "Use integrated pest management: neem oil spray (5ml/L) + yellow sticky traps + encourage beneficial insects.",
        explanation: "IPM approach reduces pesticide dependence while maintaining crop protection. Neem oil is eco-friendly and targets specific pests without harming beneficial insects. Yellow traps catch flying pests, while beneficial insects like ladybirds control aphids naturally.",
        source: "ICRISAT Research"
      };
    }
    
    return {
      advice: "Consider soil testing first, then apply organic matter and follow crop rotation for sustainable farming.",
      explanation: "Soil testing reveals nutrient deficiencies and pH levels, helping optimize fertilizer use. Organic matter improves soil structure, water retention, and microbial activity. Crop rotation breaks pest cycles and naturally replenishes soil nutrients.",
      source: "Agricultural Extension Service"
    };
  };

  const handleTranslate = (targetLang: string) => {
    toast({
      title: getStringTranslation(language, 'translationFeature'),
      description: getStringTranslation(language, 'translationDesc'),
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Welcome section */}
            <div className="text-center space-y-2 py-6 harvest-border p-6 mb-4 fertile-glow">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <Sprout className="h-10 w-10 text-primary animate-pulse" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-ping"></div>
                </div>
                <h1 className="text-3xl font-bold gradient-earth bg-clip-text text-transparent">
                  {getStringTranslation(language, 'appName')}
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {getStringTranslation(language, 'tagline')}
              </p>
            </div>

            {/* Query input */}
            <QueryInput
              onSubmit={generateAdvice}
              language={language}
              isLoading={isLoading}
            />

            {/* Current advice */}
            {currentAdvice && (
              <AdviceCard
                advice={currentAdvice.advice}
                explanation={currentAdvice.explanation}
                source={currentAdvice.source}
                language={language}
                onTranslate={handleTranslate}
              />
            )}

            {/* Recent activity */}
            {history.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-secondary" />
                    {getStringTranslation(language, 'recentActivity')}
                  </h3>
                  <div className="space-y-2">
                    {history.slice(0, 3).map((item) => (
                      <div key={item.id} className="text-sm border-l-2 border-accent/30 pl-3">
                        <p className="font-medium">{item.query}</p>
                        <p className="text-muted-foreground text-xs">{item.advice.slice(0, 80)}...</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "history":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              {getStringTranslation(language, 'queryHistory')}
            </h2>
            <QueryHistory history={history} onSelectQuery={generateAdvice} language={language} />
          </div>
        );

      case "help":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {getStringTranslation(language, 'helpTitle')}
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{getStringTranslation(language, 'howToUse')}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {(getTranslation(language, 'helpItems') as string[]).map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{getStringTranslation(language, 'exampleQuestions')}</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {(getTranslation(language, 'exampleItems') as string[]).map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {getStringTranslation(language, 'settingsTitle')}
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{getStringTranslation(language, 'language')}</h3>
                    <p className="text-sm text-muted-foreground">{getStringTranslation(language, 'languageDesc')}</p>
                  </div>
                  <LanguageSelector
                    selectedLanguage={language}
                    onLanguageChange={setLanguage}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{getStringTranslation(language, 'theme')}</h3>
                    <p className="text-sm text-muted-foreground">{getStringTranslation(language, 'themeDesc')}</p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-field">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border/50 crop-pattern">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sun className="h-6 w-6 text-accent animate-pulse" />
              <div className="absolute inset-0 h-6 w-6 text-accent opacity-50 animate-ping"></div>
            </div>
            <span className="font-semibold gradient-earth bg-clip-text text-transparent">Krishi Sakha</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector
              selectedLanguage={language}
              onLanguageChange={setLanguage}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pb-20 px-4 max-w-md mx-auto">
        <div className="py-4">
          {renderContent()}
        </div>
      </main>

      {/* Bottom navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
      />
    </div>
  );
};