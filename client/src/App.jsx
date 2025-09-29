import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import AddProduct from "./pages/AddProduct";
import Billing from "./pages/Billing";
import NewBill from "./pages/NewBill";
import QRScanner from "./pages/QRScanner";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import ExpiryAlerts from "./pages/ExpiryAlerts";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inventory" element={<DashboardLayout><Inventory /></DashboardLayout>} />
          <Route path="/inventory/add" element={<DashboardLayout><AddProduct /></DashboardLayout>} />
          <Route path="/billing" element={<DashboardLayout><Billing /></DashboardLayout>} />
          <Route path="/billing/new" element={<DashboardLayout><NewBill /></DashboardLayout>} />
          <Route path="/qr-scanner" element={<DashboardLayout><QRScanner /></DashboardLayout>} />
          <Route path="/customers" element={<DashboardLayout><Customers /></DashboardLayout>} />
          <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
          <Route path="/expiry" element={<DashboardLayout><ExpiryAlerts /></DashboardLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;