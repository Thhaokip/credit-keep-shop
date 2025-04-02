
export interface CustomerType {
  id: string;
  name: string;
  phone: string;
  address: string;
  amount: number;
  notes: string;
  lastUpdated: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  address: string;
  amount: number;
  notes: string;
}
