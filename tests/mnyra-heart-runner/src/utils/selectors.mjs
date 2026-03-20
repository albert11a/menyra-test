export const SOCIAL_SELECTORS = Object.freeze({
  authForm: "#authForm",
  authEmail: "#authEmail",
  authPassword: "#authPassword",
  appShell: ".app-shell",
  menuDetailAddToCart: "#menuDetailAddToCartBtn",
  orderDrawer: "[data-nav=\"orders\"]",
  chatComposer: "textarea, input[type='text']",
  manifestLink: 'link[rel="manifest"]'
});

export const WAITER_SELECTORS = Object.freeze({
  loginForm: "#loginForm",
  loginEmail: "#loginEmail",
  loginPassword: "#loginPassword",
  logoutButton: "#logoutBtn",
  mainShell: "main, [data-tab], [data-order-action], #logoutBtn",
  manifestLink: 'link[rel="manifest"]'
});

export const SOCIAL_TABS = Object.freeze({
  feed: "feed",
  profile: "profile",
  menu: "menu",
  orders: "orders",
  chat: "chat",
  leads: "leads"
});
