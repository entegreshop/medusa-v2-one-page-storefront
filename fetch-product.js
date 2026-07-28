const fs = require('fs');
fetch('https://api.cizgibutik.com/store/products?handle=gold-dugmeli-denim-elbise')
  .then(r => r.json())
  .then(d => {
    const p = d.products[0];
    console.log('Options:', JSON.stringify(p.options, null, 2));
    console.log('Variants:', JSON.stringify(p.variants.map(v => ({ id: v.id, title: v.title, options: v.options })), null, 2));
  });
