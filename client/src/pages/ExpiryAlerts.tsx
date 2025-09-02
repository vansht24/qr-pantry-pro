import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, type Product } from "@/lib/api"
import { AlertTriangle, Calendar, Package, Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExpiryProduct extends Product {
  daysToExpiry: number
  status: 'expired' | 'expiring-soon' | 'expiring-this-month'
}

export default function ExpiryAlerts() {
  const [products, setProducts] = useState<Product[]>([])
  const [expiryProducts, setExpiryProducts] = useState<ExpiryProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ExpiryProduct[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    processExpiryData()
  }, [products])

  useEffect(() => {
    filterProducts()
  }, [expiryProducts, searchTerm, statusFilter])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await api.getProducts()
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const processExpiryData = () => {
    const now = new Date()
    const productsWithExpiry: ExpiryProduct[] = []

    products.forEach(product => {
      if (product.expiry_date) {
        const expiryDate = new Date(product.expiry_date)
        const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
        
        let status: ExpiryProduct['status']
        if (daysToExpiry < 0) {
          status = 'expired'
        } else if (daysToExpiry <= 7) {
          status = 'expiring-soon'
        } else if (daysToExpiry <= 30) {
          status = 'expiring-this-month'
        } else {
          return // Don't include products expiring after 30 days
        }

        productsWithExpiry.push({
          ...product,
          daysToExpiry,
          status
        })
      }
    })

    // Sort by days to expiry (most urgent first)
    productsWithExpiry.sort((a, b) => a.daysToExpiry - b.daysToExpiry)
    setExpiryProducts(productsWithExpiry)
  }

  const filterProducts = () => {
    let filtered = expiryProducts

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter)
    }

    setFilteredProducts(filtered)
  }

  const getStatusBadge = (status: ExpiryProduct['status'], daysToExpiry: number) => {
    switch (status) {
      case 'expired':
        return <Badge variant="destructive">Expired ({Math.abs(daysToExpiry)} days ago)</Badge>
      case 'expiring-soon':
        return <Badge variant="destructive">Expiring in {daysToExpiry} days</Badge>
      case 'expiring-this-month':
        return <Badge variant="secondary">Expiring in {daysToExpiry} days</Badge>
      default:
        return null
    }
  }

  const getUrgencyLevel = (status: ExpiryProduct['status']) => {
    switch (status) {
      case 'expired':
        return { level: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50' }
      case 'expiring-soon':
        return { level: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50' }
      case 'expiring-this-month':
        return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
      default:
        return { level: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  const getStockValue = (product: ExpiryProduct) => {
    const stock = product.quantity_in_stock || 0
    const mrp = Number(product.mrp) || 0
    return stock * mrp
  }

  const expiredProducts = expiryProducts.filter(p => p.status === 'expired')
  const expiringSoonProducts = expiryProducts.filter(p => p.status === 'expiring-soon')
  const expiringThisMonthProducts = expiryProducts.filter(p => p.status === 'expiring-this-month')

  const totalValueAtRisk = expiryProducts.reduce((sum, product) => sum + getStockValue(product), 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expiry Alerts</h1>
          <p className="text-muted-foreground">Monitor product expiration dates</p>
        </div>
        <div className="text-center py-8">Loading expiry data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Expiry Alerts</h1>
        <p className="text-muted-foreground">Monitor product expiration dates and manage stock rotation</p>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredProducts.length}</div>
            <p className="text-xs text-muted-foreground">Critical action needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringSoonProducts.length}</div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringThisMonthProducts.length}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₹{totalValueAtRisk.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, category, or brand..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                <SelectItem value="expiring-this-month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Expiry Status</CardTitle>
          <CardDescription>
            {filteredProducts.length} of {expiryProducts.length} products with expiry concerns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "No products found matching your filters." 
                : "No products with expiry concerns found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Value at Risk</TableHead>
                    <TableHead>Urgency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const urgency = getUrgencyLevel(product.status)
                    return (
                      <TableRow key={product.id} className={urgency.bgColor}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.brand && (
                              <div className="text-sm text-muted-foreground">{product.brand}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(product.expiry_date!).toLocaleDateString('en-IN')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(product.status, product.daysToExpiry)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {product.quantity_in_stock || 0} {product.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ₹{getStockValue(product).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={urgency.color}>
                            {urgency.level}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Recommendations */}
      {(expiredProducts.length > 0 || expiringSoonProducts.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiredProducts.length > 0 && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2">Critical - Expired Products</h4>
                  <p className="text-red-700 text-sm mb-3">
                    {expiredProducts.length} products have expired and should be removed from sale immediately.
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Remove expired products from shelves</li>
                    <li>• Check if products can be returned to supplier</li>
                    <li>• Document for inventory write-off</li>
                    <li>• Review ordering patterns to prevent future waste</li>
                  </ul>
                </div>
              )}

              {expiringSoonProducts.length > 0 && (
                <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="font-semibold text-orange-800 mb-2">High Priority - Expiring Soon</h4>
                  <p className="text-orange-700 text-sm mb-3">
                    {expiringSoonProducts.length} products expire within 7 days. Take immediate action.
                  </p>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Offer discounts to move stock quickly</li>
                    <li>• Place products in prominent display areas</li>
                    <li>• Contact regular customers for bulk purchases</li>
                    <li>• Consider promotional bundles</li>
                  </ul>
                </div>
              )}

              {expiringThisMonthProducts.length > 0 && (
                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <h4 className="font-semibold text-yellow-800 mb-2">Medium Priority - Expiring This Month</h4>
                  <p className="text-yellow-700 text-sm mb-3">
                    {expiringThisMonthProducts.length} products expire within 30 days. Plan ahead.
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Monitor daily for status changes</li>
                    <li>• Adjust ordering quantities for next shipment</li>
                    <li>• Consider seasonal promotions</li>
                    <li>• Implement FIFO (First In, First Out) rotation</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}