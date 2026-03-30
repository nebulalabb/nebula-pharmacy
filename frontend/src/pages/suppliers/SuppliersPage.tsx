import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  MoreVertical, 
  Edit, 
  History,
  ShieldCheck,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { suppliersService } from '@/services/secondary.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const supplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address required'),
  taxCode: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['suppliers', searchTerm],
    queryFn: () => suppliersService.getSuppliers({ search: searchTerm }),
  });

  const suppliers = suppliersData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: SupplierFormValues) => suppliersService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier created successfully');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
       toast.error(error.response?.data?.message || 'Failed to create supplier');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierFormValues }) => 
      suppliersService.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier updated successfully');
      setIsDialogOpen(false);
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
  });

  const onSubmit = (data: SupplierFormValues) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      taxCode: supplier.taxCode || '',
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingSupplier(null);
    reset({ name: '', contactName: '', email: '', phone: '', address: '', taxCode: '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Supply Chain Partners</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3" /> Vendor Network & Procurement Integrity
            </p>
          </div>
        </div>

        <Button onClick={handleAddNew} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 gap-2">
          <Plus className="w-4 h-4" /> Register New Partner
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <CardTitle className="text-lg font-black tracking-tight">Active Suppliers</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Registry of verified pharmaceutical distributors</CardDescription>
           </div>
           
           <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name, contact, or tax code..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 pl-10 pr-4 rounded-xl border-slate-200 bg-white font-medium text-xs focus:ring-indigo-500"
              />
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
             <TableHeader className="bg-slate-100/30 text-[10px] font-black uppercase tracking-widest">
                <TableRow>
                   <TableHead className="py-4 px-6 border-r border-slate-50">Authorized Distributor</TableHead>
                   <TableHead className="py-4 px-6 border-r border-slate-50">Compliance Detail</TableHead>
                   <TableHead className="py-4 px-6 border-r border-slate-50">Communication</TableHead>
                   <TableHead className="text-center px-6">Status</TableHead>
                   <TableHead className="text-center w-[80px]"></TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {isLoading ? (
                   <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center italic text-slate-400 animate-pulse">Scanning partner registry...</TableCell>
                   </TableRow>
                ) : suppliers.length === 0 ? (
                   <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center opacity-30 flex flex-col items-center justify-center p-10">
                         <Building2 className="w-12 h-12 mb-2" />
                         <span className="font-black italic uppercase tracking-widest text-sm text-slate-400">No vendors matching criteria found.</span>
                      </TableCell>
                   </TableRow>
                ) : (
                  suppliers.map((supplier: any) => (
                    <TableRow key={supplier.id} className="hover:bg-slate-50/50 transition-colors group">
                       <TableCell className="px-6 py-4 border-r border-slate-50/50">
                          <div className="flex flex-col">
                             <span className="font-black text-slate-800 tracking-tight text-base group-hover:text-indigo-600 transition-colors">{supplier.name}</span>
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1 italic">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Rep: {supplier.contactName}
                             </span>
                          </div>
                       </TableCell>
                       <TableCell className="px-6 py-4 border-r border-slate-50/50">
                          <div className="space-y-1.5">
                             <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="line-clamp-1">{supplier.address}</span>
                             </div>
                             {supplier.taxCode && (
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax ID: {supplier.taxCode}</div>
                             )}
                          </div>
                       </TableCell>
                       <TableCell className="px-6 py-4 border-r border-slate-50/50">
                          <div className="space-y-1.5">
                             <a href={`tel:${supplier.phone}`} className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
                                <Phone className="w-3 h-3" /> {supplier.phone}
                             </a>
                             <a href={`mailto:${supplier.email}`} className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                                <Mail className="w-3 h-3 text-slate-400" /> {supplier.email}
                             </a>
                          </div>
                       </TableCell>
                       <TableCell className="text-center px-6">
                          <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase tracking-widest py-1 px-3">Active</Badge>
                       </TableCell>
                       <TableCell className="text-center">
                          <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                                   <MoreVertical className="h-4 w-4 text-slate-400" />
                                </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl border-slate-100 p-2">
                                <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 p-2">Vendor Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(supplier)} className="rounded-lg font-bold text-xs p-2 gap-2 cursor-pointer">
                                   <Edit className="w-4 h-4 text-indigo-500" /> Edit Credentials
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg font-bold text-xs p-2 gap-2 cursor-pointer">
                                   <History className="w-4 h-4 text-amber-500" /> Purchase Ledger
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-50" />
                                <DropdownMenuItem className="rounded-lg font-bold text-xs p-2 gap-2 cursor-pointer text-rose-600">
                                   <ExternalLink className="w-4 h-4" /> Deactivate Account
                                </DropdownMenuItem>
                             </DropdownMenuContent>
                          </DropdownMenu>
                       </TableCell>
                    </TableRow>
                  ))
                )}
             </TableBody>
           </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-slate-900 p-8 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-xl">
                      <Building2 className="w-6 h-6 text-indigo-400" />
                   </div>
                   {editingSupplier ? 'Revise Partner Profile' : 'New Vendor Registration'}
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-sm font-medium italic">
                  Ensure all regulatory and contact details are verified before submission.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Company Entity Name</Label>
                  <Input {...register('name')} placeholder="e.g. Nebula Pharma Group" className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" />
                  {errors.name && <p className="text-[10px] font-bold text-rose-500 pl-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Rep Name</Label>
                  <Input {...register('contactName')} placeholder="Full Name" className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" />
                  {errors.contactName && <p className="text-[10px] font-bold text-rose-500 pl-1">{errors.contactName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Tax Code (VAT ID)</Label>
                  <Input {...register('taxCode')} placeholder="0123456789" className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Direct Phone</Label>
                  <Input {...register('phone')} placeholder="098..." className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" />
                  {errors.phone && <p className="text-[10px] font-bold text-rose-500 pl-1">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Email Address</Label>
                  <Input {...register('email')} placeholder="vendor@domain.com" className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" />
                  {errors.email && <p className="text-[10px] font-bold text-rose-500 pl-1">{errors.email.message}</p>}
                </div>

                <div className="col-span-2 space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Registered Address</Label>
                   <Input {...register('address')} placeholder="Full operational address..." className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" />
                   {errors.address && <p className="text-[10px] font-bold text-rose-500 pl-1">{errors.address.message}</p>}
                </div>
              </div>
            </div>

            <DialogFooter className="p-8 bg-slate-50 pt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100">
                Discard Changes
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 gap-2">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {editingSupplier ? 'Commit Changes' : 'Authorize Partner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
