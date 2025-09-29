import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Package, QrCode } from "lucide-react"
import QRCode from "react-qr-code"

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    mrp: "",
    buying_cost: "",
    manufacturing_date: "",
    expiry_date: "",
    quantity_in_stock: "",
    min_stock_level: "",
    unit: "piece",
    description: "",
    barcode: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedQR, setGeneratedQR] = useState(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  const categories = [
    "Rice & Grains", "Pulses", "Oil & Ghee", "Spices", "Dairy", "Vegetables", 
    "Snacks", "Beverages", "Personal Care", "Instant Food", "Cleaning"
  ]

  const units = ["piece", "kg", "litre", "gram", "packet", "bottle", "box"]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateQRCode = () => {
    const productId = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const qrData = JSON.stringify({
      id,
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      mrp: parseFloat(formData.mrp) || 0,
      buying_cost: parseFloat(formData.buying_cost) || 0,
      manufacturing_date: formData.manufacturing_date,
      expiry_date: formData.expiry_date,
      unit: formData.unit,
      timestamp: new Date().toISOString(),
      type: "pantry_pal_product"
    })
    setGeneratedQR(qrData)
    setFormData(prev => ({ ...prev, barcode: productId }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.category || !formData.mrp || !formData.buying_cost) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await api.createProduct({
        ...formData,
        mrp: formData.mrp,
        buying_cost: formData.buying_cost,
        quantity_in_stock: parseInt(formData.quantity_in_stock) || 0,
        min_stock_level: parseInt(formData.min_stock_level) || 5,
        qr_code,
      })

      toast({
        title: "Success",
        description: "Product added successfully!",
      })
      navigate("/inventory")
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted-foreground">Add a new product to your inventory</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
              <CardDescription>Enter the basic product details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange("brand", e.target.value)}
                      placeholder="Enter brand name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select onValueChange={(value) => handleInputChange("unit", value)} defaultValue="piece">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="mrp">MRP (₹) *</Label>
                    <Input
                      id="mrp"
                      type="number"
                      step="0.01"
                      value={formData.mrp}
                      onChange={(e) => handleInputChange("mrp", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buying_cost">Buying Cost (₹) *</Label>
                    <Input
                      id="buying_cost"
                      type="number"
                      step="0.01"
                      value={formData.buying_cost}
                      onChange={(e) => handleInputChange("buying_cost", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity_in_stock">Initial Stock</Label>
                    <Input
                      id="quantity_in_stock"
                      type="number"
                      value={formData.quantity_in_stock}
                      onChange={(e) => handleInputChange("quantity_in_stock", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturing_date">Manufacturing Date</Label>
                    <Input
                      id="manufacturing_date"
                      type="date"
                      value={formData.manufacturing_date}
                      onChange={(e) => handleInputChange("manufacturing_date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry_date">Expiry Date</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => handleInputChange("expiry_date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_stock_level">Min Stock Level</Label>
                    <Input
                      id="min_stock_level"
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => handleInputChange("min_stock_level", e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Product"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/inventory">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Generator
              </CardTitle>
              <CardDescription>Generate QR code for this product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateQRCode} 
                disabled={!formData.name || !formData.mrp || !formData.buying_cost}
                className="w-full"
              >
                Generate QR Code
              </Button>
              
              {(!formData.name || !formData.mrp || !formData.buying_cost) && (
                <p className="text-xs text-muted-foreground text-center">
                  Fill name, MRP and buying cost to generate QR code
                </p>
              )}
              
              {generatedQR && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border">
                    <QRCode value={generatedQR} size={200} className="w-full h-auto" />
                  </div>
                  <div className="text-xs space-y-1 text-center">
                    <p className="font-medium text-foreground">{formData.name}</p>
                    <p className="text-muted-foreground">MRP: ₹{formData.mrp}</p>
                    {formData.expiry_date && (
                      <p className="text-muted-foreground">
                        Exp: {new Date(formData.expiry_date).toLocaleDateString('en-IN')}
                      </p>
                    )}
                    <p className="text-muted-foreground">ID: {formData.barcode}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      const canvas = document.querySelector('canvas')
                      if (canvas) {
                        const link = document.createElement('a')
                        link.download = `qr-${formData.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`
                        link.href = canvas.toDataURL()
                        link.click()
                      }
                    }}
                  >
                    Download QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}