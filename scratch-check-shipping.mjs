

async function check() {
  console.log("Checking Shipping Options...");
  try {
    // We need a cart ID to get shipping options properly, but let's try getting all shipping options via admin API if possible.
    // Or just create a cart, add a product, and see shipping options.
    const cartRes = await fetch("https://api.cizgibutik.com/store/carts", { method: "POST" });
    const cartData = await cartRes.json();
    const cartId = cartData.cart.id;
    
    console.log("Cart created:", cartId);
    
    // Add a product (Let's fetch one product first)
    const prodRes = await fetch("https://api.cizgibutik.com/store/products?limit=1");
    const prodData = await prodRes.json();
    const variantId = prodData.products[0].variants[0].id;
    console.log("Variant ID:", variantId);
    
    const addRes = await fetch(`https://api.cizgibutik.com/store/carts/${cartId}/line-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: variantId, quantity: 1 })
    });
    const addData = await addRes.json();
    console.log("Added to cart. Items count:", addData.cart.items.length);
    
    // Fetch shipping options for this cart
    const shipRes = await fetch(`https://api.cizgibutik.com/store/shipping-options?cart_id=${cartId}`);
    const shipData = await shipRes.json();
    console.log("Shipping options available for cart:", JSON.stringify(shipData, null, 2));

  } catch (e) {
    console.error(e);
  }
}

check();
