const fs = require('fs');

async function run() {
  try {
    const res = await fetch("https://www.cizgibutik.com/tr/products/gold-dugmeli-denim-elbise");
    const html = await res.text();
    const scriptRegex = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/;
    const match = html.match(scriptRegex);
    if (match) {
      const data = JSON.parse(match[1]);
      // Search for the product object deeply
      let p = null;
      JSON.stringify(data, (key, val) => {
        if (val && val.id && val.title === "Gold Düğmeli Denim Elbise" && val.variants) {
          p = val;
        }
        return val;
      });
      if (p) {
         const variants = p.variants.map(v => ({ title: v.title, options: v.options.map(o => o.value) }));
         console.log(JSON.stringify(variants, null, 2));
      } else {
         console.log("Product not found in __NEXT_DATA__");
      }
    } else {
      console.log("__NEXT_DATA__ not found");
    }
  } catch (e) {
    console.error(e);
  }
}
run();
