import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Removed this line
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
  Briefcase,
  BarChart, // Added for ESG
  Database, // Added for NIC
  UserPlus, // Added for Talent
  FileCheck // Added for Admin
} from 'lucide-react';

const FleetFlexPage = () => {
  // const navigate = useNavigate(); // Removed this line
  const [salary, setSalary] = useState('35000');
  const [monthlyLease, setMonthlyLease] = useState('400');
  const [taxBand, setTaxBand] = useState('basic'); // Added for calculator

  const calculateSavings = () => {
    const annualSalary = parseFloat(salary) || 0;
    const monthlyPayment = parseFloat(monthlyLease) || 0;
    const annualCost = monthlyPayment * 12;

    let taxRate = 0.32; // Basic: 20% Tax + 12% NI
    switch (taxBand) {
      case 'basic':
        taxRate = 0.32;
        break;
      case 'higher':
        taxRate = 0.42; // Higher: 40% Tax + 2% NI
        break;
      case 'additional':
        taxRate = 0.47; // Additional: 45% Tax + 2% NI
        break;
      default:
        taxRate = 0.32;
    }

    const taxSaving = annualCost * taxRate;
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
            {/* Proper inline SVG logo */}
            <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 30C10 18.9543 18.9543 10 30 10C41.0457 10 50 18.9543 50 30C50 41.0457 41.0457 50 30 50V30H10Z" fill="#f2e758"/>
              <path d="M30 50C41.0457 50 50 41.0457 50 30C50 18.9543 41.0457 10 30 10V30H50V50H30Z" fill="white" fillOpacity="0.8"/>
              <text x="65" y="42" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="30" fontWeight="bold" fill="white">
                FleetFlex
              </text>
            </svg>
          </div>
          <h1 style={styles.heroTitle}>The Ultimate Employee Benefit. The Smartest Business Decision.</h1>
          <p style={styles.heroSubtitle}>
            Save up to 40% on a brand new car with the FleetFlex salary sacrifice scheme.
            A zero-cost, zero-admin benefit for employers. A huge saving for employees.
          </p>
          <div style={styles.heroCTA}>
            <button style={styles.primaryButton}>Calculate Your Savings</button>
            <button style={styles.secondaryButton}>Browse Vehicles</button>
          </div>
        </div>
      </section>

      {/* Benefits Section (Employees) */}
      <section style={styles.benefitsSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Why It's a Win for <span style={styles.textHighlight}>Employees</span></h2>
          <div style={styles.benefitsGrid}>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <TrendingDown size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Huge Tax Savings</h3>
              <p style={styles.benefitText}>
                Pay before tax and National Insurance, saving up to 40% (or more!) on your vehicle costs.
              </p>
            </div>

            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <Shield size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Fully Inclusive Package</h3>
              <p style={styles.benefitText}>
                Insurance, maintenance, road tax, and breakdown cover all included in one simple payment.
              </p>
            </div>

            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <Car size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Brand New Vehicles</h3>
              <p style={styles.benefitText}>
                Choose from hundreds of makes and models, including the latest electric and hybrid cars.
              </p>
            </div>

            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <Award size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Hassle-Free Motoring</h3>
              <p style={styles.benefitText}>
                No deposit, no credit check, no unexpected costs. Just enjoy driving your new car.
              </p>
            </div>
          </div>
        </div>
      </section>

       {/* NEW Benefits Section (Employers) */}
      <section style={{...styles.benefitsSection, backgroundColor: '#f8f8f8'}}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>A Powerful Benefit for <span style={styles.textHighlight}>Your Business</span></h2>
          <div style={styles.benefitsGrid}>
            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <UserPlus size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Attract & Retain Talent</h3>
              <p style={styles.benefitText}>
                Offer a high-value, modern benefit that makes you stand out as a top employer.
              </p>
            </div>

            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <Database size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Generate NIC Savings</h3>
              <p style={styles.benefitText}>
                Reduce your Class 1 National Insurance contributions for every employee who joins the scheme.
              </p>
            </div>

            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <BarChart size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Boost Your ESG Goals</h3>
              <p style={styles.benefitText}>
                Accelerate your move to a green fleet by making electric vehicles accessible to all staff.
              </p>
            </div>

            <div style={styles.benefitCard}>
              <div style={styles.benefitIcon}>
                <FileCheck size={32} color="#f2e758" />
              </div>
              <h3 style={styles.benefitTitle}>Zero Cost & Zero Admin</h3>
              <p style={styles.benefitText}>
                We manage the entire process, from payroll setup to employee support, at no cost to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section style={styles.calculatorSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Calculate Your Personal Savings</h2>
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
                    style={{...styles.input, paddingLeft: '40px'}}
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
                    style={{...styles.input, paddingLeft: '40px'}}
                  />
                </div>
              </div>

              {/* NEW Tax Band Selector */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Your Tax Rate</label>
                <div style={styles.inputWrapper}>
                  <select
                    value={taxBand}
                    onChange={(e) => setTaxBand(e.target.value)}
                    style={{...styles.input, ...styles.select}}
                  >
                    <option value="basic">Basic Rate (20% Tax + 12% NI)</option>
                    <option value="higher">Higher Rate (40% Tax + 2% NI)</option>
                    <option value="additional">Additional Rate (45% Tax + 2% NI)</option>
                  </select>
                </div>
              </div>

            </div>

            <div style={styles.calculatorResults}>
              <h3 style={styles.resultsTitle}>Your Potential Savings</h3>

              <div style={styles.savingsCard}>
                <div style={styles.savingItem}>
                  <span style={styles.savingLabel}>Gross Monthly Payment</span>
                  <span style={styles.savingAmount}>£{parseFloat(monthlyLease).toFixed(2)}</span>
                </div>
                <div style={styles.savingItem}>
                  <span style={styles.savingLabel}>Your Monthly Tax Saving</span>
                  {/* FIX: Merged style objects */}
                  <span style={{...styles.savingAmount, color: '#4caf50'}}>£{savings.monthlySaving}</span>
                </div>
                <div style={{...styles.savingItem, backgroundColor: '#545454', color: 'white'}}>
                  <span style={{...styles.savingLabel, color: '#f8f8f8', fontWeight: 'bold'}}>Your Effective Monthly Cost</span>
                  <span style={styles.savingAmountHighlight}>£{savings.effectiveMonthlyCost}</span>
                </div>
              </div>

              <p style={styles.disclaimer}>
                *Savings are illustrative and depend on your individual tax situation and final vehicle choice.
                Assumes salary sacrifice is not below National Minimum Wage.
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
                title: 'Employer Sign-up',
                desc: 'Your company partners with FleetFlex to offer the scheme (it\'s free!).'
              },
              {
                num: '2',
                title: 'Check Your Eligibility',
                desc: 'Confirm you meet the simple criteria (e.g., permanent employee, above NMW).'
              },
              {
                num: '3',
                title: 'Choose Your Vehicle',
                desc: 'Browse our range and select the perfect new car for you.'
              },
              {
                num: '4',
                title: 'Get Your Final Quote',
                desc: 'See your exact monthly cost after all your tax savings are applied.'
              },
              {
                num: '5',
                title: 'Sign & Order',
                desc: 'Your employer approves, your salary is adjusted, and your new car is ordered.'
              },
              {
                num: '6',
                title: 'Drive & Enjoy',
                desc: 'Collect your new car and enjoy all-inclusive, hassle-free motoring.'
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
      {/* FIX: Restored full, correct section structure */}
      <section style={styles.includedSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Everything Included in Your Fixed Monthly Payment</h2>
          <div style={styles.includedGrid}>
            {[
              'Vehicle lease for agreed term',
              'Full manufacturer warranty',
              'Road tax (VED)',
              'Comprehensive insurance',
              'Routine maintenance & servicing',
              'Breakdown cover (24/7)',
              'Replacement tyres (fair wear)',
              'MOT tests',
              'Windscreen cover',
              'No deposit or credit check',
              'Delivery to your door',
              'Dedicated employee support'
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
      {/* FIX: Cleaned up map */}
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
                a: 'Savings depend on your tax band. Basic rate taxpayers save around 32%, higher rate taxpayers save 42%, and additional rate taxpayers can save up to 47%.'
              },
              {
                q: 'What happens if I leave my employer?',
                a: 'If you leave, the car is typically returned with no early termination fee (subject to T&Cs). We manage the entire process, so your employer has no risk.'
              },
              {
                q: 'Can I choose any car?',
                a: 'You can choose from our extensive range of vehicles. Some employers may have specific requirements or budgets, so check with your HR department.'
              },
              {
                q: 'Does it affect my pension?',
                a: 'As salary sacrifice reduces your gross salary, it may affect company pension contributions if they are based on a percentage of this amount. Check with your HR dept.'
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
      {/* FIX: Cleaned up button styles */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Start Saving?</h2>
          <p style={styles.ctaText}>
            Speak to our FleetFlex specialists today to get a free quote for your business or find out more.
          </p>
          <div style={styles.ctaButtons}>
            <button style={styles.primaryButton}>
              <Phone size={20} style={{marginRight: '10px'}} />
              Call 0161 516 6915
            </button>
            <button style={{...styles.secondaryButton, color: '#545454', borderColor: '#545454'}}>
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
    padding: '80px 20px', // Reduced padding
    textAlign: 'center',
    color: '#fff',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroLogo: {
    marginBottom: '30px', // Reduced margin
  },
  logo: {
    height: '60px',
  },
  heroTitle: {
    fontSize: '44px', // Slightly smaller
    fontWeight: 'bold',
    marginBottom: '20px',
    lineHeight: '1.2',
  },
  heroSubtitle: {
    fontSize: '18px', // Slightly smaller
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
    color: '#2a2a2a', // Darker text for contrast
    border: '2px solid #f2e758',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s, backgroundColor 0.2s',
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
  textHighlight: {
    color: '#f2e758',
    backgroundColor: '#545454',
    padding: '0 10px',
    borderRadius: '4px',
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  benefitCard: {
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#fff', // Changed for contrast on grey bg
    borderRadius: '12px',
    transition: 'transform 0.3s, box-shadow 0.3s',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
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
    backgroundColor: '#fff', // Changed from f8f8f8
  },
  calculatorCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  calculatorInputs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // Adjusted for 3 columns
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
    padding: '15px 15px 15px 20px', // Default padding
    fontSize: '18px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontWeight: 'bold',
    boxSizing: 'border-box', // Added for consistency
  },
  select: {
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' fill=\'currentColor\' class=\'bi bi-chevron-down\' viewBox=\'0 0 16 16\'%3E%path fill-rule=\'evenodd\' d=\'M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 15px center',
    backgroundSize: '16px',
    paddingRight: '40px',
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
    padding: '15px 20px', // Increased padding
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
    backgroundColor: '#f8f8f8', // Alternating color
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },
  stepCard: {
    padding: '30px',
    backgroundColor: '#fff', // Contrast
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
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
    backgroundColor: '#fff', // Alternating color
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
    backgroundColor: '#f8f8f8', // Contrast
    borderRadius: '8px',
    fontSize: '15px',
    color: '#545454',
  },
  faqSection: {
    padding: '80px 20px',
    backgroundColor: '#f8f8f8', // Alternating color
  },
  faqGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
  },
  faqCard: {
    padding: '30px',
    backgroundColor: '#fff', // Contrast
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
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