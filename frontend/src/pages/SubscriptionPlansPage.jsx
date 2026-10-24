import { useState } from 'react';
import { Check, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionPlansPage() {
  const { user, updateUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || 'Starter');
  const [upgradedMsg, setUpgradedMsg] = useState('');

  const plans = [
    {
      name: 'Free',
      tagline: 'Try it out',
      features: ['Limited products (up to 5)', 'Basic orders management', 'Manual order updates'],
      buttonText: 'Get Started',
      isCurrent: selectedPlan === 'Free',
    },
    {
      name: 'Starter',
      tagline: 'Active seller',
      features: [
        'More products (up to 50)',
        'Order tracking link for customers',
        'Basic AI answers (Price & Delivery)',
        'WhatsApp direct order notification',
      ],
      buttonText: 'Upgrade',
      isCurrent: selectedPlan === 'Starter',
      popular: true,
    },
    {
      name: 'Pro',
      tagline: 'Growing business',
      features: [
        'Unlimited products',
        'Full AI assistant with custom knowledge',
        'Sales reports & weekly charts',
        'Custom branding & store logo',
        'Priority customer support',
      ],
      buttonText: 'Upgrade',
      isCurrent: selectedPlan === 'Pro',
    },
  ];

  const handleSelectPlan = (planName) => {
    setSelectedPlan(planName);
    updateUser({ plan: planName });
    setUpgradedMsg(`You have selected the ${planName} plan!`);
    setTimeout(() => setUpgradedMsg(''), 3000);
  };

  return (
    <div>
      {/* Header (Screen 9 Mockup) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Subscription Plans
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Scale your online chat business with automated AI and order tracking
        </p>
      </div>

      {upgradedMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          ✓ {upgradedMsg}
        </div>
      )}

      {/* 3 Pricing Cards (Screen 9 Mockup) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {plans.map((p) => {
          return (
            <div
              key={p.name}
              className="card"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: p.isCurrent ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                position: 'relative',
                boxShadow: p.isCurrent ? '0 8px 25px rgba(79, 70, 229, 0.15)' : 'var(--shadow-sm)',
              }}
            >
              {p.isCurrent && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase',
                  }}
                >
                  Active Plan
                </span>
              )}

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.75rem' }}>
                  {p.tagline}
                </p>

                {/* Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                  {p.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: '#eef2ff',
                          color: '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <Check size={12} />
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.4 }}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSelectPlan(p.name)}
                className={p.isCurrent ? 'btn btn-secondary' : 'btn btn-primary'}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  backgroundColor: p.isCurrent ? '#f1f5f9' : '#4f46e5',
                  color: p.isCurrent ? '#475569' : '#ffffff',
                }}
              >
                {p.isCurrent ? 'Current Plan' : p.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
        Yeh business model ka hissa hai. Seller apne plan ke mutabiq features use karega. Prices baad mein decide honge.
      </p>
    </div>
  );
}
