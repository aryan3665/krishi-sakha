import { useState } from "react";
import { QueryInput } from "./QueryInput";
import { AdviceCard } from "./AdviceCard";
import { EnhancedAdviceCard } from "./EnhancedAdviceCard";
import { OfflineStatus } from "./OfflineStatus";
import { SourceReference } from "@/services/ragSystem";
import { QueryHistory } from "./QueryHistory";
import { BottomNavigation } from "./BottomNavigation";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, Leaf, Sun, History as HistoryIcon, HelpCircle, Settings, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTranslation, getStringTranslation } from "@/utils/translations";
import { useAuth } from "@/hooks/useAuth";
import { useQueries } from "@/hooks/useQueries";
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
  const [currentAdvice, setCurrentAdvice] = useState<{
    advice: string;
    explanation: string;
    source: string;
    sources?: SourceReference[];
    confidence?: number;
    factualBasis?: 'high' | 'medium' | 'low';
    generatedContent?: string[];
    disclaimer?: string;
  } | null>(null);
  const { user, signOut } = useAuth();
  const { queries, loading, submitQuery, deleteQuery } = useQueries();
  const { toast } = useToast();

  // Generate advice and store in database
  const generateAdvice = async (query: string) => {
    try {
      const result = await submitQuery(query, language);
      if (result) {
        setCurrentAdvice({
          advice: result.advice,
          explanation: result.explanation || "",
          source: "Krishi Sakha AI",
          sources: result.sources || [],
          confidence: result.confidence || 0.5,
          factualBasis: result.factual_basis || 'medium',
          generatedContent: [],
          disclaimer: result.explanation?.includes('factual basis') ? result.explanation : undefined
        });
      }
    } catch (error) {
      console.error('Error generating advice:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };
  const handleTranslate = (targetLang: string) => {
    toast({
      title: getStringTranslation(language, 'translationFeature'),
      description: getStringTranslation(language, 'translationDesc')
    });
  };
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <div className="space-y-6">
            {/* Welcome section */}
            <div className="text-center space-y-4 py-8 mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="relative">
                  <Sprout className="h-12 w-12 text-primary" />
                  
                </div>
                <h1 className="text-4xl font-bold gradient-earth bg-clip-text text-transparent">
                  {getStringTranslation(language, 'appName')}
                </h1>
              </div>
              <p className="text-muted-foreground text-xl font-medium">
                {getStringTranslation(language, 'tagline')}
              </p>
            </div>

            {/* Spacer for visual depth */}
            <div className="h-16"></div>

            {/* Welcome message with user name */}
            {user && (
              <div className="glass-card p-4 rounded-xl mb-6 text-center">
                <p className="text-lg font-medium text-green-700">
                  Welcome, {user.user_metadata?.full_name || user.email}! 
                </p>
                <p className="text-sm text-muted-foreground">
                  Ask any farming question below.
                </p>
              </div>
            )}

            {/* Query input - positioned lower */}
            <div className="glass-card p-6 rounded-2xl mb-8">
              <QueryInput onSubmit={generateAdvice} language={language} isLoading={loading} />
            </div>

            {/* Current advice */}
            {currentAdvice && (
              currentAdvice.sources && currentAdvice.sources.length > 0 ? (
                <EnhancedAdviceCard
                  advice={currentAdvice.advice}
                  sources={currentAdvice.sources}
                  confidence={currentAdvice.confidence || 0.5}
                  factualBasis={currentAdvice.factualBasis || 'medium'}
                  generatedContent={currentAdvice.generatedContent || []}
                  disclaimer={currentAdvice.disclaimer}
                  language={language}
                  onTranslate={handleTranslate}
                />
              ) : (
                <AdviceCard
                  advice={currentAdvice.advice}
                  explanation={currentAdvice.explanation}
                  source={currentAdvice.source}
                  language={language}
                  onTranslate={handleTranslate}
                />
              )
            )}

            {/* Recent activity */}
            {queries.length > 0 && <div className="glass-card p-6 rounded-2xl shadow-soft">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                  <Leaf className="h-5 w-5 text-secondary" />
                  {getStringTranslation(language, 'recentActivity')}
                </h3>
                <div className="space-y-3">
                  {queries.slice(0, 3).map(query => <div key={query.id} className="text-sm border-l-3 border-accent/40 pl-4 py-2">
                      <p className="font-medium text-foreground">{query.query_text}</p>
                      <p className="text-muted-foreground text-xs mt-1">{query.advice.slice(0, 80)}...</p>
                    </div>)}
                </div>
              </div>}
          </div>;
      case "history":
        return <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              {getStringTranslation(language, 'queryHistory')}
            </h2>
            <div className="space-y-4">
              {queries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No queries yet. Start by asking a question!</p>
                </div>
              ) : (
                queries.map(query => (
                  <Card key={query.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">{query.query_text}</p>
                          {query.original_query_text && query.original_query_text !== query.query_text && (
                            <p className="text-xs text-muted-foreground italic mt-1">
                              Original: {query.original_query_text}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {query.language} • {query.detected_language ? `Detected: ${query.detected_language} • ` : ''}
                            {new Date(query.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm">{query.advice}</p>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteQuery(query.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>;
      case "help":
        return <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {getStringTranslation(language, 'helpTitle')}
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{getStringTranslation(language, 'howToUse')}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {(getTranslation(language, 'helpItems') as string[]).map((item, index) => <li key={index}>• {item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{getStringTranslation(language, 'exampleQuestions')}</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {(getTranslation(language, 'exampleItems') as string[]).map((item, index) => <li key={index}>• {item}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>;
      case "settings":
        return <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {getStringTranslation(language, 'settingsTitle')}
            </h2>
            
            {/* User Profile Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-10 w-10 p-2 bg-green-100 text-green-600 rounded-full" />
                  <div>
                    <h3 className="font-semibold">{user?.user_metadata?.full_name || "User"}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* App Settings Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{getStringTranslation(language, 'language')}</h3>
                    <p className="text-sm text-muted-foreground">{getStringTranslation(language, 'languageDesc')}</p>
                  </div>
                  <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} />
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

            {/* Offline Status Card */}
            <OfflineStatus />
          </div>;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-gradient-field">
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
            {/* User Profile Display */}
            {user && (
              <div className="flex items-center gap-2 mr-2">
                <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2 py-1">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary truncate max-w-16">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 w-8 p-1 text-muted-foreground hover:text-destructive"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
            <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} />
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
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} language={language} />
    </div>;
};
