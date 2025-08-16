import { useState } from "react";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  text: string;
  author: string;
  location: string;
  language: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    text: "किसान सखा ने मेरी गेहूं की फसल के लिए सबसे अच्छी कीमत मिलने में मदद की। बाजार की जानकारी हमेशा सटीक रहती है।",
    author: "राज सिंह",
    location: "पंजाब",
    language: "हिंदी",
    rating: 5
  },
  {
    id: "2", 
    text: "The weather predictions and pest alerts saved my cotton crop. This app is a game-changer for farmers like me.",
    author: "Meera Patel",
    location: "Gujarat",
    language: "English",
    rating: 5
  },
  {
    id: "3",
    text: "আমি আমার ধানের জন্য সরকারি প্রকল্পের তথ্য সহজেই পেয়ে যাই। কিষান সখা সত্যিই অসাধারণ।",
    author: "সুভাষ দাস",
    location: "পশ্চিমবঙ্গ",
    language: "বাংলা",
    rating: 5
  },
  {
    id: "4",
    text: "என் பருத்தி பயிருக்கு சரியான நேரத்தில் பூச்சி கட்டுப்பாடு பற்றிய ஆலோசனை கிடைத்தது। மிகவும் பயனுள்ளது.",
    author: "கிருஷ்ணன்",
    location: "தமிழ்நாடு", 
    language: "தமிழ்",
    rating: 5
  },
  {
    id: "5",
    text: "Real-time market data helps me decide when to sell my produce for maximum profit. Thank you Krishi Sakha!",
    author: "Arjun Reddy",
    location: "Telangana",
    language: "English",
    rating: 5
  },
  {
    id: "6",
    text: "मराठी भाषे��� प्रश्न विचारता येतो आणि तत्काळ उत्तर मिळते. शेतकऱ्यांसाठी खरोखर उपयुक्त ॲप.",
    author: "संजय पाटील",
    location: "महाराष्ट्र",
    language: "मराठी",
    rating: 5
  },
  {
    id: "7",
    text: "Weather alerts ne mere crops ko bachaya. AI advisor bhi bahut accurate hai, puri tarah se trusted source.",
    author: "Vikram Singh",
    location: "Haryana",
    language: "Hinglish",
    rating: 5
  },
  {
    id: "8",
    text: "ನನ್ನ ಸೋಯಾಬೀನ್ ಬೆಳೆಗೆ ಸಂಬಂಧಿಸಿದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಸಂಪೂರ್ಣ ಮಾಹಿತಿ ಸಿಗುತ್ತದೆ.",
    author: "ರಾಮೇಶ್ ಕುಮಾರ್",
    location: "ಕರ್ನಾಟಕ",
    language: "ಕನ್ನಡ",
    rating: 5
  },
  {
    id: "9",
    text: "Government scheme updates automatically milte rehte hain. Subsidy ke liye apply karna ab bahut aasan hai.",
    author: "Priya Sharma", 
    location: "Uttar Pradesh",
    language: "Hinglish",
    rating: 5
  },
  {
    id: "10",
    text: "ଆମର ଧାନ ଚାଷ ପାଇଁ ସଠିକ୍ ପାଗ ପୂର୍ବାନୁମାନ ଏବଂ ବଜାର ମୂଲ୍ୟ ଜାଣିବାରେ ସାହାଯ୍ୟ କରେ।",
    author: "ରାମ ଚନ୍ଦ୍ର ଦାସ",
    location: "ଓଡ଼ିଶା",
    language: "ଓଡ଼ିଆ",
    rating: 5
  }
];

export const TestimonialsMarquee = () => {
  const [isPaused, setIsPaused] = useState(false);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const testimonialElement = (testimonial: Testimonial, key: string) => (
    <div 
      key={key}
      className="flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-lg p-4 mx-3 max-w-md border border-green-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center mb-2">
        {renderStars(testimonial.rating)}
        <span className="ml-2 text-xs text-green-600 font-medium">{testimonial.language}</span>
      </div>
      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
        "{testimonial.text}"
      </p>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 font-semibold text-xs">
            {testimonial.author.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-medium text-xs text-gray-900">{testimonial.author}</p>
          <p className="text-xs text-gray-500">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-green-50 via-white to-green-50 py-8 overflow-hidden border-y border-green-100">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-green-800 mb-2">
          Trusted by Farmers Across India
        </h3>
        <p className="text-green-600">Real testimonials in real languages</p>
      </div>
      
      <div 
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main marquee container */}
        <div className="flex">
          {/* First set of testimonials */}
          <div 
            className={`flex animate-marquee ${isPaused ? 'animation-paused' : ''}`}
            style={{
              animationDuration: '60s'
            }}
          >
            {testimonials.map((testimonial) => 
              testimonialElement(testimonial, `main-${testimonial.id}`)
            )}
          </div>
          
          {/* Duplicate set for seamless loop */}
          <div 
            className={`flex animate-marquee ${isPaused ? 'animation-paused' : ''}`}
            style={{
              animationDuration: '60s'
            }}
          >
            {testimonials.map((testimonial) => 
              testimonialElement(testimonial, `duplicate-${testimonial.id}`)
            )}
          </div>
        </div>

        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-green-50 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-green-50 to-transparent pointer-events-none z-10" />
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div className="text-center mt-4">
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
            Paused - Move cursor away to continue
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-marquee {
          animation: marquee linear infinite;
        }

        .animation-paused {
          animation-play-state: paused;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
