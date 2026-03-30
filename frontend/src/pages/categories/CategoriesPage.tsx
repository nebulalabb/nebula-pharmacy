import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Tags, 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  Info,
  Archive,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { categoriesService } from '@/services/secondary.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => categoriesService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoriesService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
      setIsDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: () => {
       toast.error('Cannot delete: Category might be linked to products');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return toast.error('Name is required');
    
    const data = { name: categoryName, description: categoryDesc };
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || '');
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDesc('');
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <Tags className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Medication Taxonomy</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 mt-1">
              <Archive className="w-3 h-3" /> Categorical Classification & Grouping
            </p>
          </div>
        </div>

        <Button onClick={handleAddNew} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 gap-2">
          <Plus className="w-4 h-4" /> Define New Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="border-none shadow-sm animate-pulse h-40 bg-slate-50" />
            ))
         ) : categories?.length === 0 ? (
            <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center">
               <Tags className="w-16 h-16 mb-4" />
               <p className="font-black uppercase tracking-[0.2em]">No categories configured.</p>
            </div>
         ) : (
            categories?.map((cat: any) => (
              <Card key={cat.id} className="border-none shadow-xl shadow-slate-100/50 bg-white group hover:translate-y-[-4px] transition-all duration-300">
                 <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-indigo-600" />
                          <CardTitle className="text-lg font-black tracking-tight text-slate-800">{cat.name}</CardTitle>
                       </div>
                       <CardDescription className="text-xs font-medium italic text-slate-400 line-clamp-1">
                          {cat.description || 'No description provided.'}
                       </CardDescription>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 font-black text-[10px] uppercase">
                       ID: {cat.id.slice(0, 4)}
                    </div>
                 </CardHeader>
                 <CardContent className="pt-4 flex items-center justify-between border-t border-slate-50 mt-4">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                       <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active Registry
                    </div>
                    <div className="flex gap-2">
                       <Button onClick={() => handleEdit(cat)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100">
                          <Edit2 className="w-4 h-4 text-indigo-500" />
                       </Button>
                       <Button onClick={() => deleteMutation.mutate(cat.id)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            ))
         )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="bg-slate-900 p-8 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-xl">
                      <Tags className="w-6 h-6 text-indigo-400" />
                   </div>
                   {editingCategory ? 'Update Categorization' : 'Define Taxonomy Group'}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm font-medium italic">
                  Groups help pharmacists quickly locate and organize medicinal inventories.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Category Designation</Label>
                  <Input 
                    value={categoryName} 
                    onChange={(e) => setCategoryName(e.target.value)} 
                    placeholder="e.g. Antibiotics, Supplements..." 
                    className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" 
                  />
               </div>

               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Brief Annotation (Optional)</Label>
                  <Input 
                    value={categoryDesc} 
                    onChange={(e) => setCategoryDesc(e.target.value)} 
                    placeholder="Summarize the purpose of this group..." 
                    className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" 
                  />
               </div>

               <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-[11px] font-medium text-amber-700 leading-relaxed italic">
                    Modifying a category name will affect all linked medicinal products in your catalog immediately.
                  </p>
               </div>
            </div>

            <DialogFooter className="p-8 bg-slate-50 pt-0">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest text-slate-500">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 gap-2">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tags className="w-4 h-4" />}
                {editingCategory ? 'Commit Update' : 'Register Group'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
