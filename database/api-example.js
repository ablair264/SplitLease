// Express API endpoints for Lease Analysis
// Example implementation showing how to connect database to React frontend

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const { leaseDB } = require('./db-integration');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// =============================================
// BEST DEALS ENDPOINTS
// =============================================

/**
 * GET /api/best-deals
 * Get best deals with optional filtering
 */
app.get('/api/best-deals', async (req, res) => {
    try {
        const filters = {
            manufacturer: req.query.manufacturer || null,
            fuelType: req.query.fuelType || null,
            maxMonthly: req.query.maxMonthly ? parseFloat(req.query.maxMonthly) : null,
            minScore: req.query.minScore ? parseFloat(req.query.minScore) : null,
            bodyStyle: req.query.bodyStyle || null,
            limit: parseInt(req.query.limit) || 100,
            offset: parseInt(req.query.offset) || 0
        };

        const result = await leaseDB.getBestDeals(filters);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                filters: filters,
                count: result.data.length
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/best-deals/terms/:term/:mileage
 * Get best deals for specific lease terms
 */
app.get('/api/best-deals/terms/:term/:mileage', async (req, res) => {
    try {
        const termMonths = parseInt(req.params.term);
        const annualMileage = parseInt(req.params.mileage);
        const limit = parseInt(req.query.limit) || 100;

        const result = await leaseDB.getBestDealsByTerms(termMonths, annualMileage, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/vehicle/:id/offers
 * Get all offers for a specific vehicle
 */
app.get('/api/vehicle/:id/offers', async (req, res) => {
    try {
        const vehicleId = parseInt(req.params.id);
        const result = await leaseDB.getVehicleOffersComparison(vehicleId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================
// DASHBOARD DATA ENDPOINTS
// =============================================

/**
 * GET /api/dashboard/stats
 * Get market statistics for dashboard
 */
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const stats = await leaseDB.getMarketStats();
        const providers = await leaseDB.getProviderPerformance();
        
        res.json({
            success: true,
            marketStats: stats.data,
            providerStats: providers.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/filters
 * Get available filter options
 */
app.get('/api/filters', async (req, res) => {
    try {
        const [manufacturers, fuelTypes] = await Promise.all([
            leaseDB.getManufacturers(),
            leaseDB.getFuelTypes()
        ]);
        
        res.json({
            success: true,
            manufacturers: manufacturers.data,
            fuelTypes: fuelTypes.data,
            bodyStyles: ['hatchback', 'saloon', 'estate', 'suv', 'coupe', 'convertible', 'mpv', 'other']
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/search
 * Search vehicles by text query
 */
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        const limit = parseInt(req.query.limit) || 20;
        
        if (!query || query.length < 2) {
            return res.json({
                success: false,
                error: 'Query must be at least 2 characters'
            });
        }
        
        const result = await leaseDB.searchVehicles(query, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================
// UPLOAD ENDPOINTS
// =============================================

/**
 * POST /api/upload
 * Upload and process lease data file
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const providerName = req.body.providerName;
        const fieldMappings = JSON.parse(req.body.fieldMappings || '{}');
        
        if (!file || !providerName) {
            return res.status(400).json({
                success: false,
                error: 'File and provider name are required'
            });
        }

        // Create upload session
        const session = await leaseDB.createUploadSession(
            providerName,
            file.originalname,
            file.mimetype.includes('excel') ? 'xlsx' : 'csv',
            0, // Will update after parsing
            req.body.uploadedBy || 'unknown'
        );

        if (!session.success) {
            return res.status(500).json(session);
        }

        // Parse file based on type
        let vehicleData = [];
        
        if (file.mimetype.includes('excel') || file.originalname.endsWith('.xlsx')) {
            // Parse Excel file
            const workbook = XLSX.readFile(file.path);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            const headers = jsonData[0];
            const dataRows = jsonData.slice(1);
            
            vehicleData = dataRows.map(row => {
                const vehicle = { provider_name: providerName };
                Object.entries(fieldMappings).forEach(([field, index]) => {
                    if (index !== undefined && row[index] !== undefined) {
                        vehicle[field] = row[index];
                    }
                });
                return vehicle;
            });
        } else {
            // Parse CSV file
            return new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(file.path)
                    .pipe(csv())
                    .on('data', (row) => {
                        const vehicle = { provider_name: providerName };
                        Object.entries(fieldMappings).forEach(([field, index]) => {
                            const header = Object.keys(row)[index];
                            if (header && row[header] !== undefined) {
                                vehicle[field] = row[header];
                            }
                        });
                        results.push(vehicle);
                    })
                    .on('end', async () => {
                        vehicleData = results;
                        await processAndRespond();
                    })
                    .on('error', reject);
            });
        }

        await processAndRespond();

        async function processAndRespond() {
            // Filter out invalid entries
            const validVehicles = vehicleData.filter(v => 
                v.manufacturer && v.model && v.monthly_rental
            );

            // Process the data
            const result = await leaseDB.processVehicleData(session.sessionId, validVehicles);
            
            // Clean up uploaded file
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });

            // Refresh best deals cache in background
            leaseDB.refreshBestDeals().catch(console.error);

            res.json({
                success: true,
                sessionId: session.sessionId,
                totalRows: vehicleData.length,
                validRows: validVehicles.length,
                processed: result.processed,
                errors: result.errors,
                errorDetails: result.errorDetails
            });
        }
    } catch (error) {
        console.error('Upload error:', error);
        
        // Clean up file on error
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/refresh-cache
 * Manually refresh best deals cache
 */
app.post('/api/refresh-cache', async (req, res) => {
    try {
        const result = await leaseDB.refreshBestDeals();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================================
// ERROR HANDLING
// =============================================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Lease Analysis API server running on port ${PORT}`);
});

module.exports = app;

// Example frontend integration code for React:
/*
// In your React component:
const fetchBestDeals = async (filters = {}) => {
    try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/best-deals?${params}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching best deals:', error);
        return { success: false, error: error.message };
    }
};

const uploadRatebook = async (file, providerName, fieldMappings) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('providerName', providerName);
        formData.append('fieldMappings', JSON.stringify(fieldMappings));
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: error.message };
    }
};
*/