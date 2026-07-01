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
});

export function firestoreFor(testEnv, fixture) {
  if (!fixture || !fixture.uid) {
    return testEnv.unauthenticatedContext().firestore();
  }
  return testEnv.authenticatedContext(fixture.uid, fixture.token).firestore();
}
