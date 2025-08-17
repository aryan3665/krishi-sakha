import { 
  Sprout, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Facebook, 
  Twitter, 
  Youtube, 
  Instagram,
  ExternalLink,
  Leaf,
  Shield,
  HelpCircle,
  FileText,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "./LanguageSelector";

interface DetailedFooterProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const DetailedFooter = ({ language, onLanguageChange }: DetailedFooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sprout className="h-8 w-8 text-green-400" />
                <Leaf className="absolute -top-1 -right-1 h-3 w-3 text-green-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Krishi Sakha</h3>
                <p className="text-sm text-green-300">AI Agricultural Advisor</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Empowering Indian farmers with AI-powered agricultural insights, real-time market data, and expert guidance in 12+ regional languages.
            </p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300">Government Data Certified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2">
                  <ExternalLink className="h-3 w-3" />
                  How It Works
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Pricing (Free)
                </a>
              </li>
              <li>
                <a href="#api" className="text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Developer API
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Farming Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Help & Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#help" className="text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2">
                  <HelpCircle className="h-3 w-3" />
                  FAQ & Guides
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#tutorial" className="text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2">
                  <Youtube className="h-3 w-3" />
                  Video Tutorials
                </a>
              </li>
              <li>
                <a href="#community" className="text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Farmer Community
                </a>
              </li>
              <li>
                <a href="#feedback" className="text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Submit Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-4 w-4 text-green-400" />
                <div>
                  <p>support@krishisakha.ai</p>
                  <p className="text-xs text-gray-400">24/7 Support</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-4 w-4 text-green-400" />
                <div>
                  <p>+91-1800-KRISHI</p>
                  <p className="text-xs text-gray-400">Toll-free helpline</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="h-4 w-4 text-green-400" />
                <div>
                  <p>Agricultural Technology Hub</p>
                  <p className="text-xs text-gray-400">New Delhi, India</p>
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="pt-2">
              <label className="block text-sm text-gray-300 mb-2">Choose Language</label>
              <LanguageSelector 
                selectedLanguage={language} 
                onLanguageChange={onLanguageChange}
                variant="footer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Legal Links */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a href="#privacy" className="text-gray-400 hover:text-green-300 transition-colors">
              Privacy Policy
            </a>
            <span className="text-gray-600">•</span>
            <a href="#terms" className="text-gray-400 hover:text-green-300 transition-colors">
              Terms of Service
            </a>
            <span className="text-gray-600">•</span>
            <a href="#cookies" className="text-gray-400 hover:text-green-300 transition-colors">
              Cookie Policy
            </a>
            <span className="text-gray-600">•</span>
            <a href="#disclaimer" className="text-gray-400 hover:text-green-300 transition-colors">
              Disclaimer
            </a>
          </div>

          {/* Social Media */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Follow us:</span>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-green-300">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-green-300">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-green-300">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-green-300">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} Krishi Sakha AI. All rights reserved. 
            <span className="text-green-300 ml-2">Made with ❤️ for Indian Farmers</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Powered by Government of India's Agricultural Data Initiative
          </p>
        </div>
      </div>
    </footer>
  );
};
