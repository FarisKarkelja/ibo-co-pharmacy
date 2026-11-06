// Business constants shared by the API and the web client.

export const ROLES = ['User', 'Admin'] as const;
export type Role = (typeof ROLES)[number];

export const PICKUP_LOCATIONS = ['Teheranski Trg 7', 'Patriotske Lige 35'] as const;
export type PickupLocation = (typeof PICKUP_LOCATIONS)[number];

export const REVIEW_LOCATIONS = ['Both', ...PICKUP_LOCATIONS] as const;
export type ReviewLocation = (typeof REVIEW_LOCATIONS)[number];

export const ORDER_STATUSES = ['Active', 'Completed', 'Cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** VAT (PDV) in Bosnia and Herzegovina. Catalog prices are stored without VAT. */
export const TAX_RATE = 0.17;

export const MAX_CART_QUANTITY = 99;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Active: 'Aktivna',
  Completed: 'Završena',
  Cancelled: 'Otkazana',
};

export const REVIEW_LOCATION_LABELS: Record<ReviewLocation, string> = {
  Both: 'Obje lokacije',
  'Teheranski Trg 7': 'Teheranski Trg 7',
  'Patriotske Lige 35': 'Patriotske Lige 35',
};

export const ROLE_LABELS: Record<Role, string> = {
  User: 'Kupac',
  Admin: 'Administrator',
};
