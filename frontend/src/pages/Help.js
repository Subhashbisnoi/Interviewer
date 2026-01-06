import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Mail, MessageCircle } from 'lucide-react';


const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      question: 'How does AI Interviewer work?',
      answer: 'AI Interviewer uses advanced artificial intelligence to simulate real interview scenarios. You upload your resume, select the job role and company, and our AI generates relevant interview questions. You can answer via voice or text, and receive detailed feedback on your performance.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, absolutely! We take data security seriously. Your resume, answers, and personal information are encrypted and stored securely. We never share your data with third parties without your explicit consent.'
    },
    {
      question: 'Can I practice for specific companies?',
      answer: 'Yes! When starting an interview, you can specify both the role and the company you\'re interviewing for. Our AI will research the company and generate questions that are relevant to that specific organization\'s interview style and culture.'
    },
    {
      question: 'How accurate is the AI feedback?',
      answer: 'Our AI has been trained on thousands of real interview scenarios and best practices from top recruiters. While it provides highly accurate and helpful feedback, we recommend using it as a practice tool alongside other preparation methods.'
    },
    {
      question: 'Can I retake interviews?',
      answer: 'Absolutely! You can practice as many times as you want. Each session generates new questions and provides fresh feedback to help you improve continuously.'
    },
    {
      question: 'Do I need a webcam?',
      answer: 'A webcam is optional but recommended for the full experience. The video feed helps simulate a real interview environment, making your practice more realistic and effective.'
    },
    {
      question: 'What file formats are supported for resume upload?',
      answer: 'Currently, we support PDF format for resume uploads. Make sure your PDF is text-based (not scanned images) for best results in text extraction.'
    },
    {
      question: 'How is my performance scored?',
      answer: 'Each answer is evaluated based on multiple criteria including relevance, clarity, depth, and communication skills. You receive both individual question scores and an overall performance score with detailed feedback.'
    },
    {
      question: 'Can I use this on mobile devices?',
      answer: 'Yes! Our platform is fully responsive and works on mobile devices, tablets, and desktops. However, for the best experience, we recommend using a desktop or laptop with a webcam.'
    },
    {
      question: 'Is there a limit to how many interviews I can do?',
      answer: 'Free users can practice with a limited number of interviews per month. Premium users get unlimited access to all features. Check our pricing page for more details.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Find answers to common questions and get the help you need
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-left font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No results found. Try a different search term.</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="mb-6">
            Can't find what you're looking for? Our support team is here to help you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="mailto:support@aiinterviewer.com"
              className="flex items-center space-x-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
            >
              <Mail className="h-6 w-6" />
              <div>
                <div className="font-semibold">Email Support</div>
                <div className="text-sm opacity-90">support@aiinterviewer.com</div>
              </div>
            </a>
            <button className="flex items-center space-x-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all">
              <MessageCircle className="h-6 w-6" />
              <div>
                <div className="font-semibold">Live Chat</div>
                <div className="text-sm opacity-90">Available 24/7</div>
              </div>
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Help;
