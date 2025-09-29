import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Link } from "react-router-dom"
import { 
  Package, 
  IndianRupee, 
  ShoppingCart, 
  AlertTriangle,
  TrendingUp,
  Users
} from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    todaySales: 0,
    totalRevenue: 0,
    expiringProducts: 0,
    totalCustomers: 0,
    lowStockProducts[],
    expiringProductsList[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const dashboardStats = await api.getDashboardStats()
      setStats(dashboardStats)
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
      icon,
      color: "text-blue-600"
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      description: "Need restocking",
      icon,
      color: "text-orange-600"
    },
    {
      title: "Today's Sales",
      value: stats.todaySales,
      description: "Bills generated",
      icon,
      color: "text-green-600"
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      description: "All time sales",
      icon,
      color: "text-purple-600"
    },
    {
      title: "Expiring Soon",
      value: stats.expiringProducts,
      description: "Within 7 days",
      icon,
      color: "text-red-600"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      description: "Registered customers",
      icon,
      color: "text-indigo-600"
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store's performance</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store's performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alerts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products running low on stock</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground">All products are well stocked!</p>
            ) : (
              <div className="space-y-3">
                {stats.lowStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.quantity_in_stock || 0} | Min: {product.min_stock_level || 0}
                      </p>
                    </div>
                    <Badge variant="secondary">Low Stock</Badge>
                  </div>
                ))}
                {stats.lowStockProducts.length > 5 && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/inventory">View All ({stats.lowStockProducts.length})</Link>
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
            {stats.expiringProductsList.length === 0 ? (
              <p className="text-muted-foreground">No products expiring soon!</p>
            ) : (
              <div className="space-y-3">
                {stats.expiringProductsList.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('en-IN') : 'No expiry date'}
                      </p>
                    </div>
                    <Badge variant="destructive">Expiring</Badge>
                  </div>
                ))}
                {stats.expiringProductsList.length > 5 && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/expiry">View All ({stats.expiringProductsList.length})</Link>
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