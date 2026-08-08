export function createEmptyShopCart() {
  return {
    restaurantId: "",
    businessName: "",
    businessAvatar: "",
    tableNumber: 0,
    tableLabel: "",
    serviceMode: "",
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

export function createEmptyTableQrState() {
  return {
    restaurantId: "",
    enabled: true,
    count: 0,
    loaded: false,
    loading: false,
    saving: false,
    error: "",
    status: "",
    verifiedAt: 0
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
    previewImageSrc: "",
    selectedSize: "",
    selectedColor: "",
    infoTab: "info",
    footerView: "cart",
    commentText: "",
    loading: false,
    sending: false
  };
}
