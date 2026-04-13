import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  MapPin, 
  Clock, 
  History, 
  FileText, 
  Printer, 
  ArrowRight, 
  CheckCircle2, 
  FileSearch, 
  Building2, 
  Calendar, 
  User, 
  MessageSquare,
  Save,
  Loader2,
  FileSignature,
  PenTool,
  RotateCcw as ResetIcon,
  Trash2,
  Check,
  Upload,
  Image as ImageIcon,
  Bell,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Inbox,
  LayoutDashboard,
  Plus
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function FileTracking() {
  const location = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("register");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  // New Form State
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [formData, setFormData] = useState({
    cfo_diary_number: "",
    inward_date: new Date().toISOString().split('T')[0],
    received_from: "",
    receiving_number: `RC-${Math.floor(1000 + Math.random() * 9000)}`,
    mainCategory: "",
    subCategory: "",
    subject: "",
    date_of_sign: new Date().toISOString().split('T')[0],
    signature_data: "",
    mark_to: "",
    outward_date: new Date().toISOString().split('T')[0],
    remarks: "",
  });

  const [currentRole, setCurrentRole] = useState("cfo"); // Simulation: 'cfo', 'medical', 'contractor', etc.
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Comprehensive Dummy Data Set for Testing (15+ entries per section)
  const [records, setRecords] = useState<any[]>([
    // MEDICAL SECTION (15 entries)
    { id: "med-1", tracking_id: "FT-MED-101", cfo_diary_number: "CFO-M-01", inward_date: "2024-04-01", received_from: "HR Admin", receiving_number: "RC-M-101", mainCategory: "employee", subCategory: "medical", subject: "Reimbursement for Staff ID 4492", mark_to: "medical", created_at: "2024-04-01T09:00:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Reimbursement for Staff ID 4492", remarks: "Check OPD claims", signature_data: "", date: "2024-04-01T09:00:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-2", tracking_id: "FT-MED-102", cfo_diary_number: "CFO-M-02", inward_date: "2024-04-01", received_from: "Revenue Section", receiving_number: "RC-M-102", mainCategory: "employee", subCategory: "medical", subject: "In-patient bill - Staff ID 5512", mark_to: "medical", created_at: "2024-04-01T10:00:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "In-patient bill - Staff ID 5512", remarks: "Verify surgery costs", signature_data: "", date: "2024-04-01T10:00:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-3", tracking_id: "FT-MED-103", cfo_diary_number: "CFO-M-03", inward_date: "2024-04-02", received_from: "Accounts Branch", receiving_number: "RC-M-103", mainCategory: "employee", subCategory: "medical", subject: "Maternity claim - Staff ID 8821", mark_to: "medical", created_at: "2024-04-02T11:00:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Maternity claim - Staff ID 8821", remarks: "Policy check required", signature_data: "", date: "2024-04-02T11:00:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-4", tracking_id: "FT-MED-104", cfo_diary_number: "CFO-M-04", inward_date: "2024-04-02", received_from: "HR Admin", receiving_number: "RC-M-104", mainCategory: "employee", subCategory: "medical", subject: "Emergency treatment - Staff ID 1121", mark_to: "medical", created_at: "2024-04-02T14:30:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Heart surgery claim", remarks: "Life saving emergency", signature_data: "", date: "2024-04-02T14:30:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-5", tracking_id: "FT-MED-105", cfo_diary_number: "CFO-M-05", inward_date: "2024-04-03", received_from: "Revenue Dept", receiving_number: "RC-M-105", mainCategory: "employee", subCategory: "medical", subject: "Optical claim batch - Staff ID 4410", mark_to: "medical", created_at: "2024-04-03T10:15:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Optical batch claim", remarks: "Standard allowance check", signature_data: "", date: "2024-04-03T10:15:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-6", tracking_id: "FT-MED-106", cfo_diary_number: "CFO-M-06", inward_date: "2024-04-03", received_from: "HR Section", receiving_number: "RC-M-106", mainCategory: "employee", subCategory: "medical", subject: "Dental treatment bill - Staff ID 9901", mark_to: "medical", created_at: "2024-04-03T16:00:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Dental claim", remarks: "Check clinic registration", signature_data: "", date: "2024-04-03T16:00:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-7", tracking_id: "FT-MED-107", cfo_diary_number: "CFO-M-07", inward_date: "2024-04-04", received_from: "Accounts Branch", receiving_number: "RC-M-107", mainCategory: "employee", subCategory: "medical", subject: "Mental health session - Staff ID 2210", mark_to: "medical", created_at: "2024-04-04T09:30:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Continuous support case", remarks: "Monthly allocation case", signature_data: "", date: "2024-04-04T09:30:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-8", tracking_id: "FT-MED-108", cfo_diary_number: "CFO-M-08", inward_date: "2024-04-04", received_from: "Revenue Section", receiving_number: "RC-M-108", mainCategory: "employee", subCategory: "medical", subject: "Pharmacy batch Q1 - Multiple staff", mark_to: "medical", created_at: "2024-04-04T12:00:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Pharmacy batch claim", remarks: "Check prescribed list", signature_data: "", date: "2024-04-04T12:00:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-9", tracking_id: "FT-MED-109", cfo_diary_number: "CFO-M-09", inward_date: "2024-04-05", received_from: "HR Admin", receiving_number: "RC-M-109", mainCategory: "employee", subCategory: "medical", subject: "Physio claim - Staff ID 3381", mark_to: "medical", created_at: "2024-04-05T11:00:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Physiotherapy claim", remarks: "Verify attendance log", signature_data: "", date: "2024-04-05T11:00:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-10", tracking_id: "FT-MED-110", cfo_diary_number: "CFO-M-10", inward_date: "2024-04-05", received_from: "Revenue Dept", receiving_number: "RC-M-110", mainCategory: "employee", subCategory: "medical", subject: "Lab test reimbursement - Various staff", mark_to: "medical", created_at: "2024-04-05T15:00:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Lab test batch", remarks: "Consolidated report check", signature_data: "", date: "2024-04-05T15:00:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-11", tracking_id: "FT-MED-111", cfo_diary_number: "CFO-M-11", inward_date: "2024-04-06", received_from: "HR Admin", receiving_number: "RC-M-111", mainCategory: "employee", subCategory: "medical", subject: "Diagnostic scan - Staff ID 7701", mark_to: "medical", created_at: "2024-04-06T09:45:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "MRI Scan claim", remarks: "Emergency diagnostic", signature_data: "", date: "2024-04-06T09:45:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-12", tracking_id: "FT-MED-112", cfo_diary_number: "CFO-M-12", inward_date: "2024-04-06", received_from: "Accounts Sect", receiving_number: "RC-M-112", mainCategory: "employee", subCategory: "medical", subject: "Hearing aid claim - Staff ID 5502", mark_to: "medical", created_at: "2024-04-06T14:00:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Medical appliance claim", remarks: "Check technical approval", signature_data: "", date: "2024-04-06T14:00:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-13", tracking_id: "FT-MED-113", cfo_diary_number: "CFO-M-13", inward_date: "2024-04-07", received_from: "HR Admin", receiving_number: "RC-M-113", mainCategory: "employee", subCategory: "medical", subject: "Dialysis batch claim - Chronic cases", mark_to: "medical", created_at: "2024-04-07T10:30:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Dialysis support batch", remarks: "Standard funding approve", signature_data: "", date: "2024-04-07T10:30:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-14", tracking_id: "FT-MED-114", cfo_diary_number: "CFO-M-14", inward_date: "2024-04-07", received_from: "Revenue Section", receiving_number: "RC-M-114", mainCategory: "employee", subCategory: "medical", subject: "Home care medical support - Staff ID 1109", mark_to: "medical", created_at: "2024-04-07T15:45:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Home care claim", remarks: "Verify medical necessity", signature_data: "", date: "2024-04-07T15:45:00Z", processed_by: "CFO Office", mark_to: "medical" }] },
    { id: "med-15", tracking_id: "FT-MED-115", cfo_diary_number: "CFO-M-15", inward_date: "2024-04-08", received_from: "Accounts Sect", receiving_number: "RC-M-115", mainCategory: "employee", subCategory: "medical", subject: "Infectious disease claim batch - Q1", mark_to: "medical", created_at: "2024-04-08T09:15:00Z", history: [{ mainCategory: "employee", subCategory: "medical", subject: "Infectious batch claim", remarks: "Health officer sign-off", signature_data: "", date: "2024-04-08T09:15:00Z", processed_by: "CFO Office", mark_to: "medical" }] },

    // CONTRACTOR SECTION (15 entries)
    { id: "con-1", tracking_id: "FT-CON-201", cfo_diary_number: "CFO-C-01", inward_date: "2024-04-01", received_from: "Chief Engineer West", receiving_number: "RC-C-201", mainCategory: "contractor", subCategory: "running_bill", subject: "Sewerage Line Work - Korangi Ph 1", mark_to: "contractor", created_at: "2024-04-01T10:00:00Z", history: [{ mainCategory: "contractor", subCategory: "running_bill", subject: "Korangi Ph 1 Bill", remarks: "Verify MB entries", signature_data: "", date: "2024-04-01T10:00:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-2", tracking_id: "FT-CON-202", cfo_diary_number: "CFO-C-02", inward_date: "2024-04-01", received_from: "XEN North", receiving_number: "RC-C-202", mainCategory: "contractor", subCategory: "final_bill", subject: "Pipe Replacement - Gulshan Zone B", mark_to: "contractor", created_at: "2024-04-01T14:00:00Z", history: [{ mainCategory: "contractor", subCategory: "final_bill", subject: "Gulshan Zone B Final", remarks: "Final inspection done", signature_data: "", date: "2024-04-01T14:00:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-3", tracking_id: "FT-CON-203", cfo_diary_number: "CFO-C-03", inward_date: "2024-04-02", received_from: "SE Central", receiving_number: "RC-C-203", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Release - Project Alpha 2023", mark_to: "contractor", created_at: "2024-04-02T09:00:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Release Case", remarks: "Maint period complete", signature_data: "", date: "2024-04-02T09:00:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-4", tracking_id: "FT-CON-204", cfo_diary_number: "CFO-C-04", inward_date: "2024-04-02", received_from: "Project Director", receiving_number: "RC-C-204", mainCategory: "contractor", subCategory: "running_bill", subject: "Bridge Maintenance - Lyari Link", mark_to: "contractor", created_at: "2024-04-02T13:30:00Z", history: [{ mainCategory: "contractor", subCategory: "running_bill", subject: "Lyari Bridge Bill #3", remarks: "Check labor records", signature_data: "", date: "2024-04-02T13:30:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-5", tracking_id: "FT-CON-205", cfo_diary_number: "CFO-C-05", inward_date: "2024-04-03", received_from: "Chief Engineer South", receiving_number: "RC-C-205", mainCategory: "contractor", subCategory: "retention_money", subject: "Retention Relief - Water Plant Ph1", mark_to: "contractor", created_at: "2024-04-03T11:00:00Z", history: [{ mainCategory: "contractor", subCategory: "retention_money", subject: "Retention Money Case", remarks: "Audit check passed", signature_data: "", date: "2024-04-03T11:00:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-6", tracking_id: "FT-CON-206", cfo_diary_number: "CFO-C-06", inward_date: "2024-04-03", received_from: "XEN West", receiving_number: "RC-C-206", mainCategory: "contractor", subCategory: "running_bill", subject: "Valve Installation - HUB Canal Ph2", mark_to: "contractor", created_at: "2024-04-03T15:45:00Z", history: [{ mainCategory: "contractor", subCategory: "running_bill", subject: "HUB Ph2 Valve Bill", remarks: "Verify parts list", signature_data: "", date: "2024-04-03T15:45:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-7", tracking_id: "FT-CON-207", cfo_diary_number: "CFO-C-07", inward_date: "2024-04-04", received_from: "SE East", receiving_number: "RC-C-207", mainCategory: "contractor", subCategory: "final_bill", subject: "Road Restoration - Quaidabad Link 1", mark_to: "contractor", created_at: "2024-04-04T10:20:00Z", history: [{ mainCategory: "contractor", subCategory: "final_bill", subject: "Quaidabad Road Final", remarks: "Compliance verified", signature_data: "", date: "2024-04-04T10:20:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-8", tracking_id: "FT-CON-208", cfo_diary_number: "CFO-C-08", inward_date: "2024-04-04", received_from: "CE West", receiving_number: "RC-C-208", mainCategory: "contractor", subCategory: "running_bill", subject: "Filter Plant Cleaning - Pipri Site B", mark_to: "contractor", created_at: "2024-04-04T14:30:00Z", history: [{ mainCategory: "contractor", subCategory: "running_bill", subject: "Pipri Site B Clean Bill", remarks: "Verify chemical log", signature_data: "", date: "2024-04-04T14:30:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-9", tracking_id: "FT-CON-209", cfo_diary_number: "CFO-C-09", inward_date: "2024-04-05", received_from: "XEN District East", receiving_number: "RC-C-209", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Release - Street Repair Zone X", mark_to: "contractor", created_at: "2024-04-05T09:15:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Zone X Repair Security", remarks: "Defects rectified", signature_data: "", date: "2024-04-05T09:15:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-10", tracking_id: "FT-CON-210", cfo_diary_number: "CFO-C-10", inward_date: "2024-04-05", received_from: "SE North", receiving_number: "RC-C-210", mainCategory: "contractor", subCategory: "running_bill", subject: "Electric Motor Overhaul - Station 5A", mark_to: "contractor", created_at: "2024-04-05T12:00:00Z", history: [{ mainCategory: "contractor", subCategory: "running_bill", subject: "Station 5A Motor Bill", remarks: "Warranty check attached", signature_data: "", date: "2024-04-05T12:00:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-11", tracking_id: "FT-CON-211", cfo_diary_number: "CFO-C-11", inward_date: "2024-04-06", received_from: "Project Director", receiving_number: "RC-C-211", mainCategory: "contractor", subCategory: "running_bill", subject: "Dredging Services - Malir River", mark_to: "contractor", created_at: "2024-04-06T10:45:00Z", history: [{ mainCategory: "contractor", subCategory: "running_bill", subject: "Malir Dredging No 2", remarks: "Verify volume report", signature_data: "", date: "2024-04-06T10:45:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-12", tracking_id: "FT-CON-212", cfo_diary_number: "CFO-C-12", inward_date: "2024-04-06", received_from: "XEN Workshop", receiving_number: "RC-C-212", mainCategory: "contractor", subCategory: "final_bill", subject: "Crane Lease Settlement - Q1", mark_to: "contractor", created_at: "2024-04-06T15:30:00Z", history: [{ mainCategory: "contractor", subCategory: "final_bill", subject: "Crane Lease Final", remarks: "Check log books", signature_data: "", date: "2024-04-06T15:30:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-13", tracking_id: "FT-CON-213", cfo_diary_number: "CFO-C-13", inward_date: "2024-04-07", received_from: "CE East", receiving_number: "RC-C-213", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Release - Water Main G-22", mark_to: "contractor", created_at: "2024-04-07T09:15:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "G-22 Security Case", remarks: "Audit observation clear", signature_data: "", date: "2024-04-07T09:15:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-14", tracking_id: "FT-CON-214", cfo_diary_number: "CFO-C-14", inward_date: "2024-04-07", received_from: "SE South", receiving_number: "RC-C-214", mainCategory: "contractor", subCategory: "running_bill", subject: "Fence Installation - Reservoir A", mark_to: "contractor", created_at: "2024-04-07T14:40:00Z", history: [{ mainCategory: "contractor", subCategory: "running_bill", subject: "Reservoir A Fence Bill", remarks: "Check site photos", signature_data: "", date: "2024-04-07T14:40:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },
    { id: "con-15", tracking_id: "FT-CON-215", cfo_diary_number: "CFO-C-15", inward_date: "2024-04-08", received_from: "Chief Engineer", receiving_number: "RC-C-215", mainCategory: "contractor", subCategory: "final_bill", subject: "IT Network Cabling - Admin Block", mark_to: "contractor", created_at: "2024-04-08T11:00:00Z", history: [{ mainCategory: "contractor", subCategory: "final_bill", subject: "IT Cabling Final", remarks: "UAT documentation check", signature_data: "", date: "2024-04-08T11:00:00Z", processed_by: "CFO Office", mark_to: "contractor" }] },

    // SECURITY DEPOSIT SECTION (15 entries)
    { id: "sd-1", tracking_id: "FT-SD-301", cfo_diary_number: "CFO-S-01", inward_date: "2024-04-01", received_from: "Contract Branch", receiving_number: "RC-S-301", mainCategory: "contractor", subCategory: "security_deposit", subject: "Retention Relief - Pipe Supply B-1", mark_to: "security_deposit", created_at: "2024-04-01T11:00:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Pipe Supply B-1 Security", remarks: "Wait for final report", signature_data: "", date: "2024-04-01T11:00:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-2", tracking_id: "FT-SD-302", cfo_diary_number: "CFO-S-02", inward_date: "2024-04-01", received_from: "Legal Advisor", receiving_number: "RC-S-302", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Refund - Canceled Tender 88", mark_to: "security_deposit", created_at: "2024-04-01T15:00:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Tender 88 Refund Case", remarks: "Tender canceled officially", signature_data: "", date: "2024-04-01T15:00:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-3", tracking_id: "FT-SD-303", cfo_diary_number: "CFO-S-03", inward_date: "2024-04-02", received_from: "Engineering Cell", receiving_number: "RC-S-303", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Release - Boundary Wall Ph1", mark_to: "security_deposit", created_at: "2024-04-02T10:00:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Boundary Ph1 Security", remarks: "Verify completion doc", signature_data: "", date: "2024-04-02T10:00:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-4", tracking_id: "FT-SD-304", cfo_diary_number: "CFO-S-04", inward_date: "2024-04-02", received_from: "IT Procurement", receiving_number: "RC-S-304", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Refund - Server Supply Q2", mark_to: "security_deposit", created_at: "2024-04-02T14:00:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Server Supply Security", remarks: "Check technical report", signature_data: "", date: "2024-04-02T14:00:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-5", tracking_id: "FT-SD-305", cfo_diary_number: "CFO-S-05", inward_date: "2024-04-03", received_from: "XEN Workshop", receiving_number: "RC-S-305", mainCategory: "contractor", subCategory: "security_deposit", subject: "Retention Money - Site Crane B-4", mark_to: "security_deposit", created_at: "2024-04-03T09:30:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Crane B-4 Security Case", remarks: "Verify maintenance log", signature_data: "", date: "2024-04-03T09:30:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-6", tracking_id: "FT-SD-306", cfo_diary_number: "CFO-S-06", inward_date: "2024-04-03", received_from: "PD HUB Canal", receiving_number: "RC-S-306", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Release - Dam Repair Ph 3", mark_to: "security_deposit", created_at: "2024-04-03T12:00:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Dam Ph3 Security", remarks: "Structural sign-off attached", signature_data: "", date: "2024-04-03T12:00:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-7", tracking_id: "FT-SD-307", cfo_diary_number: "CFO-S-07", inward_date: "2024-04-04", received_from: "CE East Cell", receiving_number: "RC-S-307", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Refund - Valve Supply 2024", mark_to: "security_deposit", created_at: "2024-04-04T10:45:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Valve Supply Security Case", remarks: "Matched store receipts", signature_data: "", date: "2024-04-04T10:45:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-8", tracking_id: "FT-SD-308", cfo_diary_number: "CFO-S-08", inward_date: "2024-04-04", received_from: "Legal Advisor", receiving_number: "RC-S-308", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Release - Court Case X-221", mark_to: "security_deposit", created_at: "2024-04-04T15:30:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Court Case Security", remarks: "Legal clearance verified", signature_data: "", date: "2024-04-04T15:30:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-9", tracking_id: "FT-SD-309", cfo_diary_number: "CFO-S-09", inward_date: "2024-04-05", received_from: "Admin Procurement", receiving_number: "RC-S-309", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Refund - Lab Equipment Unit", mark_to: "security_deposit", created_at: "2024-04-05T11:15:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Lab Supply Security", remarks: "Checking warranty status", signature_data: "", date: "2024-04-05T11:15:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-10", tracking_id: "FT-SD-310", cfo_diary_number: "CFO-S-10", inward_date: "2024-04-05", received_from: "Accounts Branch", receiving_number: "RC-S-310", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Release - Guard Services Ph A", mark_to: "security_deposit", created_at: "2024-04-05T16:00:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Guard Service Security", remarks: "Full settlement sign-off", signature_data: "", date: "2024-04-05T16:00:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-11", tracking_id: "FT-SD-311", cfo_diary_number: "CFO-S-11", inward_date: "2024-04-06", received_from: "XEN Workshop", receiving_number: "RC-S-311", mainCategory: "contractor", subCategory: "security_deposit", subject: "Retention Relief - Fleet Maintenance", mark_to: "security_deposit", created_at: "2024-04-06T10:00:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Fleet Security Release", remarks: "Maint phase complete", signature_data: "", date: "2024-04-06T10:00:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-12", tracking_id: "FT-SD-312", cfo_diary_number: "CFO-S-12", inward_date: "2024-04-06", received_from: "PD Filtration", receiving_number: "RC-S-312", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Release - Pipeline Coating", mark_to: "security_deposit", created_at: "2024-04-06T13:30:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Coating Sec Release", remarks: "Check technical audit", signature_data: "", date: "2024-04-06T13:30:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-13", tracking_id: "FT-SD-313", cfo_diary_number: "CFO-S-13", inward_date: "2024-04-07", received_from: "Engineering Branch", receiving_number: "RC-S-313", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Release - Roof Repair Batch 1", mark_to: "security_deposit", created_at: "2024-04-07T09:45:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Roof Sec Release", remarks: "Check leak-proof report", signature_data: "", date: "2024-04-07T09:45:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-14", tracking_id: "FT-SD-314", cfo_diary_number: "CFO-S-14", inward_date: "2024-04-07", received_from: "IT Section", receiving_number: "RC-S-314", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Refund - Software Dev Sec", mark_to: "security_deposit", created_at: "2024-04-07T12:00:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Software Sec Release", remarks: "Check source code hand-over", signature_data: "", date: "2024-04-07T12:00:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },
    { id: "sd-15", tracking_id: "FT-SD-315", cfo_diary_number: "CFO-S-15", inward_date: "2024-04-08", received_from: "Legal Branch", receiving_number: "RC-S-315", mainCategory: "contractor", subCategory: "security_deposit", subject: "Security Refund - Bond Case 4492", mark_to: "security_deposit", created_at: "2024-04-08T10:15:00Z", history: [{ mainCategory: "contractor", subCategory: "security_deposit", subject: "Bond Refund Case", remarks: "Bond period elapsed", signature_data: "", date: "2024-04-08T10:15:00Z", processed_by: "CFO Office", mark_to: "security_deposit" }] },

    // POL BILLS SECTION (15 entries)
    { id: "pol-1", tracking_id: "FT-POL-401", cfo_diary_number: "CFO-P-01", inward_date: "2024-04-01", received_from: "Transport Cell", receiving_number: "RC-P-401", mainCategory: "others", subCategory: "pol_bills", subject: "Fuel reimbursement - March week 1", mark_to: "pol_bills", created_at: "2024-04-01T12:00:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "March Fuel week 1", remarks: "Check vehicle log", signature_data: "", date: "2024-04-01T12:00:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-2", tracking_id: "FT-POL-402", cfo_diary_number: "CFO-P-02", inward_date: "2024-04-01", received_from: "Security Dept", receiving_number: "RC-P-402", mainCategory: "others", subCategory: "pol_bills", subject: "Diesel diesel - Station 2 Generator", mark_to: "pol_bills", created_at: "2024-04-01T16:30:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Generator Diesel Case", remarks: "Check outage report", signature_data: "", date: "2024-04-01T16:30:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-3", tracking_id: "FT-POL-403", cfo_diary_number: "CFO-P-03", inward_date: "2024-04-02", received_from: "Workshop South", receiving_number: "RC-P-403", mainCategory: "others", subCategory: "pol_bills", subject: "Lubricant batch supply - April", mark_to: "pol_bills", created_at: "2024-04-02T11:00:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Lubricant Bill Case", remarks: "Matched stock entry", signature_data: "", date: "2024-04-02T11:00:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-4", tracking_id: "FT-POL-404", cfo_diary_number: "CFO-P-04", inward_date: "2024-04-02", received_from: "Fleet Admin", receiving_number: "RC-P-404", mainCategory: "others", subCategory: "pol_bills", subject: "Tyre replacement batch - Fleet Z", mark_to: "pol_bills", created_at: "2024-04-02T15:20:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Fleet Tyre Case", remarks: "Inspected by workshop", signature_data: "", date: "2024-04-02T15:20:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-5", tracking_id: "FT-POL-405", cfo_diary_number: "CFO-P-05", inward_date: "2024-04-03", received_from: "Project Director HUB", receiving_number: "RC-P-405", mainCategory: "others", subCategory: "pol_bills", subject: "Site fuel supply - Heavy Site B", mark_to: "pol_bills", created_at: "2024-04-03T10:00:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Site Fuel Case B", remarks: "Check site log books", signature_data: "", date: "2024-04-03T10:00:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-6", tracking_id: "FT-POL-406", cfo_diary_number: "CFO-P-06", inward_date: "2024-04-03", received_from: "Transport Office", receiving_number: "RC-P-406", mainCategory: "others", subCategory: "pol_bills", subject: "Repair and Oil change - Staff Bus 4", mark_to: "pol_bills", created_at: "2024-04-03T14:40:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Staff Bus Maint", remarks: "Verify job card", signature_data: "", date: "2024-04-03T14:40:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-7", tracking_id: "FT-POL-407", cfo_diary_number: "CFO-P-07", inward_date: "2024-04-04", received_from: "Security Branch", receiving_number: "RC-P-407", mainCategory: "others", subCategory: "pol_bills", subject: "Petrol for Security Bikes March week 4", mark_to: "pol_bills", created_at: "2024-04-04T09:15:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Bike Fuel Case", remarks: "Matched route logs", signature_data: "", date: "2024-04-04T09:15:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-8", tracking_id: "FT-POL-408", cfo_diary_number: "CFO-P-08", inward_date: "2024-04-04", received_from: "XEN Workshop", receiving_number: "RC-P-408", mainCategory: "others", subCategory: "pol_bills", subject: "Hydraulic oil supply - Workshop Bulk", mark_to: "pol_bills", created_at: "2024-04-04T12:30:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Hydraulic Oil Bill", remarks: "Verify gate pass", signature_data: "", date: "2024-04-04T12:30:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-9", tracking_id: "FT-POL-409", cfo_diary_number: "CFO-P-09", inward_date: "2024-04-05", received_from: "Transport Cell", receiving_number: "RC-P-409", mainCategory: "others", subCategory: "pol_bills", subject: "Tyre patch batch - Service Center", mark_to: "pol_bills", created_at: "2024-04-05T10:45:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Tyre Patch Case", remarks: "Matched receipts", signature_data: "", date: "2024-04-05T10:45:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-10", tracking_id: "FT-POL-410", cfo_diary_number: "CFO-P-10", inward_date: "2024-04-05", received_from: "HR Section", receiving_number: "RC-P-410", mainCategory: "others", subCategory: "pol_bills", subject: "Weekly Fuel - Staff Shuttle A", mark_to: "pol_bills", created_at: "2024-04-05T15:20:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Approve for week 2", remarks: "Matched weekly log", signature_data: "", date: "2024-04-05T15:20:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-11", tracking_id: "FT-POL-411", cfo_diary_number: "CFO-P-11", inward_date: "2024-04-06", received_from: "Security Dept", receiving_number: "RC-P-411", mainCategory: "others", subCategory: "pol_bills", subject: "Lubricant - Station 4 Genset", mark_to: "pol_bills", created_at: "2024-04-06T09:00:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Genset Lubricant Case", remarks: "Check technical sign", signature_data: "", date: "2024-04-06T09:00:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-12", tracking_id: "FT-POL-412", cfo_diary_number: "CFO-P-12", inward_date: "2024-04-06", received_from: "Site Supervisor", receiving_number: "RC-P-412", mainCategory: "others", subCategory: "pol_bills", subject: "Fuel reimbursement - Site Vehicle 11", mark_to: "pol_bills", created_at: "2024-04-06T13:45:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Site Vehicle Fuel", remarks: "Matched site log", signature_data: "", date: "2024-04-06T13:45:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-13", tracking_id: "FT-POL-413", cfo_diary_number: "CFO-P-13", inward_date: "2024-04-07", received_from: "Transport Office", receiving_number: "RC-P-413", mainCategory: "others", subCategory: "pol_bills", subject: "Brake oil supply - Q2 Batch", mark_to: "pol_bills", created_at: "2024-04-07T10:15:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Brake Oil Case", remarks: "Matched store ledger", signature_data: "", date: "2024-04-07T10:15:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-14", tracking_id: "FT-POL-414", cfo_diary_number: "CFO-P-14", inward_date: "2024-04-07", received_from: "Fleet Admin", receiving_number: "RC-P-414", mainCategory: "others", subCategory: "pol_bills", subject: "Suspension parts reimbursement - Tanker B", mark_to: "pol_bills", created_at: "2024-04-07T15:20:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Tanker B Maint Bill", remarks: "Verify workshop sign", signature_data: "", date: "2024-04-07T15:20:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },
    { id: "pol-15", tracking_id: "FT-POL-415", cfo_diary_number: "CFO-P-15", inward_date: "2024-04-08", received_from: "Transport Office", receiving_number: "RC-P-415", mainCategory: "others", subCategory: "pol_bills", subject: "Radiator coolant supply batch 1", mark_to: "pol_bills", created_at: "2024-04-08T09:45:00Z", history: [{ mainCategory: "others", subCategory: "pol_bills", subject: "Coolant Batch Case", remarks: "Verify quality cert", signature_data: "", date: "2024-04-08T09:45:00Z", processed_by: "CFO Office", mark_to: "pol_bills" }] },

    // CONTINGENCIES SECTION (15 entries)
    { id: "cnt-c1", tracking_id: "FT-CT-501", cfo_diary_number: "CFO-T-01", inward_date: "2024-04-01", received_from: "General Admin", receiving_number: "RC-T-501", mainCategory: "others", subCategory: "contingencies", subject: "Office Stationery Batch #9", mark_to: "contingencies", created_at: "2024-04-01T13:00:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Stationery Bill Mar", remarks: "Matched budget head", signature_data: "", date: "2024-04-01T13:00:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c2", tracking_id: "FT-CT-502", cfo_diary_number: "CFO-T-02", inward_date: "2024-04-01", received_from: "IT Cell", receiving_number: "RC-T-502", mainCategory: "others", subCategory: "contingencies", subject: "Internet Bill - April 2024", mark_to: "contingencies", created_at: "2024-04-01T17:15:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "IT Internet Bill", remarks: "Verify uptime report", signature_data: "", date: "2024-04-01T17:15:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c3", tracking_id: "FT-CT-503", cfo_diary_number: "CFO-T-03", inward_date: "2024-04-02", received_from: "Security Section", receiving_number: "RC-T-503", mainCategory: "others", subCategory: "contingencies", subject: "Uniform supply - Duty Staff Ph 2", mark_to: "contingencies", created_at: "2024-04-02T10:45:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Uniform Ph2 Bill", remarks: "Check sample quality", signature_data: "", date: "2024-04-02T10:45:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c4", tracking_id: "FT-CT-504", cfo_diary_number: "CFO-T-04", inward_date: "2024-04-02", received_from: "Admin Branch", receiving_number: "RC-T-504", mainCategory: "others", subCategory: "contingencies", subject: "Water cooler repairs - Zone C", mark_to: "contingencies", created_at: "2024-04-02T14:15:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Zone C Cooler Repair", remarks: "Confirm work done", signature_data: "", date: "2024-04-02T14:15:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c5", tracking_id: "FT-CT-505", cfo_diary_number: "CFO-T-05", inward_date: "2024-04-03", received_from: "Accounts Branch", receiving_number: "RC-T-505", mainCategory: "others", subCategory: "contingencies", subject: "Tea and Snacks - Board Meeting 4", mark_to: "contingencies", created_at: "2024-04-03T11:30:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Board Meeting Meal", remarks: "Approved by Secretary", signature_data: "", date: "2024-04-03T11:30:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c6", tracking_id: "FT-CT-506", cfo_diary_number: "CFO-T-06", inward_date: "2024-04-03", received_from: "IT Helpdesk", receiving_number: "RC-T-506", mainCategory: "others", subCategory: "contingencies", subject: "Network switch repair - Admin B", mark_to: "contingencies", created_at: "2024-04-03T15:20:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "IT Switch Repair", remarks: "Verify job status", signature_data: "", date: "2024-04-03T15:20:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c7", tracking_id: "FT-CT-507", cfo_diary_number: "CFO-T-07", inward_date: "2024-04-04", received_from: "General Admin", receiving_number: "RC-T-507", mainCategory: "others", subCategory: "contingencies", subject: "Cleaning spray batch - Head Office", mark_to: "contingencies", created_at: "2024-04-04T09:40:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Cleaning Batch Case", remarks: "Matched quote rates", signature_data: "", date: "2024-04-04T09:40:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c8", tracking_id: "FT-CT-508", cfo_diary_number: "CFO-T-08", inward_date: "2024-04-04", received_from: "Information Office", receiving_number: "RC-T-508", mainCategory: "others", subCategory: "contingencies", subject: "Media subscription - Q2 2024", mark_to: "contingencies", created_at: "2024-04-04T13:45:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Subscription Case", remarks: "Verify media list", signature_data: "", date: "2024-04-04T13:45:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c9", tracking_id: "FT-CT-509", cfo_diary_number: "CFO-T-09", inward_date: "2024-04-05", received_from: "Engineering", receiving_number: "RC-T-509", mainCategory: "others", subCategory: "contingencies", subject: "Survey tool calibration - Site A", mark_to: "contingencies", created_at: "2024-04-05T10:00:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Calibration Case", remarks: "Check technical cert", signature_data: "", date: "2024-04-05T10:00:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c10", tracking_id: "FT-CT-510", cfo_diary_number: "CFO-T-10", inward_date: "2024-04-05", received_from: "Security Branch", receiving_number: "RC-T-510", mainCategory: "others", subCategory: "contingencies", subject: "CCTV camera cable replacement - Gate 1", mark_to: "contingencies", created_at: "2024-04-05T14:30:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Security Cable Bill", remarks: "Verify work done", signature_data: "", date: "2024-04-05T14:30:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c11", tracking_id: "FT-CT-511", cfo_diary_number: "CFO-T-11", inward_date: "2024-04-06", received_from: "Admin Cell", receiving_number: "RC-T-511", mainCategory: "others", subCategory: "contingencies", subject: "Printing paper batch - Q1 Audit", mark_to: "contingencies", created_at: "2024-04-06T09:15:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Audit Paper Case", remarks: "Matched stock code", signature_data: "", date: "2024-04-06T09:15:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c12", tracking_id: "FT-CT-512", cfo_diary_number: "CFO-T-12", inward_date: "2024-04-06", received_from: "Workshop Cell", receiving_number: "RC-T-512", mainCategory: "others", subCategory: "contingencies", subject: "Welding rod supply - Site Workshop", mark_to: "contingencies", created_at: "2024-04-06T13:00:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Welding Supply Case", remarks: "Matched store GRN", signature_data: "", date: "2024-04-06T13:00:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c13", tracking_id: "FT-CT-513", cfo_diary_number: "CFO-T-13", inward_date: "2024-04-07", received_from: "IT Cell", receiving_number: "RC-T-513", mainCategory: "others", subCategory: "contingencies", subject: "UPS battery replacement - Server Room", mark_to: "contingencies", created_at: "2024-04-07T10:45:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Server UPS Case", remarks: "Check technical report", signature_data: "", date: "2024-04-07T10:45:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c14", tracking_id: "FT-CT-514", cfo_diary_number: "CFO-T-14", inward_date: "2024-04-07", received_from: "General Admin", receiving_number: "RC-T-514", mainCategory: "others", subCategory: "contingencies", subject: "Staff ID card printing - Batch 2024", mark_to: "contingencies", created_at: "2024-04-07T15:15:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "ID Card Print Case", remarks: "Verify quantity", signature_data: "", date: "2024-04-07T15:15:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
    { id: "cnt-c15", tracking_id: "FT-CT-515", cfo_diary_number: "CFO-T-15", inward_date: "2024-04-08", received_from: "Accounts Branch", receiving_number: "RC-T-515", mainCategory: "others", subCategory: "contingencies", subject: "Legal advisor fee - Case A-41 settlement", mark_to: "contingencies", created_at: "2024-04-08T09:45:00Z", history: [{ mainCategory: "others", subCategory: "contingencies", subject: "Legal Fee Case", remarks: "Legal clearance attached", signature_data: "", date: "2024-04-08T09:45:00Z", processed_by: "CFO Office", mark_to: "contingencies" }] },
  ]);
  
  /* 
    SUPABASE SQL SCHEMA FOR file_tracking_records:
    
    CREATE TABLE file_tracking_records (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      tracking_id TEXT UNIQUE NOT NULL,
      cfo_diary_number TEXT,
      inward_date DATE,
      received_from TEXT,
      receiving_number TEXT UNIQUE,
      main_category TEXT,
      sub_category TEXT,
      subject TEXT,
      date_of_sign DATE,
      signature_data TEXT,
      mark_to TEXT,
      outward_date DATE,
      remarks TEXT,
      history JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  */
  
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0ea5e9'; // primary color

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Check if canvas is empty (simplified check)
      const dataUrl = canvas.toDataURL();
      setFormData(prev => ({ ...prev, signature_data: dataUrl }));
      setIsSignDialogOpen(false);
      toast.success("E-Signature captured successfully");
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, signature_data: event.target?.result as string }));
        setIsSignDialogOpen(false);
        toast.success("Signature image uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const categoryOptions: Record<string, string[]> = {
    employee: ["Medical", "Pension", "Salary / Arrears", "Loans / Advances", "Others"],
    contractor: ["Running Bill", "Final Bill", "Security Deposit", "Retention Money", "Others"],
    others: ["POL Bills", "Contingencies", "Legal", "General / Miscellaneous"]
  };

  const handleFormReset = () => {
    setFormData({
      cfo_diary_number: "",
      inward_date: new Date().toISOString().split('T')[0],
      received_from: "",
      receiving_number: `RC-${Math.floor(1000 + Math.random() * 9000)}`,
      mainCategory: "",
      subCategory: "",
      subject: "",
      date_of_sign: new Date().toISOString().split('T')[0],
      mark_to: "",
      outward_date: new Date().toISOString().split('T')[0],
      remarks: "",
    });
  };

  const handleSaveForm = async () => {
    if (!formData.cfo_diary_number || !formData.received_from || !formData.subject || !formData.mainCategory || !formData.subCategory || !formData.mark_to) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsSavingForm(true);
    try {
      const trackingId = `FT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const newEntry = {
          tracking_id: trackingId,
          ...formData,
      };

      const { error } = await supabase.from('file_tracking_records' as any).insert(newEntry);
      
      if (error) {
         console.warn("Table file_tracking_records not found, updating local records state.");
      }
      
      // Update local state for simulation with full data snapshot
      const snapshot = { 
        ...formData, 
        date: new Date().toISOString(), 
        processed_by: sections.find(s => s.id === currentRole)?.name,
        action: existingRecordIndex !== -1 ? "FORWARDED" : "REGISTERED"
      };
      
      if (existingRecordIndex !== -1) {
        // Appending to existing file history
        const updatedRecords = [...records];
        updatedRecords[existingRecordIndex] = {
           ...updatedRecords[existingRecordIndex],
           mark_to: formData.mark_to,
           remarks: formData.remarks,
           history: [
             ...updatedRecords[existingRecordIndex].history,
             snapshot
           ]
        };
        setRecords(updatedRecords);
        toast.success(`Detailed log entry added and file forwarded to ${formData.mark_to}`);
      } else {
        // Creating fresh record
        const fullEntry = {
          ...newEntry,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          history: [snapshot]
        };
        setRecords([fullEntry, ...records]);
        toast.success(`File registered and initial audit log created`);
      }
      
      handleFormReset();
    } catch (err) {
      console.error(err);
      toast.error("Error saving record");
    } finally {
      setIsSavingForm(false);
    }
  };

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
      // 1. Check local records first (Simulation data)
      const localMatch = records.find(r => r.tracking_id === searchQuery || r.cfo_diary_number === searchQuery || r.receiving_number === searchQuery);
      
      if (localMatch) {
        setSelectedBill({
           ...localMatch,
           diary_no: localMatch.cfo_diary_number, // map for display consistency
           party_name: localMatch.received_from,
           amount: 0 // local records don't have amount in this simple demo
        });
        toast.success("Found record in current session tray");
        setLoading(false);
        return;
      }

      // 2. Fallback to Supabase/Mock data
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

  const sections = [
    { id: 'cfo', name: 'CFO Office' },
    { id: 'medical', name: 'Medical Section' },
    { id: 'contractor', name: 'Contractor Section' },
    { id: 'security_deposit', name: 'Security Deposit' },
    { id: 'pol_bills', name: 'POL Bills Section' },
    { id: 'contingencies', name: 'Contingencies' }
  ];

  // Logic to filter incoming files for the current role
  const incomingFiles = records.filter(r => r.mark_to === currentRole);

  const handleProcessFile = (file: any) => {
     // Prepare form for the selected department to contribute their part
     setActiveTab("register"); // Switch to registration tab
     setFormData({
        ...formData,
        cfo_diary_number: file.cfo_diary_number,
        received_from: sections.find(s => s.id === currentRole)?.name || file.received_from,
        receiving_number: file.receiving_number,
        mainCategory: file.mainCategory,
        subCategory: file.subCategory,
        subject: file.subject,
        remarks: ``, // Clear remarks for new entry
        mark_to: "cfo", // Defaulting back to CFO
        signature_data: "" // Clear signature for new person to sign
     });
     toast.info(`Now processing: ${file.subject}. Review the journey below before signing.`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSearch className="w-7 h-7 text-primary" />
            Centralized Tracking & Workflow
          </h1>
          <p className="text-sm text-muted-foreground italic">Real-time file movement across KW&SB Finance Sections</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Current Active Section</p>
              <p className="text-sm font-bold text-primary">{sections.find(s => s.id === currentRole)?.name}</p>
           </div>
           <Select value={currentRole} onValueChange={setCurrentRole}>
             <SelectTrigger className="w-[200px] bg-background border-primary/20 font-bold">
               <Users className="w-4 h-4 mr-2 text-primary" />
               <SelectValue />
             </SelectTrigger>
             <SelectContent>
               {sections.map(s => (
                 <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
               ))}
             </SelectContent>
           </Select>
           
           <Dialog>
             <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                   <Bell className="w-5 h-5" />
                   {incomingFiles.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center animate-pulse">{incomingFiles.length}</span>}
                </Button>
             </DialogTrigger>
             <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
                    Incoming Files Tray
                  </DialogTitle>
                  <DialogDescription>FILES PENDING YOUR REVIEW AND SIGNATURE</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[300px] mt-4">
                   {incomingFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                         <Check className="w-10 h-10 opacity-20" />
                         <p className="text-sm">No new files for your section</p>
                      </div>
                   ) : (
                      <div className="space-y-3">
                         {incomingFiles.map((file, i) => (
                            <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-primary/5 cursor-pointer transition-colors" onClick={() => handleProcessFile(file)}>
                               <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-sm">{file.subject}</h4>
                                  <Badge>{file.receiving_number}</Badge>
                               </div>
                               <p className="text-[10px] text-muted-foreground mt-1">From: {file.received_from}</p>
                               <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-[10px] border border-primary/20">Open & Sign File</Button>
                            </div>
                         ))}
                      </div>
                   )}
                </ScrollArea>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
            <TabsList className="grid w-[600px] grid-cols-3 bg-muted/50 p-1 border border-border/50">
              <TabsTrigger value="register" className="font-bold data-[state=active]:bg-primary data-[state=active]:text-white gap-2">
                <Plus className="w-4 h-4" /> New Registration
              </TabsTrigger>
              <TabsTrigger value="tray" className="font-bold data-[state=active]:bg-primary data-[state=active]:text-white gap-2 relative">
                <Inbox className="w-4 h-4" /> My Tray
                {incomingFiles.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">{incomingFiles.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="track" className="font-bold data-[state=active]:bg-primary data-[state=active]:text-white gap-2">
                <Search className="w-4 h-4" /> Global Search
              </TabsTrigger>
            </TabsList>
         </div>

         <TabsContent value="tray" className="animate-fade-in">
           <Card className="glass-card border-none shadow-xl">
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-xl font-bold flex items-center gap-2">
                     <Inbox className="w-6 h-6 text-primary" />
                     {sections.find(s => s.id === currentRole)?.name} - Departmental Tray
                   </CardTitle>
                   <p className="text-sm text-muted-foreground mt-1">Files assigned to your section for processing</p>
                </div>
             </CardHeader>
             <CardContent>
                {incomingFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/5 rounded-xl border-2 border-dashed border-border/50">
                     <Inbox className="w-16 h-16 opacity-10 mb-4" />
                     <h3 className="text-lg font-bold">Your Tray is Empty</h3>
                     <p className="text-sm">New files marked for your section will appear here.</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="text-xs uppercase font-bold">Diary/Ref No</TableHead>
                          <TableHead className="text-xs uppercase font-bold">Subject</TableHead>
                          <TableHead className="text-xs uppercase font-bold">Category</TableHead>
                          <TableHead className="text-xs uppercase font-bold">From</TableHead>
                          <TableHead className="text-xs uppercase font-bold">Date Marked</TableHead>
                          <TableHead className="text-xs uppercase font-bold text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incomingFiles.map((file, i) => (
                          <TableRow key={i} className="hover:bg-primary/5 transition-colors group">
                            <TableCell className="font-mono text-xs font-bold text-primary">{file.receiving_number}</TableCell>
                            <TableCell className="font-semibold text-sm">{file.subject}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] uppercase">{file.mainCategory}</Badge>
                            </TableCell>
                            <TableCell className="text-xs">{file.received_from}</TableCell>
                            <TableCell className="text-xs">{new Date(file.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 gap-2 border-primary/20 hover:bg-primary hover:text-white transition-all"
                                onClick={() => handleProcessFile(file)}
                              >
                                Review & Sign <ArrowRight className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
             </CardContent>
           </Card>
         </TabsContent>

         <TabsContent value="track" className="animate-fade-in">
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
      </TabsContent>

      <TabsContent value="register" className="animate-fade-in">
        <Card className="glass-card border-none shadow-xl">
           <CardHeader className="flex flex-row items-center justify-between">
              <div>
                 <CardTitle className="text-xl font-bold flex items-center gap-2">
                   <FileSignature className="w-6 h-6 text-primary" />
                   File Registration Form
                 </CardTitle>
                 <p className="text-sm text-muted-foreground mt-1">Register new inward files and track their forward movement</p>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="outline" onClick={handleFormReset} className="font-bold">Reset</Button>
                 <Button onClick={handleSaveForm} disabled={isSavingForm} className="bg-primary hover:bg-primary/90 font-bold gap-2">
                    {isSavingForm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Record
                 </Button>
              </div>
           </CardHeader>
           <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-border/50">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">CFO Office Diary No <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="e.g. CFO-2024-001" 
                  value={formData.cfo_diary_number}
                  readOnly={currentRole !== 'cfo'}
                  onChange={e => setFormData({...formData, cfo_diary_number: e.target.value})}
                  className={`bg-muted/20 border-border/50 font-mono ${currentRole !== 'cfo' ? 'opacity-70 cursor-not-allowed' : ''}`} 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Inward Date</Label>
                <Input 
                  type="date"
                  value={formData.inward_date}
                  readOnly={currentRole !== 'cfo'}
                  onChange={e => setFormData({...formData, inward_date: e.target.value})}
                  className={`bg-muted/20 border-border/50 ${currentRole !== 'cfo' ? 'opacity-70 cursor-not-allowed' : ''}`} 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Received From Section <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="Department or Section" 
                  value={formData.received_from}
                  readOnly={currentRole !== 'cfo'}
                  onChange={e => setFormData({...formData, received_from: e.target.value})}
                  className={`bg-muted/20 border-border/50 ${currentRole !== 'cfo' ? 'opacity-70 cursor-not-allowed' : ''}`} 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Receiving Number</Label>
                <Input 
                  value={formData.receiving_number}
                  readOnly
                  className="bg-muted/5 border-border/50 font-mono opacity-70" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Main Category <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.mainCategory} 
                  onValueChange={v => setFormData({...formData, mainCategory: v, subCategory: ""})}
                >
                  <SelectTrigger className="bg-muted/20 border-border/50">
                    <SelectValue placeholder="Select Main Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="others">Others/General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Sub Category <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.subCategory} 
                  onValueChange={v => setFormData({...formData, subCategory: v})}
                  disabled={!formData.mainCategory}
                >
                  <SelectTrigger className="bg-muted/20 border-border/50">
                    <SelectValue placeholder={formData.mainCategory ? "Select Sub Category" : "Select Main Category First"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.mainCategory && categoryOptions[formData.mainCategory]?.map(opt => (
                      <SelectItem key={opt} value={opt.toLowerCase().replace(/ /g, "_")}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 lg:col-span-1">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Subject <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="Purpose of file" 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="bg-muted/20 border-border/50" 
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Digital Authorization (E-Signature)</Label>
                
                {!formData.signature_data ? (
                  <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full border-dashed border-2 h-20 flex flex-col gap-1 hover:bg-primary/5 hover:border-primary/50 transition-all">
                        <PenTool className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase">Click to Sign Digitally</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileSignature className="w-5 h-5 text-primary" />
                          Draw Your E-Signature
                        </DialogTitle>
                        <DialogDescription>
                          Choose to draw your signature or upload an image of your physical signature.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs defaultValue="draw" className="w-full mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="draw" className="gap-2">
                            <PenTool className="w-4 h-4" /> Draw
                          </TabsTrigger>
                          <TabsTrigger value="upload" className="gap-2">
                            <Upload className="w-4 h-4" /> Upload
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="draw" className="flex flex-col items-center gap-4 py-4 animate-in fade-in-50 duration-300">
                          <div className="border-2 border-border rounded-lg bg-white overflow-hidden touch-none">
                            <canvas 
                              ref={canvasRef}
                              width={450}
                              height={200}
                              onMouseDown={startDrawing}
                              onMouseUp={stopDrawing}
                              onMouseMove={draw}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchEnd={stopDrawing}
                              onTouchMove={draw}
                              className="cursor-crosshair"
                            />
                          </div>
                          <div className="flex w-full justify-between">
                            <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-destructive hover:text-destructive gap-2">
                              <ResetIcon className="w-4 h-4" /> Clear Pad
                            </Button>
                            <p className="text-[10px] text-muted-foreground italic self-center">Verification Stamp will be added automatically</p>
                          </div>
                          <div className="w-full flex justify-end gap-2 mt-2">
                            <Button variant="outline" onClick={() => setIsSignDialogOpen(false)}>Cancel</Button>
                            <Button onClick={saveSignature} className="bg-primary hover:bg-primary/90 gap-2">
                              Apply Signature <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="upload" className="flex flex-col items-center gap-6 py-10 animate-in slide-in-from-bottom-2 duration-300">
                          <div 
                            className="w-full max-w-[300px] border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center gap-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                            onClick={() => document.getElementById('signature-image-upload')?.click()}
                          >
                             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                               <ImageIcon className="w-8 h-8" />
                             </div>
                             <div className="text-center">
                               <p className="text-sm font-bold">Select Signature Image</p>
                               <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG or JPEG (Max 2MB)</p>
                             </div>
                             <input 
                               type="file" 
                               id="signature-image-upload" 
                               hidden 
                               accept="image/*" 
                               onChange={handleSignatureUpload}
                             />
                          </div>
                          <p className="text-center text-[10px] text-muted-foreground max-w-[300px]">
                            Tip: For best results, use a high-contrast image (black ink on white paper).
                          </p>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="relative group">
                    <div className="border-2 border-emerald-500/30 rounded-lg p-2 bg-emerald-500/5 flex flex-col items-center overflow-hidden">
                       <img src={formData.signature_data} alt="ESign" className="max-h-16 mix-blend-multiply" />
                       <div className="mt-2 text-[8px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                         VERIFIED: {new Date(formData.date_of_sign).toLocaleDateString()}
                       </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => setFormData({...formData, signature_data: ""})}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Date of Sign</Label>
                <Input 
                  type="date"
                  value={formData.date_of_sign}
                  onChange={e => setFormData({...formData, date_of_sign: e.target.value})}
                  className="bg-muted/20 border-border/50 text-blue-500 font-bold" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Mark To (Forward) <span className="text-red-500">*</span></Label>
                <Select value={formData.mark_to} onValueChange={v => setFormData({...formData, mark_to: v})}>
                  <SelectTrigger className="bg-muted/20 border-border/50 border-primary/30">
                    <SelectValue placeholder="Target Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cfo">CFO Office (Return/Approval)</SelectItem>
                    <SelectItem value="medical">Medical Section</SelectItem>
                    <SelectItem value="contractor">Contractor Section</SelectItem>
                    <SelectItem value="security_deposit">Security Deposit Section</SelectItem>
                    <SelectItem value="pol_bills">POL Bills Section</SelectItem>
                    <SelectItem value="contingencies">Contingencies Section</SelectItem>
                    <SelectItem value="director_finance">Director Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Outward (Forwarding) Date</Label>
                <Input 
                  type="date"
                  value={formData.outward_date}
                  onChange={e => setFormData({...formData, outward_date: e.target.value})}
                  className="bg-muted/20 border-border/50" 
                />
              </div>

              <div className="space-y-2 lg:col-span-3">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Remarks</Label>
                <Input 
                  placeholder="Any additional notes..." 
                  value={formData.remarks}
                  onChange={e => setFormData({...formData, remarks: e.target.value})}
                  className="bg-muted/20 border-border/50" 
                />
              </div>
           </CardContent>

           {/* Journey History at the Bottom */}
           {records.find(r => r.receiving_number === formData.receiving_number) && (
             <div className="border-t border-border/50 bg-muted/10 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                  <History className="w-5 h-5" /> Detailed File Movement Record
                </h3>
                <div className="space-y-0 ml-4 border-l-2 border-primary/20">
                   {records.find(r => r.receiving_number === formData.receiving_number)?.history.map((step: any, i: number) => (
                     <div key={i} className="relative pb-8 pl-8 last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                           <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-1">
                           <span className="text-xs font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">Action Log #{i+1}</span>
                           <span className="text-[10px] font-mono text-muted-foreground">{new Date(step.date).toLocaleString()}</span>
                        </div>
                        <div className="bg-background rounded-lg border border-border p-3 shadow-sm hover:border-primary/50 transition-colors">
                           <div className="flex items-center justify-between gap-4 text-sm font-bold mb-2 pb-2 border-b border-border/50">
                             <div className="flex items-center gap-2">
                               <User className="w-4 h-4 text-muted-foreground" />
                               {step.processed_by}
                             </div>
                             
                             <Dialog>
                               <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 hover:bg-primary/10 text-primary">
                                    <FileSearch className="w-3 h-3" /> View Log Details
                                  </Button>
                               </DialogTrigger>
                               <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Log Snapshot: {step.processed_by}</DialogTitle>
                                    <DialogDescription>Full data captured at {new Date(step.date).toLocaleString()}</DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-muted/20 rounded-xl border border-border">
                                     <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Main Category</p>
                                        <p className="text-sm font-semibold">{step.mainCategory.toUpperCase()}</p>
                                     </div>
                                     <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Sub Category</p>
                                        <p className="text-sm font-semibold">{step.subCategory.replace(/_/g, " ").toUpperCase()}</p>
                                     </div>
                                     <div className="col-span-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Subject</p>
                                        <p className="text-sm font-semibold bg-background p-2 rounded border border-border/50">{step.subject}</p>
                                     </div>
                                     <div className="col-span-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Remarks</p>
                                        <p className="text-xs text-muted-foreground italic bg-background p-2 rounded border border-border/20">&ldquo;{step.remarks}&rdquo;</p>
                                     </div>
                                     {step.signature_data && (
                                       <div className="col-span-2">
                                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Digital Signature</p>
                                          <img src={step.signature_data} alt="Sign" className="h-16 border rounded bg-white p-1" />
                                       </div>
                                     )}
                                     <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Marked To</p>
                                        <Badge>{step.mark_to.toUpperCase()}</Badge>
                                     </div>
                                  </div>
                               </DialogContent>
                             </Dialog>
                           </div>
                           <p className="text-xs text-muted-foreground italic line-clamp-2">&ldquo;{step.remarks}&rdquo;</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </Card>
      </TabsContent>
      </Tabs>

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
