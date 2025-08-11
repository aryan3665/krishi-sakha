import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  BookOpen,
  Lightbulb,
  Globe,
  Wifi,
  Shield,
  Target,
  Sparkles,
  MessageCircle,
  Volume2,
  Eye,
  Star,
  MapPin,
  TrendingUp
} from "lucide-react";

interface DemoModeHandlerProps {
  onRunExample: (query: string, language: string) => Promise<void>;
  isLoading: boolean;
  language: string;
}

export const DemoModeHandler = ({ onRunExample, isLoading, language }: DemoModeHandlerProps) => {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const isHindi = language === 'hi';

  const systemOverview = isHindi ? [
    "🌍 बहुभाषी सलाह - हिंदी, अंग्रेजी और हिंग्लिश समर्थन",
    "🤖 एजेंटिक AI - लाइव डेटा के साथ स्वचालित सलाह",
    "🔍 पारदर्शी स्रोत - विश्वसनीयता स्कोर के साथ",
    "📱 ऑफलाइन तैयार - कम कनेक्टिविटी में भी काम करता है",
    "🇮🇳 भारतीय कृषि के लिए विशेष रूप से तैयार"
  ] : [
    "🌍 Multilingual advice - Hindi, English & Hinglish support",
    "🤖 Agentic AI with live data retrieval from trusted sources",
    "🔍 Transparent sources with confidence scores & citations",
    "📱 Offline-ready caching for low-connectivity areas",
    "🇮🇳 Tailored specifically for Indian agriculture"
  ];

  const userGuide = isHindi ? {
    title: "���पयोग गाइड",
    items: [
      "💬 **प्रश्न पूछें**: टेक्स्ट या वॉइस में अपना कृषि प्रश्न पूछें",
      "📊 **प���िणाम पढ़ें**: इमोजी और स्रोत बैज के साथ संरचित उत्तर",
      "⭐ **विश्वसनीयता समझें**: उच्च/मध्यम/निम्न स्कोर देखें", 
      "📱 **ऑफलाइन मोड**: कैश्ड डेटा से पुराने उत्तर देखें",
      "💾 **सेव करें**: हिस्ट्री में महत्वपूर्ण सलाह सेव करें"
    ]
  } : {
    title: "User Guide",
    items: [
      "💬 **Ask Questions**: Type or speak your farming query naturally",
      "📊 **Read Results**: Structured answers with emojis & source badges",
      "⭐ **Understand Confidence**: High/Medium/Low reliability scores",
      "📱 **Use Offline**: Access cached responses when connectivity is poor",
      "💾 **Save Queries**: Important advice is automatically saved in history"
    ]
  };

  const exampleQueries = [
    {
      id: 'weather_simple',
      category: isHindi ? 'मौसम' : 'Weather',
      query: isHindi ? 'पंजाब में गेहूं की बुआई के लिए मौसम कैसा है?' : 'How is the weather for wheat sowing in Punjab?',
      language: language,
      difficulty: 'Simple',
      icon: '🌦️'
    },
    {
      id: 'market_hindi',
      category: isHindi ? 'बाजार' : 'Market',
      query: isHindi ? 'हरियाणा में धान के दाम क्या चल रहे हैं?' : 'What are the current rice prices in Haryana?',
      language: language,
      difficulty: 'Simple',
      icon: '💰'
    },
    {
      id: 'advisory_complex',
      category: isHindi ? 'सलाह' : 'Advisory',
      query: isHindi ? 'गुजरात में कपास की फसल को कीटों से कैसे बचाएं?' : 'How to protect cotton crop from pests in Gujarat?',
      language: language,
      difficulty: 'Medium',
      icon: '🐛'
    },
    {
      id: 'multi_domain',
      category: isHindi ? 'मल्टी-डोमेन' : 'Multi-domain',
      query: isHindi ? 'मध्य प्रदेश में सोयाबीन के लिए मौसम, मिट्टी और बाजा�� की जानकारी दें' : 'Provide weather, soil and market information for soybean in Madhya Pradesh',
      language: language,
      difficulty: 'Complex',
      icon: '🔄'
    },
    {
      id: 'scheme_info',
      category: isHindi ? 'योजना' : 'Schemes',
      query: isHindi ? 'छोटे किसानों के लिए सरकारी योजनाएं क्या हैं?' : 'What government schemes are available for small farmers?',
      language: language,
      difficulty: 'Medium',
      icon: '📜'
    }
  ];

  const runExample = async (example: any) => {
    setSelectedExample(example.id);
    try {
      await onRunExample(example.query, example.language);
    } finally {
      setSelectedExample(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {isHindi ? '🌾 कृषि सखा AI डेमो मोड' : '🌾 Krishi Sakha AI Demo Mode'}
        </h3>
        <p className="text-sm text-blue-800">
          {isHindi ?
            'यह एक व्यापक कृषि सलाहकार सिस्टम का डेमो है। नीचे सिस्टम ओवरव्यू और उपयोग गाइड देखें।' :
            'This is a demo of a comprehensive agricultural advisory system. Please review the system overview and user guide below.'
          }
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📜 {isHindi ? 'परिचय' : 'Overview'}</TabsTrigger>
          <TabsTrigger value="guide">📖 {isHindi ? 'गाइड' : 'Guide'}</TabsTrigger>
          <TabsTrigger value="demo">🎥 {isHindi ? 'डेमो' : 'Demo'}</TabsTrigger>
          <TabsTrigger value="notes">🔍 {isHindi ? 'नोट्स' : 'Notes'}</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {isHindi ? 'कृषि सखा AI सिस्टम' : 'Krishi Sakha AI System'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {isHindi ? 
                  'एक एजेंटिक AI सिस्टम जो भारतीय किसानों को वास्तविक समय के डेटा के साथ व्यापक कृषि सलाह प्रदान करता है।' :
                  'An agentic AI system providing comprehensive agricultural advisory to Indian farmers with real-time data integration.'
                }
              </p>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {isHindi ? 'मुख्य विशेषताएं' : 'Key Features'}
                </h4>
                <ul className="space-y-2">
                  {systemOverview.map((feature, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <Globe className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-800">
                    {isHindi ? '6+ डेटा स्रोत' : '6+ Data Sources'}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Shield className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-blue-800">
                    {isHindi ? 'पारदर्शी AI' : 'Transparent AI'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Guide Tab */}
        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {userGuide.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {userGuide.items.map((item, index) => (
                  <li key={index} className="text-sm">
                    {item}
                  </li>
                ))}
              </ul>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {isHindi ? 'विश्वसनीयता स्कोर समझें' : 'Understanding Confidence Scores'}
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                    <div className="font-medium text-green-800">{isHindi ? 'उच्च' : 'High'}</div>
                    <div className="text-green-600">85-95%</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                    <div className="font-medium text-yellow-800">{isHindi ? 'मध्यम' : 'Medium'}</div>
                    <div className="text-yellow-600">60-84%</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                    <div className="font-medium text-red-800">{isHindi ? 'निम्न' : 'Low'}</div>
                    <div className="text-red-600">30-59%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                {isHindi ? 'लाइव डेमो उदाहरण' : 'Live Demo Examples'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {isHindi ? 
                  'नीचे दिए गए उदाहरणों को चलाकर सिस्टम की क्षम���ाओं को देखें:' :
                  'Run the examples below to see the system capabilities in action:'
                }
              </p>

              <div className="space-y-3">
                {exampleQueries.map((example, index) => (
                  <Card key={example.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{example.icon}</span>
                          <Badge variant="outline" className="text-xs">
                            {example.category}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(example.difficulty)}`}>
                            {example.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="bg-muted/50 p-3 rounded text-sm">
                          "{example.query}"
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => runExample(example)}
                        disabled={isLoading || selectedExample === example.id}
                        className="flex-shrink-0"
                      >
                        {selectedExample === example.id ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            <span className="ml-1">{isHindi ? 'चल रहा' : 'Running'}</span>
                          </div>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            {isHindi ? 'चलाएं' : 'Run'}
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                {isHindi ? 'डेमो नोट्स' : 'Demo Notes'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  {isHindi ? 'सिम्युलेटेड डेटा' : 'Simulated Data'}
                </h4>
                <p className="text-sm text-blue-800">
                  {isHindi ? 
                    'यह डेमो वास्तविक भा��तीय कृषि परिस्थितियों का प्रतिनिधित्व करने वाले सिम्युलेटेड डेटा का उपयोग करता है। उत्पादन में, यह वास्तविक सरकारी APIs और डेटासेट से जुड़ेगा।' :
                    'This demo uses simulated data that represents realistic Indian agricultural scenarios. In production, this would connect to actual government APIs and datasets.'
                  }
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">{isHindi ? 'डेटा स्रोत' : 'Data Sources'}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">🌦️ {isHindi ? 'मौसम' : 'Weather'}</div>
                    <div className="text-muted-foreground">IMD, OpenWeather</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">💰 {isHindi ? 'बाजार' : 'Market'}</div>
                    <div className="text-muted-foreground">AGMARKNET</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">🌱 {isHindi ? 'मिट्टी' : 'Soil'}</div>
                    <div className="text-muted-foreground">Soil Health Card</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">📜 {isHindi ? 'योजनाएं' : 'Schemes'}</div>
                    <div className="text-muted-foreground">PM-KISAN, Others</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {isHindi ? 'प्रोडक्शन रेडी' : 'Production Ready'}
                </h4>
                <p className="text-sm text-green-800">
                  {isHindi ? 
                    'सिस्टम आर्किटेक्चर प्रोडक्शन के लिए तैयार है। वास्तविक API एंडपॉइंट्स, प्रमाणीकरण और डेटा सत्यापन जोड़ना आवश्यक है।' :
                    'The system architecture is production-ready. Real API endpoints, authentication, and data validation need to be added.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
