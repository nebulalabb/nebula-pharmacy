import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Ban, 
  Power,
  Mail,
  MoreHorizontal,
  Loader2,
  Lock,
  Unlock
} from 'lucide-react';
import { usersService } from '@/services/secondary.service';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigate } from 'react-router-dom';
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
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function StaffPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Security Gate
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast.error('Restricted Access: Administrative Privileges Required');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['staff-users'],
    queryFn: () => usersService.getUsers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
      toast.success('Personnel account authorized successfully');
      setIsCreateDialogOpen(false);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => usersService.updateUser(id, { isActive: !active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
      toast.success('User access status updated');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: any }) => usersService.resetPassword(id, { password }),
    onSuccess: () => {
      toast.success('Security credentials reset issued');
      setIsPasswordDialogOpen(false);
    }
  });

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-100 rounded-2xl">
            <Users className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Personnel Registry</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Staff Oversight & Access Control
            </p>
          </div>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} className="h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 gap-2">
          <UserPlus className="w-4 h-4" /> Authorize New Staff
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-100/50 bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
           <CardTitle className="text-lg font-black tracking-tight">Active Personnel & Access Privileges</CardTitle>
           <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Sensitive directory — restricted to Administrative users only</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
             <TableHeader className="bg-slate-100/30 text-[10px] font-black uppercase tracking-widest">
                <TableRow>
                   <TableHead className="py-4 px-6 border-r border-slate-50">Authorized User</TableHead>
                   <TableHead className="py-4 px-6 border-r border-slate-50">Role & Security</TableHead>
                   <TableHead className="text-center px-6">Access Status</TableHead>
                   <TableHead className="text-center px-6 border-l border-slate-50">Credential Ledger</TableHead>
                   <TableHead className="w-[80px]"></TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {isLoading ? (
                   <TableRow><TableCell colSpan={5} className="h-40 text-center animate-pulse italic text-slate-400">Scanning security clearance records...</TableCell></TableRow>
                ) : users?.length === 0 ? (
                   <TableRow><TableCell colSpan={5} className="h-40 text-center text-slate-400 italic font-medium">Empty registry found.</TableCell></TableRow>
                ) : (
                  users?.map((u: any) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                       <TableCell className="px-6 py-4 border-r border-slate-50/50">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs uppercase tracking-tighter">
                                {u.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                             </div>
                             <div className="flex flex-col">
                                <span className="font-black text-slate-800 tracking-tight group-hover:text-rose-600 transition-colors">{u.fullName}</span>
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {u.username}</span>
                             </div>
                          </div>
                       </TableCell>
                       <TableCell className="px-6 py-4 border-r border-slate-50/50">
                          <Badge className={u.role === 'ADMIN' ? 'bg-indigo-600 text-white border-none' : 'bg-slate-100 text-slate-600 border-none'}>
                             {u.role === 'ADMIN' ? 'SUPER ADMIN' : 'PHARMACY STAFF'}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-center px-6">
                          <Badge className={u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                             {u.isActive ? 'Active Clearance' : 'Unauthorized/Suspended'}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-center px-6 border-l border-slate-50/50 text-[10px] font-medium text-slate-400 italic">
                          Last Entry: {u.updatedAt ? format(new Date(u.updatedAt), 'dd/MM/yy HH:mm') : 'None'}
                       </TableCell>
                       <TableCell className="text-center px-2">
                          <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                                   <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 p-2 shadow-2xl">
                                <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsPasswordDialogOpen(true); }} className="rounded-lg font-bold text-xs p-2 gap-2 cursor-pointer">
                                   <Key className="w-4 h-4 text-amber-500" /> Reset Credentials
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-50" />
                                <DropdownMenuItem onClick={() => toggleStatusMutation.mutate({ id: u.id, active: u.isActive })} className="rounded-lg font-bold text-xs p-2 gap-2 cursor-pointer text-rose-600">
                                   {u.isActive ? <Ban className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                   {u.isActive ? 'Revoke Access' : 'Re-Authorize User'}
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
         <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
            <form onSubmit={(e: any) => {
               e.preventDefault();
               const formData = new FormData(e.target);
               const data = Object.fromEntries(formData);
               createMutation.mutate(data);
            }}>
               <div className="bg-slate-900 p-8 text-white">
                  <DialogHeader>
                     <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                           <UserPlus className="w-6 h-6 text-rose-400" />
                        </div>
                        Personnel Authorization
                     </DialogTitle>
                     <DialogDescription className="text-slate-400 text-sm font-medium italic">
                        Grant administrative or operational privileges to a new member.
                     </DialogDescription>
                  </DialogHeader>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Legal Full Name</Label>
                     <Input name="fullName" placeholder="Pharmacist Name" className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" required />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Username/Email</Label>
                        <Input name="username" placeholder="name@domain.com" className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" required />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Security Privilege</Label>
                        <Select name="role" defaultValue="STAFF">
                           <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50">
                              <SelectValue placeholder="Select Role" />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border-slate-100 p-2">
                              <SelectItem value="STAFF" className="rounded-lg font-bold text-xs p-2">Pharmacy Staff</SelectItem>
                              <SelectItem value="ADMIN" className="rounded-lg font-bold text-xs p-2">System Admin</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Initial Password</Label>
                     <Input name="password" type="password" placeholder="••••••••" className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" required />
                  </div>
               </div>

               <DialogFooter className="p-8 bg-slate-50 pt-0">
                  <Button type="button" variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="h-12 rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest text-slate-500">
                     Abort
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-100 gap-2">
                     {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                     Establish Account
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
         <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
            <form onSubmit={(e: any) => {
               e.preventDefault();
               const password = e.target.password.value;
               resetPasswordMutation.mutate({ id: selectedUser.id, password });
            }}>
               <div className="bg-amber-500 p-8 text-white">
                  <DialogHeader>
                     <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                           <Lock className="w-6 h-6" />
                        </div>
                        Credential Reset
                     </DialogTitle>
                     <DialogDescription className="text-amber-100 text-sm font-medium italic">
                        Issuing new security parameters for: <span className="font-black underline">{selectedUser?.fullName}</span>
                     </DialogDescription>
                  </DialogHeader>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">New Secure Password</Label>
                     <Input name="password" type="password" placeholder="Enter new password..." className="h-12 border-slate-200 rounded-xl font-bold bg-slate-50/50" required />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                     <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
                     <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed">
                        This action will immediately invalidate the user's current session and require them to re-authenticate with the new credentials.
                     </p>
                  </div>
               </div>

               <DialogFooter className="p-8 bg-slate-50 pt-0">
                  <Button type="button" variant="ghost" onClick={() => setIsPasswordDialogOpen(false)} className="h-12 rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest text-slate-500">
                     Cancel
                  </Button>
                  <Button type="submit" disabled={resetPasswordMutation.isPending} className="h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-100 gap-2">
                     {resetPasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                     Reset Credentials
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}
