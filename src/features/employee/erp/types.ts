export interface ERPOrder {
  _id: string;
  orderNumber: string;
  quoteId?: string;
  contractId?: string;
  accountId: {
    _id: string;
    name: string;
    email: string;
  };
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
  status: 'draft' | 'confirmed' | 'fulfilled' | 'closed' | 'cancelled' | 'shipped' | 'completed';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
  fulfillmentStatus: 'pending' | 'in_progress' | 'completed' | 'processing' | 'shipped' | 'delivered';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ERPInvoice {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  accountId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  balanceDue?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  dueDate: string;
  createdAt: string;
}

export interface ERPPayment {
  _id: string;
  paymentNumber: string;
  invoiceId: string;
  accountId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  method: 'credit_card' | 'bank_transfer' | 'check' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  paymentDate: string;
}

export interface ERPCreditNote {
  _id: string;
  creditNoteNumber: string;
  invoiceId: string;
  accountId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  reason: string;
  status: 'draft' | 'issued' | 'applied' | 'refunded';
  createdAt: string;
}
