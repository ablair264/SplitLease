import React, { useState } from 'react';
import { Car, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

const EmployeeSavingsPortal = () => {
    // State for form inputs
    const [salary, setSalary] = useState('');
    const [taxRegion, setTaxRegion] = useState('ewni');
    const [postcode, setPostcode] = useState('');
    const [deductions, setDeductions] = useState('0');
    
    // State to manage UI
    const [showResults, setShowResults] = useState(false);
    const [buttonHover, setButtonHover] = useState(false);
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [error, setError] = useState('');

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setShowResults(false);

        try {
            const response = await api.calculateEmployeeSavings({
                salary: parseFloat(salary),
                taxRegion,
                postcode,
                deductions: parseFloat(deductions) || 0,
                limit: 20
            });

            if (response.success && response.data) {
                setVehicles(response.data);
                setShowResults(true);
            } else {
                setError(response.error || 'Failed to calculate savings');
            }
        } catch (err) {
            console.error('Error calculating savings:', err);
            setError(err.message || 'An error occurred while calculating savings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.body}>
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.headerH1}>Employee Savings Portal</h1>
                    <p style={styles.headerP}>See how much you could save on a brand new car.</p>
                </header>
                <main style={styles.main}>
                    <aside style={styles.sidebar}>
                        <h2 style={styles.sidebarH2}>Your Details</h2>
                        <form id="calculator-form" onSubmit={handleFormSubmit}>
                            <div style={styles.formGroup}>
                                <label htmlFor="salary" style={styles.formGroupLabel}>Annual Salary</label>
                                <div style={styles.inputIcon}>
                                    <span style={styles.inputIconSpan}>£</span>
                                    <input
                                        type="number"
                                        id="salary"
                                        placeholder="e.g. 35000"
                                        required
                                        value={salary}
                                        onChange={(e) => setSalary(e.target.value)}
                                        style={{...styles.formGroupInput, paddingLeft: '30px'}}
                                    />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label htmlFor="tax-region" style={styles.formGroupLabel}>Tax Region</label>
                                <select
                                    id="tax-region"
                                    required
                                    value={taxRegion}
                                    onChange={(e) => setTaxRegion(e.target.value)}
                                    style={styles.formGroupInput}
                                >
                                    <option value="ewni">England, Wales or N. Ireland</option>
                                    <option value="scotland">Scotland</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label htmlFor="postcode" style={styles.formGroupLabel}>Postcode</label>
                                <input
                                    type="text"
                                    id="postcode"
                                    placeholder="e.g. SW1A 0AA"
                                    required
                                    value={postcode}
                                    onChange={(e) => setPostcode(e.target.value)}
                                    style={styles.formGroupInput}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label htmlFor="deductions" style={styles.formGroupLabel}>Other Monthly Sacrifices</label>
                                <div style={styles.inputIcon}>
                                    <span style={styles.inputIconSpan}>£</span>
                                    <input
                                        type="number"
                                        id="deductions"
                                        placeholder="e.g. 50"
                                        value={deductions}
                                        onChange={(e) => setDeductions(e.target.value)}
                                        style={{...styles.formGroupInput, paddingLeft: '30px'}}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                style={{
                                    ...styles.calculateBtn,
                                    backgroundColor: buttonHover ? '#00a693' : '#00BFA5',
                                    transform: buttonHover ? 'translateY(-2px)' : 'translateY(0)',
                                }}
                                onMouseEnter={() => setButtonHover(true)}
                                onMouseLeave={() => setButtonHover(false)}
                            >
                                Find My Cars
                            </button>
                        </form>
                    </aside>
                    <section style={styles.resultsArea}>
                        {error && (
                            <div style={styles.errorMessage}>
                                <p style={styles.errorText}>{error}</p>
                            </div>
                        )}
                        {loading ? (
                            <div id="results-placeholder" style={styles.resultsPlaceholder}>
                                <Loader2 
                                    size={50} 
                                    style={{
                                        ...styles.resultsPlaceholderIcon, 
                                        animation: 'spin 1s linear infinite',
                                        display: 'inline-block'
                                    }} 
                                />
                                <p style={styles.resultsPlaceholderP}>Calculating your savings...</p>
                            </div>
                        ) : !showResults ? (
                            <div id="results-placeholder" style={styles.resultsPlaceholder}>
                                <Car size={50} style={styles.resultsPlaceholderIcon} />
                                <p style={styles.resultsPlaceholderP}>Enter your details and click "Find My Cars" to see your personalised offers.</p>
                            </div>
                        ) : vehicles.length === 0 ? (
                            <div id="results-placeholder" style={styles.resultsPlaceholder}>
                                <Car size={50} style={styles.resultsPlaceholderIcon} />
                                <p style={styles.resultsPlaceholderP}>No vehicles found matching your criteria. Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div id="results-grid" style={{...styles.resultsGrid, ...(showResults && styles.resultsGridVisible)}}>
                                {vehicles.map((vehicle) => {
                                    const vehicleName = `${vehicle.manufacturer || ''} ${vehicle.model || ''} ${vehicle.variant || ''}`.trim();
                                    const imageUrl = `https://placehold.co/600x400/00BFA5/FFFFFF?text=${encodeURIComponent(vehicleName)}`;
                                    
                                    return (
                                        <div 
                                            key={vehicle.vehicle_id || `${vehicle.manufacturer}-${vehicle.model}-${vehicle.variant}`}
                                            style={styles.carCard}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.03)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={styles.carCardImage}>
                                                <img src={imageUrl} alt={vehicleName} style={styles.carCardImageImg} />
                                            </div>
                                            <div style={styles.carCardContent}>
                                                <h3 style={styles.carCardContentH3}>{vehicleName}</h3>
                                                {vehicle.fuel_type && (
                                                    <p style={styles.carCardContentFuelType}>{vehicle.fuel_type}</p>
                                                )}
                                                <p style={styles.carCardContentPriceLabel}>Your Net Monthly Cost</p>
                                                <p style={styles.carCardContentPriceValue}>
                                                    £{Math.round(vehicle.net_monthly_cost || 0).toLocaleString()} 
                                                    <span style={styles.carCardContentPriceValueSpan}>/month</span>
                                                </p>
                                                {vehicle.monthly_saving > 0 && (
                                                    <p style={styles.carCardContentSaving}>
                                                        Save £{Math.round(vehicle.monthly_saving).toLocaleString()}/month
                                                    </p>
                                                )}
                                                {vehicle.best_provider_name && (
                                                    <p style={styles.carCardContentProvider}>
                                                        via {vehicle.best_provider_name}
                                                    </p>
                                                )}
                                                <a href="#" style={styles.carCardContentViewDealBtn}>View Details</a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

// CSS-in-JS styles object
const styles = {
    // Define colors
    tealDark: '#004d4d',
    tealAccent: '#00BFA5',
    greyLight: '#F9FAFB',
    greyBorder: '#e2e8f0',
    textDark: '#333333',
    textLight: '#555555',

    body: {
        fontFamily: "'Lato', sans-serif",
        backgroundColor: '#f0f4f8',
        color: '#333333',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        padding: '40px',
    },
    container: {
        width: '100%',
        maxWidth: '1200px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#004d4d',
        color: '#FFFFFF',
        padding: '30px 40px',
    },
    headerH1: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: '32px',
        fontWeight: '700',
        margin: 0,
    },
    headerP: {
        fontSize: '18px',
        opacity: 0.9,
        marginTop: '5px',
        margin: 0,
    },
    main: {
        display: 'grid',
        gridTemplateColumns: '350px 1fr',
        minHeight: '700px',
    },
    sidebar: {
        backgroundColor: '#F9FAFB',
        padding: '30px',
        borderRight: '1px solid #e2e8f0',
    },
    sidebarH2: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: '22px',
        color: '#004d4d',
        marginBottom: '25px',
        borderBottom: '2px solid #00BFA5',
        paddingBottom: '10px',
        margin: 0,
    },
    formGroup: {
        marginBottom: '20px',
    },
    formGroupLabel: {
        display: 'block',
        fontWeight: '700',
        fontSize: '16px',
        marginBottom: '8px',
        color: '#333333',
    },
    formGroupInput: {
        width: '100%',
        padding: '12px 15px',
        fontSize: '16px',
        fontFamily: "'Lato', sans-serif",
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
    },
    inputIcon: {
        position: 'relative',
    },
    inputIconSpan: {
        position: 'absolute',
        left: '15px',
        top: '13px',
        fontSize: '16px',
        color: '#555555',
        fontWeight: '700',
    },
    calculateBtn: {
        width: '100%',
        padding: '15px',
        fontSize: '18px',
        fontWeight: '700',
        fontFamily: "'Poppins', sans-serif",
        color: '#FFFFFF',
        backgroundColor: '#00BFA5',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s',
    },
    resultsArea: {
        padding: '30px',
    },
    resultsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '25px',
        opacity: 0,
        transform: 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
    },
    resultsGridVisible: {
        opacity: 1,
        transform: 'translateY(0)',
    },
    carCard: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.03)',
        transition: 'box-shadow 0.3s, transform 0.3s',
        cursor: 'pointer',
    },
    carCardImage: {
        height: '180px',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    carCardImageImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    carCardContent: {
        padding: '20px',
    },
    carCardContentH3: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: '20px',
        fontWeight: '700',
        color: '#004d4d',
        marginBottom: '15px',
        margin: 0,
    },
    carCardContentPriceLabel: {
        fontSize: '14px',
        color: '#555555',
        marginBottom: '5px',
        margin: 0,
    },
    carCardContentPriceValue: {
        fontSize: '26px',
        fontWeight: '700',
        fontFamily: "'Poppins', sans-serif",
        color: '#00BFA5',
        marginBottom: '15px',
        margin: 0,
    },
    carCardContentPriceValueSpan: {
        fontSize: '16px',
        fontWeight: '400',
        color: '#555555',
    },
    carCardContentViewDealBtn: {
        display: 'block',
        width: '100%',
        textAlign: 'center',
        padding: '12px',
        fontSize: '16px',
        fontWeight: '700',
        color: '#004d4d',
        backgroundColor: 'transparent',
        border: '2px solid #004d4d',
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'background-color 0.2s, color 0.2s',
        boxSizing: 'border-box',
    },
    resultsPlaceholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        color: '#555555',
    },
    resultsPlaceholderIcon: {
        fontSize: '50px',
        color: '#e2e8f0',
        marginBottom: '20px',
    },
    resultsPlaceholderP: {
        fontSize: '18px',
        maxWidth: '300px',
        margin: 0,
    },
    errorMessage: {
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
    },
    errorText: {
        color: '#c33',
        fontSize: '16px',
        margin: 0,
        fontWeight: '600',
    },
    carCardContentFuelType: {
        fontSize: '12px',
        color: '#888',
        marginBottom: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        margin: 0,
    },
    carCardContentSaving: {
        fontSize: '14px',
        color: '#4caf50',
        fontWeight: '600',
        marginBottom: '8px',
        margin: 0,
    },
    carCardContentProvider: {
        fontSize: '12px',
        color: '#888',
        marginBottom: '10px',
        margin: 0,
    },
};

export default EmployeeSavingsPortal;

