import assert from "node:assert/strict";
import test from "node:test";

import { renderOrdersViewCore } from "../apps/menyra-social/core/orders/orders-render-utils.js";

function renderOrders(overrides = {}) {
  return renderOrdersViewCore({
    state: {
      userProfile: {
        role: "business",
        restaurantId: "pidhi-madh",
      },
      orders: {
        items: [
          {
            id: "order-demo-001",
            status: "new",
            buyerName: "Local Guest",
            contact: {
              name: "Local Guest",
              city: "Prishtina",
              phone: "+383 44 000 111",
            },
            tableNumber: 2,
            items: [
              {
                name: "Local Breakfast Plate",
                quantity: 2,
                price: 6.9,
              },
            ],
            total: 13.8,
            createdAt: "2026-07-01T07:00:00.000Z",
          },
        ],
        loading: false,
        error: "",
        ...(overrides.orders || {}),
      },
      ...(overrides.state || {}),
    },
    canAccessRestaurantOrdersFn: () => true,
    getOptimizedImageUrlFn: (value) => String(value || ""),
    formatPriceFn: (value) => `EUR ${Number(value || 0).toFixed(2)}`,
    parsePriceValueFn: (value) => Number(value || 0) || 0,
    formatRelativeFn: () => "gerade eben",
    toDateSafeFn: (value) => new Date(value),
  });
}

test("orders view keeps existing rows visible during refresh loading", () => {
  const html = renderOrders({
    orders: {
      loading: true,
    },
  });

  assert.match(html, /Local Breakfast Plate/);
  assert.match(html, /Bestellungen werden aktualisiert/);
  assert.doesNotMatch(html, /py-16[^>]*>Bestellungen werden geladen/);
  assert.doesNotMatch(html, /Noch keine Bestellungen/);
});

test("orders view keeps existing rows visible when a refresh reports an error", () => {
  const html = renderOrders({
    orders: {
      error: "Bestellungen konnten nicht geladen werden.",
    },
  });

  assert.match(html, /Local Breakfast Plate/);
  assert.match(html, /Bestellungen konnten nicht geladen werden/);
  assert.doesNotMatch(html, /Noch keine Bestellungen/);
});

test("orders view still shows first-load loading and empty states", () => {
  const firstLoadHtml = renderOrders({
    orders: {
      items: [],
      loading: true,
    },
  });
  const emptyHtml = renderOrders({
    orders: {
      items: [],
    },
  });

  assert.match(firstLoadHtml, /Bestellungen werden geladen/);
  assert.doesNotMatch(firstLoadHtml, /Bestellungen werden aktualisiert/);
  assert.match(emptyHtml, /Noch keine Bestellungen/);
});
