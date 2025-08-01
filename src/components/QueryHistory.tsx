import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Clock, Filter } from "lucide-react";

interface HistoryItem {
  id: string;
  query: string;
  advice: string;
  language: string;
  timestamp: Date;
  source: string;
}

interface QueryHistoryProps {
  history: HistoryItem[];
  onSelectQuery: (query: string) => void;
}

const languageNames: Record<string, string> = {
  'en': '🇮🇳 EN',
  'hi': '🇮🇳 हि',
  'mr': '🇮🇳 मर',
  'bn': '🇮🇳 বা',
  'ta': '🇮🇳 த',
  'te': '🇮🇳 తె',
  'gu': '🇮🇳 ગુ',
  'pa': '🇮🇳 ਪੰ',
};

export const QueryHistory = ({ history, onSelectQuery }: QueryHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.advice.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = !languageFilter || item.language === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  const uniqueLanguages = Array.from(new Set(history.map(item => item.language)));

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(timestamp);
  };

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search your farming questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
        
        {uniqueLanguages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={languageFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguageFilter(null)}
              className="whitespace-nowrap"
            >
              <Filter className="h-3 w-3 mr-1" />
              All
            </Button>
            {uniqueLanguages.map((lang) => (
              <Button
                key={lang}
                variant={languageFilter === lang ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguageFilter(lang)}
                className="whitespace-nowrap"
              >
                {languageNames[lang] || lang}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* History items */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchTerm || languageFilter ? "No matching queries found" : "No farming questions asked yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((item) => (
            <Card key={item.id} className="transition-smooth hover:shadow-soft cursor-pointer" onClick={() => onSelectQuery(item.query)}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm leading-relaxed flex-1">{item.query}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {languageNames[item.language] || item.language}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.advice}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatTime(item.timestamp)}</span>
                    <span>{item.source}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};