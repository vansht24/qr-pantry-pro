import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { Link } from "react-router-dom"
import { Plus, Search, Package, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  category: string
  brand?: string
  mrp: number
  buying_cost: number
  quantity_in_stock: number
  min_stock_level: number
  unit: string
  expiry_date?: string
  qr_code: string
  created_at: string
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [products, searchTerm])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error

      setProducts(data || [])
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

  const getStockStatus = (product: Product) => {
    if (product.quantity_in_stock === 0) {
      return { label: "Out of Stock", variant: "destructive" as const }
    } else if (product.quantity_in_stock <= product.min_stock_level) {
      return { label: "Low Stock", variant: "secondary" as const }
    } else {
      return { label: "In Stock", variant: "default" as const }
    }
  }

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null
    
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysDiff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24))
    
    if (daysDiff < 0) {
      return { label: "Expired", variant: "destructive" as const }
    } else if (daysDiff <= 7) {
      return { label: `${daysDiff} days left`, variant: "secondary" as const }
    } else if (daysDiff <= 30) {
      return { label: `${daysDiff} days left`, variant: "outline" as const }
    }
    return null
  }

  const generateQRCode = async (productId: string) => {
    try {
      // This would typically generate a QR code image
      // For now, we'll just show the QR code text
      const product = products.find(p => p.id === productId)
      if (product) {
        toast({
          title: "QR Code",
          description: `QR Code: ${product.qr_code}`,
        })
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your product inventory and stock levels</p>
        </div>
        <Button asChild>
          <Link to="/inventory/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Search Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or brand..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.quantity_in_stock <= p.min_stock_level).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            {filteredProducts.length} of {products.length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No products found matching your search." : "No products in inventory."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price (MRP)</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product)
                    const expiryStatus = getExpiryStatus(product.expiry_date)
                    
                    return (
                      <TableRow key={product.id}>
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
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span>{product.quantity_in_stock} {product.unit}</span>
                              <Badge variant={stockStatus.variant} className="text-xs">
                                {stockStatus.label}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Min: {product.min_stock_level} {product.unit}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">₹{product.mrp}</div>
                            <div className="text-sm text-muted-foreground">
                              Cost: ₹{product.buying_cost}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.expiry_date ? (
                            <div className="space-y-1">
                              <div className="text-sm">
                                {new Date(product.expiry_date).toLocaleDateString('en-IN')}
                              </div>
                              {expiryStatus && (
                                <Badge variant={expiryStatus.variant} className="text-xs">
                                  {expiryStatus.label}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No expiry</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateQRCode(product.id)}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/inventory/edit/${product.id}`}>Edit</Link>
                            </Button>
                          </div>
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
    </div>
  )
}