import { offlineAIService } from './offlineAIService';

export class OfflineSystemTester {
  
  async runTests(): Promise<void> {
    console.log('🧪 Testing Offline AI System...');
    
    const testQueries = [
      'What are onion prices today?',
      'How is the weather affecting my crops?',
      'Which fertilizer should I use for wheat?',
      'Help with pest control in cotton',
      'Government schemes for farmers',
      'Soil testing advice',
      'Best irrigation methods'
    ];

    for (const query of testQueries) {
      try {
        console.log(`\n📝 Testing: "${query}"`);
        const response = offlineAIService.generateResponse(query, 'en');
        const formatted = offlineAIService.formatStructuredResponse(response, query);
        
        console.log('✅ Success!');
        console.log(`Confidence: ${Math.round(response.confidence * 100)}%`);
        console.log(`Response length: ${formatted.length} characters`);
        console.log(`Preview: ${formatted.substring(0, 100)}...`);
      } catch (error) {
        console.error(`❌ Failed for query: "${query}"`, error);
      }
    }
    
    console.log('\n🎉 Offline system test completed!');
  }

  testHindiResponse(): void {
    console.log('\n🇮🇳 Testing Hindi response...');
    
    const response = offlineAIService.generateResponse('आलू की कीमत क्या है?', 'hi');
    const formatted = offlineAIService.formatStructuredResponse(response, 'आलू की कीमत क्या है?');
    
    console.log('Hindi Response:');
    console.log(formatted);
  }

  async testRealTimeIntegration(): Promise<void> {
    console.log('\n🔄 Testing Real-Time Integration with offline fallback...');
    
    try {
      // Import the real-time integration
      const { realTimeDataIntegration } = await import('./realTimeDataIntegration');
      
      const testQuery = {
        query: 'What are current onion prices in Delhi?',
        location: 'Delhi',
        crop: 'Onion',
        language: 'en'
      };
      
      const response = await realTimeDataIntegration.enhanceQueryWithRealTimeData(testQuery);
      
      console.log('✅ Real-time integration test successful!');
      console.log(`Confidence: ${Math.round(response.confidence * 100)}%`);
      console.log(`Factual Basis: ${response.factualBasis}`);
      console.log(`Response preview: ${response.answer.substring(0, 150)}...`);
      
    } catch (error) {
      console.error('❌ Real-time integration test failed:', error);
    }
  }
}

// Auto-run tests if this file is imported
export const offlineSystemTester = new OfflineSystemTester();

// Uncomment the next line to run tests immediately
// offlineSystemTester.runTests();
