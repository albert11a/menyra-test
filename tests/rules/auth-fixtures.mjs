export const AUTH_FIXTURES = Object.freeze({
  guest: {
    label: "Guest",
    uid: null,
    token: null,
  },
  user: {
    label: "Normal User",
    uid: "shopper-demo",
    token: {
      email: "shopper.local@example.test",
      email_verified: true,
      name: "Local Shopper",
    },
  },
  owner: {
    label: "Restaurant Owner",
    uid: "owner-demo",
    token: {
      email: "owner.local@example.test",
      email_verified: true,
      name: "Local Owner",
    },
  },
  shopOwner: {
    label: "Shop Owner",
    uid: "shop-owner-demo",
    token: {
      email: "shop-owner.local@example.test",
      email_verified: true,
      name: "Local Shop Owner",
    },
  },
  hotelOwner: {
    label: "Hotel Owner",
    uid: "hotel-owner-demo",
    token: {
      email: "hotel-owner.local@example.test",
      email_verified: true,
      name: "Local Hotel Owner",
    },
  },
  waiter: {
    label: "Waiter",
    uid: "waiter-demo",
    token: {
      email: "waiter.local@example.test",
      email_verified: true,
      name: "Local Waiter",
    },
  },
  heart: {
    label: "CEO/Heart",
    uid: "heart-demo",
    token: {
      email: "heart.local@example.test",
      email_verified: true,
      name: "Local Heart CEO",
    },
  },
  outsider: {
    label: "Outside User",
    uid: "outside-demo",
    token: {
      email: "outside.local@example.test",
      email_verified: true,
      name: "Outside User",
    },
  },
  // CEO, der NUR ueber die bekannte Token-E-Mail erkannt wird: keine ceo-Rolle
  // im User-Doc, kein superadmins-Eintrag, andere UID als die Global-CEO-UID.
  // Spiegelt den echten Heart-Login (alberthoti.vsa@gmail.com) wider.
  ceoByEmail: {
    label: "CEO by email",
    uid: "ceo-by-email-demo",
    token: {
      email: "alberthoti.vsa@gmail.com",
      email_verified: true,
      name: "Albert CEO",
    },
  },
});

export function firestoreFor(testEnv, fixture) {
  if (!fixture || !fixture.uid) {
    return testEnv.unauthenticatedContext().firestore();
  }
  return testEnv.authenticatedContext(fixture.uid, fixture.token).firestore();
}
