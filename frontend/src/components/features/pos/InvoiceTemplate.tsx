import { forwardRef } from 'react';
import { format } from 'date-fns';

interface InvoiceTemplateProps {
  order: {
    id: string;
    saleNumber?: string;
    createdAt: string | Date;
    totalAmount: number;
    discount?: number;
    receivedAmount?: number;
    changeAmount?: number;
    paymentMethod: string;
    items: Array<{
      id: string;
      product?: { name: string; unit: string };
      name?: string; // fallback if product object is flat
      unit?: string; // fallback
      quantity: number;
      salePrice: number;
    }>;
  };
  staffName?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ order, staffName = 'Admin' }, ref) => {
    return (
      <div ref={ref} className="p-4 w-[80mm] bg-white text-slate-900 font-sans text-xs leading-tight">
        {/* Header */}
        <div className="text-center space-y-1 mb-4 border-b border-black border-dashed pb-2">
          <h1 className="text-lg font-black uppercase tracking-tighter">NEBULA PHARMACY</h1>
          <p className="text-[10px] font-bold">123 Nebula Street, Galaxy City</p>
          <p className="text-[10px]">Hotline: 0123 456 789</p>
        </div>

        {/* Bill Info */}
        <div className="space-y-1 mb-4 text-[10px]">
          <div className="flex justify-between">
            <span className="font-bold">Order ID:</span>
            <span>{order.saleNumber || order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Date:</span>
            <span>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Staff:</span>
            <span>{staffName}</span>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-[10px] mb-4">
          <thead className="border-b border-black border-dashed">
            <tr>
              <th className="text-left py-1 w-1/2">Product</th>
              <th className="text-center py-1">Qty</th>
              <th className="text-right py-1">Price</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100 italic">
                <td className="py-2">
                  <div className="font-bold leading-none capitalize">{item.product?.name || item.name}</div>
                  <div className="text-[8px] mt-0.5 uppercase opacity-70">Unit: {item.product?.unit || item.unit}</div>
                </td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-right py-2">{formatCurrency(item.salePrice)}</td>
                <td className="text-right py-2 font-bold">{formatCurrency(item.quantity * item.salePrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="space-y-1 border-t border-black border-dashed pt-2 text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.totalAmount + (order.discount || 0))}</span>
          </div>
          {order.discount ? (
            <div className="flex justify-between italic">
              <span>Discount:</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-black border-t border-slate-200 pt-1 mt-1">
            <span>GRAND TOTAL:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mt-4 space-y-0.5 text-[9px] text-slate-500 italic">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-bold">{order.paymentMethod === 'CASH' ? 'Cash' : 'QR / Transfer'}</span>
          </div>
          {order.paymentMethod === 'CASH' && (
            <>
              <div className="flex justify-between">
                 <span>Cash Received:</span>
                 <span>{formatCurrency(order.receivedAmount || order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                 <span>Change:</span>
                 <span>{formatCurrency(order.changeAmount || 0)}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-1">
          <p className="font-bold uppercase tracking-wider text-[10px]">Thank you for choosing Nebula!</p>
          <p className="text-[8px] italic opacity-70">Please keep the receipt for warranty or exchange.</p>
          <div className="h-4" />
          <div className="text-[8px] font-mono opacity-30">Power by NebulaLab v1.0</div>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';
