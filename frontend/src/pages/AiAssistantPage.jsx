import { useState } from 'react';
import { Bot, Send, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { sendChatMessage } from '../api/aiApi';

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'user',
      text: 'is shirt ki price kya hai?',
    },
    {
      sender: 'assistant',
      text: 'Yeh shirt ki price Rs. 1,200 hai.',
    },
    {
      sender: 'user',
      text: 'Delivery kitne din mein hogi?',
    },
    {
      sender: 'assistant',
      text: 'Delivery usually 3-5 working days mein hoti hai. Aapka location ke hisab se time thoda kam ya zyada ho sakta hai.',
    },
  ]);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const handleSend = async (customQuery) => {
    const query = customQuery || input;
    if (!query || !query.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query.trim() }]);
    setInput('');
    setTyping(true);

    try {
      const data = await sendChatMessage(query.trim());
      setMessages((prev) => [...prev, { sender: 'assistant', text: data.reply, product: data.product }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Maazrat, abhi connection issue hai. Delivery usually 3-5 working days mein hoti hai.',
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([
      { sender: 'user', text: 'is shirt ki price kya hai?' },
      { sender: 'assistant', text: 'Yeh shirt ki price Rs. 1,200 hai.' },
      { sender: 'user', text: 'Delivery kitne din mein hogi?' },
      {
        sender: 'assistant',
        text: 'Delivery usually 3-5 working days mein hoti hai. Aapka location ke hisab se time thoda kam ya zyada ho sakta hai.',
      },
    ]);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            AI Assistant (Customer Simulator)
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Test how the AI assistant responds to customer inquiries about your products and policies
          </p>
        </div>

        <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
          <RefreshCw size={14} /> Reset Chat
        </button>
      </div>

      {/* Screen 8 Chat Window */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              AI Assistant
            </h3>
            <p style={{ fontSize: '0.775rem', color: '#64748b' }}>
              Ask anything about our products, delivery or orders.
            </p>
          </div>
        </div>

        {/* Chat Stream */}
        <div
          style={{
            minHeight: '380px',
            maxHeight: '480px',
            overflowY: 'auto',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={15} />
                  </div>
                )}

                <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderRadius: isUser ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      backgroundColor: isUser ? '#4f46e5' : '#ffffff',
                      color: isUser ? '#ffffff' : '#1e293b',
                      fontSize: '0.925rem',
                      lineHeight: 1.45,
                      boxShadow: isUser
                        ? '0 2px 8px rgba(79, 70, 229, 0.3)'
                        : '0 1px 4px rgba(0, 0, 0, 0.05)',
                      border: isUser ? 'none' : '1px solid #e2e8f0',
                    }}
                  >
                    {m.text}
                  </div>

                  {m.product && (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '130px',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc',
                          overflow: 'hidden',
                          marginBottom: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={m.product.image}
                          alt={m.product.title}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{m.product.title}</span>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#4f46e5' }}>Rs. {m.product.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {typing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={15} />
              </div>
              <div style={{ padding: '0.6rem 1rem', borderRadius: '16px', backgroundColor: '#ffffff', fontSize: '0.85rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                AI is typing...
              </div>
            </div>
          )}
        </div>

        {/* Preset Chips */}
        <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            'is shirt ki price kya hai?',
            'Delivery kitne din mein hogi?',
            'Delivery charges kitne hain?',
            'Watch ki price kya hai?',
            'Cash on delivery available hai?',
          ].map((ch, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(ch)}
              style={{
                fontSize: '0.775rem',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                border: '1px solid #e2e8f0',
              }}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.925rem',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: input.trim() ? '#4f46e5' : '#cbd5e1',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: input.trim() ? '0 4px 10px rgba(79, 70, 229, 0.4)' : 'none',
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
        Yeh AI chatbot customer ke aam sawalon ke jawab dega. Jaise price, delivery, availability etc.
      </p>
    </div>
  );
}
