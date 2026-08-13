import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const Support = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'faq';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const faqs = [
    {
      q: "How fast is the delivery?",
      a: "We deliver in under 15 minutes! Our local dark stores are strategically located in key neighborhoods to fulfill and dispatch orders immediately."
    },
    {
      q: "How are payment refunds processed?",
      a: "If an order is cancelled or payment verification fails, refunds are initiated instantly. Through our secure Razorpay microservice, the amount is refunded to your original payment mode (UPI, card, or wallet) within 2-3 business days."
    },
    {
      q: "Are my credit card and address details secure?",
      a: "Absolutely. We do not store sensitive payment card details. All transactions are securely routed through Razorpay. User profiles, authentication tokens, and shipping addresses are stored securely using encrypted Spring Security protocols."
    },
    {
      q: "Can I cancel my order after placing it?",
      a: "You can cancel your order from the 'My Orders' screen as long as the status is 'PENDING'. Once the status transitions to 'CONFIRMED' or 'PACKED', cancellations are restricted as the delivery partner is already assigned."
    },
    {
      q: "What is the delivery fee policy?",
      a: "Delivery is completely FREE for all order subtotals exceeding ₹500. For orders under ₹500, a flat delivery fee of ₹40 is added to support partner travel costs."
    }
  ];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="container py-5 flex-grow-1" style={{ maxWidth: '1000px' }}>
        <h3 className="fw-bold mb-4 text-dark text-center text-md-start">
          <i className="bi bi-info-circle-fill text-primary me-2"></i> GroceryMart Customer Help Center
        </h3>

        <div className="row g-4 mt-2">
          {/* Left Navigation Tabs */}
          <div className="col-md-4 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-2 bg-white">
              <ul className="nav flex-column gap-1">
                <li>
                  <button 
                    className={`btn w-100 text-start py-2.5 px-3 fw-semibold rounded-3 d-flex align-items-center gap-2 border-0 ${activeTab === 'faq' ? 'text-white shadow-sm' : 'bg-transparent text-muted'}`}
                    onClick={() => handleTabChange('faq')}
                    style={{ fontSize: '0.9rem', backgroundColor: activeTab === 'faq' ? 'var(--gm-primary)' : 'transparent' }}
                  >
                    <i className="bi bi-question-circle"></i> FAQs & Help Desk
                  </button>
                </li>
                <li>
                  <button 
                    className={`btn w-100 text-start py-2.5 px-3 fw-semibold rounded-3 d-flex align-items-center gap-2 border-0 ${activeTab === 'terms' ? 'text-white shadow-sm' : 'bg-transparent text-muted'}`}
                    onClick={() => handleTabChange('terms')}
                    style={{ fontSize: '0.9rem', backgroundColor: activeTab === 'terms' ? 'var(--gm-primary)' : 'transparent' }}
                  >
                    <i className="bi bi-file-earmark-text"></i> Terms & Conditions
                  </button>
                </li>
                <li>
                  <button 
                    className={`btn w-100 text-start py-2.5 px-3 fw-semibold rounded-3 d-flex align-items-center gap-2 border-0 ${activeTab === 'privacy' ? 'text-white shadow-sm' : 'bg-transparent text-muted'}`}
                    onClick={() => handleTabChange('privacy')}
                    style={{ fontSize: '0.9rem', backgroundColor: activeTab === 'privacy' ? 'var(--gm-primary)' : 'transparent' }}
                  >
                    <i className="bi bi-shield-check"></i> Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-md-8 col-lg-9">
            <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white min-vh-50">
              
              {/* FAQS */}
              {activeTab === 'faq' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  <h4 className="fw-bold mb-4 text-dark">Frequently Asked Questions</h4>
                  <div className="accordion accordion-flush" id="faqAccordion">
                    {faqs.map((faq, idx) => (
                      <div className="accordion-item border-bottom py-2" key={idx}>
                        <h2 className="accordion-header">
                          <button 
                            className="accordion-button collapsed fw-semibold text-dark shadow-none bg-white px-0" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target={`#faq-collapse-${idx}`} 
                            aria-expanded="false" 
                            aria-controls={`faq-collapse-${idx}`}
                          >
                            {faq.q}
                          </button>
                        </h2>
                        <div 
                          id={`faq-collapse-${idx}`} 
                          className="accordion-collapse collapse" 
                          data-bs-parent="#faqAccordion"
                        >
                          <div className="accordion-body text-muted px-0 small" style={{ lineHeight: '1.6' }}>
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TERMS & CONDITIONS */}
              {activeTab === 'terms' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  <h4 className="fw-bold mb-4 text-dark">Terms & Conditions</h4>
                  <div className="text-muted small" style={{ lineHeight: '1.7' }}>
                    <p>Welcome to GroceryMart. By utilizing our website and payment gateways, you agree to comply with the following regulations:</p>
                    
                    <h6 className="fw-bold text-dark mt-4">1. Account Eligibility</h6>
                    <p>When registering an account as a Customer or Administrator, you are responsible for maintaining credentials security. You agree to provide a valid phone number and shipping address to ensure successful order dispatch.</p>
                    
                    <h6 className="fw-bold text-dark mt-4">2. Pricing and Item Stock</h6>
                    <p>Prices and inventory availability are managed directly by GroceryMart administrators. We reserve the right to cancel orders containing incorrect pricing due to system glitches, in which case a full refund is immediately processed.</p>
                    
                    <h6 className="fw-bold text-dark mt-4">3. Gateway Transactions</h6>
                    <p>All online transaction fees are calculated in Indian Rupees (INR). Credit verify cycles are governed by Razorpay rules. We are not liable for double debits arising from network connection drops on checkout.</p>
                  </div>
                </motion.div>
              )}

              {/* PRIVACY POLICY */}
              {activeTab === 'privacy' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  <h4 className="fw-bold mb-4 text-dark">Privacy Policy</h4>
                  <div className="text-muted small" style={{ lineHeight: '1.7' }}>
                    <p>At GroceryMart, we prioritize your privacy and are committed to safeguarding your personal data:</p>
                    
                    <h6 className="fw-bold text-dark mt-4">1. Information Collection</h6>
                    <p>We collect essential delivery parameters during signup, including your username, contact phone number, email ID, and delivery address. This information is used strictly to fulfill orders and is not shared with third-party advertising companies.</p>
                    
                    <h6 className="fw-bold text-dark mt-4">2. Cookies and Browser Cache</h6>
                    <p>We use session cookies to remember your logged-in profile and caching arrays to synchronize items in your active shopping cart with our database repositories.</p>
                    
                    <h6 className="fw-bold text-dark mt-4">3. Payment Security</h6>
                    <p>All online checkout payments are securely directed and verified by Razorpay. We do not store or process debit/credit card numbers or UPI PINs on our servers.</p>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
