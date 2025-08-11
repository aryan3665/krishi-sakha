# Krishi Sakha AI - Agricultural Advisory System Demo Guide

## 🌾 Overview

Krishi Sakha AI is a comprehensive agricultural advisory system that demonstrates Retrieval-Augmented Generation (RAG) capabilities with real-time data integration for Indian farmers. The system combines multiple agricultural data sources to provide grounded, factual advice.

## 🚀 Key Features Demonstrated

### 1. **Multi-Source Data Integration**
- **Weather Data**: Real-time weather information and forecasts
- **Market Prices**: Live mandi prices from agricultural markets
- **Agricultural Advisories**: Expert recommendations and alerts
- **Soil Health**: Soil testing data and nutrient information
- **Government Schemes**: Information about subsidies and programs

### 2. **Retrieval-Augmented Generation (RAG)**
- Queries are grounded with real-time data from verified sources
- AI responses include confidence scores and factual basis ratings
- Clear distinction between verified data and generated content
- Source citations and data freshness indicators

### 3. **Multi-Language Support**
- **English**: Primary language for agricultural queries
- **Hindi**: Full support including Devanagari script
- **Hinglish**: Mixed Hindi-English queries
- Automatic language detection and query preprocessing

### 4. **Offline Capabilities**
- Intelligent caching system for low-connectivity scenarios
- Offline fallback responses when internet is unavailable
- Cache management and cleanup utilities
- Progressive enhancement based on connectivity

### 5. **Explainable AI**
- Transparent AI decision-making process
- Source attribution for all factual claims
- Confidence scoring and reliability indicators
- Visual distinction between data-backed and generated content

## 📱 Demo Navigation

### Home Tab
- **Primary Interface**: Query input and AI response display
- **Features Demonstrated**:
  - Multi-language query processing
  - Real-time data retrieval
  - Enhanced advice cards with source citations
  - Confidence scoring and factual basis indicators

### History Tab
- **Query Management**: View past queries and responses
- **Features Demonstrated**:
  - Query persistence and management
  - Language detection results
  - Response metadata and sources

### Demo Tab (🧪)
- **Testing Suite**: Comprehensive test scenarios
- **Features Demonstrated**:
  - 16+ predefined test scenarios
  - Multi-domain query testing
  - Language and difficulty filtering
  - Automated demo suite execution

### Settings Tab
- **System Configuration**: Language, theme, and offline status
- **Features Demonstrated**:
  - Offline status monitoring
  - Cache management utilities
  - Connection status indicators
  - Cache statistics and cleanup

## 🧪 Test Scenarios

### Simple Scenarios (Beginner)
1. **Basic Weather Query**: "What is the weather forecast for farming in Punjab this week?"
2. **Market Price Query**: "What are the current wheat prices in Haryana mandis?"
3. **Location-less Query**: "What is the best time to plant maize?"

### Medium Scenarios (Intermediate)
4. **Crop Advisory**: "What should I do to protect my cotton crop from pests in Gujarat?"
5. **Soil Health**: "What fertilizer should I use for rice cultivation in West Bengal?"
6. **Government Schemes**: "What government schemes are available for small farmers in Rajasthan?"
7. **Seasonal Planning**: "What crops should I prepare for the upcoming rabi season in Bihar?"

### Complex Scenarios (Advanced)
8. **Multi-domain Decision**: "Given the current weather and market prices, should I harvest my wheat crop in Punjab now?"
9. **Investment Planning**: "I have 5 acres in Maharashtra. Considering soil health, weather patterns, and market trends, what crops should I plant this kharif season?"
10. **Comprehensive Advisory**: "मध्य प्रदेश में सोयाबीन की खेती के लिए मौसम, मिट्टी की जांच और बाजार भाव देखकर सुझाव दें।"

### Edge Cases
11. **Vague Query**: "My crops are not doing well. What should I do?"
12. **Hinglish Query**: "Meri wheat crop mein fungal attack ho gaya hai, kya treatment karu?"
13. **Hindi Query**: "खरीफ सीजन की तैयारी के लिए क्या करना चाहिए?"

## 📊 Data Sources Demonstrated

### Primary Sources
- **Indian Meteorological Department**: Weather data and forecasts
- **AGMARKNET**: Real-time mandi prices
- **Kisan Call Center**: Agricultural advisories
- **Soil Health Card Program**: Soil testing data
- **PM-KISAN & Other Schemes**: Government program information

### Mock Data Implementation
*Note: The demo uses simulated data that represents realistic Indian agricultural scenarios. In production, these would connect to actual government APIs and datasets.*

## 🔧 Technical Features

### Query Preprocessing
- **Language Detection**: Automatic identification of Hindi, English, and Hinglish
- **Context Extraction**: Location, crop, season, and query type identification
- **Spell Correction**: Agriculture-specific term corrections
- **Transliteration**: Hinglish to Hindi script conversion

### Data Retrieval Agents
- **Caching Strategy**: Intelligent caching with configurable expiry times
- **Error Handling**: Graceful degradation and fallback mechanisms
- **Data Normalization**: Consistent format across different sources
- **Confidence Scoring**: Reliability assessment for each data source

### RAG Implementation
- **Prompt Engineering**: Contextual prompts with factual grounding
- **Source Attribution**: Automatic citation generation
- **Hallucination Detection**: Identification of potentially generated content
- **Response Analysis**: Confidence scoring and factual basis assessment

### Offline System
- **Cache Management**: Automatic cleanup and size management
- **Offline Detection**: Real-time connectivity monitoring
- **Fallback Responses**: Basic advice when offline
- **Progressive Enhancement**: Feature adaptation based on connectivity

## 🎯 Demo Flow Recommendations

### 1. **Basic Functionality Demo** (5 minutes)
- Start with a simple English weather query
- Show enhanced advice card with sources
- Demonstrate source expansion and explainability features

### 2. **Multi-Language Demo** (3 minutes)
- Switch to Hindi interface
- Try a Hindi agricultural query
- Show language detection and processing

### 3. **Complex Query Demo** (5 minutes)
- Use a multi-domain query combining weather, market, and advisory
- Highlight multiple data sources in response
- Show confidence scoring and factual basis

### 4. **Offline Capabilities Demo** (3 minutes)
- Go to Settings > Offline Status
- Show cache statistics
- Simulate offline scenario (if possible)

### 5. **Automated Testing Demo** (5 minutes)
- Navigate to Demo tab
- Run filtered test scenarios
- Show automated suite execution

### 6. **Advanced Features Demo** (4 minutes)
- Demonstrate explainability features
- Show source citations and data freshness
- Highlight generated content detection

## 📈 Success Metrics

### Data Integration
- ✅ 6 different data source types integrated
- ✅ Real-time data retrieval and caching
- ✅ Source attribution for all responses
- ✅ Confidence scoring implementation

### Language Support
- ✅ English and Hindi full support
- ✅ Hinglish query processing
- ✅ Automatic language detection
- ✅ Script transliteration capabilities

### Offline Functionality
- ✅ Intelligent caching system
- ✅ Offline query fallback
- ✅ Cache management utilities
- ✅ Progressive enhancement

### AI Transparency
- ✅ Source citation for all facts
- ✅ Confidence scoring
- ✅ Generated content identification
- ✅ Explainable AI workflow

## 🚀 Production Readiness

### Required for Production
1. **API Integration**: Connect to actual government data APIs
2. **Authentication**: Implement proper user authentication
3. **Data Validation**: Enhanced data quality checks
4. **Performance Optimization**: Database indexing and caching strategies
5. **Monitoring**: Comprehensive logging and analytics

### Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_AGMARKNET_API_KEY=your_agmarknet_api_key
VITE_DATA_GOV_API_KEY=your_data_gov_api_key
```

## 🎓 Learning Outcomes

This demo showcases:
- **Retrieval-Augmented Generation** implementation
- **Multi-modal data integration** strategies
- **Offline-first** application design
- **Explainable AI** principles
- **Cross-lingual** natural language processing
- **Agricultural domain** expertise integration
- **Progressive enhancement** techniques
- **Data quality** and reliability assessment

## 🤝 Contributing

To extend this demo:
1. Add new data sources in `src/services/dataSources.ts`
2. Implement retrieval agents in `src/services/dataRetrieval.ts`
3. Create test scenarios in `src/demo/testScenarios.ts`
4. Enhance UI components for new data types

## 📞 Support

For technical questions or demo setup assistance, please refer to the Builder.io documentation or contact support through the platform interface.

---

**Built with ❤️ for Indian farmers using AI and real-time data**
