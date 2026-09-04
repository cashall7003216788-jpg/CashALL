import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Preformatted
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
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header on pages > 1
        if self._pageNumber > 1:
            self.drawString(36, 762, "CashALL Platform — Partner Mobile App Backend Access & Technical Integration Handoff")
            self.setFont("Helvetica", 8)
            self.drawRightString(576, 762, "STRICT CONFIDENTIAL")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 756, 576, 756)

        # Running Footer on all pages
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 25, page_text)
        self.drawString(36, 25, "CashALL Logistics Engineering — Production Backend Handoff Document")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 35, 576, 35)
        self.restoreState()

def build_pdf(filename="CashALL_Partner_App_Backend_Access_and_API_Handoff.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=44
    )

    styles = getSampleStyleSheet()

    # Color definitions
    PRIMARY = colors.HexColor("#0F172A")       # Slate 900
    SECONDARY = colors.HexColor("#1E293B")     # Slate 800
    GOLD = colors.HexColor("#D97706")          # Amber 600
    DARK_GOLD = colors.HexColor("#B45309")     # Amber 700
    LIGHT_BG = colors.HexColor("#F8FAFC")      # Slate 50
    ALT_BG = colors.HexColor("#F1F5F9")        # Slate 100
    BORDER_COLOR = colors.HexColor("#CBD5E1")  # Slate 300
    TEXT_DARK = colors.HexColor("#1E293B")     # Slate 800
    TEXT_MUTED = colors.HexColor("#475569")    # Slate 600
    SUCCESS_COLOR = colors.HexColor("#15803D") # Green 700
    DANGER_COLOR = colors.HexColor("#DC2626")  # Red 600
    WARNING_COLOR = colors.HexColor("#B45309") # Amber 700
    INFO_BG = colors.HexColor("#EFF6FF")       # Blue 50
    INFO_BORDER = colors.HexColor("#60A5FA")   # Blue 400
    CRITICAL_BG = colors.HexColor("#FEF2F2")   # Red 50
    CRITICAL_BORDER = colors.HexColor("#F87171")# Red 400
    CODE_BG = colors.HexColor("#0F172A")       # Dark code block background

    # Typography
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=21,
        textColor=PRIMARY,
        spaceAfter=3
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=DARK_GOLD,
        spaceAfter=8
    )
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=SECONDARY,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_DARK,
        spaceAfter=3
    )
    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    code_inline = ParagraphStyle(
        'CodeInline',
        parent=body_style,
        fontName='Courier',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor("#0F172A")
    )
    code_block = ParagraphStyle(
        'CodeBlock',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.5,
        leading=8.5,
        textColor=colors.HexColor("#E2E8F0")
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=9,
        textColor=TEXT_DARK
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell,
        fontName='Helvetica-Bold'
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=colors.white
    )
    badge_prod = ParagraphStyle('BadgeProd', fontName='Helvetica-Bold', fontSize=6.5, leading=8, textColor=SUCCESS_COLOR)
    badge_mock = ParagraphStyle('BadgeMock', fontName='Helvetica-Bold', fontSize=6.5, leading=8, textColor=WARNING_COLOR)
    badge_missing = ParagraphStyle('BadgeMissing', fontName='Helvetica-Bold', fontSize=6.5, leading=8, textColor=DANGER_COLOR)
    badge_crit = ParagraphStyle('BadgeCrit', fontName='Helvetica-Bold', fontSize=6.5, leading=8, textColor=colors.HexColor("#991B1B"))

    story = []

    # =========================================================================
    # COVER / HEADER
    # =========================================================================
    story.append(Paragraph("CashALL Partner Android App — Complete Technical Handoff", title_style))
    story.append(Paragraph("EXHAUSTIVE BACKEND INTEGRATION SPECIFICATION & REAL PRODUCTION PLAYBOOK", subtitle_style))

    meta_table_data = [
        [
            Paragraph("<b>Target System:</b> CashALL Production Re-Commerce Engine", table_cell),
            Paragraph("<b>Repository:</b> github.com/cashall7003216788-jpg/CashALL", table_cell)
        ],
        [
            Paragraph("<b>Production API URL:</b> https://www.cashall.in/api/v1", table_cell),
            Paragraph("<b>Architecture:</b> Next.js 14 App Router, Supabase Postgres, Prisma", table_cell)
        ],
        [
            Paragraph("<b>Target Audience:</b> Partner Android App Developer & Backend Team", table_cell),
            Paragraph("<b>Document Scope:</b> End-to-End Specs, Payloads, Routing, Roadmap", table_cell)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))

    # =========================================================================
    # SECTION 1: CRITICAL RESOLUTION - WHY /api/v1 RETURNS 404 IN BROWSER
    # =========================================================================
    routing_box_data = [
        [Paragraph("<b>CRITICAL ARCHITECTURAL CLARIFICATION: WHY https://cashall.in/api/v1 RETURNS 404 IN BROWSER</b>", table_header)],
        [Paragraph(
            "<b>Developer Observation:</b> <i>'I opened https://cashall.in/api/v1 in Chrome and got 404 This page could not be found. Is the backend down or missing?'</i><br/><br/>"
            "<b>Authoritative Answer: NO. The backend is 100% ONLINE, CONNECTED TO POSTGRESQL, AND OPERATIONAL.</b><br/>"
            "• <b>Next.js App Router Mechanism:</b> In Next.js 14, routing is strictly mapped to individual files (<code>route.ts</code>). "
            "In our repository, <code>app/api/v1/</code> is a directory containing specialized sub-routes; there is no index <code>app/api/v1/route.ts</code> file. "
            "Therefore, navigating to the folder root <code>/api/v1</code> in a browser will return a 404 error page by design.<br/>"
            "• <b>Live Verification:</b> Navigating to <code>https://www.cashall.in/api/health</code> returns HTTP 200: "
            "<code>{\"status\":\"ok\", \"timestamp\":\"2026-09-01T...\", \"service\":\"CashALL API\", \"environment\":\"production\", \"database\":\"connected\"}</code>.<br/>"
            "• <b>Action for Android Developer:</b> Do not ping the root <code>/api/v1</code> in a browser. "
            "Your Android networking client (Retrofit/Ktor) must invoke the specific sub-path endpoints (e.g. <code>POST /api/v1/agent/login</code>, <code>GET /api/v1/agent/orders</code>, <code>POST /api/v1/quotes/calculate</code>).",
            table_cell
        )]
    ]
    routing_box = Table(routing_box_data, colWidths=[540])
    routing_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BACKGROUND', (0, 1), (-1, -1), INFO_BG),
        ('BOX', (0, 0), (-1, -1), 1, INFO_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(routing_box)
    story.append(Spacer(1, 8))

    # =========================================================================
    # SECTION 2: ANSWERS TO DEVELOPER'S 5 QUESTIONS & BACKEND ROADMAP
    # =========================================================================
    story.append(Paragraph("1. Developer Queries Resolution & Backend Roadmap", h1_style))
    story.append(Paragraph(
        "<b>Question by Developer:</b> <i>'Are we planning to add these APIs in backend? (No PricingRule endpoint, No image-upload endpoint, "
        "No IMEI blocklist, no app-settings endpoint, No agent-side cancel, no arrival event, No Idempotency-Key support)'</i><br/>"
        "<b>Authoritative Answer: YES.</b> Here is the exact status of each item, how to connect today, and our backend deployment roadmap:",
        body_style
    ))

    dev_qa_data = [
        [Paragraph("Developer Query", table_header), Paragraph("Current Codebase Status", table_header), Paragraph("How Android App Connects Today", table_header), Paragraph("Backend Plan & Roadmap", table_header)],
        [
            Paragraph("<b>1. No PricingRule endpoint</b>", table_cell_bold),
            Paragraph("Pricing rules reside in PostgreSQL <code>PricingRule</code> table. The backend does NOT expect mobile app to download raw rules.", table_cell),
            Paragraph("Call <code>POST /api/v1/quotes/calculate</code> with <code>variantId</code> and answers array. Server returns exact valuation.", table_cell),
            Paragraph("<b>NO CODE DUPLICATION.</b> Server executes calculation. If offline mode is required, backend will add <code>GET /catalog/pricing-rules</code>.", table_cell)
        ],
        [
            Paragraph("<b>2. No image-upload endpoint</b>", table_cell_bold),
            Paragraph("<b>ALREADY EXISTS!</b> The developer was unaware: TWO active upload endpoints exist backed by Supabase Storage.", table_cell),
            Paragraph("<b>A:</b> <code>POST /api/v1/storage/upload</code> (QC photos).<br/><b>B:</b> <code>POST /api/v1/agent/upload-payment</code> (UPI proofs).", table_cell),
            Paragraph("Fully supported today. Both accept multipart/form-data and return signed Supabase URLs.", table_cell)
        ],
        [
            Paragraph("<b>3. No IMEI blocklist & app-settings</b>", table_cell_bold),
            Paragraph("<code>ImeiService.verifyIMEI</code> exists in backend but is not linked to active agent route. <code>SystemSetting</code> exists in DB.", table_cell),
            Paragraph("Currently, IMEI is validated during inspection submission in <code>/agent/orders/[id]/inspection</code>.", table_cell),
            Paragraph("<b>PLANNING TO ADD:</b><br/>• <code>POST /api/v1/imei/verify</code><br/>• <code>GET /api/v1/settings/app</code> (min app version, support phone).", table_cell)
        ],
        [
            Paragraph("<b>4. No agent-side cancel & arrival event</b>", table_cell_bold),
            Paragraph("<code>OrderStatus</code> enum has <code>PARTNER_ON_THE_WAY</code> & <code>CANCELLED</code>. Generic <code>POST /orders/[id]/cancel</code> exists.", table_cell),
            Paragraph("For cancellations today, mobile app calls <code>POST /api/v1/orders/[id]/cancel</code> with <code>{\"reason\": \"...\"}</code>.", table_cell),
            Paragraph("<b>PLANNING TO ADD:</b><br/>• <code>POST /agent/orders/[id]/pickup-failed</code><br/>• <code>PATCH /agent/orders/[id]/status</code> (arrival events).", table_cell)
        ],
        [
            Paragraph("<b>5. No Idempotency-Key support</b>", table_cell_bold),
            Paragraph("Backend currently does not inspect <code>Idempotency-Key</code> header on payment mutations.", table_cell),
            Paragraph("Android App must start sending <code>Idempotency-Key: &lt;UUIDv4&gt;</code> immediately and disable button on tap.", table_cell),
            Paragraph("<b>PLANNING TO ADD:</b> Server-side idempotency middleware caching responses by key in PostgreSQL.", table_cell)
        ]
    ]
    dev_qa_table = Table(dev_qa_data, colWidths=[90, 140, 150, 160])
    dev_qa_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(dev_qa_table)
    story.append(Spacer(1, 8))

    # =========================================================================
    # SECTION 3: COMPLETE ACTIVE API INVENTORY
    # =========================================================================
    story.append(Paragraph("2. Complete Active API Inventory for Partner App", h1_style))
    story.append(Paragraph(
        "Below is the complete inventory of live production APIs that the Android developer should connect with:",
        body_style
    ))

    api_data = [
        [Paragraph("Method", table_header), Paragraph("Endpoint", table_header), Paragraph("Purpose", table_header), Paragraph("Auth", table_header), Paragraph("Caller", table_header), Paragraph("Status", table_header), Paragraph("Mobile Need", table_header)],
        [Paragraph("POST", code_inline), Paragraph("<code>/api/v1/agent/login</code>", code_inline), Paragraph("Field agent login with phone & password", table_cell), Paragraph("None", table_cell), Paragraph("Agent", table_cell), Paragraph("EXISTS", badge_prod), Paragraph("CRITICAL", table_cell_bold)],
        [Paragraph("GET", code_inline), Paragraph("<code>/api/v1/agent/orders</code>", code_inline), Paragraph("Fetch assigned doorstep orders", table_cell), Paragraph("Query param", table_cell), Paragraph("Agent", table_cell), Paragraph("EXISTS", badge_prod), Paragraph("CRITICAL", table_cell_bold)],
        [Paragraph("POST", code_inline), Paragraph("<code>/api/v1/agent/orders/[id]/inspection</code>", code_inline), Paragraph("Submit physical inspection & set offer", table_cell), Paragraph("None", table_cell), Paragraph("Agent", table_cell), Paragraph("EXISTS", badge_prod), Paragraph("CRITICAL", table_cell_bold)],
        [Paragraph("POST", code_inline), Paragraph("<code>/api/v1/agent/upload-payment</code>", code_inline), Paragraph("Upload UPI screenshot & 12-digit UTR", table_cell), Paragraph("None", table_cell), Paragraph("Agent", table_cell), Paragraph("EXISTS", badge_prod), Paragraph("CRITICAL", table_cell_bold)],
        [Paragraph("POST", code_inline), Paragraph("<code>/api/v1/agent/orders/[id]/complete</code>", code_inline), Paragraph("Complete order, sync Sheets & email bill", table_cell), Paragraph("None", table_cell), Paragraph("Agent", table_cell), Paragraph("EXISTS", badge_prod), Paragraph("CRITICAL", table_cell_bold)],
        [Paragraph("POST", code_inline), Paragraph("<code>/api/v1/storage/upload</code>", code_inline), Paragraph("Upload QC device inspection photos", table_cell), Paragraph("Bearer Token", table_cell), Paragraph("User/Agent", table_cell), Paragraph("EXISTS", badge_prod), Paragraph("HIGH", table_cell_bold)],
        [Paragraph("POST", code_inline), Paragraph("<code>/api/v1/quotes/calculate</code>", code_inline), Paragraph("Run backend pricing engine algorithm", table_cell), Paragraph("None", table_cell), Paragraph("Public/Agent", table_cell), Paragraph("EXISTS", badge_prod), Paragraph("CRITICAL", table_cell_bold)],
        [Paragraph("GET/POST", code_inline), Paragraph("<code>/api/v1/orders/[id]/generate-bill</code>", code_inline), Paragraph("Retrieve structured legal bill / PDF data", table_cell), Paragraph("None", table_cell), Paragraph("Public/Agent", table_cell), Paragraph("EXISTS", badge_prod), Paragraph("HIGH", table_cell_bold)],
        [Paragraph("GET", code_inline), Paragraph("<code>/api/v1/catalog/questions</code>", code_inline), Paragraph("Fetch condition questions & options matrix", table_cell), Paragraph("None", table_cell), Paragraph("Public/Agent", table_cell), Paragraph("EXISTS", badge_prod), Paragraph("HIGH", table_cell_bold)],
        [Paragraph("POST", code_inline), Paragraph("<code>/api/v1/orders/[id]/cancel</code>", code_inline), Paragraph("Cancel order / unassigned pickup", table_cell), Paragraph("None", table_cell), Paragraph("Public/Agent", table_cell), Paragraph("EXISTS", badge_prod), Paragraph("HIGH", table_cell_bold)]
    ]
    api_table = Table(api_data, colWidths=[42, 135, 120, 58, 55, 65, 65])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 8))

    # =========================================================================
    # SECTION 4: DETAILED API CONTRACTS & COPY-PASTE SPECIFICATIONS
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. Detailed API Contracts & Copy-Paste Technical Specifications", h1_style))
    story.append(Paragraph(
        "Below are the complete, exact HTTP contracts for every endpoint the Android developer must call, "
        "including headers, curl examples, JSON requests, and response payloads:",
        body_style
    ))

    # API 1: AGENT LOGIN
    story.append(Paragraph("3.1 Agent Authentication: <code>POST /api/v1/agent/login</code>", h2_style))
    story.append(Paragraph(
        "<b>Headers:</b> <code>Content-Type: application/json</code><br/>"
        "<b>Curl Example:</b><br/>"
        "<code>curl -X POST https://www.cashall.in/api/v1/agent/login -H 'Content-Type: application/json' -d '{\"name\":\"SANGEET SHAW\", \"password\":\"6289477287\"}'</code><br/>"
        "<b>Request Body:</b><br/>"
        "<code>{\"name\": \"SANGEET SHAW\", \"password\": \"6289477287\"}</code><br/>"
        "<b>Success Response (HTTP 200):</b><br/>"
        "<code>{\"success\": true, \"token\": \"tok_agent_sangeetshaw_1725261890\", \"agent\": {\"id\": \"agent_sangeet_shaw\", \"name\": \"SANGEET SHAW\", \"email\": \"sangeetshaw39@gmail.com\", \"phone\": \"6289477287\", \"role\": \"AGENT\"}}</code><br/>"
        "<b>Android Handling:</b> Store <code>token</code> in EncryptedSharedPreferences. Transmit as <code>Authorization: Bearer &lt;token&gt;</code> on subsequent requests.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # API 2: AGENT ORDERS
    story.append(Paragraph("3.2 Fetch Assigned Orders: <code>GET /api/v1/agent/orders</code>", h2_style))
    story.append(Paragraph(
        "<b>Query Params:</b> <code>agentId</code> or <code>phone</code> or <code>name</code><br/>"
        "<b>Headers:</b> <code>Authorization: Bearer &lt;token&gt;</code><br/>"
        "<b>Curl Example:</b><br/>"
        "<code>curl -X GET 'https://www.cashall.in/api/v1/agent/orders?phone=6289477287' -H 'Authorization: Bearer &lt;token&gt;'</code><br/>"
        "<b>Success Response (HTTP 200):</b><br/>"
        "<code>{\"success\": true, \"orders\": [{\"id\": \"b1a2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d\", \"orderNumber\": \"CA36738\", \"customerName\": \"Rahul Sharma\", \"customerPhone\": \"9876543210\", \"customerEmail\": \"rahul@gmail.com\", \"deviceName\": \"Apple iPhone 13 (128 GB)\", \"estimatedPrice\": 28000, \"finalPrice\": null, \"address\": \"Flat 402, Green Heights, Salt Lake, Kolkata - 700091\", \"pickupDate\": \"Today\", \"pickupTimeSlot\": \"2:00 PM - 4:00 PM\", \"status\": \"PARTNER_ASSIGNED\", \"paymentStatus\": \"PENDING\", \"selectedAnswersJson\": \"{\\\"screen\\\":\\\"flawless\\\",\\\"body\\\":\\\"minor_scratches\\\"}\", \"breakdownJson\": \"[...]\"}]}</code>",
        body_style
    ))
    story.append(Spacer(1, 4))

    # API 3: INSPECTION
    story.append(Paragraph("3.3 Submit Inspection Findings: <code>POST /api/v1/agent/orders/[id]/inspection</code>", h2_style))
    story.append(Paragraph(
        "<b>Path Param:</b> <code>id</code> = Order UUID or orderNumber (e.g. <code>CA36738</code>)<br/>"
        "<b>Headers:</b> <code>Content-Type: application/json</code>, <code>Authorization: Bearer &lt;token&gt;</code><br/>"
        "<b>Request Body:</b><br/>"
        "<code>{\"imei\": \"356938114059123\", \"screenFinding\": \"minor_scratches\", \"bodyFinding\": \"flawless\", \"inspectedAnswers\": {\"q-warranty\": \"o-w-no\", \"q-scratches\": \"o-sc-1-2\"}, \"revisedPrice\": 26500, \"reason\": \"Screen has hairline scratches\", \"customerEmail\": \"rahul@gmail.com\", \"agentName\": \"SANGEET SHAW\"}</code><br/>"
        "<b>Success Response (HTTP 200):</b><br/>"
        "<code>{\"success\": true, \"message\": \"Physical inspection completed! Final payout offer locked at ₹26,500.\", \"order\": {\"id\": \"b1a2c3d4-...\", \"orderNumber\": \"CA36738\", \"status\": \"ACCEPTED\", \"finalPrice\": 26500}}</code>",
        body_style
    ))
    story.append(Spacer(1, 4))

    # API 4: PRICING ENGINE RECALCULATION
    story.append(Paragraph("3.4 Dynamic Pricing Valuation: <code>POST /api/v1/quotes/calculate</code>", h2_style))
    story.append(Paragraph(
        "<b>Headers:</b> <code>Content-Type: application/json</code><br/>"
        "<b>Request Body:</b><br/>"
        "<code>{\"variantId\": \"v-iphone-13-128\", \"answers\": [{\"questionId\": \"q-screen-defect\", \"questionTitle\": \"Screen Defect\", \"group\": \"SCREEN\", \"optionId\": \"o-s-cracked\", \"optionLabel\": \"Cracked Glass\"}]}</code><br/>"
        "<b>Success Response (HTTP 200):</b><br/>"
        "<code>{\"success\": true, \"data\": {\"basePrice\": 28000, \"totalDeductions\": 6000, \"totalBonuses\": 0, \"estimatedPrice\": 22000, \"breakdown\": [{\"category\": \"SCREEN\", \"title\": \"Screen Defect\", \"selection\": \"Cracked Glass\", \"amount\": -6000}]}}</code><br/>"
        "<i>Note: Call this endpoint whenever the agent alters defect questions at the doorstep. Never code pricing formulas inside Android.</i>",
        body_style
    ))
    story.append(Spacer(1, 4))

    # API 5: QC PHOTO UPLOAD
    story.append(Paragraph("3.5 Upload QC Inspection Photos: <code>POST /api/v1/storage/upload</code>", h2_style))
    story.append(Paragraph(
        "<b>Headers:</b> <code>Content-Type: multipart/form-data</code>, <code>Authorization: Bearer &lt;token&gt;</code><br/>"
        "<b>Form Data Fields:</b><br/>"
        "• <code>file</code>: Binary file (JPEG/PNG/WebP, max 5MB)<br/>"
        "• <code>bucket</code>: <code>qc-reports</code><br/>"
        "• <code>orderId</code>: <code>b1a2c3d4-e5f6-...</code> (Order UUID)<br/>"
        "<b>Success Response (HTTP 200):</b><br/>"
        "<code>{\"success\": true, \"data\": {\"path\": \"agent_id/unique-uuid.jpg\", \"url\": \"https://jqysknhobtpcbyyltnfc.supabase.co/storage/v1/object/sign/qc-reports/...\"}}</code>",
        body_style
    ))
    story.append(Spacer(1, 4))

    # API 6: PAYMENT SCREENSHOT UPLOAD
    story.append(Paragraph("3.6 Upload UPI Payment Proof: <code>POST /api/v1/agent/upload-payment</code>", h2_style))
    story.append(Paragraph(
        "<b>Headers:</b> <code>Content-Type: multipart/form-data</code>, <code>Idempotency-Key: &lt;UUIDv4&gt;</code><br/>"
        "<b>Form Data Fields:</b><br/>"
        "• <code>file</code>: Binary image (UPI payment confirmation screenshot)<br/>"
        "• <code>orderId</code>: <code>CA36738</code> (or Order UUID)<br/>"
        "• <code>urn</code>: <code>424918274012</code> (12-digit bank UTR reference number)<br/>"
        "• <code>agentId</code>: <code>agent_sangeet_shaw</code><br/>"
        "<b>Success Response (HTTP 200):</b><br/>"
        "<code>{\"success\": true, \"message\": \"Payment screenshot & 12-digit URN uploaded and saved.\", \"urn\": \"424918274012\", \"paymentScreenshotUrl\": \"https://jqysknhobtpcbyyltnfc.supabase.co/storage/v1/object/sign/payment-screenshots/...\"}</code>",
        body_style
    ))
    story.append(Spacer(1, 4))

    # API 7: ORDER COMPLETE
    story.append(Paragraph("3.7 Complete Order & Email Bill: <code>POST /api/v1/agent/orders/[id]/complete</code>", h2_style))
    story.append(Paragraph(
        "<b>Path Param:</b> <code>id</code> = Order UUID or orderNumber (e.g. <code>CA36738</code>)<br/>"
        "<b>Headers:</b> <code>Content-Type: application/json</code>, <code>Idempotency-Key: &lt;UUIDv4&gt;</code><br/>"
        "<b>Request Body:</b><br/>"
        "<code>{\"finalPrice\": 26500, \"utr\": \"424918274012\", \"agentName\": \"SANGEET SHAW\"}</code><br/>"
        "<b>Success Response (HTTP 200):</b><br/>"
        "<code>{\"success\": true, \"message\": \"Order #CA36738 marked COMPLETED. Tax invoice PDF emailed to rahul@gmail.com.\", \"order\": {\"orderNumber\": \"CA36738\", \"status\": \"COMPLETED\", \"finalPrice\": 26500, \"urn\": \"424918274012\"}}</code><br/>"
        "<i>Server Automation: Automatically sets Order status to COMPLETED, marks Payment as PAID, writes row to Google Sheets, and emails official invoice.</i>",
        body_style
    ))
    story.append(Spacer(1, 4))

    # API 8: GENERATE BILL
    story.append(Paragraph("3.8 Retrieve Legal Purchase Receipt / Bill: <code>GET /api/v1/orders/[id]/generate-bill</code>", h2_style))
    story.append(Paragraph(
        "<b>Path Param:</b> <code>id</code> = Order UUID or orderNumber (e.g. <code>CA36738</code>)<br/>"
        "<b>Success Response (HTTP 200):</b><br/>"
        "<code>{\"success\": true, \"data\": {\"billData\": {\"billNumber\": \"CA36738_2026\", \"orderNumber\": \"CA36738\", \"seller\": {\"name\": \"Rahul Sharma\", \"phone\": \"9876543210\", \"address\": \"Kolkata, WB\"}, \"buyer\": {\"name\": \"AARNA ENTERPRISE\", \"platform\": \"CashALL Platform\", \"gstin\": \"19AVPPG9800JIZ3\", \"address\": \"Howrah, West Bengal\"}, \"device\": {\"deviceName\": \"Apple iPhone 13 (128 GB)\", \"imei1\": \"356938114059123\"}, \"financials\": {\"finalPurchasePrice\": 26500, \"utrNumber\": \"424918274012\", \"paymentStatus\": \"PAID\"}, \"declarations\": {\"sellerDeclarationText\": \"This is a computer-generated receipt issued by CashALL. The seller has voluntarily sold the device at the agreed final price...\"}}}}</code><br/>"
        "<i>Use for on-screen receipt display or printing via Bluetooth thermal printer.</i>",
        body_style
    ))
    story.append(Spacer(1, 4))

    # API 9: CANCEL
    story.append(Paragraph("3.9 Order Cancellation: <code>POST /api/v1/orders/[id]/cancel</code>", h2_style))
    story.append(Paragraph(
        "<b>Path Param:</b> <code>id</code> = Order UUID or orderNumber (e.g. <code>CA36738</code>)<br/>"
        "<b>Headers:</b> <code>Content-Type: application/json</code><br/>"
        "<b>Request Body:</b> <code>{\"reason\": \"Customer refused doorstep price offer / not available\"}</code><br/>"
        "<b>Success Response (HTTP 200):</b> <code>{\"success\": true, \"message\": \"Order successfully cancelled.\", \"data\": {\"order\": {\"status\": \"CANCELLED\"}}}</code>",
        body_style
    ))

    # =========================================================================
    # SECTION 5: PRICING ENGINE ARCHITECTURE & SINGLE SOURCE OF TRUTH
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. Single Source of Truth: Pricing Engine Architecture", h1_style))
    story.append(Paragraph(
        "<b>CRITICAL DIRECTIVE: DO NOT CODE INDEPENDENT VALUATION LOGIC IN ANDROID.</b><br/>"
        "The Partner App must calculate identical prices to the CashALL website. Both must share the backend PostgreSQL pricing rules.",
        body_style
    ))
    story.append(Paragraph(
        "<b>1. Where Pricing Logic Lives:</b><br/>"
        "• <b>Database Table:</b> <code>PricingRule</code> in Supabase PostgreSQL (AWS Mumbai).<br/>"
        "• <b>Backend Service:</b> <code>lib/services/pricing.service.ts</code> -> <code>PricingService.calculateQuote(variantId, answers)</code>.<br/>"
        "• <b>Live Endpoint:</b> <code>POST https://www.cashall.in/api/v1/quotes/calculate</code>.<br/><br/>"
        "<b>2. Mathematical Rules Executed by the Engine:</b><br/>"
        "• <b>Base Price:</b> Retrieved from <code>DeviceVariant.basePrice</code>.<br/>"
        "• <b>Percentage Deductions:</b> <code>deduction = -(basePrice * rule.adjustmentValue) / 100</code>.<br/>"
        "• <b>Fixed Deductions:</b> <code>deduction = -rule.adjustmentValue</code>.<br/>"
        "• <b>Fixed Bonuses:</b> <code>bonus = +rule.adjustmentValue</code>.<br/>"
        "• <b>Floor Price Rule:</b> <code>finalPrice = Math.max(500, Math.round(basePrice * 0.15), rawEstimated)</code>.<br/><br/>"
        "<b>3. Mobile App Integration Pattern:</b><br/>"
        "When the field agent toggles a screen crack, body dent, or missing box at the doorstep, the Android app makes a lightweight HTTP POST to "
        "<code>/api/v1/quotes/calculate</code> and displays the returned <code>estimatedPrice</code> and <code>breakdown</code>. "
        "This guarantees 100% price parity with the customer's web quote.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # =========================================================================
    # SECTION 6: SUPABASE ARCHITECTURE & MOBILE ACCESS RULES
    # =========================================================================
    story.append(Paragraph("5. Supabase Architecture & Mobile Access Rules", h1_style))
    story.append(Paragraph(
        "<b>CRITICAL SECURITY RULE: The Partner Android App must communicate SOLELY via CashALL Next.js API routes (Option A). "
        "The mobile app MUST NEVER directly connect to Supabase PostgreSQL or use the Supabase Service Role Key.</b>",
        body_style
    ))

    supa_cred_data = [
        [Paragraph("Configuration / Credential Name", table_header), Paragraph("Classification", table_header), Paragraph("Mobile App Handling Rule", table_header)],
        [Paragraph("<code>NEXT_PUBLIC_SUPABASE_URL</code>", code_inline), Paragraph("PUBLIC CLIENT CONFIG", table_cell_bold), Paragraph("Optional. Only needed if client-side direct SDK used; otherwise NOT required.", table_cell)],
        [Paragraph("<code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>", code_inline), Paragraph("PUBLIC CLIENT CONFIG", table_cell_bold), Paragraph("Restricted by Row Level Security. Only provide if mobile uses Supabase client.", table_cell)],
        [Paragraph("<code>SUPABASE_SERVICE_ROLE_KEY</code>", code_inline), Paragraph("SERVER SECRET", badge_crit), Paragraph("<b>NEVER PROVIDE TO DEVELOPER. NEVER BUNDLE IN APK.</b> Full DB admin bypass.", table_cell)],
        [Paragraph("<code>DATABASE_URL / POSTGRES_PRISMA_URL</code>", code_inline), Paragraph("SERVER SECRET", badge_crit), Paragraph("<b>NEVER PROVIDE TO DEVELOPER.</b> Direct PostgreSQL pool connection string.", table_cell)],
        [Paragraph("<code>SUPABASE_JWT_SECRET</code>", code_inline), Paragraph("SERVER SECRET", badge_crit), Paragraph("<b>NEVER PROVIDE TO DEVELOPER.</b> Used exclusively by server to sign/verify JWTs.", table_cell)],
        [Paragraph("Database Password", code_inline), Paragraph("SERVER SECRET", badge_crit), Paragraph("<b>NEVER PROVIDE TO DEVELOPER.</b> PostgreSQL superuser credential.", table_cell)]
    ]
    supa_table = Table(supa_cred_data, colWidths=[175, 130, 235])
    supa_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(supa_table)
    story.append(Spacer(1, 8))

    # =========================================================================
    # SECTION 7: VERCEL REQUIREMENTS & STAGING
    # =========================================================================
    story.append(Paragraph("6. Vercel Requirements & Staging Environment", h1_style))
    story.append(Paragraph(
        "<b>Vercel Access:</b><br/>"
        "<b>\"Partner App developer only needs the production API URL; Vercel access is not required.\"</b><br/>"
        "The developer compiles native Android code. Serverless routing and backend deployments are managed by the CashALL engineering team.<br/><br/>"
        "<b>Staging Environment Status:</b><br/>"
        "<b>\"No separate staging environment is currently configured.\"</b><br/>"
        "The project operates on a single production branch (<code>main</code>) with one PostgreSQL database. "
        "During mobile development, the developer must test against <code>https://www.cashall.in/api/v1</code> using dedicated test orders prefixed "
        "<code>#TEST_...</code> assigned to the test agent account (<code>SANGEET SHAW</code>) to avoid polluting production accounting.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # =========================================================================
    # SECTION 8: EXACT ACCESS CHECKLIST (GIVE VS DO NOT GIVE)
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("7. Exact Access Checklist: What to Give vs What NOT to Give", h1_style))

    access_data = [
        [Paragraph("Category", table_header), Paragraph("Resource / Credential Item", table_header), Paragraph("Action", table_header), Paragraph("Technical & Security Reason", table_header)],
        [Paragraph("Repository", table_cell), Paragraph("GitHub Access (<code>github.com/cashall7003216788-jpg/CashALL</code>)", table_cell_bold), Paragraph("GIVE", badge_prod), Paragraph("Allows developer to review API request/response models and schemas.", table_cell)],
        [Paragraph("API URL", table_cell), Paragraph("Production API URL: <code>https://www.cashall.in/api/v1</code>", table_cell_bold), Paragraph("GIVE", badge_prod), Paragraph("Base URL for Android HTTP Retrofit/Ktor networking client.", table_cell)],
        [Paragraph("Health Check", table_cell), Paragraph("Server Health URL: <code>https://www.cashall.in/api/health</code>", table_cell_bold), Paragraph("GIVE", badge_prod), Paragraph("Used by mobile app for connectivity and network reachability checks.", table_cell)],
        [Paragraph("Test Accounts", table_cell), Paragraph("Test Agent Account (<code>SANGEET SHAW</code> / <code>6289477287</code>)", table_cell_bold), Paragraph("GIVE", badge_prod), Paragraph("Allows testing login, order listing, inspection, and completion flows.", table_cell)],
        [Paragraph("Test Orders", table_cell), Paragraph("Synthetic Test Orders prefixed <code>TEST_...</code>", table_cell_bold), Paragraph("GIVE", badge_prod), Paragraph("Prevents corrupting live customer accounting during development testing.", table_cell)],
        [Paragraph("Push Services", table_cell), Paragraph("Firebase <code>google-services.json</code> (Client-only)", table_cell_bold), Paragraph("GIVE (If FCM)", badge_mock), Paragraph("Required for FCM push notifications in Android Studio. Contains only public app IDs.", table_cell)],
        [Paragraph("Database", table_cell), Paragraph("<code>DATABASE_URL</code> & PostgreSQL Password", table_cell_bold), Paragraph("DO NOT GIVE", badge_crit), Paragraph("Direct DB connection strings allow bypassing backend business logic.", table_cell)],
        [Paragraph("Supabase Key", table_cell), Paragraph("<code>SUPABASE_SERVICE_ROLE_KEY</code>", table_cell_bold), Paragraph("DO NOT GIVE", badge_crit), Paragraph("Admin bypass key for Supabase RLS and storage. Server secret.", table_cell)],
        [Paragraph("JWT Secret", table_cell), Paragraph("<code>SUPABASE_JWT_SECRET</code>", table_cell_bold), Paragraph("DO NOT GIVE", badge_crit), Paragraph("Private secret used by backend server to generate and verify signatures.", table_cell)],
        [Paragraph("Hosting", table_cell), Paragraph("Vercel Project Access or Personal Access Token", table_cell_bold), Paragraph("DO NOT GIVE", badge_crit), Paragraph("Developer does not manage production cloud deployments.", table_cell)],
        [Paragraph("Admin Operator", table_cell), Paragraph("Admin Portal Credentials (<code>ADMIN_PASSWORD</code>)", table_cell_bold), Paragraph("DO NOT GIVE", badge_crit), Paragraph("Partner developer must never possess administrator portal credentials.", table_cell)]
    ]
    access_table = Table(access_data, colWidths=[65, 175, 80, 220])
    access_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(access_table)
    story.append(Spacer(1, 8))

    # =========================================================================
    # SECTION 9: EXECUTIVE ONE-PAGE DEVELOPER CHECKLIST
    # =========================================================================
    story.append(Paragraph("8. Executive One-Page Developer Handover Summary", h1_style))
    story.append(Paragraph(
        "Copy and paste this final checklist directly to the Android developer:",
        body_style
    ))

    summary_box_data = [
        [Paragraph("<b>CHECKLIST: ITEMS TO HAND OVER TO PARTNER APP DEVELOPER</b>", table_header)],
        [Paragraph("<b>[  ] 1. GitHub Repository:</b> <code>https://github.com/cashall7003216788-jpg/CashALL</code> (Grant Read access).", table_cell)],
        [Paragraph("<b>[  ] 2. Production Base URL:</b> <code>https://www.cashall.in/api/v1</code> (Call specific endpoint sub-paths; do NOT ping <code>/api/v1</code> root).", table_cell)],
        [Paragraph("<b>[  ] 3. Server Health Check URL:</b> <code>https://www.cashall.in/api/health</code> (Returns <code>{\"status\":\"ok\", \"database\":\"connected\"}</code>).", table_cell)],
        [Paragraph("<b>[  ] 4. Test Agent Credentials:</b><br/>&nbsp;&nbsp;&nbsp;&nbsp;• <b>Name:</b> <code>SANGEET SHAW</code><br/>&nbsp;&nbsp;&nbsp;&nbsp;• <b>Phone / Password:</b> <code>6289477287</code> (Master Password: <code>Ank933967@</code>)<br/>&nbsp;&nbsp;&nbsp;&nbsp;• <b>Role:</b> <code>AGENT</code>", table_cell)],
        [Paragraph("<b>[  ] 5. Pricing Engine:</b> Call <code>POST /api/v1/quotes/calculate</code> with defect options. Do not write duplicate pricing formulas in Android.", table_cell)],
        [Paragraph("<b>[  ] 6. Image Uploads:</b> Use <code>POST /api/v1/storage/upload</code> (for QC photos) & <code>POST /api/v1/agent/upload-payment</code> (for UPI proofs).", table_cell)],
        [Paragraph("<b>[  ] 7. Idempotency Header:</b> Transmit <code>Idempotency-Key: &lt;UUIDv4&gt;</code> on payment mutations right now.", table_cell)],
        [Paragraph("<b>[  ] 8. Backend Roadmap:</b> Backend team is deploying <code>pickup-failed</code>, arrival events (<code>status</code>), and <code>settings/app</code> in the current sprint.", table_cell)],
        [Paragraph("<b>[  ] 9. PDF Technical Spec:</b> Provide this complete file <code>CashALL_Partner_App_Backend_Access_and_API_Handoff.pdf</code>.", table_cell)]
    ]
    summary_box = Table(summary_box_data, colWidths=[540])
    summary_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(summary_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    output_filename = sys.argv[1] if len(sys.argv) > 1 else "CashALL_Partner_App_Backend_Access_and_API_Handoff.pdf"
    build_pdf(output_filename)
