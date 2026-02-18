"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Printer, ArrowLeft, Download } from "lucide-react"

interface RentalData {
  id: string
  rentalNumber: string
  startDate: string
  endDate: string
  totalAmount: number
  deposit: number
  status: string
  notes: string | null
  createdAt: string
  customer: {
    name: string
    phone: string
    address: string | null
  }
  rentalItems: Array<{
    quantity: number
    pricePerUnit: number
    subtotal: number
    item: {
      name: string
      category: string
      description: string | null
    }
  }>
  payments: Array<{
    amount: number
    paymentMethod: string
    createdAt: string
  }>
  createdBy: {
    name: string
  }
}

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [rental, setRental] = useState<RentalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRental()
  }, [])

  const fetchRental = async () => {
    try {
      const response = await fetch(`/api/rentals/${params.id}`)
      const data = await response.json()
      setRental(data)
    } catch (error) {
      console.error("Failed to fetch rental")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getTotalPaid = () => {
    if (!rental) return 0
    return rental.payments.reduce((sum, p) => sum + p.amount, 0)
  }

  const getBalance = () => {
    if (!rental) return 0
    return rental.totalAmount - getTotalPaid()
  }

  const getDays = () => {
    if (!rental) return 0
    const start = new Date(rental.startDate)
    const end = new Date(rental.endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff || 1
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading invoice...</div>
  }

  if (!rental) {
    return <div className="flex items-center justify-center h-64">Rental not found</div>
  }

  return (
    <div>
      {/* Action Bar - Hidden when printing */}
      <div className="print:hidden mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/rentals')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rentals
        </Button>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice Document */}
      <div
        id="invoice"
        className="bg-white mx-auto shadow-lg print:shadow-none"
        style={{ maxWidth: '800px', padding: '40px', fontFamily: 'Georgia, serif' }}
      >

        {/* ── LETTERHEAD ── */}
        <div style={{ borderBottom: '3px solid #6d28d9', paddingBottom: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Company Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '48px', height: '48px', backgroundColor: '#6d28d9',
                  borderRadius: '8px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white', fontSize: '22px', fontWeight: 'bold'
                }}>
                  M
                </div>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                    Maco Rentals
                  </h1>
                  <p style={{ fontSize: '13px', color: '#6d28d9', margin: 0, fontStyle: 'italic' }}>
                    Premium Event Rentals
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                <p style={{ margin: 0 }}>📍 Yaoundé, Cameroun</p>
                <p style={{ margin: 0 }}>📞 +237 6XX XXX XXX</p>
                <p style={{ margin: 0 }}>✉️ contact@macorentals.com</p>
              </div>
            </div>

            {/* Invoice Badge */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                backgroundColor: '#6d28d9', color: 'white',
                padding: '8px 20px', borderRadius: '6px',
                fontSize: '18px', fontWeight: 'bold', marginBottom: '12px'
              }}>
                INVOICE
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Invoice #:</span>{' '}
                  {rental.rentalNumber}
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Date:</span>{' '}
                  {formatDate(rental.createdAt)}
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Status:</span>{' '}
                  <span style={{
                    color: rental.status === 'COMPLETED' ? '#16a34a' :
                           rental.status === 'ACTIVE' ? '#2563eb' :
                           rental.status === 'PENDING' ? '#d97706' : '#dc2626',
                    fontWeight: 'bold'
                  }}>
                    {rental.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BILL TO + RENTAL PERIOD ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          {/* Bill To */}
          <div style={{
            backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px',
            borderLeft: '4px solid #6d28d9', width: '48%'
          }}>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6d28d9', margin: '0 0 10px 0', fontFamily: 'Arial, sans-serif' }}>
              Bill To
            </h3>
            <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937', margin: '0 0 4px 0' }}>
              {rental.customer.name}
            </p>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px 0' }}>
              📞 {rental.customer.phone}
            </p>
            {rental.customer.address && (
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                📍 {rental.customer.address}
              </p>
            )}
          </div>

          {/* Rental Period */}
          <div style={{
            backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px',
            borderLeft: '4px solid #10b981', width: '48%'
          }}>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#10b981', margin: '0 0 10px 0', fontFamily: 'Arial, sans-serif' }}>
              Rental Period
            </h3>
            <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Start Date:</span>{' '}
                {formatDate(rental.startDate)}
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>End Date:</span>{' '}
                {formatDate(rental.endDate)}
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Duration:</span>{' '}
                {getDays()} day{getDays() > 1 ? 's' : ''}
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Prepared by:</span>{' '}
                {rental.createdBy.name}
              </p>
            </div>
          </div>
        </div>

        {/* ── ITEMS TABLE ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ backgroundColor: '#6d28d9' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontSize: '13px', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
                #
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'white', fontSize: '13px', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
                Item Description
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: 'white', fontSize: '13px', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
                Category
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: 'white', fontSize: '13px', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
                Qty
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: 'white', fontSize: '13px', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
                Unit Price
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: 'white', fontSize: '13px', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {rental.rentalItems.map((item, index) => (
              <tr
                key={index}
                style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}
              >
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                  {index + 1}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                  <p style={{ fontWeight: '600', color: '#1f2937', margin: 0, fontSize: '14px' }}>
                    {item.item.name}
                  </p>
                  {item.item.description && (
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                      {item.item.description}
                    </p>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{
                    backgroundColor: '#ede9fe', color: '#6d28d9',
                    padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    {item.item.category}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>
                  {item.quantity}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
                  {formatCurrency(item.pricePerUnit)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── TOTALS ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>{formatCurrency(rental.totalAmount)}</span>
            </div>
            {rental.deposit > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Deposit</span>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>{formatCurrency(rental.deposit)}</span>
              </div>
            )}
            {getTotalPaid() > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
                <span style={{ color: '#16a34a' }}>Amount Paid</span>
                <span style={{ color: '#16a34a', fontWeight: '600' }}>- {formatCurrency(getTotalPaid())}</span>
              </div>
            )}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 16px', marginTop: '8px',
              backgroundColor: '#6d28d9', borderRadius: '8px'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                {getBalance() <= 0 ? 'PAID IN FULL' : 'BALANCE DUE'}
              </span>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                {getBalance() <= 0 ? formatCurrency(rental.totalAmount) : formatCurrency(getBalance())}
              </span>
            </div>
          </div>
        </div>

        {/* ── PAYMENT HISTORY ── */}
        {rental.payments.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6d28d9', margin: '0 0 12px 0', fontFamily: 'Arial, sans-serif' }}>
              Payment History
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontFamily: 'Arial, sans-serif' }}>Date</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontFamily: 'Arial, sans-serif' }}>Method</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '12px', color: '#6b7280', fontFamily: 'Arial, sans-serif' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {rental.payments.map((payment, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px 12px', fontSize: '13px', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>
                      {formatDate(payment.createdAt)}
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: '13px', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>
                      {payment.paymentMethod}
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '600', color: '#16a34a', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── NOTES ── */}
        {rental.notes && (
          <div style={{ backgroundColor: '#fef9c3', padding: '14px', borderRadius: '8px', marginBottom: '28px', borderLeft: '4px solid #eab308' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#92400e', margin: '0 0 6px 0', fontFamily: 'Arial, sans-serif' }}>
              Notes
            </h3>
            <p style={{ fontSize: '13px', color: '#78350f', margin: 0 }}>{rental.notes}</p>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0' }}>
              Thank you for choosing <strong>Maco Rentals</strong>!
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              Please return all items in good condition by {formatDate(rental.endDate)}.
            </p>
          </div>

          {/* Signature */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '150px', borderTop: '1px solid #6b7280', paddingTop: '6px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Authorized Signature</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{rental.createdBy.name}</p>
            </div>
          </div>
        </div>

        {/* Watermark for paid invoices */}
        {getBalance() <= 0 && (
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '80px', fontWeight: 'bold', color: 'rgba(22, 163, 74, 0.08)',
            pointerEvents: 'none', zIndex: 0, userSelect: 'none',
            fontFamily: 'Arial, sans-serif'
          }}>
            PAID
          </div>
        )}

      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice, #invoice * { visibility: visible; }
          #invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100% !important;
            box-shadow: none !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  )
}