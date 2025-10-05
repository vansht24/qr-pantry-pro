import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { api, type Bill } from "@/lib/api"
import { Link } from "react-router-dom"
import { Plus, Search, Receipt, IndianRupee, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Billing() {
  const [bills, setBills] = useState<Bill[]>([])
  const [filteredBills, setFilteredBills] = useState<Bill[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadBills()
  }, [])

  useEffect(() => {
    const filtered = bills.filter(bill =>
      bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.customer_id && bill.customer_id.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredBills(filtered)
  }, [bills, searchTerm])

  const loadBills = async () => {
    try {
      setLoading(true)
      const billsData = await api.getBills()
      setBills(billsData)
    } catch (error) {
      console.error('Error loading bills:', error)
      toast({
        title: "Error",
        description: "Failed to load bills",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodBadge = (method: string | null) => {
    switch (method) {
      case 'cash':
        return <Badge variant="secondary">Cash</Badge>
      case 'card':
        return <Badge variant="default">Card</Badge>
      case 'upi':
        return <Badge variant="outline">UPI</Badge>
      default:
        return <Badge variant="secondary">Cash</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing</h1>
            <p className="text-muted-foreground">Manage your sales and bills</p>
          </div>
        </div>
        <div className="text-center py-8">Loading bills...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">Manage your sales and bills</p>
        </div>
        <Button asChild>
          <Link to="/billing/new">
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bills.filter(bill => {
                const billDate = new Date(bill.created_at).toDateString()
                const today = new Date().toDateString()
                return billDate === today
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{bills.reduce((sum, bill) => sum + Number(bill.final_amount), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Bill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{bills.length > 0 ? Math.round(bills.reduce((sum, bill) => sum + Number(bill.final_amount), 0) / bills.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by bill number or customer..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
          <CardDescription>
            {filteredBills.length} of {bills.length} bills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No bills found matching your search." : "No bills generated yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        <div className="font-medium">{bill.bill_number}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(bill.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">₹{Number(bill.final_amount).toLocaleString()}</span>
                          {Number(bill.discount_amount) > 0 && (
                            <span className="text-xs text-green-600">
                              Discount: ₹{Number(bill.discount_amount).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(bill.payment_method)}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}