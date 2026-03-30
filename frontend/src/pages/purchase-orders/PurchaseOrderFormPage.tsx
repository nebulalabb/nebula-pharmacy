import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Save, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Loader2, 
  Truck, 
  Package, 
  Calculator,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { purchaseService } from '@/services/purchase.service';
import { suppliersService } from '@/services/suppliers.service';
import { productsService } from '@/services/products.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface POItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitCost: number;
  lotNumber: string;
  expiryDate: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function PurchaseOrderFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [supplierId, setSupplierId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [items, setItems] = useState<POItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // Queries
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const resp = await suppliersService.getSuppliers();
      return resp.data;
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-all'],
    queryFn: async () => {
      const resp = await productsService.getProducts({ limit: 100 });
      return resp.data.products;
    }
  });

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  }, [items]);

  const addProduct = (product: any) => {
    // Check if already added
    if (items.some(i => i.productId === product.id)) {
      toast.error('This product is already in the list');
      return;
    }

    const newItem: POItem = {
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      quantity: 1,
      unitCost: 0,
      lotNumber: '',
      expiryDate: '',
    };
    setItems([...items, newItem]);
    setSearchOpen(false);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const updateItem = (productId: string, field: keyof POItem, value: any) => {
    setItems(items.map(i => i.productId === productId ? { ...i, [field]: value } : i));
  };

  const mutation = useMutation({
    mutationFn: (data: any) => purchaseService.createPurchaseOrder(data),
    onSuccess: () => {
      toast.success('Inventory stock-in completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate('/purchase-orders');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete stock-in');
    }
  });

  const handleSubmit = () => {
    if (!supplierId) return toast.error('Please select a supplier');
    if (items.length === 0) return toast.error('Please add at least one product');
    
    // Validation
    const invalidItem = items.find(i => !i.lotNumber || !i.expiryDate || i.quantity <= 0 || i.unitCost < 0);
    if (invalidItem) {
      return toast.error(`Please complete lot info for ${invalidItem.productName}`);
    }

    mutation.mutate({
      supplierId,
      note,
      totalAmount,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitCost: i.unitCost,
        lotNumber: i.lotNumber,
        expiryDate: new Date(i.expiryDate).toISOString(),
      }))
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/purchase-orders')} className="rounded-full shadow-sm bg-white">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Stock Inbound</h1>
            <p className="text-slate-500 text-sm mt-1 italic">Record receiving pharmaceutical products from suppliers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Form Details (Takes 3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-md overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" /> Inbound Items
              </CardTitle>
              
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Find Medication
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 shadow-2xl border-indigo-100" align="end">
                  <Command className="bg-white">
                    <CommandInput placeholder="Search name or scan barcode..." className="border-none h-12 focus:ring-0" />
                    <CommandList>
                      <CommandEmpty className="p-4 text-center text-slate-400 italic">No products found.</CommandEmpty>
                      <CommandGroup heading="Available Medicines" className="p-2">
                        {products.map((p: any) => (
                          <CommandItem 
                            key={p.id} 
                            value={p.name} 
                            onSelect={() => addProduct(p)}
                            className="cursor-pointer hover:bg-indigo-50 rounded-lg py-3 px-4 flex flex-col items-start"
                          >
                            <span className="font-bold text-slate-800">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono italic">{p.barcode} | Unit: {p.unit}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px] font-bold">Product</TableHead>
                    <TableHead className="font-bold">Lot Info</TableHead>
                    <TableHead className="w-[100px] font-bold text-center">Qty</TableHead>
                    <TableHead className="w-[150px] font-bold text-right">Unit Cost</TableHead>
                    <TableHead className="w-[150px] font-bold text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                          <Package className="w-12 h-12 opacity-10" />
                          <p className="italic font-medium">Please add medications to this inbound bill.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="font-bold text-slate-800 leading-tight">{item.productName}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Per {item.unit}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2 py-2">
                            <div className="relative">
                              <Input 
                                placeholder="LOT NUMBER" 
                                value={item.lotNumber} 
                                onChange={(e) => updateItem(item.productId, 'lotNumber', e.target.value)}
                                className="h-8 text-[11px] font-bold border-slate-100 bg-slate-50/50 focus:bg-white"
                              />
                            </div>
                            <div className="relative">
                              <Input 
                                type="date"
                                value={item.expiryDate} 
                                onChange={(e) => updateItem(item.productId, 'expiryDate', e.target.value)}
                                className="h-8 text-[11px] font-medium border-slate-100 bg-slate-50/50 focus:bg-white"
                              />
                              <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            min="1"
                            value={item.quantity} 
                            onChange={(e) => updateItem(item.productId, 'quantity', Number(e.target.value))}
                            className="h-9 text-center font-bold text-slate-800"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            min="0"
                            step="1000"
                            value={item.unitCost} 
                            onChange={(e) => updateItem(item.productId, 'unitCost', Number(e.target.value))}
                            className="h-9 text-right font-bold text-indigo-600"
                          />
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-900 pr-4">
                          {formatCurrency(item.quantity * item.unitCost)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(item.productId)}
                            className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary (Takes 1 column) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-md overflow-hidden bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <CardHeader className="bg-white/90 backdrop-blur-sm border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" /> Supplier Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5 bg-white/90 backdrop-blur-sm">
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Supplier</Label>
                <Select onValueChange={setSupplierId} defaultValue={supplierId}>
                  <SelectTrigger id="supplier" className="h-11 font-bold border-slate-200">
                    <SelectValue placeholder="Choose source..." />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s: any) => (
                      <SelectItem key={s.id} value={s.id} className="font-medium cursor-pointer">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-xs font-bold uppercase tracking-widest text-slate-400">Order Notes</Label>
                <textarea 
                  id="note"
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional inbound info..."
                  className="w-full rounded-xl border-slate-200 bg-slate-50/30 p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-indigo-100 overflow-hidden bg-indigo-600 text-white">
            <CardHeader className="bg-indigo-700/30 border-b border-white/10">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Final Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center text-xs text-indigo-100 font-bold uppercase tracking-widest">
                <span>Items Count</span>
                <span>{items.length} unique meds</span>
              </div>
              
              <div className="pt-4 border-t border-white/10 space-y-1">
                <p className="text-[10px] text-indigo-200 font-black uppercase tracking-[0.2em] text-center">Grand Total Payable</p>
                <div className="text-3xl font-black text-center tracking-tighter">
                  {formatCurrency(totalAmount)}
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-black h-12 shadow-md uppercase tracking-widest mt-4" 
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Confirm Stock In
              </Button>
              
              <div className="bg-white/10 rounded-xl p-3 flex items-start gap-3 mt-4">
                <AlertCircle className="w-4 h-4 text-indigo-100 shrink-0 mt-0.5" />
                <p className="text-[10px] text-indigo-100 leading-tight">
                  Proceeding will instantly update warehouse shelf levels and create active medicinal batches.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
