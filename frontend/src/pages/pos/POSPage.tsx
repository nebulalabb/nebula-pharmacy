import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Printer, 
  Package, 
  X,
  CheckCircle2,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import { useCartStore } from '@/stores/pos.store';
import { productsService } from '@/services/products.service';
import { salesService } from '@/services/sales.service';
import { InvoiceTemplate } from '@/components/features/pos/InvoiceTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function POSPage() {
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [customerCash, setCustomerCash] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<any>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { 
    items, 
    subtotal, 
    discount, 
    total, 
    addItem, 
    removeItem, 
    updateQuantity, 
    setDiscount, 
    clearCart 
  } = useCartStore();

  // Focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Fetch products for listing
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products-pos', searchTerm],
    queryFn: async () => {
      const resp = await productsService.getProducts({ 
        search: searchTerm, 
        limit: 12,
        isActive: true 
      });
      return resp.data.products;
    },
  });

  const products = productsData || [];

  const mutation = useMutation({
    mutationFn: (data: any) => salesService.createSale(data),
    onSuccess: (resp) => {
      setShowSuccessDialog(true);
      setLastSaleData(resp.data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products-pos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  });

  const handleCheckout = () => {
    if (items.length === 0) return toast.error('Cart is empty');
    
    const cash = Number(customerCash);
    if (paymentMethod === 'CASH' && cash < total) {
      return toast.error('Customer cash is not enough');
    }

    mutation.mutate({
      items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
      totalAmount: total,
      discount: discount,
      paymentMethod,
      receivedAmount: paymentMethod === 'CASH' ? cash : total,
      changeAmount: paymentMethod === 'CASH' ? Math.max(0, cash - total) : 0,
    });
  };

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Inbound_${lastSaleData?.saleNumber || lastSaleData?.id}`,
  });

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (products.length === 1 && searchTerm === products[0].barcode) {
      addItem(products[0]);
      setSearchTerm('');
    }
  };

  const changeDue = Math.max(0, Number(customerCash) - total);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-4 p-2 animate-in fade-in duration-500 overflow-hidden">
      {/* LEFT COLUMN: Product Catalog (60%) */}
      <div className="lg:w-[60%] flex flex-col h-full space-y-4">
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-4">
            <form onSubmit={handleBarcodeSubmit} className="relative group">
              <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                searchTerm ? "text-indigo-600" : "text-slate-400"
              )} />
              <Input
                ref={searchInputRef}
                placeholder="Search medications by name or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-2xl shadow-inner transition-all"
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 hover:bg-slate-100"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {isProductsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="p-8 bg-slate-50 rounded-full">
                <Package className="w-16 h-16 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold tracking-tight text-xl italic opacity-50">No medicines match your search...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {products.map((p: any) => {
                const isOutOfStock = p.totalStock <= 0;
                return (
                  <Card 
                    key={p.id}
                    onClick={() => !isOutOfStock && addItem(p)}
                    className={cn(
                      "group border-none shadow-sm h-full flex flex-col cursor-pointer transition-all active:scale-95",
                      isOutOfStock ? "opacity-50 grayscale cursor-not-allowed" : "hover:shadow-indigo-100 hover:shadow-xl ring-2 ring-transparent hover:ring-indigo-500"
                    )}
                  >
                    <CardHeader className="p-4 pb-2">
                       <div className="flex justify-between items-start gap-2">
                          <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 border-indigo-100 text-indigo-600 uppercase tracking-widest bg-indigo-50/30">
                            {p.unit}
                          </Badge>
                          <Badge className={cn(
                            "text-[10px] font-black border-none px-2 py-0.5",
                            p.totalStock < 10 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                          )}>
                            In Stock: {p.totalStock}
                          </Badge>
                       </div>
                       <CardTitle className="text-sm font-black text-slate-800 line-clamp-2 mt-2 group-hover:text-indigo-600 transition-colors">
                        {p.name}
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{p.activeIngredient || '---'}</p>
                    </CardContent>
                    <CardFooter className="p-4 bg-slate-50/50 rounded-b-2xl flex items-center justify-between">
                      <span className="text-lg font-black text-indigo-600">{formatCurrency(Number(p.salePrice))}</span>
                      <div className="p-2 bg-indigo-600 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Cart & Checkout (40%) */}
      <div className="lg:w-[40%] flex flex-col h-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Active Bill</h2>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{items.length} items collected</p>
            </div>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl h-10 w-10 p-0">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
              <ShoppingCart className="w-20 h-20 mb-4" />
              <p className="font-black uppercase tracking-widest text-sm">Cart is waiting...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="group p-4 bg-slate-50 rounded-2xl flex items-center gap-4 transition-all hover:bg-white hover:ring-2 hover:ring-indigo-500/10">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 leading-none mb-1">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {formatCurrency(item.salePrice)} / {item.unit}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-black text-sm text-slate-800">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="w-[100px] text-right font-black text-slate-900 tracking-tight">
                    {formatCurrency(item.total)}
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50/80 backdrop-blur-md rounded-t-[40px] shadow-inner space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between text-slate-500 font-bold text-sm italic">
              <span>Subtotal Cost</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500 font-bold text-sm italic shrink-0 whitespace-nowrap">Apply Discount</span>
              <div className="relative flex-1 group">
                 <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                 <Input 
                  type="number"
                  placeholder="0"
                  value={discount > 0 ? discount : ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="h-10 pl-9 pr-4 text-right font-bold text-emerald-600 bg-white border-slate-100 rounded-xl"
                />
              </div>
            </div>

            <Separator className="bg-slate-200" />
            
            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl">
              <span className="text-indigo-900 font-black text-lg uppercase tracking-wider">Total Due</span>
              <span className="text-2xl font-black text-indigo-700 tracking-tighter">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Mechanism</Label>
                <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                  <SelectTrigger className="h-12 font-bold bg-white border-slate-200 rounded-2xl shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200">
                    <SelectItem value="CASH" className="font-bold py-3"><div className="flex items-center gap-2"><Banknote className="w-4 h-4 text-emerald-500" /> Cash</div></SelectItem>
                    <SelectItem value="TRANSFER" className="font-bold py-3"><div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-indigo-500" /> QR Transfer</div></SelectItem>
                  </SelectContent>
                </Select>
             </div>
             
             {paymentMethod === 'CASH' && (
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Received</Label>
                   <div className="relative">
                      <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="0" 
                        value={customerCash}
                        onChange={(e) => setCustomerCash(e.target.value)}
                        className="h-12 pl-9 pr-4 text-right font-bold bg-white border-slate-200 rounded-2xl shadow-sm text-lg"
                      />
                   </div>
                </div>
             )}
          </div>

          {paymentMethod === 'CASH' && Number(customerCash) > 0 && (
             <div className="flex justify-between items-center py-2 px-6 bg-emerald-50 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <span className="text-emerald-700 font-bold text-sm tracking-tight italic">Customer Change:</span>
                <span className="text-lg font-black text-emerald-600">{formatCurrency(changeDue)}</span>
             </div>
          )}

          <Button 
            onClick={handleCheckout}
            disabled={mutation.isPending || items.length === 0}
            className="w-full h-16 rounded-[28px] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl shadow-indigo-100 tracking-tight transition-transform active:scale-95 group"
          >
            {mutation.isPending ? (
               <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Finalize & Record Sale
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={(open) => !open && setShowSuccessDialog(false)}>
        <DialogContent className="max-w-md p-8 rounded-[40px] border-none shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
               <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Sale Recorded!</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic">
                Transaction total: {formatCurrency(total)}
              </DialogDescription>
            </div>
            
            <div className="w-full space-y-3">
               <Button 
                onClick={() => handlePrint()}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg gap-3"
               >
                  <Printer className="w-5 h-5" /> In-Store Receipt
               </Button>
               <Button 
                variant="outline" 
                onClick={() => {
                  setShowSuccessDialog(false);
                  clearCart();
                  setSearchTerm('');
                  setCustomerCash('');
                  setLastSaleData(null);
                  searchInputRef.current?.focus();
                }}
                className="w-full h-14 rounded-2xl border-slate-200 font-bold text-slate-600"
               >
                  New Customer
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden Invoice for Printing */}
      <div className="hidden">
        {lastSaleData && (
          <InvoiceTemplate ref={invoiceRef} order={lastSaleData} />
        )}
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <ArrowRight className={cn(className, "animate-spin")} />;
}
