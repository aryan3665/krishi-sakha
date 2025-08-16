import { 
  Mic, 
  Search, 
  Brain, 
  CheckCircle, 
  ArrowRight, 
  MessageSquare,
  Smartphone,
  Database,
  Sparkles,
  Download,
  History,
  Share
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const WorkflowSteps = () => {
  const workflowSteps = [
    {
      step: 1,
      title: "Ask Your Question",
      subtitle: "Voice or Text, Any Language",
      description: "Type or speak your farming question in Hindi, English, Bengali, Tamil, or any of 12+ Indian languages. Our AI understands regional dialects and farming terminology.",
      icon: MessageSquare,
      demoText: "मेरी कपास की फसल में सफेद मक्खी का प्रकोप है, क्या करूं?",
      features: ["12+ Languages", "Voice Recognition", "Text Input", "Context Understanding"],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      step: 2,
      title: "Real-Time Data Fetch",
      subtitle: "AI Searches Multiple Sources",
      description: "Our AI instantly searches government databases (AGMARKNET, IMD), market data (eNAM, NCDEX), and expert knowledge bases to find the most relevant and current information.",
      icon: Database,
      demoText: "Fetching: Market prices, Weather data, Pest control methods, Government schemes...",
      features: ["Government APIs", "Live Market Data", "Weather Services", "Expert Knowledge"],
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      step: 3,
      title: "AI Processing & Analysis", 
      subtitle: "Intelligent Summarization",
      description: "Advanced AI analyzes all data sources, considers your location and crop type, then generates personalized, actionable advice with confidence scores and source citations.",
      icon: Brain,
      demoText: "Processing 15 data sources... Generating personalized advice... Fact-checking...",
      features: ["AI Analysis", "Personalization", "Fact Checking", "Confidence Scoring"],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      step: 4,
      title: "Get Instant Advice",
      subtitle: "Structured, Actionable Response",
      description: "Receive clear, structured advice in your language with step-by-step instructions, relevant prices, weather warnings, and links to government schemes.",
      icon: CheckCircle,
      demoText: "✅ Spray Neem oil solution (5ml/L) ⚠️ Apply before 10 AM 💰 Current cotton: ₹5,200/quintal",
      features: ["Clear Instructions", "Price Information", "Weather Alerts", "Scheme Links"],
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const additionalFeatures = [
    {
      icon: History,
      title: "Save to History",
      description: "All queries automatically saved for future reference"
    },
    {
      icon: Share,
      title: "Share with Others",
      description: "Share insights with fellow farmers in your community"
    },
    {
      icon: Download,
      title: "Download Reports",
      description: "Get PDF reports for record keeping and planning"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-white via-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Simple 4-Step Process
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            How Krishi Sakha Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From question to actionable advice in seconds. See how our AI-powered platform transforms your farming queries into expert guidance.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-8">
          {workflowSteps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {index < workflowSteps.length - 1 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-1 h-8 bg-gradient-to-b from-green-300 to-green-500 z-10"></div>
              )}

              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Content Side */}
                    <div className="flex-1 p-8">
                      <div className="flex items-start gap-6">
                        {/* Step Number & Icon */}
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-2xl font-bold mb-4`}>
                            {step.step}
                          </div>
                          <div className={`w-12 h-12 rounded-lg ${step.bgColor} flex items-center justify-center mx-auto`}>
                            <step.icon className="h-6 w-6 text-gray-700" />
                          </div>
                        </div>

                        {/* Step Content */}
                        <div className="flex-1">
                          <div className="mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">
                              {step.title}
                            </h3>
                            <p className="text-lg text-green-600 font-medium mb-3">
                              {step.subtitle}
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                              {step.description}
                            </p>
                          </div>

                          {/* Feature Badges */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {step.features.map((feature, featureIndex) => (
                              <Badge 
                                key={featureIndex}
                                variant="secondary"
                                className="bg-green-100 text-green-800 hover:bg-green-200"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>

                          {/* Demo Text */}
                          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-green-400 text-xs">Step {step.step} Demo</span>
                            </div>
                            <div className="text-green-300">
                              {step.demoText}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visual Side */}
                    <div className={`lg:w-80 ${step.bgColor} flex items-center justify-center p-8`}>
                      <div className="text-center">
                        <div className="relative">
                          <Smartphone className="h-32 w-32 text-gray-400 mx-auto mb-4" />
                          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                            <step.icon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          Interactive Demo Available
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Plus These Helpful Features
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Experience the Future of Farming?
            </h3>
            <p className="text-xl text-green-100 mb-6">
              Join thousands of farmers already using Krishi Sakha to make smarter decisions.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 text-lg font-semibold"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
