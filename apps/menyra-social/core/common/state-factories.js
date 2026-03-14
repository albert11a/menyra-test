export function createEmptyShopCart() {
  return {
    restaurantId: "",
    businessName: "",
    businessAvatar: "",
    items: [],
    checkoutOpen: false,
    form: {
      name: "",
      phone: "",
      city: "",
      address: ""
    },
    status: "",
    loading: false
  };
}

export function createEmptyOrdersState() {
  return {
    items: [],
    loading: false,
    error: ""
  };
}

export function createEmptyFavoriteMenuItemsState() {
  return {
    items: [],
    loading: false,
    error: "",
    loaded: false
  };
}

export function createEmptyMenuDetailState() {
  return {
    open: false,
    item: null,
    index: 0,
    restaurantId: "",
    selectedSize: "",
    selectedColor: "",
    footerView: "cart",
    commentText: "",
    loading: false,
    sending: false
  };
}
