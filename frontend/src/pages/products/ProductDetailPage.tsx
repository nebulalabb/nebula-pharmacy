import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Edit, 
  Pill, 
  Calendar, 
  Layers, 
  History, 
  TrendingUp, 
  AlertCircle,
  Package,
  Activity,
  ArrowRight
} from 'lucide-react';
import { productsService } from '@/services/products.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const resp = await productsService.getProductById(id!);
      return resp.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  }

  if (isError || !product) {
    return <div className="p-8 text-center text-rose-500">Product not found.</div>;
  }

  const isLowStock = product.totalStock <= product.minStockLevel;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/products')} className="rounded-full shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              {product.name}
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> {product.category?.name || 'Uncategorized'} | Barcode: {product.barcode}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="h-10 border-slate-200">
            <Link to={`/products/${id}/edit`}>
              <Edit className="w-4 h-4 mr-2" /> Edit Info
            </Link>
          </Button>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 h-10 shadow-md">
            <Link to="/pos">
              Sell This Medicine <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Info Card */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600" /> Medication Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-slate-400 font-medium italic">Active Ingredient:</div>
              <div className="text-slate-900 font-bold text-right">{product.activeIngredient || '---'}</div>
              
              <div className="text-slate-400 font-medium italic">Dosage Form:</div>
              <div className="text-slate-900 font-bold text-right">{product.dosageForm || '---'}</div>
              
              <div className="text-slate-400 font-medium italic">Concentration:</div>
              <div className="text-slate-900 font-bold text-right">{product.concentration || '---'}</div>
              
              <div className="text-slate-400 font-medium italic">Primary Unit:</div>
              <div className="text-slate-900 font-bold text-right capitalize">{product.unit}</div>

              <div className="text-slate-400 font-medium italic">Batch Managed:</div>
              <div className="text-right">
                <Badge variant={product.isBatchManaged ? 'outline' : 'secondary'} className="bg-indigo-50 border-indigo-100 text-indigo-700 font-bold">
                  {product.isBatchManaged ? 'REQUIRED' : 'NO'}
                </Badge>
              </div>
            </div>
            {product.description && (
              <div className="pt-4 border-t border-slate-50">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Instructions / Notes</p>
                <p className="text-sm text-slate-600 leading-relaxed italic">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Summary Card */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" /> Stock Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col justify-center items-center space-y-4 min-h-[220px]">
            <div className="text-center">
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">Total Warehouse Stock</p>
              <div className={cn(
                "text-6xl font-black transition-colors",
                isLowStock ? "text-rose-600" : "text-slate-900"
              )}>
                {product.totalStock}
              </div>
              <p className="text-slate-400 font-bold text-sm uppercase">{product.unit}(s)</p>
            </div>
            
            {isLowStock ? (
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl flex items-center gap-3 w-full animate-pulse">
                <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
                <p className="text-xs text-rose-700 font-bold leading-tight uppercase">
                  Low stock alert! Below min level of {product.minStockLevel}
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center gap-3 w-full">
                <TrendingUp className="w-6 h-6 text-emerald-500 shrink-0" />
                <p className="text-[10px] text-emerald-700 font-bold leading-tight uppercase">
                  Healthy stock levels identified
                </p>
              </div>
            )}
            
            <div className="w-full flex justify-between items-center pt-4 border-t border-slate-50 mt-4">
              <span className="text-sm text-slate-500 italic">Selling Price:</span>
              <span className="text-xl font-black text-indigo-600">{formatCurrency(Number(product.salePrice))}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Mini Cards */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="border-none shadow-sm bg-indigo-600 text-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-indigo-100 font-bold uppercase tracking-widest mb-1">Lifetime Sold</p>
                <h4 className="text-2xl font-black">---</h4>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-slate-900 text-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Last Purchase</p>
                <h4 className="text-sm font-bold truncate">---</h4>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Batches Table */}
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" /> Active Inventory Batches
          </CardTitle>
          <Badge className="bg-slate-100 text-slate-600 font-bold border-none">
            {product.inventoryBatches?.length || 0} batches tracked
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/10">
              <TableRow>
                <TableHead className="font-bold">Lot Number</TableHead>
                <TableHead className="font-bold">Manufacturing Date</TableHead>
                <TableHead className="font-bold">Expiration Date</TableHead>
                <TableHead className="text-right font-bold">Remaining Stock</TableHead>
                <TableHead className="text-right font-bold">Unit Cost</TableHead>
                <TableHead className="text-center font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.inventoryBatches?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">
                    No active stock batches found for this medicine.
                  </TableCell>
                </TableRow>
              ) : (
                product.inventoryBatches.map((batch: any) => {
                  const isExpired = new Date(batch.expiryDate) < new Date();
                  return (
                    <TableRow key={batch.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-bold text-slate-700">{batch.lotNumber}</TableCell>
                      <TableCell className="text-slate-500">
                        {batch.manufacturingDate ? format(new Date(batch.manufacturingDate), 'dd/MM/yyyy') : '---'}
                      </TableCell>
                      <TableCell className={cn(
                        "font-medium",
                        isExpired ? "text-rose-600" : "text-slate-700"
                      )}>
                        {batch.expiryDate ? format(new Date(batch.expiryDate), 'dd/MM/yyyy') : '---'}
                      </TableCell>
                      <TableCell className="text-right font-black text-slate-800">
                        {batch.quantityRemaining}
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {formatCurrency(Number(batch.unitCost))}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          isExpired 
                            ? "bg-rose-100 text-rose-700" 
                            : "bg-emerald-100 text-emerald-700"
                        )}>
                          {isExpired ? 'EXPIRED' : 'ACTIVE STOCK'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
