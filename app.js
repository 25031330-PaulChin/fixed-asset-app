const express = require('express');
const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

// --- IN-MEMORY DATABASE ---
// Pre-populated with some initial data
let fixedAssets = [
    { id: '1716347000000', assetNo: 'FA-1001', costCenter: 'IT Dept', acquisitionDate: '2024-01-15', usefulLife: 5, cost: 2500, accDepreciation: 500 },
    { id: '1716347000001', assetNo: 'FA-1002', costCenter: 'HR Dept', acquisitionDate: '2023-06-01', usefulLife: 10, cost: 1200, accDepreciation: 240 }
];

// Helper function to format currency
const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;

// --- ROUTES ---

// 1. Home Page
app.get('/', (req, res) => {
    res.render('index');
});

// 2. View Items (List Page) with Sorting
app.get('/assets', (req, res) => {
    let displayAssets = [...fixedAssets]; // Clone array to avoid mutating original order
    const sort = req.query.sort;

    // Handle Sorting Logic
    if (sort === 'cost') {
        displayAssets.sort((a, b) => b.cost - a.cost); // Highest cost first
    } else if (sort === 'nbv') {
        displayAssets.sort((a, b) => (b.cost - b.accDepreciation) - (a.cost - a.accDepreciation));
    } else if (sort === 'date') {
        displayAssets.sort((a, b) => new Date(b.acquisitionDate) - new Date(a.acquisitionDate));
    }

    res.render('assets', { assets: displayAssets, formatCurrency });
});

// 3. Add Item Form
app.get('/assets/add', (req, res) => {
    res.render('add');
});

// 4. Handle Add Item Submission (POST)
app.post('/assets/add', (req, res) => {
    const newAsset = {
        id: Date.now().toString(), // Simple unique ID generator
        assetNo: req.body.assetNo,
        costCenter: req.body.costCenter,
        acquisitionDate: req.body.acquisitionDate,
        usefulLife: parseInt(req.body.usefulLife),
        cost: parseFloat(req.body.cost),
        accDepreciation: parseFloat(req.body.accDepreciation)
    };
    fixedAssets.push(newAsset);
    res.redirect('/assets');
});

// 5. View Item Details
app.get('/assets/:id', (req, res) => {
    const asset = fixedAssets.find(a => a.id === req.params.id);
    if (!asset) return res.status(404).send('Asset not found');
    
    // Calculate NBV on the fly
    const nbv = asset.cost - asset.accDepreciation;
    res.render('details', { asset, nbv, formatCurrency });
});

// 6. Edit Item Form
app.get('/assets/:id/edit', (req, res) => {
    const asset = fixedAssets.find(a => a.id === req.params.id);
    if (!asset) return res.status(404).send('Asset not found');
    res.render('edit', { asset });
});

// 7. Handle Edit Item Submission (POST)
app.post('/assets/:id/edit', (req, res) => {
    const index = fixedAssets.findIndex(a => a.id === req.params.id);
    if (index !== -1) {
        fixedAssets[index] = {
            ...fixedAssets[index], // Keep the original ID
            assetNo: req.body.assetNo,
            costCenter: req.body.costCenter,
            acquisitionDate: req.body.acquisitionDate,
            usefulLife: parseInt(req.body.usefulLife),
            cost: parseFloat(req.body.cost),
            accDepreciation: parseFloat(req.body.accDepreciation)
        };
    }
    res.redirect('/assets');
});

// 8. Handle Delete Item (POST only - strictly meeting assignment rules)
app.post('/assets/:id/delete', (req, res) => {
    fixedAssets = fixedAssets.filter(a => a.id !== req.params.id);
    res.redirect('/assets');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});