export const trackViewContent = (product: { id: string; title: string; price: number; currency: string }) => {
  if (typeof window === "undefined") return;

  // 1. Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq("track", "ViewContent", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      value: product.price,
      currency: product.currency
    });
  }

  // 2. TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track("ViewContent", {
      contents: [{
        content_id: product.id,
        content_name: product.title,
        content_type: "product",
        quantity: 1,
        price: product.price
      }],
      value: product.price,
      currency: product.currency
    });
  }

  // 3. Google Analytics (GA4)
  if ((window as any).gtag) {
    (window as any).gtag("event", "view_item", {
      currency: product.currency,
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.title,
        price: product.price,
        quantity: 1
      }]
    });
  }
};

export const trackAddToCart = (product: { id: string; title: string; price: number; currency: string; quantity: number }) => {
  if (typeof window === "undefined") return;

  // 1. Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq("track", "AddToCart", {
      content_ids: [product.id],
      content_name: product.title,
      content_type: "product",
      value: product.price * product.quantity,
      currency: product.currency
    });
  }

  // 2. TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track("AddToCart", {
      contents: [{
        content_id: product.id,
        content_name: product.title,
        content_type: "product",
        quantity: product.quantity,
        price: product.price
      }],
      value: product.price * product.quantity,
      currency: product.currency
    });
  }

  // 3. Google Analytics (GA4)
  if ((window as any).gtag) {
    (window as any).gtag("event", "add_to_cart", {
      currency: product.currency,
      value: product.price * product.quantity,
      items: [{
        item_id: product.id,
        item_name: product.title,
        price: product.price,
        quantity: product.quantity
      }]
    });
  }
};

export const trackInitiateCheckout = (cart: { id: string; total: number; currency: string; items: any[] }) => {
  if (typeof window === "undefined") return;

  const contentIds = cart.items.map(item => item.variant?.product_id || item.product_id || item.id);

  // 1. Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq("track", "InitiateCheckout", {
      content_ids: contentIds,
      content_type: "product",
      value: cart.total,
      currency: cart.currency
    });
  }

  // 2. TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track("InitiateCheckout", {
      contents: cart.items.map(item => ({
        content_id: item.variant?.product_id || item.product_id || item.id,
        content_name: item.title,
        content_type: "product",
        quantity: item.quantity,
        price: (item.unit_price || 0) / 100
      })),
      value: cart.total,
      currency: cart.currency
    });
  }

  // 3. Google Analytics (GA4)
  if ((window as any).gtag) {
    (window as any).gtag("event", "begin_checkout", {
      currency: cart.currency,
      value: cart.total,
      items: cart.items.map(item => ({
        item_id: item.variant?.product_id || item.product_id || item.id,
        item_name: item.title,
        price: (item.unit_price || 0) / 100,
        quantity: item.quantity
      }))
    });
  }
};

export const trackPurchase = (order: { id: string; total: number; currency: string; items: any[] }) => {
  if (typeof window === "undefined") return;

  const contentIds = order.items.map(item => item.variant?.product_id || item.product_id || item.id);

  // 1. Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq("track", "Purchase", {
      content_ids: contentIds,
      content_type: "product",
      value: order.total,
      currency: order.currency
    });
  }

  // 2. TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track("CompletePayment", {
      contents: order.items.map(item => ({
        content_id: item.variant?.product_id || item.product_id || item.id,
        content_name: item.title,
        content_type: "product",
        quantity: item.quantity,
        price: (item.unit_price || 0) / 100
      })),
      value: order.total,
      currency: order.currency
    });
  }

  // 3. Google Analytics (GA4)
  if ((window as any).gtag) {
    (window as any).gtag("event", "purchase", {
      transaction_id: order.id,
      currency: order.currency,
      value: order.total,
      items: order.items.map(item => ({
        item_id: item.variant?.product_id || item.product_id || item.id,
        item_name: item.title,
        price: (item.unit_price || 0) / 100,
        quantity: item.quantity
      }))
    });
  }
};

export const trackViewCart = (cart: { id: string; total: number; currency: string; items: any[] }) => {
  if (typeof window === "undefined") return;

  const contentIds = cart.items.map(item => item.variant?.product_id || item.product_id || item.id);

  // 1. Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq("track", "ViewContent", {
      content_ids: contentIds,
      content_type: "product",
      value: cart.total,
      currency: cart.currency
    });
    (window as any).fbq("trackCustom", "ViewCart", {
      content_ids: contentIds,
      value: cart.total,
      currency: cart.currency,
      num_items: cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    });
  }

  // 2. TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track("ViewContent", {
      contents: cart.items.map(item => ({
        content_id: item.variant?.product_id || item.product_id || item.id,
        content_name: item.title,
        content_type: "product",
        quantity: item.quantity,
        price: (item.unit_price || 0) / 100
      })),
      value: cart.total,
      currency: cart.currency
    });
  }

  // 3. Google Analytics (GA4)
  if ((window as any).gtag) {
    (window as any).gtag("event", "view_cart", {
      currency: cart.currency,
      value: cart.total,
      items: cart.items.map(item => ({
        item_id: item.variant?.product_id || item.product_id || item.id,
        item_name: item.title,
        price: (item.unit_price || 0) / 100,
        quantity: item.quantity
      }))
    });
  }
};

export const trackAddPaymentInfo = (params: {
  cart: { id: string; total: number; currency: string; items: any[] };
  paymentOption: string;
}) => {
  if (typeof window === "undefined") return;

  const { cart, paymentOption } = params;
  const contentIds = cart.items.map(item => item.variant?.product_id || item.product_id || item.id);

  // 1. Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq("track", "AddPaymentInfo", {
      content_ids: contentIds,
      content_type: "product",
      value: cart.total,
      currency: cart.currency,
      payment_option: paymentOption
    });
  }

  // 2. TikTok Pixel
  if ((window as any).ttq) {
    (window as any).ttq.track("AddPaymentInfo", {
      contents: cart.items.map(item => ({
        content_id: item.variant?.product_id || item.product_id || item.id,
        content_name: item.title,
        content_type: "product",
        quantity: item.quantity,
        price: (item.unit_price || 0) / 100
      })),
      value: cart.total,
      currency: cart.currency,
      payment_option: paymentOption
    });
  }

  // 3. Google Analytics (GA4)
  if ((window as any).gtag) {
    (window as any).gtag("event", "add_payment_info", {
      currency: cart.currency,
      value: cart.total,
      payment_type: paymentOption,
      items: cart.items.map(item => ({
        item_id: item.variant?.product_id || item.product_id || item.id,
        item_name: item.title,
        price: (item.unit_price || 0) / 100,
        quantity: item.quantity
      }))
    });
  }
};
