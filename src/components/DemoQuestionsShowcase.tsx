import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Cloud, 
  TrendingUp, 
  Sprout, 
  FileText,
  Copy,
  Play
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { demoQuestionHandler, DemoQuestion } from '@/services/demoQuestionHandler';

interface DemoQuestionsShowcaseProps {
  onQuestionSelect: (question: string) => void;
  className?: string;
}

export const DemoQuestionsShowcase = ({ onQuestionSelect, className = "" }: DemoQuestionsShowcaseProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const { toast } = useToast();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weather': return <Cloud className="h-4 w-4" />;
      case 'market': return <TrendingUp className="h-4 w-4" />;
      case 'farming': return <Sprout className="h-4 w-4" />;
      case 'government': return <FileText className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weather': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'market': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'farming': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'government': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleQuestionCopy = (question: string) => {
    navigator.clipboard.writeText(question);
    toast({
      title: "Question Copied",
      description: "You can now paste this question in the chat",
    });
  };

  const handleQuestionTry = (question: string) => {
    onQuestionSelect(question);
    toast({
      title: "Question Selected",
      description: "The demo question has been sent",
    });
  };

  const renderQuestionCard = (demoQuestion: DemoQuestion, index: number) => (
    <Card key={index} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {getCategoryIcon(demoQuestion.category)}
            <Badge className={`text-xs ${getCategoryColor(demoQuestion.category)}`}>
              {demoQuestion.category}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs">
            {(demoQuestion.confidence * 100).toFixed(0)}% accuracy
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Question */}
        <div>
          <h4 className="font-medium text-sm mb-2">Demo Question:</h4>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
            <p className="text-sm font-mono">{demoQuestion.patterns[0]}</p>
          </div>
        </div>

        {/* Expected Answer */}
        <div>
          <h4 className="font-medium text-sm mb-2">Expected Answer:</h4>
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 dark:text-green-200">{demoQuestion.answer}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQuestionCopy(demoQuestion.patterns[0])}
            className="flex items-center gap-1"
          >
            <Copy className="h-3 w-3" />
            Copy
          </Button>
          <Button 
            size="sm"
            onClick={() => handleQuestionTry(demoQuestion.patterns[0])}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
          >
            <Play className="h-3 w-3" />
            Try Now
          </Button>
        </div>

        {/* Alternative Patterns */}
        {demoQuestion.patterns.length > 1 && (
          <div>
            <h4 className="font-medium text-xs mb-2 text-gray-600 dark:text-gray-400">
              Alternative phrasings ({demoQuestion.patterns.length - 1}):
            </h4>
            <div className="space-y-1">
              {demoQuestion.patterns.slice(1, 3).map((pattern, i) => (
                <div key={i} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  {pattern}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const englishQuestions = demoQuestionHandler.getDemoQuestionsByLanguage('en');
  const hindiQuestions = demoQuestionHandler.getDemoQuestionsByLanguage('hi');

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Demo Questions
          </CardTitle>
          <CardDescription>
            Try these predefined questions to see how Krishi Sakha responds with accurate agricultural information
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as 'en' | 'hi')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="en" className="flex items-center gap-2">
                🇬🇧 English ({englishQuestions.length})
              </TabsTrigger>
              <TabsTrigger value="hi" className="flex items-center gap-2">
                🇮🇳 हिंदी ({hindiQuestions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="en" className="space-y-4">
              <div className="grid gap-4">
                {englishQuestions.map((question, index) => renderQuestionCard(question, index))}
              </div>
            </TabsContent>

            <TabsContent value="hi" className="space-y-4">
              <div className="grid gap-4">
                {hindiQuestions.map((question, index) => renderQuestionCard(question, index))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Usage Instructions */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to use:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Click "Try Now" to automatically send the question</li>
              <li>• Click "Copy" to copy the question and paste it manually</li>
              <li>• You can also type similar questions - the system will recognize variations</li>
              <li>• Each question demonstrates different categories: weather, market prices, farming advice, and government schemes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
