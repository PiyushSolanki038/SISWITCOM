export interface ERPOrder {
  _id: string;
  orderNumber: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  status: 'draft' | 'confirmed' | 'fulfillment' | 'shipped' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
  fulfillmentStatus: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

export interface ERPInvoice {
  _id: string;
  invoiceNumber: string;
  grandTotal: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  dueDate: string;
  createdAt: string;
}

export interface ERPPayment {
  _id: string;
  paymentNumber: string;
  amount: number;
  method: 'credit_card' | 'bank_transfer' | 'check' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  paymentDate: string;
}
