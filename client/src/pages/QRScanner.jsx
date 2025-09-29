import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { QrCode, Camera, Search, Package, Play, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QrScanner from "qr-scanner"

export default function QRScanner() {
  const [manualCode, setManualCode] = useState("")
  const [scannedData, setScannedData] = useState(null)
  const [product, setProduct] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanner, setScanner] = useState(null)
  const { toast } = useToast()
  const videoRef = useRef(null)

  const handleManualScan = async () => {
    if (!manualCode.trim()) return
    await processQRCode(manualCode)
  }

  const processQRCode = async (qrData) => {
    setIsSearching(true)
    try {
      // Try to parse as JSON first (for our generated QR codes)
      try {
        const parsed = JSON.parse(qrData)
        setScannedData(parsed)
        
        // If it has a product ID, try to fetch the product
        if (parsed.id) {
          await findProductByCode(parsed.id)
        }
      } catch {
        // If not JSON, treat as simple product ID or barcode
        await findProductByCode(qrData)
      }
    } catch (error) {
      console.error('Error scanning code:', error)
      toast({
        title: "Error",
        description: "Failed to process QR code",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const findProductByCode = async (code) => {
    try {
      const products = await api.getProducts()
      console.log("Searching for code:", code)
      console.log("Available products:", products.length)
      
      // Search by QR code, barcode, or ID
      const foundProduct = products.find(p => 
        p.qr_code === code || 
        p.barcode === code || 
        p.id === code ||
        (p.qr_code && p.qr_code.includes(code))
      )
      
      console.log("Found product:", foundProduct)
      
      if (foundProduct) {
        setProduct(foundProduct)
        toast({
          title: "Product Found!",
          description: `Found: ${foundProduct.name}`,
        })
      } else {
        setProduct(null)
        toast({
          title: "Product Not Found",
          description: `No product matches this QR code: ${code}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error finding product:', error)
      toast({
        title: "Error",
        description: "Failed to search for product",
        variant: "destructive",
      })
    }
  }

  const getStockStatus = (product) => {
    const stock = product.quantity_in_stock || 0
    const minLevel = product.min_stock_level || 0
    
    if (stock === 0) {
      return { label: "Out of Stock", variant: "destructive" as const }
    } else if (stock <= minLevel) {
      return { label: "Low Stock", variant: "secondary" as const }
    } else {
      return { label: "In Stock", variant: "default" as const }
    }
  }

  const getExpiryStatus = (expiryDate? ) => {
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

  const startCameraScanning = async () => {
    if (!videoRef.current) return
    
    try {
      setIsScanning(true)
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          toast({
            title: "QR Code Detected!",
            description: "Processing scanned data...",
          })
          processQRCode(result.data)
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
        description: "Point your camera at a QR code to scan",
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

  const resetScan = () => {
    setManualCode("")
    setScannedData(null)
    setProduct(null)
    stopCameraScanning()
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">QR Code Scanner</h1>
        <p className="text-muted-foreground">Scan QR codes to quickly find product information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan QR Code
            </CardTitle>
            <CardDescription>Enter QR code data manually or use camera scanner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Manual Input */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-code">Manual QR Code Entry</Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-code"
                    placeholder="Enter QR code or product barcode"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                  />
                  <Button onClick={handleManualScan} disabled={isSearching || !manualCode.trim()}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Camera Scanner */}
            <div className="space-y-4">
              <Label>Camera Scanner</Label>
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

            {/* Reset Button */}
            {(scannedData || product) && (
              <Button variant="outline" onClick={resetScan} className="w-full">
                Reset Scanner
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Scanned Data */}
          {scannedData && (
            <Card>
              <CardHeader>
                <CardTitle>Scanned QR Code Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(scannedData, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Information */}
          {product && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    {product.brand && (
                      <p className="text-muted-foreground">{product.brand}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{product.category}</Badge>
                    {(() => {
                      const stockStatus = getStockStatus(product)
                      return <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    })()}
                    {(() => {
                      const expiryStatus = getExpiryStatus(product.expiry_date)
                      return expiryStatus && <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
                    })()}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">MRP</Label>
                      <p className="text-lg font-semibold text-green-600">₹{Number(product.mrp).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Stock</Label>
                      <p className="text-lg">{product.quantity_in_stock || 0} {product.unit}</p>
                    </div>
                  </div>

                  {product.expiry_date && (
                    <div>
                      <Label className="text-sm font-medium">Expiry Date</Label>
                      <p>{new Date(product.expiry_date).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}

                  {product.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-muted-foreground">{product.description}</p>
                    </div>
                  )}

                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product ID:</span>
                      <span className="font-mono">{product.id}</span>
                    </div>
                    {product.barcode && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Barcode:</span>
                        <span className="font-mono">{product.barcode}</span>
                      </div>
                    )}
                    {product.qr_code && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">QR Code:</span>
                        <span className="font-mono text-xs break-all">{product.qr_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {!scannedData && !product && (
            <Card>
              <CardContent className="text-center py-12">
                <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No QR Code Scanned</h3>
                <p className="text-muted-foreground">
                  Enter a QR code manually to see product information
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}