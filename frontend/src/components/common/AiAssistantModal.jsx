import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, ShoppingBag, Check } from 'lucide-react';
import { sendChatMessage } from '../../api/aiApi';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';

export default function AiAssistantModal({ isOpen = true, onClose }) {
  const { addToCart } = useCart();
  const [addedProductId, setAddedProductId] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your AI Store Assistant. Ask me about product prices, delivery, Cash on Delivery, or order tracking. I can reply in English or Urdu.',
    },
  ]);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Lock background body scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query || !query.trim()) return;

    const userMsg = { sender: 'user', text: query.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const data = await sendChatMessage(query.trim());
      const botMsg = {
        sender: 'assistant',
        text: data.reply,
        product: data.product, // Product with photo and details if matched
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I could not connect right now. Please try again.',
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleAddProductFromChat = (prod) => {
    addToCart(prod, 1);
    setAddedProductId(prod._id || prod.title);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  const quickChips = [
    'What is the price of the shirt?',
    'How long does delivery take?',
    'Show me shoes',
    'What are the delivery charges?',
    'Is Cash on Delivery available?',
    'Track order #10024',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      {/* Right-Side Drawer Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          backgroundColor: '#ffffff',
          boxShadow: '-8px 0 35px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)',
              }}
            >
              <Bot size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15 }}>
                AI Assistant
              </h3>
              <p style={{ fontSize: '0.775rem', color: '#64748b' }}>
                Ask in English or Urdu and I will reply in the same language.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Assistant"
            style={{
              background: '#f1f5f9',
              color: '#64748b',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
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
                      marginTop: '4px',
                    }}
                  >
                    <Bot size={15} />
                  </div>
                )}

                <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Chat Text Bubble */}
                  <div
                    style={{
                      padding: '0.75rem 1.1rem',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
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

                  {/* Photo Card sent to customer if product matches */}
                  {m.product && (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                        marginTop: '0.25rem',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '140px',
                          borderRadius: '8px',
                          backgroundColor: '#f3f4f6',
                          overflow: 'hidden',
                          marginBottom: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={m.product.image}
                          alt={m.product.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: '6px',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                          {m.product.title}
                        </h4>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4f46e5' }}>
                          {formatCurrency(m.product.price)}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginBottom: '0.65rem' }}>
                        ✓ In Stock ({m.product.stock || 10} available)
                      </p>

                      <button
                        onClick={() => handleAddProductFromChat(m.product)}
                        className="btn btn-sm"
                        style={{
                          width: '100%',
                          padding: '0.45rem',
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          backgroundColor: addedProductId === (m.product._id || m.product.title) ? '#10b981' : '#4f46e5',
                          color: '#ffffff',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {addedProductId === (m.product._id || m.product.title) ? (
                          <>
                            <Check size={14} /> Added to Cart!
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={14} /> Add to Cart
                          </>
                        )}
                      </button>
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
              <div
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                }}
              >
                AI Assistant is typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '0.55rem 1rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {quickChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              style={{
                fontSize: '0.75rem',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontWeight: 600,
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Bottom Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1.15rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              fontSize: '0.925rem',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: input.trim() ? '#4f46e5' : '#cbd5e1',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              boxShadow: input.trim() ? '0 4px 10px rgba(79, 70, 229, 0.4)' : 'none',
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
