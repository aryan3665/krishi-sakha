import { 
  Smartphone, 
  BarChart3, 
  Cloud, 
  MessageSquare, 
  Bell, 
  TrendingUp,
  Calendar,
  Shield,
  Globe,
  Mic,
  Search,
  History,
  ArrowRight,
  CheckCircle,
  Star,
  MapPin
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const AppFunctionalityShowcase = () => {
  const features = [
    {
      icon: Smartphone,
      title: "Multi-Language Voice Queries",
      description: "Ask questions in Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati and 8+ more languages",
      demo: "मेरी ग��हूं की फसल के लिए आज का भाव क्या है?",
      badges: ["Voice Input", "12+ Languages", "Instant Response"],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Live Mandi Price Dashboard",
      description: "Real-time commodity prices from AGMARKNET, eNAM, and NCDEX markets",
      demo: "Wheat: ₹2,150/quintal ↗️ (+5.2%)",
      badges: ["Live Data", "All Major Mandis", "Price Trends"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: Cloud,
      title: "Weather & Climate Alerts",
      description: "IMD weather forecasts, rainfall predictions, and farming-specific alerts",
      demo: "⛈️ Heavy rain expected. Delay pesticide spray by 2 days.",
      badges: ["IMD Data", "7-Day Forecast", "Smart Alerts"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Shield,
      title: "Pest & Disease Control",
      description: "AI-powered pest identification and government-approved treatment recommendations",
      demo: "Brown plant hopper detected. Apply Neem oil spray.",
      badges: ["AI Detection", "Organic Solutions", "Expert Advice"],
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Bell,
      title: "Government Scheme Updates",
      description: "Latest agricultural schemes, subsidies, and application deadlines",
      demo: "PM-KISAN installment of ₹2,000 credited to account.",
      badges: ["Auto Updates", "Easy Application", "Status Tracking"],
      color: "from-red-500 to-red-600"
    },
    {
      icon: History,
      title: "Query History & Analytics",
      description: "Track your farming queries and get personalized insights over time",
      demo: "Your cotton yield improved by 15% this season!",
      badges: ["Personal Insights", "Progress Tracking", "Smart Analysis"],
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="h-4 w-4" />
            App Features in Action
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            See Krishi Sakha in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real screenshots and live demos of how farmers across India are using our AI-powered platform to make smarter farming decisions.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden">
              <CardContent className="p-0">
                {/* Feature Header with Gradient */}
                <div className={`bg-gradient-to-r ${feature.color} p-6 text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                      <p className="text-white/90 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>

                {/* Demo Content */}
                <div className="p-6">
                  {/* Demo Mockup */}
                  <div className="bg-gray-900 rounded-lg p-4 mb-4 font-mono text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-400 text-xs ml-2">Krishi Sakha Dashboard</span>
                    </div>
                    <div className="text-green-400">
                      <span className="text-gray-500">farmer@krishisakha:~$</span> {feature.demo}
                    </div>
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {feature.badges.map((badge, badgeIndex) => (
                      <Badge 
                        key={badgeIndex} 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>

                  {/* Try It Button */}
                  <Button 
                    size="sm" 
                    className="w-full group-hover:bg-green-600 transition-colors"
                  >
                    Try This Feature
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Real Usage Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Real Impact, Real Numbers
            </h3>
            <p className="text-gray-600">How farmers are benefiting from Krishi Sakha</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">25%</div>
              <div className="text-sm text-gray-600">Average yield increase</div>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">1M+</div>
              <div className="text-sm text-gray-600">Queries answered</div>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">500+</div>
              <div className="text-sm text-gray-600">Districts covered</div>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">95%</div>
              <div className="text-sm text-gray-600">Accuracy rate</div>
            </div>
          </div>
        </div>

        {/* Mobile App Preview */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white overflow-hidden relative">
          <div className="relative z-10">
            <div className="max-w-2xl">
              <h3 className="text-3xl font-bold mb-4">
                Available on All Devices
              </h3>
              <p className="text-green-100 text-lg mb-6">
                Access Krishi Sakha on your smartphone, tablet, or computer. Works offline and syncs when connected.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Mobile App
                </Button>
                <Button variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
                  <Globe className="mr-2 h-5 w-5" />
                  Web Portal
                </Button>
              </div>
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute top-0 right-0 opacity-10">
            <Smartphone className="h-48 w-48 text-white transform rotate-12" />
          </div>
        </div>
      </div>
    </section>
  );
};
