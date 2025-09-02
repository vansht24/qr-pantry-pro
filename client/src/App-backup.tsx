import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
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
          <Route path="/inventory/add" element={<DashboardLayout><div>Add Product Page - Coming Soon</div></DashboardLayout>} />
          <Route path="/billing" element={<DashboardLayout><div>Billing Page - Coming Soon</div></DashboardLayout>} />
          <Route path="/billing/new" element={<DashboardLayout><div>New Bill Page - Coming Soon</div></DashboardLayout>} />
          <Route path="/qr-scanner" element={<DashboardLayout><div>QR Scanner - Coming Soon</div></DashboardLayout>} />
          <Route path="/customers" element={<DashboardLayout><div>Customers Page - Coming Soon</div></DashboardLayout>} />
          <Route path="/reports" element={<DashboardLayout><div>Reports Page - Coming Soon</div></DashboardLayout>} />
          <Route path="/expiry" element={<DashboardLayout><div>Expiry Alerts - Coming Soon</div></DashboardLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;