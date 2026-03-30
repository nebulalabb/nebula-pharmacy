import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Save, 
  X, 
  ChevronLeft, 
  Loader2, 
  Scan, 
  Info, 
  Banknote, 
  LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productsService } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  barcode: z.string().min(1, 'Barcode is required'),
  activeIngredient: z.string().optional(),
  dosageForm: z.string().optional(),
  concentration: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  salePrice: z.number().min(0, 'Sale price must be positive'),
  minStockLevel: z.number().min(0, 'Min stock level must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean(),
  isBatchManaged: z.boolean(),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoadingData, setIsLoadingData] = useState(isEdit);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      barcode: '',
      unit: '',
      salePrice: 0,
      minStockLevel: 10,
      categoryId: '',
      isActive: true,
      isBatchManaged: true,
      activeIngredient: '',
      dosageForm: '',
      concentration: '',
      description: '',
    }
  });

  const isActive = watch('isActive');
  const isBatchManaged = watch('isBatchManaged');

  // Load Categories for select
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const resp = await categoriesService.getCategories();
      return resp.data;
    }
  });

  // Load Product if edit mode
  useEffect(() => {
    if (isEdit && id) {
      const fetchProduct = async () => {
        try {
          const resp = await productsService.getProductById(id);
          if (resp.success) {
            reset(resp.data);
          }
        } catch (error) {
          toast.error('Failed to load product data');
          navigate('/products');
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, reset, navigate]);

  const mutation = useMutation({
    mutationFn: (data: ProductFormValues) => {
      return isEdit 
        ? productsService.updateProduct(id!, data) 
        : productsService.createProduct(data);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  });

  const onSubmit = (data: ProductFormValues) => {
    mutation.mutate(data);
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading product information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/products')} className="rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-slate-500 text-sm mt-1 italic">
              Carefully enter pharmaceutical details to ensure inventory accuracy.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="md:col-span-2 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" /> General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Medicine Name <span className="text-rose-500">*</span></Label>
                  <Input id="name" placeholder="e.g. Paracetamol 500mg" {...register('name')} />
                  {errors.name && <p className="text-xs text-rose-500 italic font-medium">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode <span className="text-rose-500">*</span></Label>
                  <div className="relative">
                    <Input id="barcode" placeholder="Scan or enter barcode" {...register('barcode')} />
                    <Scan className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  {errors.barcode && <p className="text-xs text-rose-500 italic font-medium">{errors.barcode.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category <span className="text-rose-500">*</span></Label>
                  <Select 
                    onValueChange={(value) => setValue('categoryId', value)}
                    defaultValue={watch('categoryId')}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Select medication group" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-xs text-rose-500 italic font-medium">{errors.categoryId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activeIngredient">Active Ingredient</Label>
                  <Input id="activeIngredient" placeholder="e.g. Acetaminophen" {...register('activeIngredient')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosageForm">Dosage Form</Label>
                  <Input id="dosageForm" placeholder="e.g. Tablet, Syrup" {...register('dosageForm')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concentration">Concentration / Strength</Label>
                  <Input id="concentration" placeholder="e.g. 500mg" {...register('concentration')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Primary Unit <span className="text-rose-500">*</span></Label>
                  <Input id="unit" placeholder="e.g. Tablet, Box, Pill" {...register('unit')} />
                  {errors.unit && <p className="text-xs text-rose-500 italic font-medium">{errors.unit.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Notes / Instructions</Label>
                <Textarea id="description" rows={3} placeholder="Special storage or usage instructions..." {...register('description')} className="resize-none" />
              </div>
            </CardContent>
          </Card>

          {/* Business & Status */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-indigo-600" /> Pricing & Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Selling Price (VND) <span className="text-rose-500">*</span></Label>
                  <Input id="salePrice" type="number" step="1000" {...register('salePrice', { valueAsNumber: true })} className="font-bold text-indigo-600" />
                  {errors.salePrice && <p className="text-xs text-rose-500 italic font-medium">{errors.salePrice.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Min Stock Alert <span className="text-rose-500">*</span></Label>
                  <Input id="minStockLevel" type="number" {...register('minStockLevel', { valueAsNumber: true })} />
                  {errors.minStockLevel && <p className="text-xs text-rose-500 italic font-medium">{errors.minStockLevel.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-indigo-900 text-white overflow-hidden">
              <CardHeader className="bg-indigo-950/40 border-b border-indigo-800/30">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> System Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white font-semibold">Active Status</Label>
                    <p className="text-[10px] text-indigo-300">Available for display and sale</p>
                  </div>
                  <Switch 
                    checked={isActive} 
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
                <Separator className="bg-indigo-800/40" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white font-semibold flex items-center gap-2">
                      Batch Management
                    </Label>
                    <p className="text-[10px] text-indigo-300">Track expiry dates and lots</p>
                  </div>
                  <Switch 
                    checked={isBatchManaged} 
                    onCheckedChange={(checked) => setValue('isBatchManaged', checked)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t font-medium">
          <Button type="button" variant="outline" onClick={() => navigate('/products')} className="px-8 h-11 shadow-sm">
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-10 h-11 shadow-lg shadow-indigo-100" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEdit ? 'Update Medicine' : 'Save New Medicine'}
          </Button>
        </div>
      </form>
    </div>
  );
}
