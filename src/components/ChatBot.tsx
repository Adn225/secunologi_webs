import React, { useState, useCallback } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Bonjour ! Je suis votre assistant SecunologieCI. Comment puis-je vous aider aujourd\'hui ?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickReplies = [
    'Demander un devis',
    'Voir les produits',
    'Service technique',
    'Horaires d\'ouverture'
  ];

  const handleSendMessage = useCallback((messageText?: string) => {
    const text = messageText ?? inputText;
    if (!text.trim()) return;

    setMessages(prev => {
      const newMessage = {
        id: prev.length + 1,
        text,
        isBot: false,
        timestamp: new Date()
      };
      return [...prev, newMessage];
    });
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: getBotResponse(text),
          isBot: true,
          timestamp: new Date()
        }
      ]);
    }, 1000);
  }, [inputText]);

  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('devis')) {
      return 'Pour obtenir un devis personnalisé, vous pouvez remplir notre formulaire de contact ou appeler directement au +225 07 123 456 78.';
    } else if (lowerMessage.includes('produit')) {
      return 'Nous proposons une large gamme de produits Hikvision, Huawei et EZVIZ : caméras IP, NVR, interphones, alarmes. Consultez notre catalogue !';
    } else if (lowerMessage.includes('horaire')) {
      return 'Nos horaires : Lundi-Vendredi 8h-18h, Samedi 8h-13h. Notre support technique est disponible 24/7.';
    } else if (lowerMessage.includes('installation')) {
      return 'Nos techniciens certifiés assurent l\'installation complète de vos équipements avec garantie. Contactez-nous pour planifier votre intervention.';
    } else {
      return 'Je vous remercie pour votre message. Pour une assistance personnalisée, n\'hésitez pas à contacter notre équipe au +225 07 123 456 78 ou par email à contact@securologieci.com.';
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-brand-green-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-green-700 transition-colors z-50 animate-pulse"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-brand-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              <span className="font-semibold">Assistant SecunologieCI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.isBot
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-brand-green-600 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Réponses rapides :</p>
                <div className="space-y-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="w-full text-left text-sm px-3 py-2 bg-brand-green-50 hover:bg-brand-green-100 rounded text-brand-green-600 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="bg-brand-green-600 text-white px-3 py-2 rounded-lg hover:bg-brand-green-700 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
