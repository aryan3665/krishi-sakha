import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Play, TestTube } from 'lucide-react';
import { demoQuestionHandler } from '@/services/demoQuestionHandler';

interface TestResult {
  question: string;
  expectedAnswer: string;
  actualAnswer: string | null;
  matched: boolean;
  confidence: number;
  similarity: number;
}

export const DemoQuestionsTest = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testQuestions = [
    'What is the weather forecast for Pune tomorrow?',
    'What is today\'s wholesale price of potatoes in Delhi mandi?',
    'धान की अच्छी पैदावार के लिए कौन-सी खाद डालनी चाहिए?',
    'प्रधानमंत्री किसान सम्मान निधि योजना का लाभ कैसे लिया जा सकता है?',
    'when should i plant tomatoes?'
  ];

  const expectedAnswers = [
    'Tomorrow in Pune: Partly cloudy, max 31°C, min 24°C, with a 40% chance of light rain.',
    'The average wholesale price of potatoes in Delhi\'s Azadpur mandi is around ₹18–22 per kg.',
    'धान के लिए यूरिया, डीएपी और पोटाश का संतुलित प्रयोग करें। साथ ही, गोबर की खाद या कम्पोस्ट डालना मिट्टी की उर्वरता बढ़ाता है।',
    'किसान भाई pmkisan.gov.in वेबसाइट या नजदीकी CSC केंद्र पर जाकर आधार और बैंक खाता विवरण दर्ज करके योजना का लाभ ले सकते हैं।',
    'The best time to plant tomatoes is during the rabi season (October-November) or summer season (January-February), depending on your region. Ensure soil temperature is above 15°C for optimal germination.'
  ];

  const runTests = () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    testQuestions.forEach((question, index) => {
      const response = demoQuestionHandler.getDemoResponse(question);
      const matched = response !== null && response.answer === expectedAnswers[index];
      
      // Get match details for debugging
      const matchDetails = demoQuestionHandler.findMatchingQuestion(question);
      
      results.push({
        question,
        expectedAnswer: expectedAnswers[index],
        actualAnswer: response?.answer || null,
        matched,
        confidence: response?.confidence || 0,
        similarity: matchDetails?.similarity || 0
      });
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const testSingleQuestion = (question: string, expectedAnswer: string) => {
    const response = demoQuestionHandler.getDemoResponse(question);
    console.log('Testing:', question);
    console.log('Expected:', expectedAnswer);
    console.log('Got:', response?.answer || 'No match');
    console.log('Confidence:', response?.confidence || 0);
    console.log('---');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          Demo Questions Test Suite
        </CardTitle>
        <CardDescription>
          Test all 5 predefined demo questions to ensure they return the exact expected answers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex gap-4">
          <Button 
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setTestResults([])}
          >
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <Separator />
            
            {/* Summary */}
            <div className="flex gap-4">
              <Badge className="bg-green-100 text-green-800">
                Passed: {testResults.filter(r => r.matched).length}
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                Failed: {testResults.filter(r => !r.matched).length}
              </Badge>
              <Badge variant="outline">
                Total: {testResults.length}
              </Badge>
            </div>

            {/* Individual Results */}
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card key={index} className={`border-l-4 ${
                  result.matched ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {result.matched ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        Test {index + 1}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Confidence: {(result.confidence * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="outline">
                          Similarity: {(result.similarity * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Question */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Question:</h4>
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border">
                        <p className="text-sm">{result.question}</p>
                      </div>
                    </div>

                    {/* Expected Answer */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Expected Answer:</h4>
                      <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200">
                        <p className="text-sm text-green-800 dark:text-green-200">{result.expectedAnswer}</p>
                      </div>
                    </div>

                    {/* Actual Answer */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Actual Answer:</h4>
                      <div className={`p-3 rounded border ${
                        result.matched 
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200' 
                          : 'bg-red-50 dark:bg-red-950/20 border-red-200'
                      }`}>
                        <p className={`text-sm ${
                          result.matched 
                            ? 'text-green-800 dark:text-green-200' 
                            : 'text-red-800 dark:text-red-200'
                        }`}>
                          {result.actualAnswer || 'No matching response found'}
                        </p>
                      </div>
                    </div>

                    {/* Debug Single Test */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => testSingleQuestion(result.question, result.expectedAnswer)}
                    >
                      Debug in Console
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Test Instructions:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Click "Run All Tests" to test all 5 demo questions</li>
            <li>• Each test verifies that the exact expected answer is returned</li>
            <li>• Confidence and similarity scores help debug matching issues</li>
            <li>• Use "Debug in Console" to see detailed matching information</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
