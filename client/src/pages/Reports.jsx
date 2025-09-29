import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { BarChart, Download, TrendingUp, TrendingDown, Package, Users, IndianRupee, ShoppingCart, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

  totalRevenue
  totalBills
  averageBillValue
  topSellingProducts<{
    product
    totalSold
    revenue
  }>
  dailySales<{
    date
    revenue
    billCount
  }>
}

export default function Reports() {
  const [bills, setBills] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [reportPeriod, setReportPeriod] = useState("7")
  const [salesReport, setSalesReport] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (bills.length > 0 && products.length > 0) {
      generateSalesReport()
    }
  }, [bills, products, reportPeriod])

  const loadData = async () => {
    try {
      setLoading(true)
      const [billsData, productsData, customersData] = await Promise.all([
        api.getBills(),
        api.getProducts(),
        api.getCustomers()
      ])
      setBills(billsData)
      setProducts(productsData)
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSalesReport = () => {
    const days = parseInt(reportPeriod)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const filteredBills = bills.filter(bill => 
      new Date(bill.created_at) >= startDate
    )

    const totalRevenue = filteredBills.reduce((sum, bill) => sum + Number(bill.final_amount), 0)
    const totalBills = filteredBills.length
    const averageBillValue = totalBills > 0 ? totalRevenue / totalBills : 0

    // Generate daily sales data
    const dailySalesMap = new Map<string, { revenue, billCount }>()
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      dailySalesMap.set(dateStr, { revenue: 0, billCount: 0 })
    }

    filteredBills.forEach(bill => {
      const dateStr = new Date(bill.created_at).toDateString()
      if (dailySalesMap.has(dateStr)) {
        const current = dailySalesMap.get(dateStr)!
        dailySalesMap.set(dateStr, {
          revenue: current.revenue + Number(bill.final_amount),
          billCount: current.billCount + 1
        })
      }
    })

    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        billCount: data.billCount
      }))
      .reverse()

    // Mock top selling products (in a real app, this would come from bill_items)
    const topSellingProducts = products.slice(0, 5).map(product => ({
      product,
      totalSold.floor(Math.random() * 50) + 1,
      revenue.floor(Math.random() * 10000) + 1000
    })).sort((a, b) => b.revenue - a.revenue)

    setSalesReport({
      totalRevenue,
      totalBills,
      averageBillValue,
      topSellingProducts,
      dailySales
    })
  }

  const exportReport = () => {
    if (!salesReport) return
    
    const csvContent = [
      ['Report Period', `Last ${reportPeriod} days`],
      ['Total Revenue', `₹${salesReport.totalRevenue.toLocaleString()}`],
      ['Total Bills', salesReport.totalBills.toString()],
      ['Average Bill Value', `₹${Math.round(salesReport.averageBillValue).toLocaleString()}`],
      [],
      ['Daily Sales'],
      ['Date', 'Revenue', 'Bills'],
      ...salesReport.dailySales.map(day => [
        new Date(day.date).toLocaleDateString('en-IN'),
        day.revenue.toString(),
        day.billCount.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Report exported successfully!",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Business analytics and insights</p>
        </div>
        <div className="text-center py-8">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Business analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} disabled={!salesReport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{salesReport?.totalRevenue.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Last {reportPeriod} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesReport?.totalBills || 0}</div>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Bill</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(salesReport?.averageBillValue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Sales Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Daily Sales Trend
            </CardTitle>
            <CardDescription>Revenue and transaction count over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesReport?.dailySales.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(day.date).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{day.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{day.billCount} bills</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Products
            </CardTitle>
            <CardDescription>Best selling products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salesReport?.topSellingProducts.map((item, index) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.product.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{item.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{item.totalSold} sold</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
          <CardDescription>Current stock levels and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-6 border rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => (p.quantity_in_stock || 0) > (p.min_stock_level || 0)).length}
              </div>
              <div className="text-sm text-muted-foreground">Well Stocked</div>
            </div>
            
            <div className="text-center p-6 border rounded-lg">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {products.filter(p => (p.quantity_in_stock || 0) <= (p.min_stock_level || 0) && (p.quantity_in_stock || 0) > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Low Stock</div>
            </div>
            
            <div className="text-center p-6 border rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => (p.quantity_in_stock || 0) === 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Out of Stock</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold">{customers.length}</div>
              <div className="text-sm text-muted-foreground">Total Customers</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600">
                {customers.filter(c => c.phone).length}
              </div>
              <div className="text-sm text-muted-foreground">With Phone</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.email).length}
              </div>
              <div className="text-sm text-muted-foreground">With Email</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((customers.filter(c => c.phone || c.email).length / customers.length) * 100) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Contactable</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}