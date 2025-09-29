import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Trash2, QrCode, Receipt, Camera, Play, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QrScanner from "qr-scanner"

  product
  quantity
  unit_price
  total_price
}

export default function NewBill() {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [billItems, setBillItems] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanner, setScanner] = useState(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  const videoRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, customersData] = await Promise.all([
        api.getProducts(),
        api.getCustomers()
      ])
      setProducts(productsData)
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const addProductToBill = (product, quantity = 1) => {
    const existingItem = billItems.find(item => item.product.id === product.id)
    
    if (existingItem) {
      updateItemQuantity(product.id, existingItem.quantity + quantity)
    } else {
      const unit_price = Number(product.mrp)
      const total_price = unit_price * quantity
      setBillItems(prev => [...prev, {
        product,
        quantity,
        unit_price,
        total_price
      }])
    }
  }

  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromBill(productId)
      return
    }
    
    setBillItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const total_price = item.unit_price * newQuantity
        return { ...item, quantity, total_price }
      }
      return item
    }))
  }

  const removeItemFromBill = (productId) => {
    setBillItems(prev => prev.filter(item => item.product.id !== productId))
  }

  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.total_price, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + taxAmount - discountAmount
  }

  const startCameraScanning = async () => {
    if (!videoRef.current) return
    
    try {
      setIsScanning(true)
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          handleQRCodeScan(result.data)
          stopCameraScanning()
        },
        {
          returnDetailedScanResult,
          highlightScanRegion,
          highlightCodeOutline,
        }
      )
      
      await qrScanner.start()
      setScanner(qrScanner)
      
      toast({
        title: "Camera Started",
        description: "Point your camera at a QR code to add to bill",
      })
    } catch (error) {
      console.error('Error starting camera:', error)
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      })
      setIsScanning(false)
    }
  }

  const stopCameraScanning = () => {
    if (scanner) {
      scanner.stop()
      scanner.destroy()
      setScanner(null)
    }
    setIsScanning(false)
  }

  const handleQRCodeScan = async (qrData) => {
    console.log("Scanning QR Code:", qrData)
    console.log("Available products:", products.length)
    
    try {
      // Try to parse as JSON first (for our generated QR codes)
      const parsed = JSON.parse(qrData)
      console.log("Parsed QR data:", parsed)
      
      if (parsed.type === "pantry_pal_product" && parsed.id) {
        // Find the product by barcode (since QR generated ID is stored in barcode field)
        const product = products.find(p => p.barcode === parsed.id || p.id === parsed.id)
        console.log("Found product by QR ID:", product)
        
        if (product) {
          addProductToBill(product)
          toast({
            title: "Product Added!",
            description: `${product.name} added to bill`,
          })
          setIsScannerOpen(false)
        } else {
          // Try to find by name as fallback
          const productByName = products.find(p => p.name === parsed.name)
          if (productByName) {
            addProductToBill(productByName)
            toast({
              title: "Product Added!",
              description: `${productByName.name} added to bill`,
            })
            setIsScannerOpen(false)
          } else {
            toast({
              title: "Product Not Found",
              description: `QR Code ID: ${parsed.id} - No matching product found in inventory`,
              variant: "destructive",
            })
          }
        }
      } else {
        // Try to find by barcode or product ID
        const product = products.find(p => p.barcode === qrData || p.id === qrData)
        if (product) {
          addProductToBill(product)
          toast({
            title: "Product Added!",
            description: `${product.name} added to bill`,
          })
          setIsScannerOpen(false)
        } else {
          toast({
            title: "Product Not Found",
            description: "No product matches this QR code",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.log("QR Code is not JSON, trying direct match")
      // Not a valid JSON, try to find by simple ID
      const product = products.find(p => p.barcode === qrData || p.id === qrData)
      if (product) {
        addProductToBill(product)
        toast({
          title: "Product Added!",
          description: `${product.name} added to bill`,
        })
        setIsScannerOpen(false)
      } else {
        toast({
          title: "Invalid QR Code",
          description: `Raw data: ${qrData} - This QR code is not recognized`,
          variant: "destructive",
        })
      }
    }
  }

  const handleSubmit = async () => {
    if (billItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to the bill",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const billData = {
        bill_number: `BILL-${Date.now()}`,
        customer_id: selectedCustomer || undefined,
        total_amount: calculateSubtotal().toString(),
        discount_amount: discountAmount.toString(),
        tax_amount: taxAmount.toString(),
        final_amount: calculateTotal().toString(),
        payment_method,
      }

      const bill = await api.createBill(billData)
      
      // Add bill items
      for (const item of billItems) {
        await api.post(`/bills/${bill.id}/items`, {
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price.toString(),
          total_price: item.total_price.toString(),
        })
      }

      toast({
        title: "Success",
        description: `Bill ${bill.bill_number} created successfully!`,
      })
      navigate("/billing")
    } catch (error) {
      console.error("Error creating bill:", error)
      toast({
        title: "Error",
        description: "Failed to create bill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop()
        scanner.destroy()
      }
    }
  }, [scanner])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/billing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Bill</h1>
          <p className="text-muted-foreground">Add items and generate bill</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Products</CardTitle>
              <CardDescription>Search and add products to the bill</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="search">Search Products</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, category, or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-10">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                        <DialogDescription>
                          Scan a product QR code to add it to the bill
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <video
                            ref={videoRef}
                            className="w-full h-64 bg-black rounded-lg"
                            style={{ display: isScanning ? 'block' : 'none' }}
                          />
                          {!isScanning && (
                            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/50 h-64 flex flex-col justify-center">
                              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <p className="text-muted-foreground mb-4">Ready to scan QR codes</p>
                              <Button onClick={startCameraScanning} className="mx-auto">
                                <Play className="h-4 w-4 mr-2" />
                                Start Camera
                              </Button>
                            </div>
                          )}
                          {isScanning && (
                            <div className="absolute top-2 right-2 z-10">
                              <Button 
                                onClick={stopCameraScanning}
                                variant="destructive"
                                size="sm"
                              >
                                <Square className="h-4 w-4 mr-2" />
                                Stop
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.brand && `${product.brand} • `}
                        {product.category} • ₹{Number(product.mrp).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Stock: {product.quantity_in_stock || 0} {product.unit}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addProductToBill(product)}
                      disabled={(product.quantity_in_stock || 0) <= 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bill Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Bill Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer (Optional)</Label>
                  <Select onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment">Payment Method</Label>
                  <Select onValueChange={setPaymentMethod} defaultValue="cash">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bill Items */}
              <div className="space-y-4">
                <Label>Items in Bill</Label>
                {billItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    No items added yet
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billItems.map(item => (
                          <TableRow key={item.product.id}>
                            <TableCell>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-xs text-muted-foreground">{item.product.unit}</div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.product.id, parseInt(e.target.value) || 0)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>₹{item.unit_price.toLocaleString()}</TableCell>
                            <TableCell>₹{item.total_price.toLocaleString()}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeItemFromBill(item.product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Calculations */}
              {billItems.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount (₹)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax">Tax (₹)</Label>
                      <Input
                        id="tax"
                        type="number"
                        min="0"
                        value={taxAmount}
                        onChange={(e) => setTaxAmount(Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>₹{taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? "Creating..." : "Generate Bill"}
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/billing">Cancel</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}