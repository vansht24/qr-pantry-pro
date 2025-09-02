import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { Link } from "react-router-dom"
import { 
  Package, 
  IndianRupee, 
  ShoppingCart, 
  AlertTriangle,
  TrendingUp,
  Users
} from "lucide-react"

interface DashboardStats {
  totalProducts: number
  lowStock: number
  todaySales: number
  totalRevenue: number
  expiringProducts: number
  totalCustomers: number
}

interface Product {
  id: string
  name: string
  quantity_in_stock: number
  min_stock_level: number
  expiry_date: string
  mrp: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStock: 0,
    todaySales: 0,
    totalRevenue: 0,
    expiringProducts: 0,
    totalCustomers: 0
  })
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [expiringProducts, setExpiringProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Get products stats
      const { data: products } = await supabase
        .from('products')
        .select('*')

      // Get bills for today's sales
      const today = new Date().toISOString().split('T')[0]
      const { data: todayBills } = await supabase
        .from('bills')
        .select('final_amount')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)

      // Get all bills for total revenue
      const { data: allBills } = await supabase
        .from('bills')
        .select('final_amount')

      // Get customers count
      const { data: customers } = await supabase
        .from('customers')
        .select('id')

      if (products) {
        const lowStock = products.filter(p => p.quantity_in_stock <= p.min_stock_level)
        const expiring = products.filter(p => {
          if (!p.expiry_date) return false
          const expiryDate = new Date(p.expiry_date)
          const now = new Date()
          const daysDiff = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
          return daysDiff <= 7 && daysDiff >= 0
        })

        setLowStockProducts(lowStock)
        setExpiringProducts(expiring)

        setStats({
          totalProducts: products.length,
          lowStock: lowStock.length,
          todaySales: todayBills?.length || 0,
          totalRevenue: allBills?.reduce((sum, bill) => sum + Number(bill.final_amount), 0) || 0,
          expiringProducts: expiring.length,
          totalCustomers: customers?.length || 0
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      description: "Items in inventory",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      description: "Need restocking",
      icon: AlertTriangle,
      color: "text-orange-600"
    },
    {
      title: "Today's Sales",
      value: stats.todaySales,
      description: "Bills generated",
      icon: ShoppingCart,
      color: "text-green-600"
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      description: "All time earnings",
      icon: IndianRupee,
      color: "text-emerald-600"
    },
    {
      title: "Expiring Soon",
      value: stats.expiringProducts,
      description: "Within 7 days",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      description: "Registered customers",
      icon: Users,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/billing/new">New Bill</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/inventory/add">Add Product</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products that need immediate restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground">No items are low on stock!</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.quantity_in_stock} / Min: {product.min_stock_level}
                      </p>
                    </div>
                    <Badge variant="destructive">Low</Badge>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/inventory">View All ({lowStockProducts.length})</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiry Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Expiring Products
            </CardTitle>
            <CardDescription>Products expiring within 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {expiringProducts.length === 0 ? (
              <p className="text-muted-foreground">No products expiring soon!</p>
            ) : (
              <div className="space-y-3">
                {expiringProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {new Date(product.expiry_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <Badge variant="destructive">Expiring</Badge>
                  </div>
                ))}
                {expiringProducts.length > 5 && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/expiry">View All ({expiringProducts.length})</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}