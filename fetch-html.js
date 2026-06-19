const https = require('https');

https.get('https://jetsepetim.com/s/urban-core-oversize-takim-kampanya', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Search for container classes, main layouts or grid structures
    console.log('HTML Length:', data.length);
    
    // Print the head/meta and body start to see the framework and overall structure
    const bodyStart = data.indexOf('<body');
    if (bodyStart !== -1) {
      console.log('--- BODY START ---');
      console.log(data.substring(bodyStart, bodyStart + 1500));
    }

    // Look for layout wrappers (divs with class)
    const matches = data.match(/<div[^>]*class="[^"]*"[^>]*>/g) || [];
    console.log('--- DETECTED DIV CLASSES (Sample) ---');
    console.log(matches.slice(0, 30));
  });
}).on('error', (err) => {
  console.error('Hata:', err.message);
});
