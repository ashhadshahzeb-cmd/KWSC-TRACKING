import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ClipboardList, 
  Send, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowRightCircle,
  FileText,
  RotateCcw,
  Save,
  Loader2,
  ImageIcon,
  Eye,
  FileImage,
  Upload
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BillDispatch() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [viewScanOpen, setViewScanOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [targetSection, setTargetSection] = useState("");
  
  // Scanned Bill States
  const [photo, setPhoto] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    diaryNo: "",
    receivedDate: new Date().toISOString().split('T')[0],
    partyName: "",
    subject: "",
    amount: "0",
    refNo: "",
    remarks: "",
  });

  const [forwardRemarks, setForwardRemarks] = useState("");

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('bill_dispatch' as any)
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
         console.warn("Table bill_dispatch not found, using mock data");
         return;
      }
      if (data) setDiaryEntries(data);
    } catch (err) {
      console.error("Error fetching diary entries:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileToUpload(file);
      const reader = new FileReader();
      reader.onload = (event) => setPhoto(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchEntries();
    // Fallback mock data if table doesn't exist yet
    if (diaryEntries.length === 0) {
        setDiaryEntries([
            { 
              id: 12, 
              diary_no: "Diary-12", 
              tracking_id: "FL-2024-0012",
              received_date: "2024-04-12", 
              party_name: "Pakistan State Oil (PSO)", 
              subject: "Fuel Supply for KW&SB Vehicles", 
              amount: 1250000, 
              ref_no: "PSO-MAR-2024", 
              status: "forwarded", 
              forwarded_to: "pol_bills",
              history: [
                { step: "Inward Entry", date: "2024-04-12T09:00:00Z", location: "Bill Dispatch", remarks: "Received bulk fuel invoice" },
                { step: "Forwarded", date: "2024-04-12T11:30:00Z", location: "POL Bills Section", remarks: "For consumption verification" }
              ]
            },
            { 
              id: 101, 
              diary_no: "D-101", 
              tracking_id: "FL-2024-0101",
              received_date: "2024-04-05", 
              party_name: "Aga Khan University Hospital", 
              subject: "Emergency Medical Claim - Staff ID #4492", 
              amount: 45000, 
              ref_no: "MED-AKI-99", 
              status: "forwarded", 
              forwarded_to: "medical",
              history: [
                { step: "Inward Entry", date: "2024-04-05T10:00:00Z", location: "Bill Dispatch", remarks: "Priority medical case" },
                { step: "Forwarded", date: "2024-04-05T14:00:00Z", location: "Medical Section", remarks: "Verify treatment bill" }
              ]
            },
            { 
              id: 202, 
              diary_no: "KW-202", 
              tracking_id: "FL-2024-0202",
              received_date: "2024-04-08", 
              party_name: "Indus Constructions Ltd", 
              subject: "Sewerage Pipe Replacement - District Central", 
              amount: 8500000, 
              ref_no: "IC-PROJ-021", 
              status: "pending",
              history: [
                { step: "Inward Entry", date: "2024-04-08T15:00:00Z", location: "Bill Dispatch", remarks: "Completion certificate attached" }
              ]
            },
        ]);
    }
  }, []);

  const handleSave = async () => {
    if (!formData.partyName || !formData.subject) {
      toast.error("Please fill required fields (Party Name & Subject)");
      return;
    }

    setIsSaving(true);
    try {
      let publicUrl = null;

      // 1. Image Upload (Scanning the bill)
      if (fileToUpload) {
        setUploadingImage(true);
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `bill_${Date.now()}.${fileExt}`;
        const filePath = `bill_scans/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('bucket_assets') 
          .upload(filePath, fileToUpload);

        if (!uploadError) {
          const { data: { publicUrl: url } } = supabase.storage
            .from('bucket_assets')
            .getPublicUrl(filePath);
          publicUrl = url;
        }
      }

      const trackingId = `FL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newEntry = {
        diary_no: formData.diaryNo || `D-${Math.floor(Math.random() * 10000)}`,
        tracking_id: trackingId,
        received_date: formData.receivedDate,
        party_name: formData.partyName,
        subject: formData.subject,
        amount: parseFloat(formData.amount) || 0,
        ref_no: formData.refNo,
        scan_url: publicUrl,
        status: "pending",
        remarks: formData.remarks,
        history: [{
          step: "Inward Entry",
          date: new Date().toISOString(),
          location: "Bill Dispatch",
          remarks: "Initial recording in diary"
        }]
      };

      const { error } = await supabase.from('bill_dispatch' as any).insert(newEntry);
      
      if (error) throw error;

      toast.success("Bill entry is digitized & saved!");
      handleReset();
      fetchEntries();
    } catch (err: any) {
      const mockEntry = { ...formData, id: Date.now(), status: 'pending', scan_url: photo, diary_no: formData.diaryNo || `D-${Math.floor(Math.random() * 10000)}` };
      setDiaryEntries([mockEntry, ...diaryEntries]);
      toast.info("Digitized locally (Database restricted)");
      handleReset();
    } finally {
      setIsSaving(false);
      setUploadingImage(false);
    }
  };

  const handleReset = () => {
    setFormData({
      diaryNo: "",
      receivedDate: new Date().toISOString().split('T')[0],
      partyName: "",
      subject: "",
      amount: "0",
      refNo: "",
      remarks: "",
    });
    setForwardRemarks("");
    setPhoto(null);
    setFileToUpload(null);
  };

  const openScanViewer = (entry: any) => {
    setSelectedEntry(entry);
    setViewScanOpen(true);
  };

  const openForwardDialog = (entry: any) => {
    setSelectedEntry(entry);
    setForwardDialogOpen(true);
  };

  const handleForward = async () => {
    if (!targetSection) {
      toast.warning("Please select a target section");
      return;
    }

    toast.loading(`Forwarding to ${targetSection}...`);
    
    try {
        // 1. Update status and history in dispatch table
        const updatedHistory = [
            ...(selectedEntry.history || []),
            {
                step: "Forwarded",
                date: new Date().toISOString(),
                location: targetSection,
                remarks: forwardRemarks || "No remarks provided"
            }
        ];

        await supabase.from('bill_dispatch' as any)
            .update({ 
                status: 'forwarded', 
                forwarded_to: targetSection,
                history: updatedHistory,
                forward_remarks: forwardRemarks
            } as any)
            .eq('id', selectedEntry.id);

        // 2. Prepare navigation path
        let path = "";
        switch(targetSection) {
            case 'medical': path = "/book-section/medical"; break;
            case 'contractor': path = "/book-section/contractor"; break;
            case 'security_deposit': path = "/book-section/security-deposit"; break;
            case 'pol_bills': path = "/book-section/pol-bills"; break;
            case 'contingencies': path = "/book-section/contigencies"; break;
        }

        toast.dismiss();
        toast.success(`Bill forwarded to ${targetSection} department`);
        setForwardDialogOpen(false);

        // Navigate with state so the department page can pre-fill
        navigate(path, { 
            state: { 
                vendorName: selectedEntry.party_name,
                contractorName: selectedEntry.party_name,
                grossAmount: selectedEntry.amount,
                voucherNo: selectedEntry.ref_no,
                partyCode: selectedEntry.ref_no, // assuming ref no might be party code
                workDescription: selectedEntry.subject,
                scanUrl: selectedEntry.scan_url,
                trackingId: selectedEntry.tracking_id
            } 
        });
    } catch (err) {
        toast.dismiss();
        toast.error("Forwarding failed");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary" />
            Inward Bill Dispatch (Dairy)
          </h1>
          <p className="text-sm text-muted-foreground font-sans">Centralized bill receiving and department forwarding system</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 font-sans">
             <RotateCcw className="w-4 h-4" /> Reset
           </Button>
           <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 bg-primary hover:bg-primary/90 font-bold font-sans">
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Record Entry
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Entry Form */}
        <Card className="lg:col-span-1 glass-card border-none overflow-hidden shadow-xl">
          <div className="h-1 bg-primary" />
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Bill Digitization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3 p-4 bg-primary/5 rounded-xl border-2 border-dashed border-primary/20 group hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden" onClick={() => document.getElementById('billScan')?.click()}>
               {photo ? (
                 <img src={photo} alt="Scan preview" className="w-full h-32 object-cover rounded-lg shadow-md" />
               ) : (
                 <div className="flex flex-col items-center gap-2 py-4">
                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <Upload className="w-6 h-6" />
                   </div>
                   <span className="text-[10px] font-bold uppercase text-muted-foreground group-hover:text-primary transition-colors">Scan / Upload Physical Bill</span>
                 </div>
               )}
               {uploadingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
               )}
               <input type="file" id="billScan" hidden accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Diary Number</Label>
              <Input 
                placeholder="Auto-assigned if empty" 
                value={formData.diaryNo}
                onChange={e => setFormData({...formData, diaryNo: e.target.value})}
                className="bg-muted/20 border-border/50 h-9 font-mono text-xs" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Date Received</Label>
              <Input 
                type="date" 
                value={formData.receivedDate}
                onChange={e => setFormData({...formData, receivedDate: e.target.value})}
                className="bg-muted/20 border-border/50 h-9 font-mono text-xs" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Party / Vendor Name <span className="text-red-400">*</span></Label>
              <Input 
                placeholder="Enter party name" 
                value={formData.partyName}
                onChange={e => setFormData({...formData, partyName: e.target.value})}
                className="bg-muted/20 border-border/50 h-9 text-xs" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Reference / Ref No</Label>
              <Input 
                placeholder="Invoice or Letter No" 
                value={formData.refNo}
                onChange={e => setFormData({...formData, refNo: e.target.value})}
                className="bg-muted/20 border-border/50 h-9 font-mono text-xs" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Amount (If any)</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="bg-muted/20 border-border/50 h-9 font-mono text-xs text-primary" 
              />
            </div>
            <div className="space-y-2 pt-2">
              <Label className="text-[10px] font-bold uppercase">Subject / Purpose <span className="text-red-400">*</span></Label>
              <Input 
                placeholder="Short description of bill" 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="bg-muted/20 border-border/50 h-9 text-xs" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase">Initial Remarks</Label>
              <Input 
                placeholder="Any special notes" 
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
                className="bg-muted/20 border-border/50 h-9 text-xs" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Dashboard/List Table */}
        <div className="lg:col-span-3 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card border-none bg-primary/5">
                <CardContent className="pt-6 flex justify-between items-center">
                   <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Pending Bills</p>
                      <h3 className="text-2xl font-bold font-mono">{diaryEntries.filter(e => e.status === 'pending').length}</h3>
                   </div>
                   <Clock className="w-10 h-10 text-primary/20" />
                </CardContent>
              </Card>
              <Card className="glass-card border-none bg-emerald-500/5">
                <CardContent className="pt-6 flex justify-between items-center">
                   <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Forwarded Today</p>
                      <h3 className="text-2xl font-bold font-mono">{diaryEntries.filter(e => e.status === 'forwarded').length}</h3>
                   </div>
                   <CheckCircle2 className="w-10 h-10 text-emerald-500/20" />
                </CardContent>
              </Card>
              <Card className="glass-card border-none bg-blue-500/5">
                <CardContent className="pt-6 flex justify-between items-center">
                   <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Inward</p>
                      <h3 className="text-2xl font-bold font-mono">{diaryEntries.length}</h3>
                   </div>
                   <FileText className="w-10 h-10 text-blue-500/20" />
                </CardContent>
              </Card>
           </div>

           <Card className="glass-card border-none overflow-hidden shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Diary Register (Recent Inwards)
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search party or diary no..." className="pl-9 bg-muted/20 border-border/50 h-9 text-xs" />
              </div>
            </CardHeader>
            <CardContent>
               <div className="rounded-md border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs uppercase font-bold">Diary No</TableHead>
                      <TableHead className="text-xs uppercase font-bold">Received Date</TableHead>
                      <TableHead className="text-xs uppercase font-bold">Party Name</TableHead>
                      <TableHead className="text-xs uppercase font-bold text-center">Scan</TableHead>
                      <TableHead className="text-xs uppercase font-bold text-center">Track</TableHead>
                      <TableHead className="text-xs uppercase font-bold">Subject</TableHead>
                      <TableHead className="text-xs uppercase font-bold">Amount</TableHead>
                      <TableHead className="text-xs uppercase font-bold">Status</TableHead>
                      <TableHead className="text-xs uppercase font-bold text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diaryEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-primary/5 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-primary">{entry.diary_no}</TableCell>
                        <TableCell className="text-xs">{entry.received_date}</TableCell>
                        <TableCell className="font-semibold text-sm">{entry.party_name}</TableCell>
                        <TableCell className="text-center">
                          {entry.scan_url || entry.scan_url === photo ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 text-primary hover:bg-primary/10"
                              onClick={() => openScanViewer(entry)}
                            >
                              <FileImage className="w-4 h-4" />
                            </Button>
                          ) : (
                            <span className="text-[9px] text-muted-foreground italic">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 text-primary hover:bg-primary/10"
                              onClick={() => navigate('/book-section/file-tracking', { state: { bill: entry } })}
                              title="View File Journey"
                            >
                              <Search className="w-4 h-4" />
                            </Button>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{entry.subject}</TableCell>
                        <TableCell className="font-mono text-xs">{entry.amount?.toLocaleString()}</TableCell>
                        <TableCell>
                           {entry.status === 'pending' ? (
                             <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full w-fit">
                               <Clock className="w-3 h-3" /> Pending
                             </span>
                           ) : (
                             <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                               <CheckCircle2 className="w-3 h-3" /> Forwarded
                             </span>
                           )}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.status === 'pending' ? (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-primary hover:bg-primary/10 hover:text-primary rounded-full transition-all"
                              onClick={() => openForwardDialog(entry)}
                              title="Forward to Section"
                            >
                              <ArrowRightCircle className="w-5 h-5" />
                            </Button>
                          ) : (
                            <span className="text-[10px] italic text-muted-foreground uppercase">{entry.forwarded_to}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               </div>
            </CardContent>
           </Card>
        </div>
      </div>

      {/* Forwarding Dialog */}
      <Dialog open={forwardDialogOpen} onOpenChange={setForwardDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Forward Bill to Section
            </DialogTitle>
            <DialogDescription>
              Select the department section where this bill should be processed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
               <p className="text-xs font-bold text-muted-foreground uppercase">Selected Bill</p>
               <p className="text-sm font-semibold">{selectedEntry?.party_name}</p>
               <p className="text-[10px] text-primary font-mono">{selectedEntry?.diary_no}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold">Target Department Section</Label>
              <Select value={targetSection} onValueChange={setTargetSection}>
                <SelectTrigger className="bg-muted/20 border-border/50">
                  <SelectValue placeholder="Identify Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical Section</SelectItem>
                  <SelectItem value="contractor">Contractor Section</SelectItem>
                  <SelectItem value="security_deposit">Security Deposit Section</SelectItem>
                  <SelectItem value="pol_bills">POL Bills Section</SelectItem>
                  <SelectItem value="contingencies">Contingencies Section</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold">Forwarding Remarks</Label>
              <Input 
                placeholder="Reason or instructions for next department..." 
                value={forwardRemarks}
                onChange={e => setForwardRemarks(e.target.value)}
                className="bg-muted/20 border-border/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForwardDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleForward} className="gap-2 bg-primary">
               Forward to Section <Send className="w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Scan Viewer */}
      <Dialog open={viewScanOpen} onOpenChange={setViewScanOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-zinc-950 border-white/5">
          <DialogHeader className="p-4 border-b border-white/5">
            <DialogTitle className="flex items-center gap-2 text-white">
              <FileImage className="w-5 h-5 text-primary" /> Original Scanned Bill
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
               {selectedEntry?.party_name} - {selectedEntry?.diary_no}
            </DialogDescription>
          </DialogHeader>
          <div className="w-full bg-zinc-900 border-b border-white/5 flex items-center justify-center min-h-[400px]">
             {selectedEntry?.scan_url ? (
               <img src={selectedEntry.scan_url} alt="Bill Scan" className="max-w-full max-h-[70vh] object-contain shadow-2xl" />
             ) : (
                <div className="flex flex-col items-center gap-3 text-zinc-600">
                   <ImageIcon className="w-16 h-16 opacity-20" />
                   <p className="text-sm font-medium">No scan available for this entry</p>
                </div>
             )}
          </div>
          <DialogFooter className="p-4 bg-zinc-950">
            <Button variant="outline" onClick={() => setViewScanOpen(false)} className="border-white/10 text-white hover:bg-white/5">Close Viewer</Button>
            <a href={selectedEntry?.scan_url} target="_blank" rel="noreferrer">
               <Button className="gap-2">
                 <Upload className="w-4 h-4" /> Open Full Image
               </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
