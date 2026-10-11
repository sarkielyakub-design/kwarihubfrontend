export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type CurrentUser = {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
};

export type AdminDashboard = {
  total_users: number;
  total_sellers: number;
  total_products: number;
  total_categories: number;
  total_orders: number;
  total_payments: number;
  total_withdrawals: number;
  total_reviews: number;
  total_revenue: number | string;
  pending_withdrawals: number;
  pending_products: number;
};
