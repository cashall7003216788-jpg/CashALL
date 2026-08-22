import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
  },
  header: {
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 8,
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FACC15",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 9,
    color: "#FFFFFF",
    marginTop: 4,
    textTransform: "uppercase",
  },
  badge: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    textAlign: "center",
    marginBottom: 16,
  },
  badgeText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLabel: {
    color: "#4B5563",
    fontWeight: "bold",
    width: "40%",
  },
  rowVal: {
    color: "#111827",
    width: "60%",
    textAlign: "right",
  },
  amountVal: {
    color: "#16A34A",
    fontSize: 14,
    fontWeight: "bold",
  },
  urnVal: {
    fontFamily: "Courier",
    color: "#1D4ED8",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    textAlign: "center",
    fontSize: 8,
    color: "#6B7280",
    lineHeight: 1.4,
  },
});

export interface InvoicePdfProps {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  deviceName: string;
  amountPaid: number;
  urn: string;
  agentName?: string;
  date?: string;
  orderDate?: string;
  completedDate?: string;
}

export function InvoicePdfDocument({
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  customerAddress,
  deviceName,
  amountPaid,
  urn,
  agentName,
  date,
  orderDate,
  completedDate,
}: InvoicePdfProps) {
  const formattedDate = date || new Date().toISOString().split("T")[0];
  const formattedOrderDate = orderDate || formattedDate;
  const formattedCompletedDate = completedDate || formattedDate;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>CashALL</Text>
          <Text style={styles.subtitle}>
            Official Purchase Receipt & Tax Invoice • AARNA ENTERPRISE
          </Text>
        </View>

        {/* STATUS BADGE */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            STATUS: TRANSACTION COMPLETED — INSTANT UPI TRANSFERRED
          </Text>
        </View>

        {/* ORDER DETAILS */}
        <Text style={styles.sectionTitle}>Order & Transaction Summary</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Order ID / Receipt #</Text>
          <Text style={styles.rowVal}>#{orderNumber}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Order Placed Time</Text>
          <Text style={styles.rowVal}>{formattedOrderDate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Order Completion & Payout</Text>
          <Text style={styles.rowVal}>{formattedCompletedDate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Final Amount Paid</Text>
          <Text style={[styles.rowVal, styles.amountVal]}>
            Rs. {amountPaid.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Payment Mode</Text>
          <Text style={styles.rowVal}>Instant Bank Transfer / UPI</Text>
        </View>

        {urn ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Bank UTR Reference</Text>
            <Text style={[styles.rowVal, styles.urnVal]}>{urn}</Text>
          </View>
        ) : null}

        {/* CUSTOMER DETAILS */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
          Customer & Seller Details
        </Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Customer Name</Text>
          <Text style={styles.rowVal}>{customerName || "Customer"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Mobile Number</Text>
          <Text style={styles.rowVal}>{customerPhone || "N/A"}</Text>
        </View>

        {customerEmail ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email Address</Text>
            <Text style={styles.rowVal}>{customerEmail}</Text>
          </View>
        ) : null}

        {customerAddress ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Pickup Location</Text>
            <Text style={styles.rowVal}>{customerAddress}</Text>
          </View>
        ) : null}

        {/* DEVICE DETAILS */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
          Purchased Device Information
        </Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Device Model</Text>
          <Text style={styles.rowVal}>{deviceName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Verified Field Agent</Text>
          <Text style={styles.rowVal}>{agentName || "CashALL Agent"}</Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>
            CashALL • AARNA ENTERPRISE | GSTIN: 19AVPPG9800JIZ3 | Howrah, West
            Bengal
          </Text>
          <Text>
            Helpline: +91 7003216788 | Support Email: support@cashall.in |
            Website: www.cashall.in
          </Text>
          <Text style={{ marginTop: 4, color: "#9CA3AF" }}>
            This is a computer-generated tax invoice. No signature is required.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdfBuffer(
  props: InvoicePdfProps
): Promise<Buffer> {
  const doc = <InvoicePdfDocument {...props} />;
  const instance = pdf(doc);
  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
