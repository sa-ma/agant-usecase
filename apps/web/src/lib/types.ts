export type Customer = {
  id: number;
  name: string;
  kyb_status: string;
  addresses?: WhitelistedAddress[];
};

export type WhitelistedAddress = {
  id: number;
  customer_id: number;
  address: string;
  status: string;
};

export type MintRedeemRequest = {
  id: number;
  type: string;
  customer_id: number;
  address: string;
  amount_gbp: string;
  status: string;
  chain_tx_hash?: string | null;
  fiat_ledger_ref?: string | null;
  created_at: string;
  customer?: Customer;
  creator?: { name: string; email: string } | null;
  approver?: { name: string; email: string } | null;
};

export type AuditLog = {
  id: number;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  created_at: string;
  metadata_json?: Record<string, unknown> | null;
  actor?: { name: string; email: string } | null;
};

export type TokenStatus = {
  paused: boolean;
  frozen_count: number;
  frozen_addresses: string[];
};

export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type ReserveSnapshot = {
  cash_gbp: string;
  gov_securities_gbp: string;
  total_reserves_gbp: string;
  circulating_supply_gbp: string;
  created_at: string;
};
