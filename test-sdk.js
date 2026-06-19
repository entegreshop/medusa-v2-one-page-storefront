const Medusa = require('@medusajs/js-sdk').default;

const sdk = new Medusa({
  baseUrl: 'http://localhost:9001',
  publishableKey: 'test'
});

console.log('complete:', sdk.store.cart.complete.toString());
