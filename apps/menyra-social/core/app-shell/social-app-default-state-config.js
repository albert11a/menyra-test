export const DEFAULT_PROFILE = {
  name: "",
  handle: "",
  bio: "",
  avatar: "",
  location: "",
  address: "",
  followers: 0,
  following: 0,
  privateAccount: false,
  karma: "0",
  roles: [],
  role: "user",
  sourceUserRole: "user",
  isPremium: false,
  restaurantId: "",
  staffRestaurantId: "",
  waiterRestaurantId: "",
  businessAccess: false,
  waiterAccess: false,
  permissions: {
    businessAccess: false,
    waiterAccess: false
  },
  staffRole: "",
  businessOwnerUid: "",
  staffActive: true,
  staffStatus: "",
  socialAccessMode: "",
  socialAccessMessage: "",
  leadSettings: null,
  posts: []
};

export const DEFAULT_SETTINGS = {
  darkMode: false,
  privateAccount: false,
  showOnline: false,
  pushNotifs: true,
  emailNotifs: false,
  language: "Deutsch"
};

export const DEFAULT_MENU_LAYOUT = {
  cardColor: "white"
};
