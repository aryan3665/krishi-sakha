import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sprout,
  Cloud,
  TrendingUp,
  Shield,
  MessageSquare,
  BarChart3,
  Leaf,
  Sun,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle,
  Star
} from "lucide-react";
import { TestimonialsMarquee } from "./TestimonialsMarquee";
import { AppFunctionalityShowcase } from "./AppFunctionalityShowcase";
import { WorkflowSteps } from "./WorkflowSteps";
import { DetailedFooter } from "./DetailedFooter";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

interface LandingPageProps {
  onGetStarted: () => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

export const LandingPage = ({ onGetStarted, language = "en", onLanguageChange = () => {} }: LandingPageProps) => {
  const [currentLanguage, setCurrentLanguage] = useState(language);

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    onLanguageChange(newLanguage);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Logo and Brand */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <Sprout className="h-16 w-16 text-green-600" />
                <Sun className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-green-800 mb-2">
                  Krishi Sakha
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg text-green-600 font-medium">AI-Powered Agricultural Advisor</span>
                  <Leaf className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Empowering Indian Farmers with{" "}
                <span className="text-green-600">Data-Driven Advice</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Get instant, reliable agricultural guidance in your language. From crop prices to weather forecasts, 
                pest control to government schemes - everything you need for smarter farming decisions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                onClick={onGetStarted}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 text-lg"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mt-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Government Data</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-500" />
                <span>12+ Languages</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Farming
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access real-time agricultural data and AI-powered insights to make informed decisions about your crops.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Live Market Prices</h4>
                <p className="text-gray-600">
                  Get real-time mandi prices from AGMARKNET, eNAM, and NCDEX for informed selling decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Weather Insights</h4>
                <p className="text-gray-600">
                  Access IMD weather data and forecasts to plan your farming activities and protect your crops.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Pest & Disease Control</h4>
                <p className="text-gray-600">
                  Get expert advice on pest management and disease prevention with government-backed solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Voice & Text Queries</h4>
                <p className="text-gray-600">
                  Ask questions in your local language using voice or text - get instant, personalized responses.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Government Schemes</h4>
                <p className="text-gray-600">
                  Stay updated with the latest agricultural schemes, subsidies, and support programs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Mobile Optimized</h4>
                <p className="text-gray-600">
                  Access all features on your smartphone with a fast, responsive interface designed for farmers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* App Functionality Showcase */}
      <AppFunctionalityShowcase />

      {/* Workflow Steps */}
      <WorkflowSteps />

      {/* Animated Testimonials Marquee */}
      <TestimonialsMarquee />

      {/* Final CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Start Your Smart Farming Journey Today
          </h3>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of farmers who are already using Krishi Sakha to make better farming decisions.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 text-lg font-semibold shadow-lg"
            onClick={onGetStarted}
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-green-200 text-sm mt-4">
            No credit card required • Free forever • Available in 12+ languages
          </p>
        </div>
      </section>

      {/* Detailed Footer */}
      <DetailedFooter language={currentLanguage} onLanguageChange={handleLanguageChange} />
    </div>
  );
};
