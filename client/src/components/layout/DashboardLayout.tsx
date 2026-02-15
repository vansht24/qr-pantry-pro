import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api, type DashboardStats } from "@/lib/api"
import { Link } from "react-router-dom"
import { 
  Package, 
  IndianRupee, 
  ShoppingCart, 
  AlertTriangle,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles
} from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStock: 0,
    todaySales: 0,
    totalRevenue: 0,
    expiringProducts: 0,
    totalCustomers: 0,
    lowStockProducts: [],
    expiringProductsList: []
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
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      bgGradient: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      description: "Need restocking",
      icon: AlertTriangle,
      color: "from-orange-500 to-red-500",
      bgGradient: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      badge: stats.lowStock > 0 ? "Urgent" : null
    },
    {
      title: "Today's Sales",
      value: stats.todaySales,
      description: "Bills generated",
      icon: ShoppingCart,
      color: "from-green-500 to-emerald-500",
      bgGradient: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      description: "All time sales",
      icon: IndianRupee,
      color: "from-purple-500 to-pink-500",
      bgGradient: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Expiring Soon",
      value: stats.expiringProducts,
      description: "Within 7 days",
      icon: TrendingUp,
      color: "from-red-500 to-rose-500",
      bgGradient: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600 dark:text-red-400",
      badge: stats.expiringProducts > 0 ? "Alert" : null
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      description: "Registered customers",
      icon: Users,
      color: "from-indigo-500 to-blue-500",
      bgGradient: "bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400"
    }
  ]

  if (loading) {
    return (
      <div className="space-y-8 gradient-bg min-h-screen p-6">
        <div className="animate-in">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold text-gradient">Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">Loading your store's performance...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="card-enhanced animate-in-delay-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-5 w-32 bg-muted shimmer rounded" />
                <div className="h-10 w-10 bg-muted shimmer rounded-lg" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-muted shimmer rounded mb-2" />
                <div className="h-4 w-full bg-muted shimmer rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 gradient-bg min-h-screen p-6">
      {/* Header with animation */}
      <div className="animate-in">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary float" />
          <h1 className="text-4xl font-bold text-gradient">Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-lg">Overview of your store's performance</p>
      </div>

      {/* Stats Cards with staggered animation */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const animationClass = index === 0 ? 'animate-in' : 
                                 index === 1 ? 'animate-in-delay-1' :
                                 index === 2 ? 'animate-in-delay-2' :
                                 'animate-in-delay-3'
          return (
            <Card 
              key={card.title} 
              className={`card-enhanced stat-card group ${animationClass} ${card.bgGradient} border-0 overflow-hidden`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  {card.badge && (
                    <Badge variant="destructive" className="badge-glow text-xs">
                      {card.badge}
                    </Badge>
                  )}
                </div>
                <div className={`${card.iconBg} p-3 rounded-xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alerts Section with enhanced styling */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alert */}
        <Card className="card-enhanced decorative-corner border-0 animate-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/10 p-3 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Low Stock Alert</CardTitle>
                  <CardDescription>Products running low on stock</CardDescription>
                </div>
              </div>
              {stats.lowStock > 0 && (
                <Badge className="badge-glow bg-orange-500 text-white">
                  {stats.lowStock}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground font-medium">All products are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.lowStockProducts.slice(0, 5).map((product, index) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-all duration-200 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: <span className="font-medium text-orange-600">{product.quantity_in_stock || 0}</span> | 
                        Min: <span className="font-medium">{product.min_stock_level || 0}</span>
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">Low Stock</Badge>
                  </div>
                ))}
                {stats.lowStockProducts.length > 5 && (
                  <Button variant="outline" size="sm" asChild className="w-full group">
                    <Link to="/inventory" className="flex items-center justify-center gap-2">
                      View All ({stats.lowStockProducts.length})
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiry Alert */}
        <Card className="card-enhanced decorative-corner border-0 animate-in-delay-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Expiring Products</CardTitle>
                  <CardDescription>Products expiring within 7 days</CardDescription>
                </div>
              </div>
              {stats.expiringProducts > 0 && (
                <Badge variant="destructive" className="badge-glow">
                  {stats.expiringProducts}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {stats.expiringProductsList.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground font-medium">No products expiring soon!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.expiringProductsList.slice(0, 5).map((product, index) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-all duration-200 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: <span className="font-medium text-red-600">
                          {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('en-IN') : 'No expiry date'}
                        </span>
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-2">Expiring</Badge>
                  </div>
                ))}
                {stats.expiringProductsList.length > 5 && (
                  <Button variant="outline" size="sm" asChild className="w-full group">
                    <Link to="/expiry" className="flex items-center justify-center gap-2">
                      View All ({stats.expiringProductsList.length})
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions floating bar */}
      <Card className="card-enhanced border-gradient animate-in-delay-2">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Quick Actions</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="btn-primary">
                <Link to="/inventory/add">
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/billing/new">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  New Bill
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/customers">
                  <Users className="h-4 w-4 mr-2" />
                  Add Customer
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}