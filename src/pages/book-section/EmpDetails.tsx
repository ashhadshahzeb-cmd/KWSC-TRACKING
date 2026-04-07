import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, ImageIcon, Search, Save, RotateCcw, Trash2, Wallet, Users, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export default function EmpDetails() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedViewRecord, setSelectedViewRecord] = useState<any>(null);

  // Form States
  const [empNo, setEmpNo] = useState("");
  const [formData, setFormData] = useState({
    serialNo: "",
    pensionNo: "",
    empName: "",
    cnic: "",
    nominees: "",
    appointment: "",
    retiredDate: "",
    regularCategory: "",
    retiredCategory: "",
    status: "active",
    disbursedDate: "",
    bankDetails: "",
    totalAmount: "",
    balance: "",
    chequeAmount: "",
    amountWords: "",
  });

  const [records, setRecords] = useState<any[]>([]);

  // Fetch from unified table
  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('book_section_employees')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (data) setRecords(data);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Handle Photo Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileToUpload(file);
      const reader = new FileReader();
      reader.onload = (event) => setPhoto(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Search Logic (Enter key)
  const handleFetchEmployee = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && empNo) {
      toast.info('Searching unified records...');
      try {
        const { data, error } = await supabase
          .from('book_section_employees')
          .select('*')
          .eq('employee_no', empNo)
          .maybeSingle();

        if (data) {
          setFormData({
            ...formData,
            pensionNo: data.pension_no || "",
            empName: data.full_name || "",
            cnic: data.cnic_no || "",
            nominees: data.nominees || "",
            appointment: data.appointment_date || "",
            retiredDate: data.retired_date || "",
            regularCategory: data.sub_category_regular || "",
            retiredCategory: data.sub_category_retired || "",
            status: data.status || "active",
            bankDetails: data.bank_details || "",
            totalAmount: data.total_amount?.toString() || "0",
            balance: data.balance_amount?.toString() || "0",
            chequeAmount: data.cheque_amount?.toString() || "0",
            amountWords: data.amount_in_words || ""
          });
          setPhoto(data.photo_url || null);
          toast.success('Record retrieved successfully');
        } else {
          toast.error('Record not found');
        }
      } catch (err) {
        toast.error('Search failed');
      }
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.empName) return toast.error("Employee Name is required!");
    if (!empNo && !formData.pensionNo) return toast.error("Employee No or Pension No must be provided.");

    setIsSaving(true);
    try {
      let publicUrl = photo;

      // 1. Image Upload
      if (fileToUpload) {
        setUploadingImage(true);
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `emp_photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('bucket_assets') 
          .upload(filePath, fileToUpload);

        if (uploadError) throw uploadError;

        const { data: { publicUrl: url } } = supabase.storage
          .from('bucket_assets')
          .getPublicUrl(filePath);
        
        publicUrl = url;
      }

      // 2. automated Category Selection
      const category = empNo.trim() !== "" ? "Employed" : "Retired";

      // 3. Save to Unified Table
      const { error } = await supabase.from('book_section_employees').upsert({
        id: selectedViewRecord?.id || undefined, // Upsert if existing record
        employee_no: empNo || null,
        pension_no: formData.pensionNo || null,
        full_name: formData.empName,
        cnic_no: formData.cnic || null,
        nominees: formData.nominees || null,
        appointment_date: formData.appointment || null,
        retired_date: formData.retiredDate || null,
        disbursed_date: formData.disbursedDate || null,
        sub_category_regular: formData.regularCategory || null,
        sub_category_retired: formData.retiredCategory || null,
        status: formData.status || 'active',
        bank_details: formData.bankDetails || null,
        total_amount: parseFloat(formData.totalAmount) || 0,
        balance_amount: parseFloat(formData.balance) || 0,
        cheque_amount: parseFloat(formData.chequeAmount) || 0,
        amount_in_words: formData.amountWords || null,
        category: category,
        photo_url: publicUrl,
        serial_no: formData.serialNo || null
      });

      if (error) throw error;
      toast.success(`${category} record saved to unified database!`);
      handleReset();
      fetchRecords(); 

      // Redirect logic
      setTimeout(() => {
        navigate('/book-section/cheque-record', {
          state: {
            empName: formData.empName,
            empNo: empNo,
            pensionNo: formData.pensionNo,
            empStatus: category.toLowerCase(),
            totalAmount: formData.totalAmount,
            remainingBalance: formData.balance,
            photoUrl: publicUrl
          }
        });
      }, 1500);
    } catch (err: any) {
      toast.error('Storage/Save failed: ' + err.message);
    } finally {
      setIsSaving(false);
      setUploadingImage(false);
    }
  };

  const handleReset = () => {
    setEmpNo("");
    setFormData({
      serialNo: "", pensionNo: "", empName: "", cnic: "", nominees: "",
      appointment: "", retiredDate: "", billPassedOn: "", regularCategory: "",
      retiredCategory: "", status: "active", disbursedDate: "", bankDetails: "",
      totalAmount: "", balance: "", chequeAmount: "", amountWords: "",
    });
    setPhoto(null);
    setFileToUpload(null);
    setSelectedViewRecord(null);
    toast.info('Form reset');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Records Management</h1>
          <p className="text-sm text-muted-foreground/80 font-sans">Comprehensive portal for Regular (Employed) and Retired (Pension) staff</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button variant="destructive" size="sm" className="gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="glass-card overflow-hidden border-none shadow-md h-full">
            <div className="h-2 bg-primary" />
            <CardHeader className="py-4 px-6 border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2 font-heading tracking-wide">
                <User className="w-5 h-5 text-primary" /> Staff Identification
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="id" className="text-xs uppercase font-bold tracking-tighter text-muted-foreground">Serial No (Id)</Label>
                  <Input id="id" placeholder="Auto-gen" className="bg-muted/10 border-border/50 h-10" value={formData.serialNo} onChange={e => setFormData({ ...formData, serialNo: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="empNo" className="text-xs uppercase font-bold tracking-tighter text-blue-500">Employee NO (regular)</Label>
                  <Input
                    id="empNo"
                    placeholder="EMP-XXXX"
                    className="bg-blue-500/5 border-blue-500/30 h-10 font-mono focus:border-blue-500"
                    value={empNo}
                    onChange={(e) => setEmpNo(e.target.value)}
                    onKeyDown={handleFetchEmployee}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pensionNo" className="text-xs uppercase font-bold tracking-tighter text-rose-500">Pension NO (retired)</Label>
                  <Input id="pensionNo" placeholder="PEN-XXXX" className="bg-rose-500/5 border-rose-500/30 h-10 font-mono focus:border-rose-500" value={formData.pensionNo} onChange={e => setFormData({ ...formData, pensionNo: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="empName" className="text-xs uppercase font-bold tracking-tight">Employee Name</Label>
                <Input id="empName" placeholder="Enter full name of staff member" className="bg-muted/10 border-border/50 h-10" value={formData.empName} onChange={e => setFormData({ ...formData, empName: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cnic" className="text-xs uppercase font-bold tracking-tight">CNIC No</Label>
                  <Input id="cnic" placeholder="00000-0000000-0" className="bg-muted/10 border-border/50 font-mono h-10" value={formData.cnic} onChange={e => setFormData({ ...formData, cnic: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="nominees" className="text-xs uppercase font-bold tracking-tight">Nominees</Label>
                  <Input id="nominees" placeholder="Enter nominee name and relation" className="bg-muted/10 border-border/50 h-10" value={formData.nominees} onChange={e => setFormData({ ...formData, nominees: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="glass-card overflow-hidden border-none shadow-lg h-full group">
            <div className="h-2 bg-purple-500/50" />
            <CardHeader className="text-center py-4 bg-muted/20">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-purple-400 transition-colors">Staff Verification Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <div 
                className="w-40 h-40 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden relative transition-all group-hover:border-primary/40 group-hover:bg-primary/10 cursor-pointer shadow-inner"
                onClick={() => document.getElementById('staffPhoto')?.click()}
              >
                {photo ? (
                  <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                   <span className="text-white text-xs font-bold uppercase tracking-widest">Select New</span>
                </div>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              <input type="file" id="staffPhoto" hidden accept="image/*" onChange={handleFileChange} />
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Recommended: Square Aspect Ratio</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="glass-card overflow-hidden border-none shadow-md w-full">
        <div className="h-2 bg-blue-500/50" />
        <CardHeader className="py-4 px-6 border-b border-white/5">
          <CardTitle className="text-lg flex items-center gap-2 font-heading tracking-wide">
            <Calendar className="w-5 h-5 text-blue-400" /> Administrative Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label htmlFor="appointment" className="text-xs uppercase font-bold text-muted-foreground">Appointment Date</Label>
              <Input id="appointment" type="date" className="bg-muted/10 border-border/50 h-10 font-mono" value={formData.appointment} onChange={e => setFormData({ ...formData, appointment: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="retiredDate" className="text-xs uppercase font-bold text-muted-foreground">Retired Date</Label>
              <Input id="retiredDate" type="date" className="bg-muted/10 border-border/50 h-10 font-mono" value={formData.retiredDate} onChange={e => setFormData({ ...formData, retiredDate: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="totalAmount" className="text-xs uppercase font-bold text-emerald-500">Total Amount</Label>
              <Input id="totalAmount" type="number" className="bg-emerald-500/5 border-emerald-500/20 h-10 font-mono text-emerald-500 font-bold" value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="balance" className="text-xs uppercase font-bold text-rose-500">Remaining</Label>
              <Input id="balance" type="number" className="bg-rose-500/5 border-rose-500/20 h-10 font-mono text-rose-500 font-bold" value={formData.balance} onChange={e => setFormData({ ...formData, balance: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs uppercase font-bold">Sub Category (Regular)</Label>
              <Select value={formData.regularCategory} onValueChange={v => setFormData({ ...formData, regularCategory: v })}>
                <SelectTrigger className="bg-blue-500/5 border-blue-500/20 h-10 font-medium">
                  <SelectValue placeholder="Regular Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cp-fund">CP Fund</SelectItem>
                  <SelectItem value="supp-salary">Supp Salary</SelectItem>
                  <SelectItem value="house-building">House Building</SelectItem>
                  <SelectItem value="tada">TADA</SelectItem>
                  <SelectItem value="overtime">Overtime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase font-bold text-rose-500">Sub Category (Retired)</Label>
              <Select value={formData.retiredCategory} onValueChange={v => setFormData({ ...formData, retiredCategory: v })}>
                <SelectTrigger className="bg-rose-500/5 border-rose-500/20 h-10 font-medium text-rose-500">
                  <SelectValue placeholder="Retired Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fund">Fund</SelectItem>
                  <SelectItem value="lpr">LPR</SelectItem>
                  <SelectItem value="pension-gratuity">Pension Gratuity</SelectItem>
                  <SelectItem value="pension-arrear">Pension Arrear</SelectItem>
                  <SelectItem value="financial-assistance">Financial Assistance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs uppercase font-bold">Current Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="bg-emerald-500/5 border-emerald-500/20 h-10 font-bold text-emerald-500 tracking-wider uppercase">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="close">Close</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Grid List Bottom */}
      <Card className="glass-card overflow-hidden border-none shadow-md mt-6">
        <div className="h-2 bg-indigo-500/50" />
        <CardHeader className="flex flex-row items-center justify-between py-4 bg-muted/10">
          <CardTitle className="text-lg flex items-center gap-2 font-heading">
            <Users className="w-5 h-5 text-indigo-400" /> Recent Employee Entries
          </CardTitle>
          <div className="relative w-72">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
             <Input placeholder="Search database for staff..." className="pl-9 bg-background/50 border-border/50 h-9 text-xs" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 border-b border-border/50">
                <TableRow>
                  <TableHead className="w-20 pl-6 uppercase text-[10px] font-bold">Category</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold">Emp/Pen No</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold">Full Name</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold">Amount (Rs.)</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold">Status</TableHead>
                  <TableHead className="text-right pr-6 uppercase text-[10px] font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length > 0 ? (
                  records.map((r) => (
                    <TableRow key={r.id} className="hover:bg-white/5 transition-colors border-b border-white/5">
                      <TableCell className="pl-6 font-medium">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tighter ${r.category === 'Employed' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {r.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.employee_no || r.pension_no}</TableCell>
                      <TableCell className="text-sm">{r.full_name}</TableCell>
                      <TableCell className="font-mono text-sm font-bold text-emerald-400">{r.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold ${r.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {r.status?.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedViewRecord(r)}>
                           <Eye className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic text-sm font-sans">No records found in unified database</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={!!selectedViewRecord} onOpenChange={(open) => !open && setSelectedViewRecord(null)}>
        <DialogContent className="sm:max-w-2xl bg-card border-none glass-card shadow-2xl backdrop-blur-xl">
          <DialogHeader className="border-b border-white/5 pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-3 font-heading">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                 <User className="w-6 h-6 text-primary" />
              </div>
              Record # {selectedViewRecord?.serial_no || "Auto"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 p-4">
            <div className="space-y-4">
               <div className="w-full aspect-square rounded-xl border border-white/10 overflow-hidden bg-white/5">
                  {selectedViewRecord?.photo_url ? (
                    <img src={selectedViewRecord.photo_url} alt="Staff" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-muted-foreground/40">
                       <ImageIcon className="w-12 h-12" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">No Photo Available</span>
                    </div>
                  )}
               </div>
               <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <span className="text-[10px] uppercase font-bold text-primary/60 block mb-1">Categorization</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-black/40 rounded text-[10px] font-bold">{selectedViewRecord?.category}</span>
                    <span className="px-2 py-0.5 bg-black/40 rounded text-[10px] font-bold">{selectedViewRecord?.sub_category_regular || selectedViewRecord?.sub_category_retired}</span>
                  </div>
               </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5 text-xs">
                  <span className="text-muted-foreground font-medium uppercase tracking-tighter">Staff Name</span>
                  <p className="font-bold text-base truncate">{selectedViewRecord?.full_name}</p>
                </div>
                <div className="space-y-0.5 text-xs">
                  <span className="text-muted-foreground font-medium uppercase tracking-tighter">CNIC Number</span>
                  <p className="font-mono font-bold">{selectedViewRecord?.cnic_no || "---"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 font-sans">
                <div>
                   <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Employee No</span>
                   <p className="font-bold">{selectedViewRecord?.employee_no || "N/A"}</p>
                </div>
                <div>
                   <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Pension No</span>
                   <p className="font-bold">{selectedViewRecord?.pension_no || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Bank Account Record</span>
                <p className="font-semibold text-blue-400 bg-blue-500/5 p-2 rounded border border-blue-500/10 text-xs italic">{selectedViewRecord?.bank_details || "No details provided"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                 <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Appointment</span>
                    <p className="font-bold">{selectedViewRecord?.appointment_date || "N/A"}</p>
                 </div>
                 <div>
                    <span className="text-[10px] uppercase font-bold text-rose-500 opacity-60">Retired</span>
                    <p className="font-bold">{selectedViewRecord?.retired_date || "N/A"}</p>
                 </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/5">
                 <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-500">Total Approved</span>
                      <p className="text-xl font-bold font-mono">Rs.{selectedViewRecord?.total_amount?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] uppercase font-bold text-rose-500">Net Payable</span>
                       <p className="text-lg font-bold font-mono">Rs.{selectedViewRecord?.cheque_amount?.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
