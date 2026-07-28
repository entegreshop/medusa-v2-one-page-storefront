async function run() {
  const backendUrl = 'https://api.cizgibutik.com';
  const publishableKey = 'pk_2c282ff4870aa9a458b774fc276908462c41f9626349330ff535a7bce4852274'; // From cart.ts

  // 1. Create a cart
  const cartRes = await fetch(`${backendUrl}/store/carts`, {
    method: 'POST',
    headers: { 'x-publishable-api-key': publishableKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ region_id: 'reg_01J32T7X6Z3J25M9ZJZGZ3X6H8' }) // Assuming a region id, or omit
  });
  if (!cartRes.ok) {
    // try without region
    const cartRes2 = await fetch(`${backendUrl}/store/carts`, {
      method: 'POST',
      headers: { 'x-publishable-api-key': publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const c2 = await cartRes2.json();
    console.log('Cart:', c2);
    if (!c2.cart) return;
    
    // Get product variants
    const pRes = await fetch(`${backendUrl}/store/products?handle=gold-dugmeli-denim-elbise`, {
      headers: { 'x-publishable-api-key': publishableKey }
    });
    const p = await pRes.json();
    const vId = p.products[0].variants[0].id;
    console.log('Variant ID:', vId);

    // Add to cart
    const addRes = await fetch(`${backendUrl}/store/carts/${c2.cart.id}/line-items`, {
      method: 'POST',
      headers: { 'x-publishable-api-key': publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant_id: vId, quantity: 1 })
    });
    console.log('Add res:', addRes.status, await addRes.text());
  }
}
run();
