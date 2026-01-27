// Simple HTTP server for testing filters
const http = require('http');
const url = require('url');

const mockPlaces = [
  { id: 1, name: "Joe's Diner", location: "Toronto", type: "Restaurant", budget: "Medium" },
  { id: 2, name: "Central Park", location: "New York", type: "Park", budget: "Low" },
  { id: 3, name: "Starbucks", location: "Toronto", type: "Cafe", budget: "Medium" },
  { id: 4, name: "Luxury Hotel", location: "Vancouver", type: "Hotel", budget: "High" },
  { id: 5, name: "Pizza Palace", location: "Toronto", type: "Restaurant", budget: "Low" },
  { id: 6, name: "Art Museum", location: "Montreal", type: "Museum", budget: "Medium" },
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  console.log(`Request: ${pathname}`, query);
  
  if (pathname === '/api/places' || pathname === '/places') {
    const { location, type, budget } = query;
    
    let results = [...mockPlaces];
    
    // Apply location filter
    if (location) {
      results = results.filter(p => 
        p.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Apply type filter
    if (type) {
      results = results.filter(p => p.type === type);
    }
    
    // Apply budget filter
    if (budget) {
      results = results.filter(p => p.budget === budget);
    }
    
    const response = {
      success: true,
      message: `Found ${results.length} place(s)`,
      status: 200,
      data: results,
      count: results.length,
      filtersApplied: {
        location: location || 'None',
        type: type || 'None',
        budget: budget || 'None'
      }
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    
  } else if (pathname === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ 
      status: 'OK', 
      message: 'Filter API is running',
      timestamp: new Date().toISOString()
    }));
    
  } else {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'NextStop Filter API',
      version: '1.0',
      endpoints: {
        '/api/places': 'GET - Filter places (params: location, type, budget)',
        '/health': 'GET - Health check'
      },
      example: '/api/places?location=Toronto&type=Restaurant&budget=Medium'
    }, null, 2));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 FILTER API SERVER RUNNING');
  console.log('='.repeat(60));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log('📋 Test URLs:');
  console.log(`   1. All places: http://localhost:${PORT}/api/places`);
  console.log(`   2. Toronto only: http://localhost:${PORT}/api/places?location=Toronto`);
  console.log(`   3. Restaurants only: http://localhost:${PORT}/api/places?type=Restaurant`);
  console.log(`   4. Medium budget: http://localhost:${PORT}/api/places?budget=Medium`);
  console.log(`   5. Toronto + Cafe: http://localhost:${PORT}/api/places?location=Toronto&type=Cafe`);
  console.log(`   6. Combined: http://localhost:${PORT}/api/places?location=Toronto&type=Restaurant&budget=Medium`);
  console.log('='.repeat(60));
  console.log('💡 Open any URL in browser to test filters');
  console.log('='.repeat(60));
});