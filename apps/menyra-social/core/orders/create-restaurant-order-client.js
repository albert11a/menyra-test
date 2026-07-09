import { USE_CREATE_RESTAURANT_ORDER_FUNCTION } from "../../../../shared/config/feature-flags.js";

const FUNCTION_NAME = "createRestaurantOrder";
const FUNCTION_REGION = "us-central1";

let createOrderCallablePromise = null;
const connectedFunctionsInstances = new WeakSet();

function asText(value, maxLength = 240) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

function asQuantity(value) {
  const quantity = Math.trunc(Number(value));
  return Number.isFinite(quantity) ? Math.min(99, Math.max(1, quantity)) : 1;
}

function asCropPercent(value, fallback = 50) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(100, Math.max(0, number))
    : fallback;
}

function buildContact(contact = {}) {
  const source = contact && typeof contact === "object" ? contact : {};
  return {
    name: asText(source.name, 160),
    phone: asText(source.phone, 80),
    email: asText(source.email, 240),
    city: asText(source.city, 160),
    address: asText(source.address, 300),
    tableNumber: Math.max(0, Math.trunc(Number(source.tableNumber) || 0)),
    tableLabel: asText(source.tableLabel, 120),
  };
}

function buildItem(item = {}) {
  const source = item && typeof item === "object" ? item : {};
  return {
    itemId: asText(source.itemId || source.id, 180),
    quantity: asQuantity(source.quantity),
    comment: asText(source.comment || source.note, 500),
    cartKey: asText(source.cartKey, 240),
    selectedSize: asText(source.selectedSize || source.size, 120),
    selectedColor: asText(source.selectedColor || source.color, 120),
    cropX: asCropPercent(source.cropX, 50),
    cropY: asCropPercent(source.cropY, 50),
  };
}

export function buildCreateRestaurantOrderRequest(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const tableNumber = Math.max(0, Math.trunc(Number(source.tableNumber) || 0));
  return {
    restaurantId: asText(source.restaurantId, 180),
    serviceMode: asText(source.serviceMode, 40),
    source: asText(source.source, 40),
    tableId: asText(source.tableId, 180),
    tableNumber,
    tableLabel: asText(source.tableLabel, 120),
    contact: buildContact(source.contact),
    items: (Array.isArray(source.items) ? source.items : []).map(buildItem),
    guestScopeUid: asText(source.guestScopeUid, 180),
    guestSessionId: asText(source.guestSessionId, 180),
  };
}

async function ensureCreateOrderCallable() {
  if (!USE_CREATE_RESTAURANT_ORDER_FUNCTION) {
    throw new Error("create-restaurant-order-function-disabled");
  }
  if (!createOrderCallablePromise) {
    // Literale Import-Strings: im Bundled-Modus dedupliziert Vite auf die
    // gebuendelten Firebase-Module (keine zweite rohe Kopie); Raw-Modus gleich.
    createOrderCallablePromise = Promise.all([
      import("/shared/firebase-config.js?v=2026-05-02-public-startup-diet-01"),
      import("/shared/vendor/firebase/11.0.0/firebase-functions.js"),
    ])
      .then(([firebaseConfigModule, functionsModule]) => {
        const firebaseApp = firebaseConfigModule?.app;
        if (!firebaseApp)
          throw new Error("create-restaurant-order-firebase-app-unavailable");
        const functionsInstance = functionsModule.getFunctions(
          firebaseApp,
          FUNCTION_REGION,
        );
        const emulatorSettings =
          firebaseConfigModule.getLocalFirebaseEmulatorSettings?.();
        if (
          emulatorSettings &&
          !connectedFunctionsInstances.has(functionsInstance)
        ) {
          functionsModule.connectFunctionsEmulator(
            functionsInstance,
            emulatorSettings.host,
            emulatorSettings.functionsPort,
          );
          connectedFunctionsInstances.add(functionsInstance);
        }
        return functionsModule.httpsCallable(functionsInstance, FUNCTION_NAME);
      })
      .catch((error) => {
        createOrderCallablePromise = null;
        throw error;
      });
  }
  return createOrderCallablePromise;
}

export async function createRestaurantOrder(input = {}) {
  const callable = await ensureCreateOrderCallable();
  return callable(buildCreateRestaurantOrderRequest(input));
}
