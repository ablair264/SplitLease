import React, { useEffect, useState } from 'react';
import { api } from '../lib/api'
import { 
  Car, 
  Truck, 
  Star, 
  Zap, 
  Search, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  X,
  Snowflake,
  Settings,
  Lightbulb,
  Smartphone,
  Users,
  DollarSign,
  Scale,
  Info,
  TrendingUp
} from 'lucide-react';

const FleetpricesHomepage = ({ onLogin }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaseType, setLeaseType] = useState('personal');
  const [quickLookOpen, setQuickLookOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bestDeals, setBestDeals] = useState([])
  const [loadingDeals, setLoadingDeals] = useState(true)
  const [error, setError] = useState('')

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const openQuickLook = (vehicle) => {
    setSelectedVehicle(vehicle);
    setQuickLookOpen(true);
  };

  const closeQuickLook = () => {
    setQuickLookOpen(false);
    setTimeout(() => setSelectedVehicle(null), 300);
  };

  const navItems = [
    { 
      id: 'car-leasing', 
      label: 'Car leasing', 
      icon: Car,
      hasDropdown: true 
    },
    { 
      id: 'van-leasing', 
      label: 'Van leasing', 
      icon: Truck,
      hasDropdown: true 
    },
    { 
      id: 'managers-specials', 
      label: "Manager's specials", 
      icon: Star
    },
    { 
      id: 'electric-specials', 
      label: 'Electric specials', 
      icon: Zap
    },
    { 
      id: 'outright-purchase', 
      label: 'Outright purchase'
    },
    { 
      id: 'additional-services', 
      label: 'Additional services'
    },
    { 
      id: 'more-info', 
      label: 'More Info',
      hasDropdown: true 
    }
  ];

  const placeholderVehicle = 'https://via.placeholder.com/300x200?text=Vehicle'
  const placeholderCategory = 'https://via.placeholder.com/400x300?text=Category'

  const featuredDeals = [
    {
      name: 'Cupra Terramar Hatchback',
      variant: '1.5 eTSI 150 V2 5dr DSG',
      image: placeholderVehicle,
      price: '224.79',
      initialPayment: '2,021.10',
      processingFee: '349.99',
      bodyType: 'SUV / Crossover',
      features: ['3 zone climate', 'Alloy wheels', 'Ambient lighting', 'Android Auto'],
      badges: ['In Stock', 'Pre-Registered'],
      seats: '5',
      doors: '5',
      transmission: 'Automatic',
      fuel: 'Petrol',
      contractLength: '2 Years',
      mileage: '5,000',
      roadTax: 'Included (Worth up to £3,000)',
      warranty: 'Included',
      breakdown: 'Included',
      registration: 'Included (Worth up to £55)',
      delivery: 'Included (FREE UK Mainland Delivery)',
      description: 'The Cupra Terramar combines sporty design with practical everyday usability. This plug-in hybrid variant offers excellent fuel economy and low emissions, making it perfect for both city driving and longer journeys.'
    },
    {
      name: 'Jaecoo 7 Estate',
      variant: '1.5T PHEV Luxury 5dr Auto',
      image: placeholderVehicle,
      price: '285.84',
      initialPayment: '2,572.56',
      processingFee: '349.99',
      bodyType: 'SUV / Crossover',
      features: ['2 zone climate', 'Alloy wheels', 'Ambient lighting', 'Android Auto', 'Apple CarPlay'],
      badges: ['Dec 2025', 'Top Deal'],
      seats: '5',
      doors: '5',
      transmission: 'Automatic',
      fuel: 'Hybrid',
      contractLength: '2 Years',
      mileage: '5,000',
      roadTax: 'Included (Worth up to £3,000)',
      warranty: 'Included',
      breakdown: 'Included',
      registration: 'Included (Worth up to £55)',
      delivery: 'Expected on Dec 2025',
      description: 'The Jaecoo 7 Estate offers spacious luxury with advanced technology. With its plug-in hybrid powertrain, you can enjoy electric-only driving for short trips while having the flexibility of a petrol engine for longer journeys.'
    },
    {
      name: 'Omoda 5 Estate',
      variant: '1.6 TGDi [147] Noble 5dr 7DCT',
      image: placeholderVehicle,
      price: '182.76',
      initialPayment: '1,644.84',
      processingFee: '349.99',
      bodyType: 'SUV / Crossover',
      features: ['2 zone climate', 'Alloy wheels', 'Ambient lighting', 'Android Auto', 'Apple CarPlay', 'Blind spot information', 'Door mirror electric heated'],
      badges: ['In Stock', 'Top Deal', 'Pre-Registered'],
      seats: '5',
      doors: '5',
      transmission: 'Manual',
      fuel: 'Petrol',
      contractLength: '2 Years',
      mileage: '5,000',
      roadTax: 'Included (Worth up to £3,000)',
      warranty: 'Included',
      breakdown: 'Included',
      registration: 'Included (Worth up to £55)',
      delivery: 'Included (FREE UK Mainland Delivery)',
      description: 'The Omoda 5 Estate delivers exceptional value with a comprehensive specification. This stylish crossover comes packed with technology and safety features, making it an ideal choice for families and professionals alike.'
    }
  ];

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoadingDeals(true)
        const resp = await api.getBestDeals({ limit: 12 })
        if (!cancelled) setBestDeals(resp.data || [])
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoadingDeals(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const lifestyleCategories = [
    {
      title: 'Family cars',
      image: placeholderCategory,
      links: ['Compact family cars', 'Popular family cars', 'MPVs and 7+ seaters', 'All family cars']
    },
    {
      title: 'Budget-friendly cars',
      image: placeholderCategory,
      links: ['Up to £200', 'Up to £250', 'Up to £300', 'All budget-friendly cars']
    },
    {
      title: 'Eco-friendly cars',
      image: placeholderCategory,
      links: ['Hybrid cars', 'Electric cars', 'All eco-friendly cars']
    }
  ];

  return (
    <div style={styles.container}>
      {/* Quick Look Slide-out Panel */}
      {quickLookOpen && (
        <>
          <div style={styles.overlay} onClick={closeQuickLook} />
          <div style={{...styles.quickLookPanel, ...(quickLookOpen ? styles.quickLookPanelOpen : {})}}>
            <div style={styles.quickLookHeader}>
              <h2 style={styles.quickLookTitle}>Quick finance example</h2>
              <button onClick={closeQuickLook} style={styles.closeButton}>
                <X size={24} />
              </button>
            </div>
            
            {selectedVehicle && (
              <div style={styles.quickLookContent}>
                <div style={styles.vehicleMainInfo}>
                  <h3 style={styles.vehicleName}>{selectedVehicle.name}</h3>
                  <p style={styles.vehicleVariant}>{selectedVehicle.variant}</p>
                  <img src={selectedVehicle.image} alt={selectedVehicle.name} style={styles.quickLookImage} />
                  
                  <div style={styles.vehicleSpecs}>
                    <div style={styles.specItem}>
                      <Users size={20} />
                      <span>{selectedVehicle.seats} Seats</span>
                    </div>
                    <div style={styles.specItem}>
                      <Car size={20} />
                      <span>{selectedVehicle.doors} Doors</span>
                    </div>
                    <div style={styles.specItem}>
                      <Settings size={20} />
                      <span>{selectedVehicle.transmission}</span>
                    </div>
                    <div style={styles.specItem}>
                      <Zap size={20} />
                      <span>{selectedVehicle.fuel}</span>
                    </div>
                  </div>

                  <p style={styles.vehicleDescription}>{selectedVehicle.description}</p>
                </div>

                <div style={styles.financeSummary}>
                  <h3 style={styles.summaryTitle}>Finance Summary</h3>
                  
                  <div style={styles.summaryGrid}>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Contract type:</span>
                      <span style={styles.summaryValue}>Personal Contract Hire</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Contract length:</span>
                      <span style={styles.summaryValue}>{selectedVehicle.contractLength}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Annual mileage:</span>
                      <span style={styles.summaryValue}>{selectedVehicle.mileage}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Initial rental (First months payment):</span>
                      <span style={styles.summaryValue}>£{selectedVehicle.initialPayment}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>
                        <Info size={16} style={{display: 'inline', marginRight: '5px'}} />
                        Processing fee:
                      </span>
                      <span style={styles.summaryValue}>£{selectedVehicle.processingFee} Inc. VAT</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>
                        <Info size={16} style={{display: 'inline', marginRight: '5px'}} />
                        Road tax:
                      </span>
                      <span style={styles.summaryValue}>{selectedVehicle.roadTax}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>
                        <Info size={16} style={{display: 'inline', marginRight: '5px'}} />
                        Breakdown cover:
                      </span>
                      <span style={styles.summaryValue}>{selectedVehicle.breakdown}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>
                        <Info size={16} style={{display: 'inline', marginRight: '5px'}} />
                        Warranty:
                      </span>
                      <span style={styles.summaryValue}>{selectedVehicle.warranty}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>
                        <Info size={16} style={{display: 'inline', marginRight: '5px'}} />
                        Registration fee:
                      </span>
                      <span style={styles.summaryValue}>{selectedVehicle.registration}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>
                        <Info size={16} style={{display: 'inline', marginRight: '5px'}} />
                        Delivery:
                      </span>
                      <span style={styles.summaryValue}>{selectedVehicle.delivery}</span>
                    </div>
                  </div>

                  <div style={styles.featuresList}>
                    <h4 style={styles.featuresTitle}>Key Features:</h4>
                    <div style={styles.featuresGrid}>
                      {(selectedVehicle.features || []).map((feature, idx) => (
                        <div key={idx} style={styles.featureItem}>
                          <Lightbulb size={16} style={{color: '#58f175'}} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.priceSection}>
                    <span style={styles.priceLabel}>Personal lease from</span>
                    <div style={styles.priceDisplay}>
                      <span style={styles.pricePound}>£</span>
                      <span style={styles.priceAmount}>{selectedVehicle.price}</span>
                      <span style={styles.priceFrequency}>p/m<br/>Inc. VAT</span>
                    </div>
                  </div>

                  <button style={styles.saveCompareButton}>
                    <Scale size={20} />
                    Save & Compare
                  </button>

                  <div style={styles.fuelGoInfo}>
                    <div style={styles.fuelGoIcon}>
                      <Zap size={24} color="#fff" />
                    </div>
                    <div>
                      <strong>FUEL&GO</strong>
                      <p style={styles.fuelGoText}>Enjoy our all-in-one lease package with insurance and maintenance for worry-free car leasing.</p>
                    </div>
                  </div>

                  <div style={styles.needHelp}>
                    <span>Need help? Call one of our leasing experts</span>
                    <a href="tel:01615166915" style={styles.phoneNumber}>0161 516 6915</a>
                  </div>

                  <p style={styles.disclaimer}>
                    The above figures are for illustrative purposes only and do not constitute a finance offer. 
                    Quotes are subject to the requirements of the dealer or broker, including availability and applicant status. 
                    Actual monthly payments may vary depending on the dealer or broker for a personalized quote tailored to your specific needs.
                  </p>
                  <p style={styles.disclaimer}>
                    Additional charges may apply based on the vehicle's condition or mileage. Terms and conditions apply.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.topBar}>
          <div style={styles.topBarContent}>
            <span><Phone size={14} style={{display: 'inline', marginRight: '5px', verticalAlign: 'middle'}} /> 0161 516 6915 | Mon-Fri 8:30am - 6pm</span>
            <div style={styles.topBarRight}>
              <a href="#" style={styles.topBarLink}>Blog</a>
              <a href="#" style={styles.topBarLink}>Help</a>
              <a href="#" style={styles.topBarLink}>Contact</a>
              <button onClick={onLogin} style={styles.topBarLink}>Login</button>
            </div>
          </div>
        </div>

        <div style={styles.mainNav}>
          <div style={styles.navContent}>
            <img 
              src="https://www.fleetprices.co.uk/gfx/logo-200.png" 
              alt="Fleetprices.co.uk" 
              style={styles.logo}
            />

            <div style={styles.searchBar}>
              <input
                type="text"
                placeholder="e.g. BMW 3 Series"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <button style={styles.searchButton}>
                <Search size={20} />
              </button>
            </div>

            <div style={styles.navButtons}>
              <button style={styles.navIconButton}>
                <DollarSign size={20} />
                <small>Sell your car</small>
              </button>
              <button style={styles.navIconButton}>
                <TrendingUp size={20} />
                <small>Eligibility</small>
              </button>
              <button style={styles.navIconButton}>
                <Scale size={20} />
                <small>Compare</small>
              </button>
            </div>
          </div>

          <nav style={styles.mainNavLinks}>
            {navItems.map((item) => (
              <div key={item.id} style={styles.navItem}>
                <button
                  onClick={() => item.hasDropdown && toggleDropdown(item.id)}
                  style={styles.navLink}
                >
                  {item.icon && <item.icon size={16} style={{display: 'inline', marginRight: '6px'}} />}
                  {item.label}
                  {item.hasDropdown && <ChevronDown size={14} style={{marginLeft: '4px'}} />}
                </button>
                
                {item.hasDropdown && activeDropdown === item.id && (
                  <div style={styles.dropdown}>
                    <div style={styles.dropdownContent}>
                      <div style={styles.dropdownColumn}>
                        <h3 style={styles.dropdownTitle}>
                          {item.label.includes('Car') ? 'Car leasing' : 
                           item.label.includes('Van') ? 'Van leasing' : 'Information'}
                        </h3>
                        <a href="#" style={styles.dropdownLink}>View top deals</a>
                        <a href="#" style={styles.dropdownLink}>Browse by manufacturer</a>
                        <a href="#" style={styles.dropdownLink}>Search all deals</a>
                        <a href="#" style={styles.dropdownLink}>In stock vehicles</a>
                        <a href="#" style={styles.dropdownLink}>No deposit leasing</a>
                      </div>
                      <div style={styles.dropdownColumn}>
                        <h3 style={styles.dropdownTitle}>Popular searches</h3>
                        <a href="#" style={styles.dropdownLink}>Under £150 per month</a>
                        <a href="#" style={styles.dropdownLink}>£150 - £250 per month</a>
                        <a href="#" style={styles.dropdownLink}>£250 - £350 per month</a>
                        <a href="#" style={styles.dropdownLink}>Electric vehicles</a>
                      </div>
                      <div style={styles.dropdownColumn}>
                        <h3 style={styles.dropdownTitle}>Useful links</h3>
                        <a href="#" style={styles.dropdownLink}>Apply for finance</a>
                        <a href="#" style={styles.dropdownLink}>Request a quote</a>
                        <a href="#" style={styles.dropdownLink}>How leasing works</a>
                        <a href="#" style={styles.dropdownLink}>Order process</a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroText}>
            <h1 style={styles.heroTitle}>Your dream car leasing deal for less</h1>
            <p style={styles.heroSubtitle}>
              Choose a brand-new car lease at a great monthly price, fully taxed and delivered for free nationwide. 
              Personal leasing and business car leasing options are both available.
            </p>

            <div style={styles.leaseTypeToggle}>
              <button
                onClick={() => setLeaseType('personal')}
                style={{
                  ...styles.leaseTypeButton,
                  ...(leaseType === 'personal' ? styles.leaseTypeButtonActive : {})
                }}
              >
                Personal Leasing
              </button>
              <button
                onClick={() => setLeaseType('business')}
                style={{
                  ...styles.leaseTypeButton,
                  ...(leaseType === 'business' ? styles.leaseTypeButtonActive : {})
                }}
              >
                Business Leasing
              </button>
            </div>

            <div style={styles.searchFilters}>
              <select style={styles.filterSelect}>
                <option>Choose your make (50)</option>
              </select>
              <select style={styles.filterSelect}>
                <option>Fuel type Any (4)</option>
              </select>
              <select style={styles.filterSelect}>
                <option>Body type Any (7)</option>
              </select>
              <select style={styles.filterSelect}>
                <option>Max budget Any (12)</option>
              </select>
              <button style={styles.showDealsButton}>Show deals →</button>
            </div>

            <div style={styles.inStockNotice}>
              <Car size={20} style={{marginRight: '10px'}} />
              Need a vehicle now? <a href="#" style={styles.inStockLink}>View in stock offers</a>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Searches */}
      <section style={styles.popularSearches}>
        <div style={styles.sectionContent}>
          <div style={styles.popularSearchTabs}>
            <span style={styles.tabLabel}>Popular searches</span>
            {['Up to £200', 'Up to £250', 'Up to £300', 'Up to £350', 'SUV/Crossover', 'Hatchback', 'Estate', 'BMW', 'Vauxhall', 'Cupra', 'Nissan', 'Volkswagen'].map((tab, idx) => (
              <button key={idx} style={styles.searchTab}>{tab}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section style={styles.dealsSection}>
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Our latest <span style={styles.highlight}>best car leasing deals</span></h2>
            <div style={styles.sectionNav}>
              <button style={styles.navArrow}><ChevronLeft size={20} /></button>
              <button style={styles.navArrow}><ChevronRight size={20} /></button>
            </div>
          </div>

          <div style={styles.dealsGrid}>
            {(bestDeals.length > 0 ? bestDeals.map(d => ({
              name: `${d.manufacturer} ${d.model}`,
              variant: d.variant || '',
              image: d.image_url || '/api/placeholder/300/200',
              price: (Number(d.best_monthly_rental) || 0).toFixed(2),
              badges: [],
              bodyType: d.body_style || '',
              fuel: d.fuel_type || ''
            })) : featuredDeals).slice(0,9).map((deal, idx) => (
              <div key={idx} style={styles.dealCard}>
                <div style={styles.dealBadges}>
                  {(deal.badges || []).map((badge, bidx) => (
                    <span key={bidx} style={styles.dealBadge}>{badge}</span>
                  ))}
                </div>
                <img src={deal.image} alt={deal.name} style={styles.dealImage} />
                <div style={styles.dealInfo}>
                  <h3 style={styles.dealName}>{deal.name}</h3>
                  <p style={styles.dealVariant}>{deal.variant}</p>
                  <p style={styles.dealBodyType}>Body Type: {deal.bodyType}</p>
                  <div style={styles.dealFeatures}>
                    <span style={styles.featureIcon} title="Climate control">
                      <Snowflake size={20} />
                    </span>
                    <span style={styles.featureIcon} title="Alloy wheels">
                      <Settings size={20} />
                    </span>
                    <span style={styles.featureIcon} title="Ambient lighting">
                      <Lightbulb size={20} />
                    </span>
                    <span style={styles.featureIcon} title="Smartphone integration">
                      <Smartphone size={20} />
                    </span>
                  </div>
                  <div style={styles.dealPricing}>
                    <span style={styles.dealLabel}>Personal lease from</span>
                    <div style={styles.dealPrice}>
                      <span style={styles.pricePound}>£</span>
                      <span style={styles.priceAmount}>{deal.price}</span>
                      <span style={styles.priceFrequency}>p/m<br/>Inc. VAT</span>
                    </div>
                  </div>
                  <div style={styles.dealActions}>
                    <button style={styles.compareButton}>
                      <Scale size={16} style={{marginRight: '5px'}} />
                      Save & Compare
                    </button>
                    <button 
                      style={styles.quickLookButton}
                      onClick={() => openQuickLook(deal)}
                    >
                      <Info size={16} style={{marginRight: '5px'}} />
                      Quick look
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Categories */}
      <section style={styles.lifestyleSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Find a car lease to match your lifestyle</h2>
          <div style={styles.lifestyleGrid}>
            {lifestyleCategories.map((category, idx) => (
              <div key={idx} style={styles.lifestyleCard}>
                <img src={category.image} alt={category.title} style={styles.lifestyleImage} />
                <div style={styles.lifestyleContent}>
                  <h3 style={styles.lifestyleTitle}>{category.title}</h3>
                  {category.links.map((link, lidx) => (
                    <a key={lidx} href="#" style={styles.lifestyleLink}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section style={styles.processSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Car leasing made easy</h2>
          <p style={styles.processSubtitle}>
            With our car leasing options, we offer complete leasing flexibility, whether that be the length of contract or the agreed annual mileage.
          </p>
          <div style={styles.processGrid}>
            {[
              { num: '1', title: 'Choose your Car Lease', desc: 'Browse Fleetprices range of cars or use our car leasing comparison tool.' },
              { num: '2', title: 'Get a Quote', desc: 'Once you decide on a car, our expert account managers will pull together a quote for you.' },
              { num: '3', title: 'Apply for Finance', desc: 'Every car lease is subject to a credit check. Simply get in touch and we will help you with the finance process.' },
              { num: '4', title: 'Arrange Delivery', desc: 'Once you have had your finance approved, you can order your dream car and finalise the necessary documents and arrange your delivery.' }
            ].map((step) => (
              <div key={step.num} style={styles.processCard}>
                <div style={styles.processNumber}>{step.num}.</div>
                <h3 style={styles.processTitle}>{step.title}</h3>
                <p style={styles.processDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerGrid}>
            <div style={styles.footerColumn}>
              <img 
                src="https://www.fleetprices.co.uk/gfx/logo-200.png" 
                alt="Fleetprices.co.uk" 
                style={styles.footerLogo}
              />
              <p style={styles.footerContact}>Call 0161 516 6915</p>
              <p style={styles.footerHours}>Monday to Friday: | 8:30am - 6pm</p>
              <a href="mailto:info@fleetprices.co.uk" style={styles.footerEmail}>info@fleetprices.co.uk</a>
              <div style={styles.socialIcons}>
                <a href="#" style={styles.socialIcon}><Facebook size={24} /></a>
                <a href="#" style={styles.socialIcon}><Twitter size={24} /></a>
                <a href="#" style={styles.socialIcon}><Linkedin size={24} /></a>
                <a href="#" style={styles.socialIcon}><Youtube size={24} /></a>
              </div>
              <div style={styles.awards}>
                <span style={styles.trustpilot}>
                  <Star size={14} fill="#f1e758" color="#f1e758" style={{display: 'inline', marginRight: '2px'}} />
                  Excellent 4.9 Stars
                </span>
              </div>
            </div>

            <div style={styles.footerColumn}>
              <h3 style={styles.footerHeading}>Company</h3>
              <a href="#" style={styles.footerLink}>About Us</a>
              <a href="#" style={styles.footerLink}>Terms & Conditions</a>
              <a href="#" style={styles.footerLink}>News</a>
              <a href="#" style={styles.footerLink}>Careers</a>
              <a href="#" style={styles.footerLink}>Contact</a>
              <a href="#" style={styles.footerLink}>Finance FAQs</a>
              <a href="#" style={styles.footerLink}>Sitemap</a>
            </div>

            <div style={styles.footerColumn}>
              <h3 style={styles.footerHeading}>Quick Links</h3>
              <a href="#" style={styles.footerLink}>Personal Car Leasing</a>
              <a href="#" style={styles.footerLink}>Van Leasing</a>
              <a href="#" style={styles.footerLink}>Business Car Leasing</a>
              <a href="#" style={styles.footerLink}>Car Leasing Special Offers</a>
              <a href="#" style={styles.footerLink}>Leasing With Insurance</a>
              <a href="#" style={styles.footerLink}>Company Fleet Support</a>
              <a href="#" style={styles.footerLink}>Compare Deals</a>
            </div>

            <div style={styles.footerColumn}>
              <h3 style={styles.footerHeading}>Compliance</h3>
              <a href="#" style={styles.footerLink}>Privacy Policy</a>
              <a href="#" style={styles.footerLink}>Cookie Policy</a>
              <a href="#" style={styles.footerLink}>Treating Customers Fairly</a>
              <a href="#" style={styles.footerLink}>Initial Disclosure Document</a>
              <a href="#" style={styles.footerLink}>Commission Disclosure Statement</a>
              <a href="#" style={styles.footerLink}>Complaints</a>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <p style={styles.disclaimerText}>
              Fleetprices.co.uk Ltd are a credit broker and not a lender, we are authorised and regulated by the Financial Conduct Authority. 
              Registered No: 656734. You may be able to obtain finance for your purchase from other lenders and you are encouraged to seek 
              alternative quotations. Business customers may not be protected under the Consumer Credit Act 1974 or the rules of the 
              Financial Conduct Authority.
            </p>
            <p style={styles.disclaimerText}>
              Fleetprices.co.uk Ltd is a company registered in England & Wales with company number: 6774890 | Data Protection No: Z1757197 | 
              VAT No: 946297970. Fleetprices.co.uk Ltd is a member of the British Vehicle Rental & Leasing Association: Membership number 2008.
            </p>
            <p style={styles.disclaimerText}>
              Registered Office: Fleetprices.co.uk Ltd, Marston House, 90 Liverpool Road, Cadishead, Manchester, M44 5AN
            </p>
            <p style={styles.disclaimerText}>
              Disclaimer: All vehicle images and descriptions are for illustration and reference purposes only, all vehicle leases are 
              subject to credit approval and subject to change at any time. E&OE.
            </p>
            <p style={styles.copyright}>
              Copyright © 2025 FleetPrices.co.uk, All rights reserved. | Powered by CALAS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0,
    color: '#545454',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
    animation: 'fadeIn 0.3s ease-in-out',
  },
  quickLookPanel: {
    position: 'fixed',
    top: 0,
    right: '-600px',
    width: '600px',
    maxWidth: '100vw',
    height: '100vh',
    backgroundColor: '#fff',
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.2)',
    zIndex: 9999,
    transition: 'right 0.3s ease-in-out',
    overflowY: 'auto',
  },
  quickLookPanelOpen: {
    right: 0,
  },
  quickLookHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    borderBottom: '1px solid #eee',
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff',
    zIndex: 100,
  },
  quickLookTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#545454',
    margin: 0,
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  quickLookContent: {
    padding: '30px',
  },
  vehicleMainInfo: {
    marginBottom: '30px',
  },
  vehicleName: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#545454',
    marginBottom: '8px',
  },
  vehicleVariant: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  quickLookImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  vehicleSpecs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    marginBottom: '20px',
  },
  specItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#f8f8f8',
    borderRadius: '8px',
    fontSize: '14px',
  },
  vehicleDescription: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#666',
    padding: '15px',
    backgroundColor: '#f8f8f8',
    borderRadius: '8px',
  },
  financeSummary: {
    backgroundColor: '#f8f8f8',
    padding: '25px',
    borderRadius: '12px',
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#545454',
  },
  summaryGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '25px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    fontSize: '14px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e0e0e0',
  },
  summaryLabel: {
    color: '#666',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  summaryValue: {
    fontWeight: '500',
    color: '#545454',
    textAlign: 'right',
    flex: 1,
  },
  featuresList: {
    marginBottom: '25px',
  },
  featuresTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#545454',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#666',
  },
  priceSection: {
    textAlign: 'center',
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  priceLabel: {
    fontSize: '14px',
    color: '#666',
    display: 'block',
    marginBottom: '10px',
  },
  priceDisplay: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '3px',
  },
  saveCompareButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#fff',
    border: '2px solid #58f175',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#545454',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  fuelGoInfo: {
    display: 'flex',
    gap: '15px',
    padding: '20px',
    backgroundColor: 'linear-gradient(135deg, #58f175 0%, #f1e758 100%)',
    background: 'linear-gradient(135deg, #58f175 0%, #f1e758 100%)',
    borderRadius: '8px',
    marginBottom: '20px',
    alignItems: 'center',
  },
  fuelGoIcon: {
    width: '50px',
    height: '50px',
    backgroundColor: '#545454',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fuelGoText: {
    fontSize: '13px',
    margin: '5px 0 0 0',
    color: '#545454',
  },
  needHelp: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  phoneNumber: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#58f175',
    textDecoration: 'none',
    marginTop: '8px',
  },
  disclaimer: {
    fontSize: '11px',
    lineHeight: '1.5',
    color: '#666',
    marginTop: '15px',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  topBar: {
    backgroundColor: '#545454',
    color: '#fff',
    padding: '8px 0',
    fontSize: '13px',
  },
  topBarContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarRight: {
    display: 'flex',
    gap: '20px',
  },
  topBarLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '13px',
  },
  mainNav: {
    backgroundColor: '#fff',
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  logo: {
    height: '45px',
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    maxWidth: '500px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 20px',
    border: '2px solid #f1e758',
    borderRadius: '25px 0 0 25px',
    fontSize: '15px',
    outline: 'none',
  },
  searchButton: {
    padding: '12px 20px',
    backgroundColor: '#f1e758',
    border: 'none',
    borderRadius: '0 25px 25px 0',
    cursor: 'pointer',
    fontSize: '18px',
  },
  navButtons: {
    display: 'flex',
    gap: '15px',
  },
  navIconButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    fontSize: '12px',
    color: '#545454',
  },
  mainNavLinks: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    gap: '5px',
    borderTop: '1px solid #eee',
  },
  navItem: {
    position: 'relative',
  },
  navLink: {
    padding: '15px 18px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#545454',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#f8f8f8',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '700px',
    zIndex: 100,
  },
  dropdownContent: {
    display: 'flex',
    padding: '30px',
    gap: '30px',
  },
  dropdownColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dropdownTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#545454',
  },
  dropdownLink: {
    color: '#545454',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '5px 0',
  },
  hero: {
    background: 'linear-gradient(135deg, #58f175 0%, #f1e758 100%)',
    padding: '80px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  heroText: {
    maxWidth: '900px',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#fff',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  leaseTypeToggle: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
  },
  leaseTypeButton: {
    padding: '12px 30px',
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    color: '#545454',
    transition: 'all 0.3s',
  },
  leaseTypeButtonActive: {
    backgroundColor: '#545454',
    color: '#fff',
  },
  searchFilters: {
    display: 'flex',
    gap: '10px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  filterSelect: {
    flex: 1,
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  showDealsButton: {
    padding: '12px 40px',
    backgroundColor: '#58f175',
    color: '#545454',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  inStockNotice: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#fff',
    fontSize: '15px',
  },
  inStockLink: {
    color: '#fff',
    textDecoration: 'underline',
    fontWeight: '500',
  },
  popularSearches: {
    backgroundColor: '#f8f8f8',
    padding: '20px 0',
  },
  sectionContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
  },
  popularSearchTabs: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tabLabel: {
    fontWeight: 'bold',
    marginRight: '10px',
    color: '#545454',
  },
  searchTab: {
    padding: '8px 15px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
  },
  dealsSection: {
    padding: '60px 20px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#545454',
  },
  highlight: {
    color: '#58f175',
  },
  sectionNav: {
    display: 'flex',
    gap: '10px',
  },
  navArrow: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #ddd',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '18px',
  },
  dealsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
  },
  dealCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  dealBadges: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    zIndex: 10,
  },
  dealBadge: {
    padding: '4px 10px',
    backgroundColor: '#58f175',
    color: '#545454',
    fontSize: '11px',
    fontWeight: 'bold',
    borderRadius: '12px',
  },
  dealImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  dealInfo: {
    padding: '20px',
  },
  dealName: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#545454',
  },
  dealVariant: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px',
  },
  dealBodyType: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '15px',
  },
  dealFeatures: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px',
  },
  featureIcon: {
    fontSize: '20px',
    cursor: 'help',
  },
  dealPricing: {
    borderTop: '1px solid #eee',
    paddingTop: '15px',
    marginBottom: '15px',
  },
  dealLabel: {
    fontSize: '13px',
    color: '#666',
    display: 'block',
    marginBottom: '8px',
  },
  dealPrice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '3px',
  },
  pricePound: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#545454',
  },
  priceAmount: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#545454',
  },
  priceFrequency: {
    fontSize: '12px',
    color: '#666',
    lineHeight: '1.3',
    marginTop: '8px',
  },
  dealActions: {
    display: 'flex',
    gap: '10px',
  },
  compareButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f8f8f8',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLookButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#58f175',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lifestyleSection: {
    padding: '60px 20px',
    backgroundColor: '#f8f8f8',
  },
  lifestyleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
    marginTop: '40px',
  },
  lifestyleCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  lifestyleImage: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
  },
  lifestyleContent: {
    padding: '25px',
  },
  lifestyleTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#545454',
  },
  lifestyleLink: {
    display: 'block',
    padding: '10px 0',
    color: '#545454',
    textDecoration: 'none',
    fontSize: '14px',
    borderBottom: '1px solid #eee',
  },
  processSection: {
    padding: '60px 20px',
  },
  processSubtitle: {
    fontSize: '16px',
    color: '#666',
    maxWidth: '800px',
    margin: '20px auto 40px',
    textAlign: 'center',
  },
  processGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  processCard: {
    backgroundColor: '#545454',
    color: '#fff',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
  },
  processNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#f1e758',
    marginBottom: '15px',
  },
  processTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  processDesc: {
    fontSize: '14px',
    lineHeight: '1.6',
    opacity: 0.9,
  },
  footer: {
    backgroundColor: '#545454',
    color: '#fff',
    padding: '60px 20px 20px',
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '40px',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  footerLogo: {
    height: '40px',
    marginBottom: '15px',
  },
  footerContact: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  footerHours: {
    fontSize: '13px',
    opacity: 0.8,
  },
  footerEmail: {
    color: '#f1e758',
    textDecoration: 'none',
  },
  socialIcons: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  socialIcon: {
    color: '#fff',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
    display: 'inline-flex',
  },
  awards: {
    marginTop: '15px',
  },
  trustpilot: {
    fontSize: '14px',
    color: '#f1e758',
  },
  footerHeading: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  footerLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '13px',
    opacity: 0.8,
    transition: 'opacity 0.2s',
  },
  footerBottom: {
    borderTop: '1px solid rgba(255,255,255,0.2)',
    paddingTop: '30px',
    marginTop: '30px',
  },
  disclaimerText: {
    fontSize: '11px',
    lineHeight: '1.6',
    opacity: 0.7,
    marginBottom: '15px',
  },
  copyright: {
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '20px',
    opacity: 0.6,
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('style[data-fade-in]')) {
  styleSheet.setAttribute('data-fade-in', 'true');
  document.head.appendChild(styleSheet);
}

export default FleetpricesHomepage;
