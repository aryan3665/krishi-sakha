import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Square, 
  SkipForward,
  TestTube,
  Languages,
  Target,
  TrendingUp,
  Database,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { DEMO_SCENARIOS, DEMO_METRICS, TestScenario } from "@/demo/testScenarios";
import { useToast } from "@/hooks/use-toast";

interface DemoControllerProps {
  onRunScenario: (query: string, language: string) => Promise<void>;
  isLoading: boolean;
}

export const DemoController = ({ onRunScenario, isLoading }: DemoControllerProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentScenario, setCurrentScenario] = useState<TestScenario | null>(null);
  const [runningDemo, setRunningDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [testResults, setTestResults] = useState<{ [key: string]: 'pass' | 'fail' | 'running' }>({});
  const { toast } = useToast();

  const getFilteredScenarios = (): TestScenario[] => {
    return DEMO_SCENARIOS.filter(scenario => {
      const categoryMatch = selectedCategory === 'all' || scenario.category === selectedCategory;
      const languageMatch = selectedLanguage === 'all' || scenario.language === selectedLanguage;
      const difficultyMatch = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;
      return categoryMatch && languageMatch && difficultyMatch;
    });
  };

  const runSingleScenario = async (scenario: TestScenario) => {
    setCurrentScenario(scenario);
    setTestResults(prev => ({ ...prev, [scenario.id]: 'running' }));
    
    try {
      await onRunScenario(scenario.query, scenario.language);
      setTestResults(prev => ({ ...prev, [scenario.id]: 'pass' }));
      toast({
        title: "Scenario completed",
        description: `"${scenario.title}" executed successfully`,
      });
    } catch (error) {
      setTestResults(prev => ({ ...prev, [scenario.id]: 'fail' }));
      toast({
        title: "Scenario failed",
        description: `"${scenario.title}" encountered an error`,
        variant: "destructive"
      });
    }
  };

  const runDemoSuite = async () => {
    setRunningDemo(true);
    setDemoProgress(0);
    
    const scenarios = getFilteredScenarios();
    const total = scenarios.length;
    
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      await runSingleScenario(scenario);
      setDemoProgress(((i + 1) / total) * 100);
      
      // Small delay between scenarios for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setRunningDemo(false);
    setCurrentScenario(null);
    
    toast({
      title: "Demo suite completed",
      description: `Ran ${total} test scenarios successfully`,
    });
  };

  const getStatusIcon = (scenarioId: string) => {
    const status = testResults[scenarioId];
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weather': return '🌤️';
      case 'market': return '💰';
      case 'advisory': return '📋';
      case 'soil': return '🌱';
      case 'scheme': return '🏛️';
      case 'multi-domain': return '🔄';
      default: return '📊';
    }
  };

  const filteredScenarios = getFilteredScenarios();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Demo Controller
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test agricultural AI system with predefined scenarios
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
            <TabsTrigger value="metrics">Demo Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-3 gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="weather">Weather</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="advisory">Advisory</SelectItem>
                  <SelectItem value="soil">Soil</SelectItem>
                  <SelectItem value="scheme">Schemes</SelectItem>
                  <SelectItem value="multi-domain">Multi-domain</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="complex">Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Demo Controls */}
            <div className="flex gap-2">
              <Button 
                onClick={runDemoSuite}
                disabled={runningDemo || isLoading || filteredScenarios.length === 0}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Demo Suite ({filteredScenarios.length})
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setTestResults({})}
                disabled={runningDemo || isLoading}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            {runningDemo && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Demo Progress</span>
                  <span>{Math.round(demoProgress)}%</span>
                </div>
                <Progress value={demoProgress} />
                {currentScenario && (
                  <p className="text-xs text-muted-foreground">
                    Running: {currentScenario.title}
                  </p>
                )}
              </div>
            )}

            {/* Scenario List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredScenarios.map((scenario) => (
                <Card key={scenario.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(scenario.category)}</span>
                        <h4 className="font-medium text-sm">{scenario.title}</h4>
                        {getStatusIcon(scenario.id)}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {scenario.description}
                      </p>
                      
                      <div className="bg-muted/50 p-2 rounded text-xs">
                        "{scenario.query}"
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Languages className="h-3 w-3 mr-1" />
                          {scenario.language.toUpperCase()}
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {scenario.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runSingleScenario(scenario)}
                      disabled={runningDemo || isLoading || testResults[scenario.id] === 'running'}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">Total Scenarios</h4>
                </div>
                <p className="text-2xl font-bold">{DEMO_METRICS.totalScenarios}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium">Languages</h4>
                </div>
                <div className="text-sm space-y-1">
                  <div>English: {DEMO_METRICS.byLanguage.english}</div>
                  <div>Hindi: {DEMO_METRICS.byLanguage.hindi}</div>
                </div>
              </Card>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">By Category</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(DEMO_METRICS.byCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between">
                    <span className="capitalize">{category}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">By Difficulty</h4>
              <div className="space-y-2">
                {Object.entries(DEMO_METRICS.byDifficulty).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex justify-between text-sm">
                    <span className="capitalize">{difficulty}:</span>
                    <Badge className={getDifficultyColor(difficulty)}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
