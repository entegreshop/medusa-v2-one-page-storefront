async function run() {
  const r = await fetch('https://api.cizgibutik.com/store/products?handle=gold-dugmeli-denim-elbise');
  const d = await r.json();
  const p = d.products[0];
  const opts = p.options.map(o => ({ title: o.title, values: o.values }));
  console.log(JSON.stringify(opts, null, 2));
  
  const variants = p.variants.slice(0, 3).map(v => ({ title: v.title, options: v.options.map(o => `'${o.value}'`) }));
  console.log(JSON.stringify(variants, null, 2));
}
run();
