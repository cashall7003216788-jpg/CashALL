import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 762, "CashALL Platform — Partner App Technical Specification & Architecture")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(36, 756, 576, 756)
            
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 25, page_text)
        self.drawString(36, 25, "CONFIDENTIAL — FOR INTERNAL & AUTHORIZED PARTNER DEVELOPERS ONLY")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(36, 35, 576, 35)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=44
    )

    styles = getSampleStyleSheet()

    # Color Palette
    PRIMARY = colors.HexColor("#0F172A")    # Slate 900
    GOLD = colors.HexColor("#D97706")       # Amber 600
    DARK_GOLD = colors.HexColor("#B45309")  # Amber 700
    LIGHT_BG = colors.HexColor("#F8FAFC")   # Slate 50
    BORDER_COLOR = colors.HexColor("#CBD5E1") # Slate 300
    TEXT_DARK = colors.HexColor("#1E293B")  # Slate 800
    TEXT_MUTED = colors.HexColor("#475569") # Slate 600
    SUCCESS_COLOR = colors.HexColor("#15803D")
    WARNING_COLOR = colors.HexColor("#B45309")
    ALERT_BG = colors.HexColor("#FEF3C7")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY,
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=DARK_GOLD,
        spaceAfter=12
    )
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=DARK_GOLD,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_DARK,
        spaceAfter=5
    )
    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=PRIMARY
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=TEXT_DARK
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell,
        fontName='Helvetica-Bold'
    )
    table_cell_header = ParagraphStyle(
        'TableCellHeader',
        parent=table_cell,
        fontName='Helvetica-Bold',
        textColor=colors.white
    )
    badge_done = ParagraphStyle(
        'BadgeDone',
        parent=table_cell,
        fontName='Helvetica-Bold',
        textColor=SUCCESS_COLOR
    )
    badge_partial = ParagraphStyle(
        'BadgePartial',
        parent=table_cell,
        fontName='Helvetica-Bold',
        textColor=WARNING_COLOR
    )

    story = []

    # Cover / Header Banner
    story.append(Paragraph("CASHALL WEBSITE → PARTNER APP TECHNICAL HANDOFF", title_style))
    story.append(Paragraph("End-to-End System Architecture, Supabase Database Specification & Unified Mobile Integration Guide", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceBefore=0, spaceAfter=10))

    # Meta Table
    meta_data = [
        [Paragraph("Target Audience:", table_cell_bold), Paragraph("Partner & Delivery Mobile App Engineering Team", table_cell),
         Paragraph("Target Date:", table_cell_bold), Paragraph("August 2026", table_cell)],
        [Paragraph("Core Backend:", table_cell_bold), Paragraph("Next.js 14 Serverless on Vercel (TypeScript)", table_cell),
         Paragraph("Database:", table_cell_bold), Paragraph("Supabase PostgreSQL (Project jqysknhobtpcbyyltnfc)", table_cell)],
        [Paragraph("Scope:", table_cell_bold), Paragraph("Read-Only Inspection, Flow Documentation & API Contracts", table_cell),
         Paragraph("Status:", table_cell_bold), Paragraph("Production Verified & Operational", badge_done)]
    ]
    meta_table = Table(meta_data, colWidths=[80, 200, 70, 190])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(Paragraph(
        "CashALL operates a specialized device re-commerce buyback service across West Bengal and Uttar Pradesh, buying pre-owned smartphones, laptops, and tablets directly from consumers. The customer workflow delivers an online estimated quote, captures doorstep pickup details, schedules a local appointment, and dispatches a CashALL field logistics partner to physically inspect the hardware, verify seller identity (KYC), capture digital signatures, disburse instant payout funds (via UPI), and issue an authorized bill of sale. "
        "The web application and the mobile partner app share <b>one unified backend infrastructure</b> powered by Supabase. There are no separate databases, no duplicate tables, and no fragmented business logic. Both platforms operate as two synchronized clients interacting with the same PostgreSQL database.",
        body_style
    ))

    # 2. Current System Architecture
    story.append(Paragraph("2. Current System Architecture", h1_style))
    story.append(Paragraph(
        "<b>• Client Tier:</b> Web application built with Next.js 14 App Router, Tailwind CSS, and Framer Motion. Mobile Partner App built with Flutter or React Native using official Supabase client libraries.<br/>"
        "<b>• API & Application Tier:</b> Next.js Serverless API endpoints deployed on Vercel acting as the trusted server environment. Manages role authorization (CUSTOMER, AGENT, PARTNER, ADMIN), state transitions, SHA-256 PII hashing for Meta CAPI, and privileged database operations.<br/>"
        "<b>• Database Tier:</b> Hosted PostgreSQL database managed by Supabase in the <code>aws-0-ap-south-1</code> (Mumbai, India) AWS region. Queried by the backend through Prisma ORM using transaction-mode connection pooling (PgBouncer IPv4).<br/>"
        "<b>• Storage Tier:</b> Supabase Storage Buckets storing device photos, inspection evidence, and payment receipts.",
        body_style
    ))

    # 3. Supabase Project Structure
    story.append(Paragraph("3. Supabase Project Structure & Configuration", h1_style))
    supabase_info = [
        [Paragraph("Parameter", table_cell_header), Paragraph("Environment Variable Name", table_cell_header), Paragraph("Client Exposure (Mobile App)", table_cell_header), Paragraph("Description", table_cell_header)],
        [Paragraph("Project URL", table_cell_bold), Paragraph("<code>NEXT_PUBLIC_SUPABASE_URL</code>", code_style), Paragraph("YES (Embed in App)", badge_done), Paragraph("https://jqysknhobtpcbyyltnfc.supabase.co", table_cell)],
        [Paragraph("Anon / Public Key", table_cell_bold), Paragraph("<code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>", code_style), Paragraph("YES (Embed in App)", badge_done), Paragraph("JWT with 'anon' role for client-side queries", table_cell)],
        [Paragraph("Publishable Key", table_cell_bold), Paragraph("<code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>", code_style), Paragraph("YES (Embed in App)", badge_done), Paragraph("sb_publishable_... client identifier", table_cell)],
        [Paragraph("Service Role Key", table_cell_bold), Paragraph("<code>SUPABASE_SERVICE_ROLE_KEY</code>", code_style), Paragraph("STRICTLY FORBIDDEN", ParagraphStyle('Red', parent=table_cell, fontName='Helvetica-Bold', textColor=colors.red)), Paragraph("Privileged key bypassing RLS. Server-side only.", table_cell)],
        [Paragraph("Database URL", table_cell_bold), Paragraph("<code>DATABASE_URL</code> / <code>POSTGRES_PRISMA_URL</code>", code_style), Paragraph("STRICTLY FORBIDDEN", ParagraphStyle('Red', parent=table_cell, fontName='Helvetica-Bold', textColor=colors.red)), Paragraph("PostgreSQL connection string with pooler port 6543.", table_cell)]
    ]
    t_sup = Table(supabase_info, colWidths=[90, 160, 110, 180])
    t_sup.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_sup)
    story.append(Spacer(1, 10))

    # 4. Database Tables Inventory
    story.append(Paragraph("4. Database Tables Inventory (Audit of 41 PostgreSQL Tables)", h1_style))
    story.append(Paragraph(
        "A rigorous schema inspection confirms <b>41 tables</b> currently active in the database. Below is the breakdown of all core entities relevant to the Partner App:",
        body_style
    ))

    catalog_audit = [
        [Paragraph("Intended Entity", table_cell_header), Paragraph("Actual Table Name in DB", table_cell_header), Paragraph("Schema Status", table_cell_header), Paragraph("Architectural Role & Description", table_cell_header)],
        [Paragraph("brands", table_cell_bold), Paragraph("<code>Brand</code>", code_style), Paragraph("EXISTS", badge_done), Paragraph("Manufacturer directory (Apple, Samsung, Xiaomi, HP, Dell, etc.)", table_cell)],
        [Paragraph("device_models", table_cell_bold), Paragraph("<code>DeviceModel</code>", code_style), Paragraph("EXISTS", badge_done), Paragraph("Specific models, release years, category tags, and base prices", table_cell)],
        [Paragraph("model_variants", table_cell_bold), Paragraph("<code>DeviceVariant</code>", code_style), Paragraph("EXISTS", badge_done), Paragraph("Implemented as DeviceVariant. Links modelId with storage/ram.", table_cell)],
        [Paragraph("storage_variants", table_cell_bold), Paragraph("Column <code>storage</code>", code_style), Paragraph("Not separate table", badge_partial), Paragraph("Expected table not found. Storage is stored on DeviceVariant.storage.", table_cell)],
        [Paragraph("color_variants", table_cell_bold), Paragraph("<code>ColorVariant</code>", code_style), Paragraph("EXISTS", badge_done), Paragraph("Model/variant color choices, hex codes, and color image assets", table_cell)],
        [Paragraph("question_sets", table_cell_bold), Paragraph("<code>QuestionSet</code>", code_style), Paragraph("EXISTS", badge_done), Paragraph("Category-level grouping for condition questionnaires", table_cell)],
        [Paragraph("questions", table_cell_bold), Paragraph("<code>ConditionQuestion</code>", code_style), Paragraph("EXISTS", badge_done), Paragraph("Implemented as ConditionQuestion. Groups: BASIC, SCREEN, BODY, etc.", table_cell)],
        [Paragraph("question_options", table_cell_bold), Paragraph("<code>ConditionOption</code>", code_style), Paragraph("EXISTS", badge_done), Paragraph("Implemented as ConditionOption. Selectable answers per question.", table_cell)],
        [Paragraph("pricing_rules", table_cell_bold), Paragraph("<code>PricingRule</code>", code_style), Paragraph("EXISTS", badge_done), Paragraph("Mathematical deduction / bonus rules (% or fixed amounts)", table_cell)],
        [Paragraph("pricing_history", table_cell_bold), Paragraph("<code>PricingHistory</code>", code_style), Paragraph("EXISTS", badge_done), Paragraph("Audit log of pricing rule changes and author IDs", table_cell)],
        [Paragraph("device_images", table_cell_bold), Paragraph("<code>DeviceImage</code>", code_style), Paragraph("EXISTS", badge_done), Paragraph("Photo gallery references attached to models", table_cell)]
    ]
    t_cat = Table(catalog_audit, colWidths=[85, 115, 90, 250])
    t_cat.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_cat)
    story.append(Spacer(1, 8))

    # Core Transaction Tables
    story.append(Paragraph("Core Transactional Tables Summary:", h2_style))
    tx_tables = [
        [Paragraph("Table Name", table_cell_header), Paragraph("Primary Key", table_cell_header), Paragraph("Foreign Keys", table_cell_header), Paragraph("Key Columns & Responsibility", table_cell_header)],
        [Paragraph("<code>User</code>", code_style), Paragraph("<code>id</code> (UUID)", table_cell), Paragraph("None", table_cell), Paragraph("phone (unique), name, email, role (CUSTOMER, AGENT, PARTNER, ADMIN), firebaseUid.", table_cell)],
        [Paragraph("<code>Address</code>", code_style), Paragraph("<code>id</code> (UUID)", table_cell), Paragraph("userId → User", table_cell), Paragraph("house, street, area, landmark, city, state, pincode, lat/lng.", table_cell)],
        [Paragraph("<code>Quote</code>", code_style), Paragraph("<code>id</code> (UUID)", table_cell), Paragraph("variantId → DeviceVariant", table_cell), Paragraph("quoteNumber (unique), selectedAnswersJson, basePrice, totalDeductions, estimatedPrice, breakdownJson.", table_cell)],
        [Paragraph("<code>Order</code>", code_style), Paragraph("<code>id</code> (UUID)", table_cell), Paragraph("quoteId, userId, addressId, agentId", table_cell), Paragraph("orderNumber (unique e.g. #CA61962), pickupDate, pickupTimeSlot, status, finalPrice, urn, paymentScreenshotUrl.", table_cell)],
        [Paragraph("<code>Pickup</code>", code_style), Paragraph("<code>id</code> (UUID)", table_cell), Paragraph("orderId → Order, partnerId → Partner", table_cell), Paragraph("date, timeSlot, status (SCHEDULED, ASSIGNED), notes (agent name), assignedAt.", table_cell)],
        [Paragraph("<code>QcReport</code>", code_style), Paragraph("<code>id</code> (UUID)", table_cell), Paragraph("orderId → Order", table_cell), Paragraph("inspectorName, imeiNumber, declaredAnswersJson, physicalAnswersJson, revisedPrice, photoUrlsJson.", table_cell)],
        [Paragraph("<code>Offer</code>", code_style), Paragraph("<code>id</code> (UUID)", table_cell), Paragraph("orderId → Order", table_cell), Paragraph("originalPrice, revisedPrice, priceDifferenceReason, status (PENDING, ACCEPTED).", table_cell)],
        [Paragraph("<code>Payment</code>", code_style), Paragraph("<code>id</code> (UUID)", table_cell), Paragraph("orderId → Order", table_cell), Paragraph("amount, method (UPI), status (PAID), transactionRef (Bank UTR), paidAt.", table_cell)],
        [Paragraph("<code>Imei</code>", code_style), Paragraph("<code>id</code> (UUID)", table_cell), Paragraph("orderId → Order (optional)", table_cell), Paragraph("code (unique 15-digit), status (VERIFIED), checkedAt, comments.", table_cell)],
        [Paragraph("<code>ImageReference</code>", code_style), Paragraph("<code>id</code> (UUID)", table_cell), Paragraph("entityId → Order", table_cell), Paragraph("url (signed), bucket (qc-reports, etc.), key (storage path), entityType.", table_cell)]
    ]
    t_tx = Table(tx_tables, colWidths=[80, 65, 115, 280])
    t_tx.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_tx)
    story.append(Spacer(1, 10))

    # 5. Database Relationships
    story.append(Paragraph("5. Database Relationships & Entity Relationship Model", h1_style))
    story.append(Paragraph(
        "• <b>Brand 1:N DeviceModel:</b> Deleting a brand cascades to its models.<br/>"
        "• <b>DeviceModel 1:N DeviceVariant:</b> Variants define storage options (128GB, 256GB) and base prices.<br/>"
        "• <b>DeviceVariant 1:N Quote:</b> Quotes store the snapshot of answers and pricing at calculation time.<br/>"
        "• <b>Quote 1:1 Order:</b> An order converts a quote into a scheduled pickup commitment.<br/>"
        "• <b>User 1:N Order:</b> Both customer (userId) and internal agent (agentId) link to the User table.<br/>"
        "• <b>Order 1:N Pickup:</b> Stores appointment date, time window, and partner assignment.<br/>"
        "• <b>Order 1:N QcReport & Offer:</b> Captures field inspection results and revised price negotiations.<br/>"
        "• <b>Order 1:N Payment & ImageReference:</b> Connects transaction UTR and Supabase Storage photo paths.",
        body_style
    ))

    # 6. Customer Journey Matrix
    story.append(Paragraph("6. Customer Journey — Step-by-Step Flow", h1_style))
    journey_steps = [
        [Paragraph("Step", table_cell_header), Paragraph("Customer Action", table_cell_header), Paragraph("Implementation Status", table_cell_header), Paragraph("Code Location / Route", table_cell_header), Paragraph("Database Data Stored", table_cell_header)],
        [Paragraph("1", table_cell), Paragraph("Select Location & Category", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>LocationModal.tsx</code>", code_style), Paragraph("Browser session / cookies", table_cell)],
        [Paragraph("2", table_cell), Paragraph("Select Brand & Model", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>app/sell/[category]/...</code>", code_style), Paragraph("Queried from Brand & DeviceModel", table_cell)],
        [Paragraph("3", table_cell), Paragraph("Select Storage Variant", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>app/calculator/[slug]</code>", code_style), Paragraph("Reads DeviceVariant.basePrice", table_cell)],
        [Paragraph("4", table_cell), Paragraph("Answer Diagnostic Questions", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>app/calculator/[slug]</code>", code_style), Paragraph("In-memory questionnaire state", table_cell)],
        [Paragraph("5", table_cell), Paragraph("Generate Valuation Quote", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>POST /api/v1/quotes/calculate</code>", code_style), Paragraph("Quote table (quoteNumber, estimatedPrice)", table_cell)],
        [Paragraph("6", table_cell), Paragraph("Customer Phone Auth", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>app/checkout/pickup</code>", code_style), Paragraph("User table (phone, firebaseUid)", table_cell)],
        [Paragraph("7", table_cell), Paragraph("Address & Date Selection", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>app/checkout/pickup</code>", code_style), Paragraph("Address table (pincode, house, city)", table_cell)],
        [Paragraph("8", table_cell), Paragraph("Confirm Doorstep Pickup", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>POST /api/v1/orders/create</code>", code_style), Paragraph("Order (#CAxxxxx) & Pickup (SCHEDULED)", table_cell)],
        [Paragraph("9", table_cell), Paragraph("Admin Assigns Field Partner", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>/admin/orders</code> assign route", code_style), Paragraph("Order.agentId, status: PARTNER_ASSIGNED", table_cell)],
        [Paragraph("10", table_cell), Paragraph("Partner Visits & Starts QC", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>POST /api/v1/orders/[id]/start-inspection</code>", code_style), Paragraph("Order.status: INSPECTION_STARTED", table_cell)],
        [Paragraph("11", table_cell), Paragraph("Physical Inspection & IMEI", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>POST /api/v1/agent/orders/[id]/inspection</code>", code_style), Paragraph("QcReport table, Imei table, finalPrice", table_cell)],
        [Paragraph("12", table_cell), Paragraph("Seller ID Verification (KYC)", table_cell), Paragraph("PARTIALLY IMPLEMENTED", badge_partial), Paragraph("<code>POST /api/v1/orders/[id]/verify-identity</code>", code_style), Paragraph("Masked ID (XXXX-XXXX-1234), ref ID", table_cell)],
        [Paragraph("13", table_cell), Paragraph("Customer E-Signature", table_cell), Paragraph("PARTIALLY IMPLEMENTED", badge_partial), Paragraph("<code>POST /api/v1/orders/[id]/esign</code>", code_style), Paragraph("SHA-256 agreement hash, declaration", table_cell)],
        [Paragraph("14", table_cell), Paragraph("Payout via UPI / Bank", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>POST /api/v1/agent/upload-payment</code>", code_style), Paragraph("Payment (PAID), Order.urn (UTR), screenshot", table_cell)],
        [Paragraph("15", table_cell), Paragraph("Order Marked Completed", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>POST /api/v1/agent/orders/[id]/complete</code>", code_style), Paragraph("Order.status: COMPLETED", table_cell)],
        [Paragraph("16", table_cell), Paragraph("Automated Bill Issued", table_cell), Paragraph("IMPLEMENTED", badge_done), Paragraph("<code>GET /api/v1/orders/[id]/generate-bill</code>", code_style), Paragraph("Official invoice with GSTIN & IMEI emailed", table_cell)]
    ]
    t_jou = Table(journey_steps, colWidths=[24, 110, 86, 170, 150])
    t_jou.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_jou)
    story.append(Spacer(1, 10))

    # 7. Pricing Engine
    story.append(Paragraph("7. Pricing Engine & Dynamic Valuation", h1_style))
    story.append(Paragraph(
        "<b>Does the current system support percentage-based deductions per question? YES.</b><br/>"
        "Implemented in <code>lib/services/pricing.service.ts</code>. The valuation pipeline evaluates rules in <code>PricingRule</code>:<br/>"
        "1. <b>Base Price:</b> Queried from <code>DeviceVariant.basePrice</code>.<br/>"
        "2. <b>Deduction Rules:</b> Each answer matches a rule with <code>adjustmentType</code>:<br/>"
        "   • <code>PERCENTAGE_DEDUCTION</code>: <code>deduction = (basePrice * abs(adjustmentValue)) / 100</code><br/>"
        "   • <code>FIXED_DEDUCTION</code>: <code>deduction = abs(adjustmentValue)</code><br/>"
        "   • <code>FIXED_BONUS</code>: Adds value for original charger/box.<br/>"
        "3. <b>Floor Price Protection:</b> Guaranteed minimum buyout price clamped to: <code>Math.max(500, Math.round(basePrice * 0.15))</code>.<br/>"
        "4. <b>Dynamic Administration:</b> Admins can update rule percentages in PostgreSQL without deploying new code.",
        body_style
    ))

    # 8. Storage Architecture
    story.append(Paragraph("8. Supabase Storage Architecture", h1_style))
    story.append(Paragraph(
        "CashALL utilizes 4 private/signed Supabase Storage buckets configured in <code>StorageService</code> (<code>lib/services/storage.service.ts</code>):<br/>"
        "• <b><code>customer-devices</code>:</b> Photos uploaded by customers. Path: <code>{userId}/{uuid}.{ext}</code>.<br/>"
        "• <b><code>qc-reports</code>:</b> Hardware inspection photos uploaded by field agents. Path: <code>{agentId}/{orderId}_{uuid}.{ext}</code>.<br/>"
        "• <b><code>payment-screenshots</code>:</b> Proof of successful UPI transfer screenshots showing Bank UTR. Path: <code>urn_{orderNumber}_{timestamp}.{ext}</code>.<br/>"
        "• <b><code>payment-proofs</code>:</b> Back-office payment receipts.<br/>"
        "Access is governed by signed URLs with configurable expiry (3,600s for display, up to 1 year for audit references).",
        body_style
    ))

    # 9. Existing APIs Contract
    story.append(Paragraph("9. Existing APIs Contract for Partner App Integration", h1_style))
    api_list = [
        [Paragraph("Method & Endpoint", table_cell_header), Paragraph("Authentication", table_cell_header), Paragraph("Input Body / Query", table_cell_header), Paragraph("Output & Database Impact", table_cell_header)],
        [Paragraph("<code>POST /api/v1/agent/login</code>", code_style), Paragraph("Public / Agent", table_cell), Paragraph("<code>{ name, password, phone }</code>", code_style), Paragraph("Returns <code>{ token, agent: { id, name, role } }</code>.", table_cell)],
        [Paragraph("<code>GET /api/v1/agent/orders</code>", code_style), Paragraph("Bearer Token", table_cell), Paragraph("<code>?agentId={id}&phone={phone}</code>", code_style), Paragraph("Returns array of assigned pickups with address, slot, amount.", table_cell)],
        [Paragraph("<code>GET /api/v1/orders/[id]</code>", code_style), Paragraph("Bearer Token", table_cell), Paragraph("Order ID or #CA number in path", table_cell), Paragraph("Full order object with quote, address, customer details.", table_cell)],
        [Paragraph("<code>POST /api/v1/orders/[id]/start-inspection</code>", code_style), Paragraph("Agent Token", table_cell), Paragraph("None", table_cell), Paragraph("Transitions Order to <code>INSPECTION_STARTED</code>.", table_cell)],
        [Paragraph("<code>POST /api/v1/agent/orders/[id]/inspection</code>", code_style), Paragraph("Agent Token", table_cell), Paragraph("<code>{ imei, screenFinding, bodyFinding, revisedPrice, reason, agentName }</code>", code_style), Paragraph("Creates <code>QcReport</code>, updates <code>Imei</code>, locks finalPrice.", table_cell)],
        [Paragraph("<code>POST /api/v1/agent/upload-payment</code>", code_style), Paragraph("Agent Token", table_cell), Paragraph("Multipart: <code>orderId, urn, file</code>", code_style), Paragraph("Uploads screenshot to Supabase Storage, sets Order.urn.", table_cell)],
        [Paragraph("<code>POST /api/v1/agent/orders/[id]/complete</code>", code_style), Paragraph("Agent Token", table_cell), Paragraph("<code>{ finalPrice, utr, agentName }</code>", code_style), Paragraph("Sets Payment PAID, Order COMPLETED, dispatches bill email.", table_cell)],
        [Paragraph("<code>GET /api/v1/orders/[id]/generate-bill</code>", code_style), Paragraph("Public / Agent", table_cell), Paragraph("Order ID or #CA number in path", table_cell), Paragraph("Returns structured bill JSON with GSTIN, IMEI, payout.", table_cell)]
    ]
    t_api = Table(api_list, colWidths=[150, 65, 125, 200])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_api)
    story.append(Spacer(1, 10))

    # 10. Partner App Data Flow
    story.append(Paragraph("10. Partner App Operational Data Flow", h1_style))
    story.append(Paragraph(
        "<code>CUSTOMER PLACES PICKUP ORDER ON CASHALL.IN (#CAxxxxx, QUOTE_CREATED)</code><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>"
        "<code>ADMIN ASSIGNS LOGISTICS AGENT (Status changes to PARTNER_ASSIGNED)</code><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>"
        "<code>PARTNER APP LOGS IN → FETCHES ASSIGNED ORDERS (/api/v1/agent/orders)</code><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>"
        "<code>AGENT ARRIVES AT CUSTOMER DOORSTEP → TAPS 'START INSPECTION'</code><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>"
        "<code>AGENT VERIFIES SCREEN, BODY, FUNCTIONAL DEFECTS & INPUTS 15-DIGIT IMEI</code><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>"
        "<code>FINAL PRICE NEGOTIATED → CUSTOMER ACCEPTS SETTLED AMOUNT (ACCEPTED)</code><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>"
        "<code>AGENT INITIATES INSTANT UPI TRANSFER VIA CASHALL CORPORATE HANDLE (GPAY/PAYTM)</code><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>"
        "<code>AGENT INPUTS 12-DIGIT UTR & UPLOADS PAYMENT SCREENSHOT (/upload-payment)</code><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br/>"
        "<code>AGENT CONFIRMS HANDOVER → STATUS: COMPLETED → BILL OF SALE GENERATED & EMAILED</code>",
        code_style
    ))
    story.append(Spacer(1, 10))

    # 11. Security & RLS Architecture
    story.append(Paragraph("11. Security & Row Level Security (RLS) Rules", h1_style))
    story.append(Paragraph(
        "<b>Zero-Trust Client Boundary:</b> The Partner App must execute with <b>Public/Anon credentials only</b>. "
        "The <code>SUPABASE_SERVICE_ROLE_KEY</code> and direct database credentials (<code>postgresql://postgres...</code>) must <b>NEVER</b> be compiled into mobile binaries (APK/IPA). If decompiled, an embedded service role key compromises the entire database.<br/>"
        "• <b>Public Read Access:</b> <code>Brand</code>, <code>DeviceModel</code>, <code>DeviceVariant</code>, <code>ConditionQuestion</code>, <code>ConditionOption</code>, <code>ServiceArea</code>.<br/>"
        "• <b>Agent Scoped Access:</b> Orders are scoped strictly to the authenticated agent's assigned ID. Agents cannot read or modify unassigned orders.<br/>"
        "• <b>Audit Trail:</b> Every state change, inspection write, and price adjustment writes an immutable record to <code>AuditLog</code>.",
        body_style
    ))

    # 12. What the App Developer Needs From CashALL
    story.append(Paragraph("WHAT THE APP DEVELOPER NEEDS FROM CASHALL", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=GOLD, spaceBefore=2, spaceAfter=8))

    handoff_items = [
        [Paragraph("Category", table_cell_header), Paragraph("Items & Architectural Details", table_cell_header)],
        [Paragraph("A. Credentials & Config", table_cell_bold), Paragraph(
            "1. <b>Supabase Project URL:</b> <code>https://jqysknhobtpcbyyltnfc.supabase.co</code><br/>"
            "2. <b>Supabase Anon Key:</b> JWT string with 'anon' role (embeddable in app).<br/>"
            "3. <b>Supabase Publishable Key:</b> <code>sb_publishable_P-MbOk1yAxihXTOFUxt54w_o_hpl3fI</code><br/>"
            "4. <b>CashALL API Base URL:</b> <code>https://www.cashall.in/api/v1</code>", table_cell)],
        [Paragraph("B. APIs to Call", table_cell_bold), Paragraph(
            "• <code>POST /api/v1/agent/login</code> (Agent authentication)<br/>"
            "• <code>GET /api/v1/agent/orders</code> (Assigned pickups list)<br/>"
            "• <code>POST /api/v1/orders/[id]/start-inspection</code> (Status transition)<br/>"
            "• <code>POST /api/v1/agent/orders/[id]/inspection</code> (Submit QC & IMEI)<br/>"
            "• <code>POST /api/v1/agent/upload-payment</code> (Upload UTR & screenshot)<br/>"
            "• <code>POST /api/v1/agent/orders/[id]/complete</code> (Mark finished)<br/>"
            "• <code>GET /api/v1/orders/[id]/generate-bill</code> (Fetch receipt)", table_cell)],
        [Paragraph("C. Supabase Tables", table_cell_bold), Paragraph(
            "• <b>Direct Reads:</b> <code>Brand</code>, <code>DeviceModel</code>, <code>DeviceVariant</code>, <code>ConditionQuestion</code>, <code>ConditionOption</code>.<br/>"
            "• <b>Indirect Reads/Writes (via API):</b> <code>Order</code>, <code>Address</code>, <code>QcReport</code>, <code>Imei</code>, <code>Payment</code>, <code>ImageReference</code>.", table_cell)],
        [Paragraph("D. Permissions Needed", table_cell_bold), Paragraph(
            "• Permission to read assigned orders for logged-in agent.<br/>"
            "• Permission to upload inspection and payment photos to Supabase Storage.<br/>"
            "• Permission to transition order statuses through the state machine.", table_cell)],
        [Paragraph("E. Prohibited Access", ParagraphStyle('RedE', parent=table_cell, fontName='Helvetica-Bold', textColor=colors.red)), Paragraph(
            "• <b>NEVER access <code>SUPABASE_SERVICE_ROLE_KEY</code> or direct DB strings.</b><br/>"
            "• Must NOT access other agents' unassigned orders.<br/>"
            "• Must NOT alter base buyout prices or system pricing rules.", table_cell)],
        [Paragraph("F. To Be Built in App", table_cell_bold), Paragraph(
            "1. Native mobile UI (Flutter / React Native) with offline caching.<br/>"
            "2. Camera integration with Barcode / IMEI scanner for box/SIM tray scanning.<br/>"
            "3. Touchpad signature canvas for customer digital declaration.<br/>"
            "4. UPI intent launcher (e.g. <code>upi://pay?pa=...&am=...</code>) for direct payment.", table_cell)]
    ]
    t_han = Table(handoff_items, colWidths=[120, 420])
    t_han.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_han)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] Generated PDF successfully: {filename}")

if __name__ == "__main__":
    primary_output = os.path.join(r"c:\Users\DELL\OneDrive\Desktop\CashALL", "CashALL_Website_to_Partner_App_Technical_Handoff.pdf")
    build_pdf(primary_output)

    # Copy to Desktop root and artifact folder
    import shutil
    desktop_output = os.path.join(r"c:\Users\DELL\OneDrive\Desktop", "CashALL_Website_to_Partner_App_Technical_Handoff.pdf")
    artifact_output = os.path.join(r"C:\Users\DELL\.gemini\antigravity-ide\brain\0dd1add2-1a68-4762-807b-13cdb168f15b", "CashALL_Website_to_Partner_App_Technical_Handoff.pdf")

    try:
        shutil.copyfile(primary_output, desktop_output)
        print(f"[SUCCESS] Copied to Desktop: {desktop_output}")
    except Exception as e:
        print(f"[WARNING] Could not copy to Desktop: {e}")

    try:
        shutil.copyfile(primary_output, artifact_output)
        print(f"[SUCCESS] Copied to Artifacts: {artifact_output}")
    except Exception as e:
        print(f"[WARNING] Could not copy to Artifacts: {e}")

