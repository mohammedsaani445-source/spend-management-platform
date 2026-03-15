"use client";

import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle, 
  Package, 
  Truck, 
  Calendar, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import styles from './Portal.module.css';
import { PurchaseOrder, ShippingDetails } from '@/types';
import { acknowledgePO, shipOrder } from '@/lib/purchaseOrders';
import { createVendorInvoice } from '@/lib/invoices';

interface PODetailsModalProps {
  po: PurchaseOrder;
  tenantId: string;
  vendorName: string;
  onClose: () => void;
  onAcknowledged: () => void;
}

const PODetailsModal: React.FC<PODetailsModalProps> = ({ 
  po, 
  tenantId, 
  vendorName, 
  onClose, 
  onAcknowledged 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShipForm, setShowShipForm] = useState(false);
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await acknowledgePO(tenantId, po, vendorName);
      onAcknowledged();
    } catch (err: any) {
      setError(err.message || "Failed to acknowledge the order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShip = async (e: React.FormEvent) => {
    // ... existing handleShip code ...
    e.preventDefault();
    if (!carrier || !trackingNumber) {
        setError("Carrier and Tracking Number are required.");
        return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const details: ShippingDetails = {
        carrier,
        trackingNumber,
        shippedAt: new Date().toISOString(),
        estimatedDelivery
      };
      await shipOrder(tenantId, po, details, vendorName);
      onAcknowledged();
      setShowShipForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to mark as shipped.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber) {
        setError("Invoice number is required.");
        return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createVendorInvoice(tenantId, {
        invoiceNumber,
        vendorId: po.vendorId,
        vendorName: vendorName,
        amount: po.totalAmount,
        currency: po.currency || 'USD',
        status: 'SUBMITTED',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days net
        department: po.department || 'Finance',
        lines: po.items.map((item, idx) => ({
            description: item.description,
            quantity: item.quantity,
            receivedQty: item.quantity, // Billed qty
            orderedQty: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            itemIndex: idx,
            qualityStatus: 'PASSED'
        })) as any // Cast if necessary or fix the interface if it's too restrictive
      }, po);
      onAcknowledged();
      setShowInvoiceForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to submit invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAcknowledged = po.status === 'ACKNOWLEDGED' || po.status === 'SHIPPED' || po.status === 'DELIVERED' || po.status === 'RECEIVED';
  const isShipped = po.status === 'SHIPPED' || po.status === 'DELIVERED' || po.status === 'RECEIVED';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.headerIcon}>
            <FileText size={32} />
          </div>
          <div>
            <h2 className={styles.modalTitle}>Purchase Order: {po.poNumber}</h2>
            <p className={styles.modalSubtitle}>Issued on {new Date(po.createdAt || '').toLocaleDateString()}</p>
          </div>
        </div>

        <div className={styles.modalBody}>
          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.poGrid}>
            <div className={styles.poSection}>
              <h3 className={styles.sectionTitle}>Order Information</h3>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Status:</span>
                <span className={`${styles.statusBadge} ${styles[po.status.toLowerCase()]}`}>
                  {po.status}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Department:</span>
                <span>{po.department || 'N/A'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Contact:</span>
                <span>{po.issuedByName || 'Procurement Team'}</span>
              </div>
            </div>

            <div className={styles.poSection}>
              <h3 className={styles.sectionTitle}>Delivery Details</h3>
              <div className={styles.infoRow}>
                <Calendar size={16} />
                <span className={styles.infoLabel}>Expected:</span>
                <span>{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'TBD'}</span>
              </div>
              <div className={styles.infoRow}>
                <Package size={16} />
                <span className={styles.infoLabel}>Location:</span>
                <span>{po.shippingAddress || 'Headquarters'}</span>
              </div>
            </div>
          </div>

          <div className={styles.itemsSection}>
            <h3 className={styles.sectionTitle}>Line Items</h3>
            <table className={styles.poTable}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>${item.unitPrice.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>${(item.quantity * item.unitPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total:</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                    ${po.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {!isAcknowledged && (
            <div className={styles.actionPanel}>
              <p className={styles.actionNote}>
                By clicking "Acknowledge Order", you confirm receipt of this Purchase Order and agree to the delivery terms.
              </p>
              <button 
                className={styles.submitButton} 
                onClick={handleAcknowledge}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className={styles.spinner} size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Acknowledge Order
                  </>
                )}
              </button>
            </div>
          )}

          {po.status === 'ACKNOWLEDGED' && !showShipForm && (
            <div className={styles.actionPanel}>
              <div className={styles.successPanel} style={{ marginBottom: '1.5rem', background: 'rgba(34, 197, 94, 0.05)' }}>
                <CheckCircle size={24} style={{ color: '#22c55e' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Order Acknowledged. Ready for fulfillment.</p>
              </div>
              <button 
                className={styles.submitButton} 
                onClick={() => setShowShipForm(true)}
                style={{ background: '#0ea5e9' }}
              >
                <Truck size={20} />
                Mark as Shipped
              </button>
            </div>
          )}

          {po.status === 'ACKNOWLEDGED' && showShipForm && (
            <div className={styles.actionPanel} style={{ textAlign: 'left' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0ea5e9' }}>
                    <Truck size={20} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Enter Shipping Details</h3>
               </div>
               <form onSubmit={handleShip} className={styles.bidForm}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Carrier (e.g. FedEx, DHL)</label>
                            <input 
                                type="text" 
                                value={carrier} 
                                onChange={(e) => setCarrier(e.target.value)}
                                placeholder="Universal Cargo"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tracking Number</label>
                            <input 
                                type="text" 
                                value={trackingNumber} 
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="TRK-12345678"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Est. Delivery Date</label>
                            <input 
                                type="date" 
                                value={estimatedDelivery} 
                                onChange={(e) => setEstimatedDelivery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button 
                            type="button" 
                            className={styles.secondaryBtn} 
                            onClick={() => setShowShipForm(false)}
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={isSubmitting}
                            style={{ flex: 2, background: '#0ea5e9', marginTop: 0 }}
                        >
                            {isSubmitting ? <Loader2 className={styles.spinner} size={20} /> : <CheckCircle size={20} />}
                            Confirm Shipment
                        </button>
                    </div>
               </form>
            </div>
          )}

          {isShipped && po.status !== 'BILLED' && !showInvoiceForm && (
            <div className={styles.actionPanel} style={{ marginTop: '1rem' }}>
              <p className={styles.actionNote} style={{ marginBottom: '1rem' }}>
                Order has been shipped. You can now generate an invoice for payment.
              </p>
              <button 
                className={styles.submitButton} 
                onClick={() => setShowInvoiceForm(true)}
                style={{ background: 'var(--accent-color)' }}
              >
                <FileText size={20} />
                Generate Invoice
              </button>
            </div>
          )}

          {showInvoiceForm && (
            <div className={styles.actionPanel} style={{ textAlign: 'left', marginTop: '1rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>
                    <FileText size={20} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Generate Vendor Invoice</h3>
               </div>
               <form onSubmit={handleCreateInvoice} className={styles.bidForm}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Invoice Number</label>
                            <input 
                                type="text" 
                                value={invoiceNumber} 
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                placeholder="INV-2024-001"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Amount to Bill</label>
                            <input 
                                type="text" 
                                value={`$${po.totalAmount.toLocaleString()}`} 
                                disabled
                                style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Billing Summary:</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                            <span>PO Subtotal:</span>
                            <span>${po.totalAmount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontWeight: 600 }}>
                            <span>Total Billed Amount:</span>
                            <span>${po.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button 
                            type="button" 
                            className={styles.secondaryBtn} 
                            onClick={() => setShowInvoiceForm(false)}
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={isSubmitting}
                            style={{ flex: 2, marginTop: 0 }}
                        >
                            {isSubmitting ? <Loader2 className={styles.spinner} size={20} /> : <CheckCircle size={20} />}
                            Submit Invoice
                        </button>
                    </div>
               </form>
            </div>
          )}

          {po.status === 'BILLED' && (
            <div className={styles.successPanel} style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <CheckCircle size={32} style={{ color: '#22c55e' }} />
              <div>
                <h4 style={{ margin: 0, color: '#22c55e' }}>Invoice Submitted</h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                    Your invoice has been received and is undergoing 3-way matching.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PODetailsModal;
