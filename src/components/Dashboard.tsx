import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sprout, 
  Sun, 
  TrendingUp, 
  Cloud, 
  Bell, 
  Search,
  Menu,
  X,
  Home,
  History,
  Settings,
  HelpCircle,
  LogOut,
  User,
  BarChart3,
  Leaf,
  Shield,
  Calendar,
  MapPin
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { QueryInput } from "./QueryInput";
import { useQueries } from "@/hooks/useQueries";
import { systemInitializer } from '@/services/initializeRealTimeSystem';

// Lazy load components for better performance
const AdviceCard = lazy(() => import("./AdviceCard").then(module => ({ default: module.AdviceCard })));
const EnhancedAdviceCard = lazy(() => import("./EnhancedAdviceCard").then(module => ({ default: module.EnhancedAdviceCard })));
const QueryHistory = lazy(() => import("./QueryHistory").then(module => ({ default: module.QueryHistory })));
const RealTimeDataDashboard = lazy(() => import("./RealTimeDataDashboard").then(module => ({ default: module.RealTimeDataDashboard })));

interface DashboardProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const Dashboard = ({ language, onLanguageChange }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentAdvice, setCurrentAdvice] = useState<any>(null);
  const { user, signOut } = useAuth();
  const { queries, loading, submitQuery } = useQueries();
  const { toast } = useToast();

  // Initialize real-time system when dashboard loads (gracefully)
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('🚀 Checking real-time agricultural data system status...');
        // Only check status, don't force initialization
        const status = await systemInitializer.getQuickStatus();
        console.log('📊 System status:', status);
      } catch (error) {
        console.warn('⚠️ Real-time system not yet available:', error);
        // Don't show error to user, just log it
      }
    };

    // Delay to let the app settle first
    const timeoutId = setTimeout(initializeSystem, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

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
      toast({
        title: "Error",
        description: "Failed to generate advice. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Transform Query[] to HistoryItem[] for QueryHistory component
  const transformQueriesToHistory = (queries: any[]) => {
    return queries.map(query => ({
      id: query.id,
      query: query.query_text,
      advice: query.advice,
      language: query.language,
      timestamp: new Date(query.created_at),
      source: "Krishi Sakha AI",
      originalQuery: query.original_query_text,
      translatedQuery: query.translated_query_text,
      detectedLanguage: query.detected_language,
      geminiValidated: query.gemini_validated,
      confidence: query.confidence,
      factualBasis: query.factual_basis
    }));
  };

  // Handle selecting query from history
  const handleSelectQuery = (query: string) => {
    generateAdvice(query);
    setActiveTab("home"); // Switch to home tab to show the result
    toast({
      title: "Query selected",
      description: "Generating advice for selected query...",
    });
  };

  const sidebarItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "realtime", label: "Real-Time Data", icon: BarChart3 },
    { id: "history", label: "Query History", icon: History },
    { id: "help", label: "Help & Guide", icon: HelpCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderMainContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Sprout className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-800">
                    Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || 'Farmer'}!
                  </h2>
                  <p className="text-green-600">
                    Ready to get agricultural insights? Ask your question below.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Market Trends</p>
                      <p className="text-2xl font-bold text-green-600">↗️ 5.2%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Cloud className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Weather</p>
                      <p className="text-2xl font-bold text-blue-600">28°C</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Alerts</p>
                      <p className="text-2xl font-bold text-yellow-600">3 New</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Queries</p>
                      <p className="text-2xl font-bold text-purple-600">{queries.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Query Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Ask Krishi Sakha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QueryInput
                  onSubmit={generateAdvice}
                  language={language}
                  isLoading={loading}
                  onLanguageDetected={(detectedLang) => {
                    if (detectedLang !== language) {
                      toast({
                        title: "🗣️ Language Detected",
                        description: `Detected: ${detectedLang.toUpperCase()}. Query processed in detected language.`,
                      });
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Current Advice Display */}
            {currentAdvice && (
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>}>
                {currentAdvice.sources && currentAdvice.sources.length > 0 ? (
                  <EnhancedAdviceCard
                    advice={currentAdvice.advice}
                    sources={currentAdvice.sources}
                    confidence={currentAdvice.confidence || 0.5}
                    factualBasis={currentAdvice.factualBasis || 'medium'}
                    generatedContent={currentAdvice.generatedContent || []}
                    disclaimer={currentAdvice.disclaimer}
                    language={language}
                    onTranslate={(lang) => toast({ title: "Translation", description: "Feature coming soon!" })}
                  />
                ) : (
                  <AdviceCard
                    advice={currentAdvice.advice}
                    explanation={currentAdvice.explanation}
                    source={currentAdvice.source}
                    language={language}
                    onTranslate={(lang) => toast({ title: "Translation", description: "Feature coming soon!" })}
                  />
                )}
              </Suspense>
            )}

            {/* Recent Activity */}
            {queries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {queries.slice(0, 3).map(query => (
                      <div key={query.id} className="border-l-2 border-green-200 pl-4 py-2">
                        <p className="font-medium text-sm">{query.query_text}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(query.created_at).toLocaleDateString()} • {query.language}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "realtime":
        return (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>}>
            <RealTimeDataDashboard />
          </Suspense>
        );

      case "history":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Query History</h2>
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>}>
              <QueryHistory
                history={transformQueriesToHistory(queries)}
                onSelectQuery={handleSelectQuery}
                language={language}
              />
            </Suspense>
          </div>
        );

      case "help":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Help & Guide</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>How to Use Krishi Sakha</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Getting Started</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Ask questions in any Indian language</li>
                      <li>Use voice input for hands-free querying</li>
                      <li>Get real-time market prices and weather data</li>
                      <li>Access government schemes information</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Example Questions</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>"What are wheat prices in Punjab today?"</li>
                      <li>"Weather forecast for the next 7 days"</li>
                      <li>"How to control aphids in cotton crop?"</li>
                      <li>"Government schemes for small farmers"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-10 w-10 p-2 bg-green-100 text-green-600 rounded-full" />
                    <div>
                      <h3 className="font-semibold">{user?.user_metadata?.full_name || "User"}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Language</h4>
                      <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                    </div>
                    <LanguageSelector selectedLanguage={language} onLanguageChange={onLanguageChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Theme</h4>
                      <p className="text-sm text-muted-foreground">Toggle dark/light mode</p>
                    </div>
                    <ThemeToggle />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
          {/* Left Side - Logo and Menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sprout className="h-8 w-8 text-green-600" />
                <Sun className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-green-800">Krishi Sakha</h1>
                <p className="text-xs text-green-600">Agricultural AI Assistant</p>
              </div>
            </div>
          </div>

          {/* Center - App Title */}
          <div className="hidden md:flex flex-1 justify-center">
            <h2 className="text-lg font-semibold text-green-800">AI-Powered Agricultural Advisor</h2>
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
            
            <LanguageSelector selectedLanguage={language} onLanguageChange={onLanguageChange} />
            <ThemeToggle />
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user?.user_metadata?.full_name?.split(' ')[0] || 'Farmer'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:sticky lg:top-16 inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r transition-transform duration-200 ease-in-out h-screen lg:h-[calc(100vh-4rem)]
        `}>
          <div className="flex items-center justify-between p-4 lg:hidden">
            <span className="font-semibold text-green-800">Navigation</span>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === item.id ? 'bg-green-600 text-white' : 'text-gray-700'}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Quick Actions in Sidebar */}
          <div className="p-4 mt-auto">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800 mb-2">Quick Tips</h4>
                <p className="text-xs text-green-600">
                  Ask about weather, prices, or pest control for instant AI-powered advice.
                </p>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-h-screen">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};
