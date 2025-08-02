import { Button } from "@/components/ui/button";
import { Home, History, HelpCircle, Settings } from "lucide-react";
import { getStringTranslation } from "@/utils/translations";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: string;
}

const getNavItems = (language: string) => [
  { id: "home", label: getStringTranslation(language, 'home'), icon: Home },
  { id: "history", label: getStringTranslation(language, 'history'), icon: History },
  { id: "help", label: getStringTranslation(language, 'help'), icon: HelpCircle },
  { id: "settings", label: getStringTranslation(language, 'settings'), icon: Settings },
];

export const BottomNavigation = ({ activeTab, onTabChange, language }: BottomNavigationProps) => {
  const navItems = getNavItems(language);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border z-50">
      <nav className="flex items-center justify-around p-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 touch-target transition-smooth rounded-xl ${
                isActive ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.label}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-primary-foreground' : ''}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
};