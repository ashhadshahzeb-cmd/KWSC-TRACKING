import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, MapPin, Clock, History, FileText, Printer, ArrowRight, CheckCircle2, FileSearch, Building2, Calendar, User, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/mock-data";

export default function FileTracking() {
  const location = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  useEffect(() => {
    // If navigated from BillDispatch with a bill in state
    if (location.state?.bill) {
      setSelectedBill(location.state.bill);
      setSearchQuery(location.state.bill.tracking_id || location.state.bill.diary_no);
    }
  }, [location.state]);

  const handleSearch = async () => {
    if (!searchQuery) {
      toast.error("Please enter a Tracking ID or Diary Number");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bill_dispatch' as any)
        .select('*')
        .or(`tracking_id.eq.${searchQuery},diary_no.eq.${searchQuery}`)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSelectedBill(data);
        toast.success("File record found!");
      } else {
        // Advanced Mock Data for demo/testing
        const mockRecords: Record<string, any> = {
          "12": {
            tracking_id: "FL-2024-0012",
            diary_no: "Diary-12",
            party_name: "Pakistan State Oil (PSO)",
            subject: "Fuel Supply for KW&SB Vehicles",
            amount: 1250000,
            status: "forwarded",
            forwarded_to: "pol_bills",
            received_date: "2024-04-12",
            history: [
              { step: "Inward Entry", date: "2024-04-12T09:00:00Z", location: "Bill Dispatch", remarks: "Received bulk fuel invoice" },
              { step: "Forwarded", date: "2024-04-12T11:30:00Z", location: "POL Bills Section", remarks: "For consumption verification" }
            ]
          },
          "101": {
            tracking_id: "FL-2024-0101",
            diary_no: "D-101",
            party_name: "Aga Khan University Hospital",
            subject: "Emergency Medical Claim - Staff ID #4492",
            amount: 45000,
            status: "forwarded",
            forwarded_to: "medical",
            received_date: "2024-04-05",
            history: [
              { step: "Inward Entry", date: "2024-04-05T10:00:00Z", location: "Bill Dispatch", remarks: "Priority medical case" },
              { step: "Forwarded", date: "2024-04-05T14:00:00Z", location: "Medical Section", remarks: "Verify treatment bill" },
              { step: "Processed", date: "2024-04-06T10:00:00Z", location: "Medical Section", remarks: "Bill checked & approved" },
              { step: "Forwarded", date: "2024-04-06T11:00:00Z", location: "CFO Office", remarks: "For final signature" }
            ]
          },
          "202": {
            tracking_id: "FL-2024-0202",
            diary_no: "KW-202",
            party_name: "Indus Constructions Ltd",
            subject: "Sewerage Pipe Replacement - District Central",
            amount: 8500000,
            status: "forwarded",
            forwarded_to: "contractor",
            received_date: "2024-04-08",
            history: [
              { step: "Inward Entry", date: "2024-04-08T15:00:00Z", location: "Bill Dispatch", remarks: "Completion certificate attached" },
              { step: "Forwarded", date: "2024-04-09T10:00:00Z", location: "Contractor Section", remarks: "Check MB entries" }
            ]
          }
        };

        if (mockRecords[searchQuery]) {
          setSelectedBill(mockRecords[searchQuery]);
          toast.success("Found mock record for demonstration");
        } else if (searchQuery.startsWith('FL-')) {
            setSelectedBill({
                tracking_id: searchQuery,
                diary_no: "KWB/2024/099",
                party_name: "Mock Vendor Ltd",
                subject: "Emergency Repair Works",
                amount: 75000,
                status: "forwarded",
                forwarded_to: "medical",
                received_date: "2024-04-10",
                history: [
                    { step: "Inward Entry", date: "2024-04-10T10:00:00Z", location: "Bill Dispatch", remarks: "Received by Ahmed" },
                    { step: "Forwarded", date: "2024-04-11T14:30:00Z", location: "Medical Section", remarks: "Allocated for budget verification" }
                ]
            });
            toast.info("Generated temp tracking view");
        } else {
          toast.error("No record found with this ID");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error fetching record");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSearch className="w-7 h-7 text-primary" />
            File Journey Tracking
          </h1>
          <p className="text-sm text-muted-foreground">Monitor file movement across departments and sections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <Card className="glass-card border-none shadow-xl">
           <CardHeader>
             <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Track Your File</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold font-mono">TRACKING ID / DIARY NO</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. FL-2024-1234" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="bg-muted/20 border-border/50 h-10 font-mono text-sm"
                  />
                  <Button onClick={handleSearch} disabled={loading} className="bg-primary hover:bg-primary/90 px-3">
                    {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {selectedBill && (
                <div className="pt-4 border-t border-border/50 space-y-4 animate-fade-in">
                   <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <p className="text-[10px] font-bold text-primary uppercase">Current Location</p>
                      <h3 className="text-xl font-bold flex items-center gap-2 mt-1">
                        <Building2 className="w-5 h-5 text-primary" />
                        {selectedBill.status === 'pending' ? 'Bill Dispatch (Inward)' : selectedBill.forwarded_to.charAt(0).toUpperCase() + selectedBill.forwarded_to.slice(1) + ' Section'}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-xs text-muted-foreground flex items-center gap-1">
                           <Calendar className="w-3 h-3" /> Updated: {selectedBill.history ? new Date(selectedBill.history[selectedBill.history.length-1].date).toLocaleDateString() : 'N/A'}
                         </span>
                      </div>
                   </div>

                   <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5" onClick={handlePrint}>
                      <Printer className="w-4 h-4" /> Print Covering Page (Slip)
                   </Button>
                </div>
              )}
           </CardContent>
        </Card>

        {/* Content Panel */}
        <div className="lg:col-span-2 space-y-6">
           {!selectedBill ? (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
                <History className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-bold text-muted-foreground">Search for a file to see its history</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Enter the unique Tracking ID generated during bill entry to see where your file is currently located.</p>
             </div>
           ) : (
             <div className="space-y-6 animate-fade-in">
                {/* File Details */}
                <Card className="glass-card border-none shadow-xl overflow-hidden">
                   <div className="h-1 bg-gradient-to-r from-primary to-blue-400" />
                   <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/30">
                      <CardTitle className="text-lg font-bold">File Specifications</CardTitle>
                      <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{selectedBill.tracking_id}</span>
                   </CardHeader>
                   <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                      <div className="space-y-4">
                         <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-muted-foreground mt-1" />
                            <div>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase">Party / Vendor</p>
                               <p className="font-semibold">{selectedBill.party_name}</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-3">
                            <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                            <div>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase">Subject</p>
                               <p className="text-sm text-muted-foreground">{selectedBill.subject}</p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                            <div>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase">Diary Reference</p>
                               <p className="font-mono text-sm">{selectedBill.diary_no}</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground mt-1" />
                            <div>
                               <p className="text-[10px] font-bold text-muted-foreground uppercase">Amount</p>
                               <p className="font-bold text-primary">{formatCurrency(selectedBill.amount)}</p>
                            </div>
                         </div>
                      </div>
                   </CardContent>
                </Card>

                {/* Tracking Journey */}
                <Card className="glass-card border-none shadow-xl relative">
                   <CardHeader>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Movement History (Timeline)
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="pb-10 pt-4">
                      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-primary/20 before:to-transparent">
                        {selectedBill.history?.map((step: any, index: number) => (
                           <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-primary/50 bg-background text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                                 {index === selectedBill.history.length - 1 ? <MapPin className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                              </div>
                              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-primary/10 bg-primary/5 shadow-sm group-hover:bg-primary/10 transition-colors duration-200">
                                 <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-sm text-primary">{step.step}</div>
                                    <time className="font-mono text-[10px] text-muted-foreground">{new Date(step.date).toLocaleString()}</time>
                                 </div>
                                 <div className="text-xs font-semibold flex items-center gap-1 mb-2">
                                    <Building2 className="w-3 h-3 text-muted-foreground" />
                                    {step.location.toUpperCase()}
                                 </div>
                                 <div className="text-xs text-muted-foreground italic flex gap-1 items-start bg-background/50 p-2 rounded-md">
                                    <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                                    "{step.remarks}"
                                 </div>
                              </div>
                           </div>
                        ))}
                      </div>
                   </CardContent>
                </Card>
             </div>
           )}
        </div>
      </div>

      {/* Hidden Printable Covering Page */}
      <div className="print-only hidden">
        <div ref={printRef} className="p-10 font-sans text-black bg-white min-h-[11in] w-[8.5in] relative">
           {/* Header */}
           <div className="text-center border-b-2 border-black pb-4 mb-8">
              <h1 className="text-2xl font-black uppercase tracking-tighter">Karachi Water & Sewerage Board</h1>
              <h2 className="text-lg font-bold uppercase mt-1">Finance Department - File Movement Slip</h2>
              <div className="flex justify-between mt-4 font-mono text-xs">
                 <span>Ref No: {selectedBill?.diary_no}</span>
                 <span>Tracking ID: {selectedBill?.tracking_id}</span>
              </div>
           </div>

           {/* File Overview */}
           <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                 <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500">Party / Vendor Name</p>
                    <p className="text-base font-bold underline underline-offset-4">{selectedBill?.party_name}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500">Subject / Nature of Work</p>
                    <p className="text-sm border-b border-dotted border-gray-400 pb-1">{selectedBill?.subject}</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500">Date Received in Finance</p>
                    <p className="text-base font-bold">{selectedBill?.received_date}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500">Amount Claimed</p>
                    <p className="text-base font-bold">{formatCurrency(selectedBill?.amount)}</p>
                 </div>
              </div>
           </div>

           {/* Movement Table */}
           <div className="mt-8">
              <h3 className="text-sm font-bold uppercase mb-4 bg-gray-100 p-2">Chronological Movement Record</h3>
              <table className="w-full border-collapse border border-black text-xs">
                 <thead>
                    <tr className="bg-gray-50">
                       <th className="border border-black p-2 text-left w-12">SN</th>
                       <th className="border border-black p-2 text-left">Department / Section</th>
                       <th className="border border-black p-2 text-left">Date & Time</th>
                       <th className="border border-black p-2 text-left">Action Taken / Remarks</th>
                       <th className="border border-black p-2 text-left w-24">Signature</th>
                    </tr>
                 </thead>
                 <tbody>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                       const step = selectedBill?.history?.[i-1];
                       return (
                          <tr key={i} className="h-16">
                             <td className="border border-black p-2 text-center font-bold">{i}</td>
                             <td className="border border-black p-2 text-sm font-semibold">{step?.location || ""}</td>
                             <td className="border border-black p-2 font-mono text-[10px]">{step ? new Date(step.date).toLocaleString() : ""}</td>
                             <td className="border border-black p-2 text-gray-600">{step?.remarks || ""}</td>
                             <td className="border border-black p-2"></td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>

           {/* Footer */}
           <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end border-t border-black pt-4">
              <div className="text-[10px] font-mono">
                 <p>Generated by: FinLedger Software</p>
                 <p>Timestamp: {new Date().toLocaleString()}</p>
              </div>
              <div className="text-center w-48">
                 <div className="border-t border-black mb-1"></div>
                 <p className="text-[10px] font-bold uppercase">Section Officer (Finance)</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
