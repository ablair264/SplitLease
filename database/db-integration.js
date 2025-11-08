// Database Integration Module for Lease Analysis
// Connects PostgreSQL database with React frontend

const { Pool } = require('pg');

class LeaseAnalysisDB {
    constructor(config = {}) {
        this.pool = new Pool({
            user: config.user || process.env.DB_USER || 'postgres',
            host: config.host || process.env.DB_HOST || 'localhost',
            database: config.database || process.env.DB_NAME || 'lease_analysis',
            password: config.password || process.env.DB_PASSWORD || 'password',
            port: config.port || process.env.DB_PORT || 5432,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }

    async query(text, params) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    }

    // =============================================
    // BEST DEALS FUNCTIONS
    // =============================================

    /**
     * Get best deals with filtering options
     */
    async getBestDeals(filters = {}) {
        const { 
            manufacturer, 
            fuelType, 
            maxMonthly, 
            minScore, 
            bodyStyle, 
            limit = 100, 
            offset = 0 
        } = filters;

        try {
            const result = await this.query(`
                SELECT * FROM get_best_deals($1, $2, $3, $4, $5, $6, $7)
            `, [manufacturer, fuelType, maxMonthly, minScore, bodyStyle, limit, offset]);

            return {
                success: true,
                data: result.rows,
                total: result.rows.length
            };
        } catch (error) {
            console.error('Error fetching best deals:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Get best deals by specific lease terms
     */
    async getBestDealsByTerms(termMonths = 36, annualMileage = 10000, limit = 100) {
        try {
            const result = await this.query(`
                SELECT * FROM get_best_deals_by_terms($1, $2, $3)
            `, [termMonths, annualMileage, limit]);

            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            console.error('Error fetching deals by terms:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Get all offers for a specific vehicle (comparison view)
     */
    async getVehicleOffersComparison(vehicleId) {
        try {
            const result = await this.query(`
                SELECT * FROM get_vehicle_offers_comparison($1)
            `, [vehicleId]);

            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            console.error('Error fetching vehicle offers:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Get market statistics for dashboard
     */
    async getMarketStats() {
        try {
            const result = await this.query('SELECT * FROM get_market_stats()');
            
            return {
                success: true,
                data: result.rows[0] || {}
            };
        } catch (error) {
            console.error('Error fetching market stats:', error);
            return {
                success: false,
                error: error.message,
                data: {}
            };
        }
    }

    /**
     * Get provider performance data
     */
    async getProviderPerformance() {
        try {
            const result = await this.query('SELECT * FROM get_provider_performance()');
            
            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            console.error('Error fetching provider performance:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    // =============================================
    // DATA UPLOAD FUNCTIONS
    // =============================================

    /**
     * Create upload session
     */
    async createUploadSession(providerName, filename, fileFormat, totalRows, uploadedBy) {
        try {
            // Get or create provider
            let providerResult = await this.query(
                'SELECT id FROM providers WHERE name = $1',
                [providerName.toLowerCase()]
            );

            let providerId;
            if (providerResult.rows.length === 0) {
                const newProvider = await this.query(
                    'INSERT INTO providers (name, display_name) VALUES ($1, $2) RETURNING id',
                    [providerName.toLowerCase(), providerName]
                );
                providerId = newProvider.rows[0].id;
            } else {
                providerId = providerResult.rows[0].id;
            }

            // Create upload session
            const result = await this.query(`
                INSERT INTO upload_sessions (
                    provider_id, filename, file_format, total_rows, uploaded_by
                ) VALUES ($1, $2, $3, $4, $5) RETURNING id
            `, [providerId, filename, fileFormat, totalRows, uploadedBy]);

            return {
                success: true,
                sessionId: result.rows[0].id,
                providerId
            };
        } catch (error) {
            console.error('Error creating upload session:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process vehicle data and create lease offers
     */
    async processVehicleData(sessionId, vehicleData) {
        const client = await this.pool.connect();
        let processedCount = 0;
        let errorCount = 0;
        const errors = [];

        try {
            await client.query('BEGIN');

            for (const vehicle of vehicleData) {
                try {
                    const result = await client.query(`
                        SELECT insert_lease_offer(
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
                            $15, $16, $17, $18, $19, $20, $21, $22
                        )
                    `, [
                        vehicle.provider_name,
                        sessionId,
                        vehicle.cap_code || null,
                        vehicle.manufacturer,
                        vehicle.model,
                        vehicle.variant || null,
                        vehicle.p11d_price || null,
                        vehicle.fuel_type || null,
                        vehicle.mpg || null,
                        vehicle.co2_emissions || null,
                        vehicle.electric_range || null,
                        vehicle.insurance_group || null,
                        vehicle.body_style || null,
                        vehicle.transmission || null,
                        vehicle.monthly_rental,
                        vehicle.upfront_payment || 0,
                        vehicle.term_months || 36,
                        vehicle.annual_mileage || 10000,
                        vehicle.maintenance_included || false,
                        vehicle.admin_fee || 0,
                        vehicle.offer_valid_until || null,
                        vehicle.special_conditions || null
                    ]);

                    processedCount++;
                } catch (error) {
                    errorCount++;
                    errors.push({
                        vehicle: `${vehicle.manufacturer} ${vehicle.model}`,
                        error: error.message
                    });
                    console.error(`Error processing vehicle ${vehicle.manufacturer} ${vehicle.model}:`, error);
                }
            }

            // Update upload session
            await client.query(`
                UPDATE upload_sessions 
                SET processed_rows = $1, 
                    status = $2, 
                    processing_completed_at = CURRENT_TIMESTAMP,
                    error_message = $3
                WHERE id = $4
            `, [
                processedCount, 
                errorCount > 0 ? 'completed' : 'completed', // Could add 'partial' status
                errors.length > 0 ? JSON.stringify(errors.slice(0, 10)) : null, // Limit error log
                sessionId
            ]);

            await client.query('COMMIT');

            return {
                success: true,
                processed: processedCount,
                errors: errorCount,
                errorDetails: errors.slice(0, 5) // Return first 5 errors
            };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Transaction error:', error);
            return {
                success: false,
                error: error.message,
                processed: processedCount,
                errors: errorCount + 1
            };
        } finally {
            client.release();
        }
    }

    /**
     * Refresh best deals cache
     */
    async refreshBestDeals() {
        try {
            const result = await this.query('SELECT refresh_all_best_deals()');
            return {
                success: true,
                processed: result.rows[0].refresh_all_best_deals
            };
        } catch (error) {
            console.error('Error refreshing best deals:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // =============================================
    // UTILITY FUNCTIONS
    // =============================================

    /**
     * Get unique manufacturers for filtering
     */
    async getManufacturers() {
        try {
            const result = await this.query(`
                SELECT DISTINCT manufacturer 
                FROM best_deals_cache 
                ORDER BY manufacturer
            `);
            
            return {
                success: true,
                data: result.rows.map(row => row.manufacturer)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Get unique fuel types for filtering
     */
    async getFuelTypes() {
        try {
            const result = await this.query(`
                SELECT DISTINCT fuel_type 
                FROM best_deals_cache 
                WHERE fuel_type IS NOT NULL
                ORDER BY fuel_type
            `);
            
            return {
                success: true,
                data: result.rows.map(row => row.fuel_type)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Search vehicles by text query
     */
    async searchVehicles(query, limit = 20) {
        try {
            const result = await this.query(`
                SELECT DISTINCT 
                    v.id, v.cap_code, v.manufacturer, v.model, v.variant,
                    bdc.best_monthly_rental, bdc.best_provider_name, bdc.best_deal_score
                FROM vehicles v
                LEFT JOIN best_deals_cache bdc ON v.id = bdc.vehicle_id
                WHERE v.search_vector @@ plainto_tsquery('english', $1)
                   OR similarity(v.make_model_variant_normalized, lower($1)) > 0.3
                ORDER BY 
                    ts_rank(v.search_vector, plainto_tsquery('english', $1)) DESC,
                    similarity(v.make_model_variant_normalized, lower($1)) DESC
                LIMIT $2
            `, [query, limit]);
            
            return {
                success: true,
                data: result.rows
            };
        } catch (error) {
            console.error('Error searching vehicles:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Close database connection
     */
    async close() {
        await this.pool.end();
    }
}

// Export singleton instance
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

const leaseDB = new LeaseAnalysisDB(dbConfig);

module.exports = {
    LeaseAnalysisDB,
    leaseDB
};

// Example usage:
/*
const { leaseDB } = require('./db-integration');

// Get best deals
const bestDeals = await leaseDB.getBestDeals({
    manufacturer: 'BMW',
    maxMonthly: 400,
    limit: 50
});

// Process uploaded data
const sessionId = await leaseDB.createUploadSession('Lex Autolease', 'ratebook.csv', 'csv', 1000, 'user123');
const result = await leaseDB.processVehicleData(sessionId.sessionId, vehicleDataArray);

// Get market stats
const stats = await leaseDB.getMarketStats();
*/