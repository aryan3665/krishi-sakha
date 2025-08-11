import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  AlertTriangle, 
  Info,
  MapPin,
  Clock,
  Database,
  Sparkles,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { getStringTranslation } from "@/utils/translations";
import { SourceReference } from "@/services/ragSystem";

interface EnhancedAdviceCardProps {
  advice: string;
  sources: SourceReference[];
  confidence: number;
  factualBasis: 'high' | 'medium' | 'low';
  generatedContent: string[];
  disclaimer?: string;
  language: string;
  onTranslate?: (targetLang: string) => void;
}

export const EnhancedAdviceCard = ({
  advice,
  sources,
  confidence,
  factualBasis,
  generatedContent,
  disclaimer,
  language,
  onTranslate
}: EnhancedAdviceCardProps) => {
  const [showSources, setShowSources] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showGeneratedContent, setShowGeneratedContent] = useState(false);

  const getFactualBasisColor = (basis: string) => {
    switch (basis) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFactualBasisIcon = (basis: string) => {
    switch (basis) {
      case 'high': return <CheckCircle2 className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return '🌤️';
      case 'market': return '💰';
      case 'advisory': return '📋';
      case 'soil': return '🌱';
      case 'scheme': return '🏛️';
      default: return '📊';
    }
  };

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'fresh': return 'text-green-600';
      case 'cached': return 'text-yellow-600';
      case 'stale': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Krishi Sakha AI Advice
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Confidence Score */}
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {(confidence * 100).toFixed(0)}%
            </Badge>
            
            {/* Factual Basis */}
            <Badge className={getFactualBasisColor(factualBasis)}>
              {getFactualBasisIcon(factualBasis)}
              <span className="ml-1 capitalize">{factualBasis}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Advice */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {advice}
          </p>
        </div>

        {/* Disclaimer */}
        {disclaimer && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">{disclaimer}</p>
          </div>
        )}

        {/* Data Sources Section */}
        <Collapsible open={showSources} onOpenChange={setShowSources}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Sources ({sources.length})
              </div>
              {showSources ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {sources.map((source, index) => (
            <Card key={index} className="p-3 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getSourceTypeIcon(source.type)}</span>
                    <h4 className="font-medium text-sm">{source.source}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {source.type}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    {source.citation}
                  </p>

                  {/* Show missing data notes transparently */}
                  {source.data?.missingDataNote && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                      <p className="text-xs text-yellow-800">
                        ⚠️ {source.data.missingDataNote}
                      </p>
                    </div>
                  )}

                  {/* Show data coverage status */}
                  {source.data?.coverage && (
                    <div className="mb-2">
                      <Badge variant="outline" className={`text-xs ${
                        source.data.coverage === 'complete' ? 'text-green-700 border-green-300' :
                        source.data.coverage === 'partial' ? 'text-yellow-700 border-yellow-300' :
                        'text-red-700 border-red-300'
                      }`}>
                        {source.data.coverage} data
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className={getFreshnessColor(source.freshness)}>
                        {source.freshness}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>{(source.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Generated Content Warning */}
        {generatedContent.length > 0 && (
          <Collapsible open={showGeneratedContent} onOpenChange={setShowGeneratedContent}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between text-yellow-700 border-yellow-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Potentially Generated Content ({generatedContent.length})
                </div>
                {showGeneratedContent ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 mb-2">
                  The following parts of the response may be based on general knowledge rather than current data:
                </p>
                {generatedContent.map((content, index) => (
                  <div key={index} className="text-sm bg-white p-2 rounded border-l-2 border-yellow-400">
                    "{content}"
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Explainability Section */}
        <Collapsible open={showExplanation} onOpenChange={setShowExplanation}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                How This Answer Was Generated
              </div>
              {showExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">AI Processing Steps:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Your query was analyzed to extract location, crop, and topic information</li>
                <li>Relevant data was retrieved from {sources.length} verified agricultural sources</li>
                <li>The AI combined this real-time data with agricultural expertise</li>
                <li>The response was validated for accuracy and marked with confidence levels</li>
                <li>Sources were cited and potentially uncertain content was flagged</li>
              </ol>
              
              <Separator className="my-3" />
              
              <div className="space-y-2">
                <h5 className="font-medium text-blue-900">Data Quality Assessment:</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Factual Basis:</span> {factualBasis}
                  </div>
                  <div>
                    <span className="font-medium">Confidence:</span> {(confidence * 100).toFixed(0)}%
                  </div>
                  <div>
                    <span className="font-medium">Fresh Sources:</span> {sources.filter(s => s.freshness === 'fresh').length}
                  </div>
                  <div>
                    <span className="font-medium">Total Sources:</span> {sources.length}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTranslate?.(language === 'en' ? 'hin' : 'en')}
            className="flex-1"
          >
            <span className="mr-2">🔄</span>
            {getStringTranslation(language, 'translate')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.share?.({
                title: 'Krishi Sakha AI Advice',
                text: advice
              }) || navigator.clipboard.writeText(advice);
            }}
            className="flex-1"
          >
            <span className="mr-2">📤</span>
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
