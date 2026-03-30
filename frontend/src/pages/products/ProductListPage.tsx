import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Package,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { productsService } from '@/services/products.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function ProductListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', searchTerm, page],
    queryFn: async () => {
      const resp = await productsService.getProducts({
        search: searchTerm,
        page,
        limit,
      });
      return resp.data;
    },
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Medicine Directory</h1>
          <p className="text-slate-500 mt-1">Manage all pharmaceutical products and inventory levels</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
          <Link to="/products/new">
            <Plus className="w-4 h-4 mr-2" /> Add New Product
          </Link>
        </Button>
      </div>

      {/* Filters Area */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, barcode or active ingredient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" className="h-10 px-6">
                Search
              </Button>
              <Button type="button" variant="outline" className="h-10 px-3">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[100px] font-bold">STT</TableHead>
              <TableHead className="font-bold">Product Name</TableHead>
              <TableHead className="font-bold">Main Ingredient</TableHead>
              <TableHead className="font-bold">Unit</TableHead>
              <TableHead className="font-bold text-right">Selling Price</TableHead>
              <TableHead className="font-bold text-center">Stock</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-400 italic">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-400 italic">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product: any, index: number) => {
                const isLowStock = product.totalStock <= product.minStockLevel;
                
                return (
                  <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="text-slate-500 font-medium">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{product.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{product.barcode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm italic">
                      {product.activeIngredient || '---'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold bg-slate-50">
                        {product.unit}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-indigo-600">
                      {formatCurrency(Number(product.salePrice))}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={cn(
                          "font-bold",
                          isLowStock ? "text-rose-600 animate-pulse" : "text-slate-700"
                        )}>
                          {product.totalStock}
                        </span>
                        {isLowStock && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        product.isActive 
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-100 border-none"
                      )}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 p-1 border-slate-200">
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigate(`/products/${product.id}`)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/products/${product.id}/edit`)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4 text-indigo-500" /> Edit Info
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                            <Trash2 className="mr-2 h-4 w-4" /> Disable
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-500">
          Showing <span className="font-bold text-slate-800">{products.length}</span> items
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-9 px-4 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? "default" : "ghost"}
                size="sm"
                onClick={() => setPage(p)}
                className={cn(
                  "h-9 w-9 p-0",
                  page === p ? "bg-indigo-600 hover:bg-indigo-700" : "hover:bg-slate-100"
                )}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-9 px-4 shadow-sm"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
