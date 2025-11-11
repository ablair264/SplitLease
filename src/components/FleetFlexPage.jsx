import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Calculator,
  TrendingDown,
  Shield,
  Award,
  CheckCircle,
  Phone,
  Mail,
  ChevronRight,
  DollarSign,
  Users,
  Briefcase
} from 'lucide-react';

const FleetFlexPage = () => {
  const navigate = useNavigate();
  const [salary, setSalary] = useState('35000');
  const [monthlyLease, setMonthlyLease] = useState('400');

  const calculateSavings = () => {
    const annualSalary = parseFloat(salary) || 0;
    const monthlyPayment = parseFloat(monthlyLease) || 0;
    const annualCost = monthlyPayment * 12;

    // Simplified calculation - actual savings depend on tax band
    const taxSaving = annualCost * 0.32; // Assuming 20% income tax + 12% NI
    const monthlySaving = taxSaving / 12;

    return {
      annualSaving: taxSaving.toFixed(2),
      monthlySaving: monthlySaving.toFixed(2),
      effectiveMonthlyCost: (monthlyPayment - monthlySaving).toFixed(2)
    };
  };

  const savings = calculateSavings();

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroLogo}>
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Ctext x='10' y='40' font-family='Arial' font-size='32' font-weight='bold' fill='%23fff'%3EFleetFlex%3C/text%3E%3C/svg%3E"
              alt="FleetFlex Logo"
              style={styles.logo}
            />
          </div>
          <h1 style={styles.heroTitle}>Drive Your Dream Car Through Salary Sacrifice</h1>
          <p style={styles.heroSubtitle}>
            Save up to 40% on your car costs with FleetFlex salary sacrifice scheme.
            Get a brand new vehicle with maintenance, insurance, and road tax included.
          </p>
          <div style={styles.heroCTA}>
            <button style={styles.primaryButton}>Calculate Your Savings</button>
            <button style={styles.secondaryButton}>Browse Vehicles</button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={styles.benefitsSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Why Choose FleetFlex?</h2>
          <div style={styles.benefitsGrid}>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <TrendingDown size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Tax-Efficient Savings</h3>
              <p style={styles.benefitText}>
                Pay before tax and National Insurance, saving up to 40% on your vehicle costs
              </p>
            </div>

            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <Shield size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Fully Inclusive Package</h3>
              <p style={styles.benefitText}>
                Insurance, maintenance, road tax, and breakdown cover all included in one simple payment
              </p>
            </div>

            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <Car size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Brand New Vehicles</h3>
              <p style={styles.benefitText}>
                Choose from hundreds of makes and models, all brand new with full manufacturer warranty
              </p>
            </div>

            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <Award size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Hassle-Free Motoring</h3>
              <p style={styles.benefitText}>
                No unexpected costs, no maintenance worries - just enjoy driving your new car
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section style={styles.calculatorSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Calculate Your Savings</h2>
          <div style={styles.calculatorCard}>
            <div style={styles.calculatorInputs}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Your Annual Salary</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputPrefix}>£</span>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Monthly Lease Payment</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputPrefix}>£</span>
                  <input
                    type="number"
                    value={monthlyLease}
                    onChange={(e) => setMonthlyLease(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.calculatorResults}>
              <h3 style={styles.resultsTitle}>Your Potential Savings</h3>

              <div style={styles.savingsCard}>
                <div style={styles.savingItem}>
                  <span style={styles.savingLabel}>Monthly Saving</span>
                  <span style={styles.savingAmount}>£{savings.monthlySaving}</span>
                </div>
                <div style={styles.savingItem}>
                  <span style={styles.savingLabel}>Annual Saving</span>
                  <span style={styles.savingAmount}>£{savings.annualSaving}</span>
                </div>
                <div style={styles.savingItem}>
                  <span style={styles.savingLabel}>Effective Monthly Cost</span>
                  <span style={styles.savingAmountHighlight}>£{savings.effectiveMonthlyCost}</span>
                </div>
              </div>

              <p style={styles.disclaimer}>
                *Savings are illustrative and based on a 32% combined tax and NI rate.
                Actual savings depend on your individual tax situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={styles.howItWorksSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>How FleetFlex Works</h2>
          <div style={styles.stepsGrid}>
            {[
              {
                num: '1',
                title: 'Check Eligibility',
                desc: 'Confirm your employer offers FleetFlex salary sacrifice scheme'
              },
              {
                num: '2',
                title: 'Choose Your Vehicle',
                desc: 'Browse our range and select the perfect car for you'
              },
              {
                num: '3',
                title: 'Get a Quote',
                desc: 'See your monthly cost after tax savings and inclusions'
              },
              {
                num: '4',
                title: 'Complete Application',
                desc: 'Simple online application with quick approval'
              },
              {
                num: '5',
                title: 'Salary Adjustment',
                desc: 'Your monthly payment is deducted from your gross salary'
              },
              {
                num: '6',
                title: 'Drive & Enjoy',
                desc: 'Collect your new car and enjoy hassle-free motoring'
              }
            ].map((step) => (
              <div key={step.num} style={styles.stepCard}>
                <div style={styles.stepNumber}>{step.num}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section style={styles.includedSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Everything Included in FleetFlex</h2>
          <div style={styles.includedGrid}>
            {[
              'Vehicle lease for agreed term',
              'Full manufacturer warranty',
              'Road tax for contract duration',
              'Comprehensive insurance',
              'Routine maintenance & servicing',
              'Breakdown cover (24/7)',
              'Replacement tyres',
              'MOT tests',
              'Windscreen cover',
              'Vehicle registration',
              'Delivery to your door',
              'Dedicated account manager'
            ].map((item, idx) => (
              <div key={idx} style={styles.includedItem}>
                <CheckCircle size={20} color="#f2e758" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={styles.faqSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div style={styles.faqGrid}>
            {[
              {
                q: 'Am I eligible for FleetFlex?',
                a: 'You need to be employed by a company that offers the FleetFlex salary sacrifice scheme, earn above the minimum wage after the deduction, and pass a credit check.'
              },
              {
                q: 'How much can I really save?',
                a: 'Savings depend on your tax band. Basic rate taxpayers save 32%, higher rate taxpayers save 42%, and additional rate taxpayers can save up to 47%.'
              },
              {
                q: 'What happens if I leave my employer?',
                a: 'If you leave your employer, you have several options including transferring the lease to your new employer if they offer the scheme, or making private payments to continue the lease.'
              },
              {
                q: 'Can I choose any car?',
                a: 'You can choose from our extensive range of vehicles. Some employers may have specific requirements or budgets, so check with your HR department.'
              },
              {
                q: 'Does it affect my pension?',
                a: 'Since the lease payment is taken from your gross salary, it may slightly reduce your pensionable income. However, the tax savings often outweigh this.'
              },
              {
                q: 'What about insurance claims?',
                a: 'All insurance matters are handled for you. Simply report any incidents to us and we\'ll manage the claim process with the insurer.'
              }
            ].map((faq, idx) => (
              <div key={idx} style={styles.faqCard}>
                <h3 style={styles.faqQuestion}>{faq.q}</h3>
                <p style={styles.faqAnswer}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Start Saving?</h2>
          <p style={styles.ctaText}>
            Speak to our FleetFlex specialists today and discover how much you could save
          </p>
          <div style={styles.ctaButtons}>
            <button style={styles.primaryButton}>
              <Phone size={20} style={{marginRight: '10px'}} />
              Call 0161 516 6915
            </button>
            <button style={styles.secondaryButton}>
              <Mail size={20} style={{marginRight: '10px'}} />
              Email Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
  },
  hero: {
    background: 'linear-gradient(135deg, #545454 0%, #2a2a2a 100%)',
    padding: '100px 20px',
    textAlign: 'center',
    color: '#fff',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroLogo: {
    marginBottom: '40px',
  },
  logo: {
    height: '60px',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px',
    lineHeight: '1.2',
  },
  heroSubtitle: {
    fontSize: '20px',
    marginBottom: '40px',
    opacity: 0.9,
    maxWidth: '800px',
    margin: '0 auto 40px',
  },
  heroCTA: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '15px 40px',
    backgroundColor: '#f2e758',
    color: '#545454',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s',
  },
  secondaryButton: {
    padding: '15px 40px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: '2px solid #fff',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  benefitsSection: {
    padding: '80px 20px',
    backgroundColor: '#fff',
  },
  sectionContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '60px',
    color: '#545454',
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  benefitCard: {
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: '12px',
    transition: 'transform 0.3s',
  },
  benefitIcon: {
    width: '80px',
    height: '80px',
    margin: '0 auto 20px',
    backgroundColor: '#545454',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#545454',
  },
  benefitText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#666',
  },
  calculatorSection: {
    padding: '80px 20px',
    backgroundColor: '#f8f8f8',
  },
  calculatorCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  calculatorInputs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginBottom: '40px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  inputLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#545454',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputPrefix: {
    position: 'absolute',
    left: '15px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#545454',
  },
  input: {
    width: '100%',
    padding: '15px 15px 15px 40px',
    fontSize: '18px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontWeight: 'bold',
  },
  calculatorResults: {
    backgroundColor: '#f8f8f8',
    borderRadius: '12px',
    padding: '30px',
  },
  resultsTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#545454',
    textAlign: 'center',
  },
  savingsCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '20px',
  },
  savingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  savingLabel: {
    fontSize: '16px',
    color: '#666',
  },
  savingAmount: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#545454',
  },
  savingAmountHighlight: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#f2e758',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  howItWorksSection: {
    padding: '80px 20px',
    backgroundColor: '#fff',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },
  stepCard: {
    padding: '30px',
    backgroundColor: '#f8f8f8',
    borderRadius: '12px',
    textAlign: 'center',
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    margin: '0 auto 20px',
    backgroundColor: '#f2e758',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#545454',
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#545454',
  },
  stepDesc: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#666',
  },
  includedSection: {
    padding: '80px 20px',
    backgroundColor: '#f8f8f8',
  },
  includedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  includedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#545454',
  },
  faqSection: {
    padding: '80px 20px',
    backgroundColor: '#fff',
  },
  faqGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
  },
  faqCard: {
    padding: '30px',
    backgroundColor: '#f8f8f8',
    borderRadius: '12px',
  },
  faqQuestion: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#545454',
  },
  faqAnswer: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#666',
  },
  ctaSection: {
    padding: '80px 20px',
    background: 'linear-gradient(135deg, #f2e758 0%, #e5d84a 100%)',
    textAlign: 'center',
  },
  ctaContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: '42px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#545454',
  },
  ctaText: {
    fontSize: '18px',
    marginBottom: '40px',
    color: '#545454',
  },
  ctaButtons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
};

export default FleetFlexPage;
