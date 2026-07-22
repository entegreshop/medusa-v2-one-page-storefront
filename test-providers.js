const { Medusa } = require("@medusajs/js-sdk");
const sdk = new Medusa({ baseUrl: "https://api.cizgibutik.com", maxRetries: 0 });

async function run() {
  const regions = await sdk.store.region.list({ fields: "*payment_providers" });
  console.log("Regions:", regions.regions.map(r => r.name));
  
  if (regions.regions.length > 0) {
     const providers = regions.regions[0].payment_providers;
     console.log("Providers for first region:", providers.map(p => p.id));
  }
}
run();
