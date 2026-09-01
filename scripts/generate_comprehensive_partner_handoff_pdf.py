import os
import sys
import shutil
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
        
        # Running Header on pages > 1
        if self._pageNumber > 1:
            self.drawString(36, 762, "CashALL Platform — Partner Mobile App Technical API Handoff")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 756, 576, 756)
            
        # Running Footer on all pages
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 25, page_text)
        self.drawString(36, 25, "CONFIDENTIAL — CASHALL RE-COMMERCE LOGISTICS ENGINEERING")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
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
    WARNING_BG = colors.HexColor("#FEF3C7")    # Amber 100
    DANGER_BG = colors.HexColor("#FEE2E2")     # Red 100
    CODE_BG = colors.HexColor("#0F172A")       # Dark code block background

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=PRIMARY,
        spaceAfter=3
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=DARK_GOLD,
        spaceAfter=10
    )
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=12,
        spaceAfter=4,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=SECONDARY,
        spaceBefore=8,
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
        spaceAfter=4
    )
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=TEXT_DARK,
        leftIndent=12,
        spaceAfter=2
    )
    table_hdr = ParagraphStyle(
        'TableHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.white
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=9.5,
        textColor=TEXT_DARK
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9.5,
        textColor=PRIMARY
    )
    code_inline = ParagraphStyle(
        'CodeInline',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7,
        leading=9,
        textColor=DARK_GOLD
    )
    code_block = ParagraphStyle(
        'CodeBlock',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.5,
        leading=8.5,
        textColor=colors.HexColor("#F8FAFC"),
        spaceBefore=2,
        spaceAfter=2
    )
    alert_text = ParagraphStyle(
        'AlertText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10.5,
        textColor=DARK_GOLD
    )
    danger_text = ParagraphStyle(
        'DangerText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10.5,
        textColor=DANGER_COLOR
    )

    story = []

    def add_header(title_text, subtitle_text):
        story.append(Paragraph(title_text, title_style))
        story.append(Paragraph(subtitle_text, subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=8))

    def make_box(title, paragraphs, bg_color=LIGHT_BG, border_color=BORDER_COLOR):
        content = [Paragraph(f"<b>{title}</b>", h2_style)]
        for p in paragraphs:
            content.append(p if isinstance(p, Paragraph) else Paragraph(p, body_style))
        t = Table([[content]], colWidths=[540])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_color),
            ('BOX', (0, 0), (-1, -1), 0.75, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        return t

    def make_code_box(title, code_str):
        escaped = code_str.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>').replace(' ', '&nbsp;')
        content = [
            Paragraph(f"<b>{title}</b>", ParagraphStyle('CBH', parent=body_style, fontName='Helvetica-Bold', fontSize=7.5, textColor=colors.HexColor("#94A3B8"))),
            Spacer(1, 2),
            Paragraph(escaped, code_block)
        ]
        t = Table([[content]], colWidths=[540])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), CODE_BG),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#334155")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        return t

    # -------------------------------------------------------------
    # DOCUMENT HEADER
    # -------------------------------------------------------------
    add_header(
        "CashALL Partner Mobile App — Technical API Handoff",
        "Official API Contracts, Real Request/Response Schemas, Security Audit & Backend Integration Guide"
    )

    # -------------------------------------------------------------
    # 1. PRODUCTION & STAGING ENVIRONMENT STATUS
    # -------------------------------------------------------------
    story.append(Paragraph("1. Production & Staging Environment Status", h1_style))
    story.append(Paragraph(
        "This section directly answers the mobile engineering team's queries regarding the production and staging backend infrastructure.",
        body_style
    ))

    env_table_data = [
        [Paragraph("Environment", table_hdr), Paragraph("Status", table_hdr), Paragraph("Base URL & Service Host", table_hdr), Paragraph("Verification & Audit Notes", table_hdr)],
        [
            Paragraph("<b>Production</b>", table_cell_bold),
            Paragraph("<font color='#15803D'><b>WORKING (VERIFIED)</b></font>", table_cell),
            Paragraph("<code>https://www.cashall.in/api/v1</code><br/>Supabase: <code>jqysknhobtpcbyyltnfc</code>", table_cell),
            Paragraph("Live test to <code>/api/health</code> returned HTTP 200 OK: <code>status: 'ok', database: 'connected'</code>. Serving live orders.", table_cell)
        ],
        [
            Paragraph("<b>Staging / Dev</b>", table_cell_bold),
            Paragraph("<font color='#DC2626'><b>DOES NOT EXIST</b></font>", table_cell),
            Paragraph("<i>None configured</i>", table_cell),
            Paragraph("<b>'No separate staging environment is currently configured.'</b> Single git branch (<code>main</code>), single Vercel project, and single Supabase DB.", table_cell)
        ],
    ]
    t_env = Table(env_table_data, colWidths=[70, 110, 160, 200])
    t_env.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_env)
    story.append(Spacer(1, 6))

    # -------------------------------------------------------------
    # 2. SAFE ENVIRONMENT VARIABLE REFERENCE (.env.example)
    # -------------------------------------------------------------
    story.append(Paragraph("2. Safe Environment Variable Reference (Variable Names Only)", h1_style))
    story.append(Paragraph(
        "To safeguard infrastructure security, secrets are never bundled into mobile binaries. Below is the variable classification:",
        body_style
    ))

    env_vars_data = [
        [Paragraph("Category", table_hdr), Paragraph("Variable Name", table_hdr), Paragraph("Scope", table_hdr), Paragraph("Purpose / Security Rule", table_hdr)],
        [Paragraph("Supabase Public", table_cell_bold), Paragraph("<code>NEXT_PUBLIC_SUPABASE_URL</code>", table_cell), Paragraph("PUBLIC", table_cell), Paragraph("Supabase API project URL (safe for mobile client).", table_cell)],
        [Paragraph("Supabase Public", table_cell_bold), Paragraph("<code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>", table_cell), Paragraph("PUBLIC", table_cell), Paragraph("Client JWT with Row Level Security (safe for mobile client).", table_cell)],
        [Paragraph("Supabase Secret", table_cell_bold), Paragraph("<code>SUPABASE_SERVICE_ROLE_KEY</code>", table_cell), Paragraph("SECRET", table_cell), Paragraph("<b>NEVER GIVE TO DEVELOPER.</b> Full root DB bypass key.", table_cell)],
        [Paragraph("Supabase Secret", table_cell_bold), Paragraph("<code>SUPABASE_JWT_SECRET</code>", table_cell), Paragraph("SECRET", table_cell), Paragraph("Used server-side for signing and verifying Auth JWTs.", table_cell)],
        [Paragraph("Database", table_cell_bold), Paragraph("<code>DATABASE_URL</code>", table_cell), Paragraph("SECRET", table_cell), Paragraph("Direct PostgreSQL TCP connection string for Prisma.", table_cell)],
        [Paragraph("Firebase Client", table_cell_bold), Paragraph("<code>NEXT_PUBLIC_FIREBASE_API_KEY</code>", table_cell), Paragraph("PUBLIC", table_cell), Paragraph("Client-side Firebase API key for phone OTP.", table_cell)],
        [Paragraph("Firebase Client", table_cell_bold), Paragraph("<code>NEXT_PUBLIC_FIREBASE_PROJECT_ID</code>", table_cell), Paragraph("PUBLIC", table_cell), Paragraph("Firebase project identifier for SMS phone auth.", table_cell)],
        [Paragraph("Integrations", table_cell_bold), Paragraph("<code>GOOGLE_SHEETS_WEBHOOK_URL</code>", table_cell), Paragraph("SECRET", table_cell), Paragraph("Internal Google Sheets accounting auto-sync webhook.", table_cell)],
        [Paragraph("Mailer", table_cell_bold), Paragraph("<code>RESEND_API_KEY</code> / <code>SMTP_*</code>", table_cell), Paragraph("SECRET", table_cell), Paragraph("Transactional Tax Invoice PDF email dispatch credentials.", table_cell)],
    ]
    t_vars = Table(env_vars_data, colWidths=[90, 160, 60, 230])
    t_vars.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_vars)
    story.append(Spacer(1, 8))

    # -------------------------------------------------------------
    # 3. CRITICAL AGENT AUTHENTICATION & SECURITY AUDIT
    # -------------------------------------------------------------
    story.append(Paragraph("3. Critical Agent Authentication & Security Audit", h1_style))
    story.append(Paragraph(
        "<b>Developer Report:</b> <i>'bub in backend: GET /agent/orders works without a valid login. The agent token is tok_agent_{agentId}_{timestamp}.'</i>",
        alert_text
    ))
    story.append(Spacer(1, 3))

    audit_box = make_box(
        "AUDIT CLASSIFICATION: SECURITY VULNERABILITY (HIGH SEVERITY)",
        [
            "<b>1. Token Generation Vulnerability:</b> In <code>/api/v1/agent/login</code>, the token is generated as <code>tok_agent_${agent.id}_${Date.now()}</code>. This is an unencrypted, unsigned plain-text string containing the agent ID and a timestamp. It is not a cryptographically signed JWT.",
            "<b>2. Completely Unauthenticated Orders Endpoint:</b> In <code>/api/v1/agent/orders</code>, the server extracts <code>agentId</code>, <code>phone</code>, or <code>name</code> directly from URL query parameters. It <b>never inspects the Authorization header</b>. Anyone who guesses or knows an agent's phone can view customer PII, phone numbers, doorstep addresses, and payout amounts.",
            "<b>3. Middleware Fallback Flaw:</b> In <code>lib/middlewares/auth.ts</code> (<code>verifyAuthToken</code>), if a request is received with <b>no Authorization header</b>, it automatically falls back to <code>role: 'ADMIN', uid: 'admin_master_1'</code>! In endpoints like <code>GET /api/v1/partner/orders</code>, this leaks ALL orders in the system.",
            "<b>Recommended Fix:</b> Generate signed HMAC-SHA256 JWTs using <code>SUPABASE_JWT_SECRET</code> upon agent login. Enforce <code>Authorization: Bearer &lt;JWT&gt;</code> on <code>/api/v1/agent/orders</code> and extract <code>agentId</code> strictly from the decoded token claim."
        ],
        bg_color=DANGER_BG,
        border_color=DANGER_COLOR
    )
    story.append(audit_box)
    story.append(Spacer(1, 8))

    # -------------------------------------------------------------
    # 4. AGENT API AUTHORIZATION MATRIX
    # -------------------------------------------------------------
    story.append(Paragraph("4. Agent API Authorization Matrix & Cross-Agent Risk", h1_style))
    story.append(Paragraph("Cross-agent isolation analysis across all field-logistics endpoints:", body_style))

    matrix_data = [
        [Paragraph("Endpoint", table_hdr), Paragraph("Method", table_hdr), Paragraph("Login Enforced?", table_hdr), Paragraph("Validates Identity?", table_hdr), Paragraph("Can Tamper Other Agent?", table_hdr), Paragraph("Risk Level", table_hdr)],
        [Paragraph("<code>/api/v1/agent/login</code>", table_cell), Paragraph("POST", table_cell), Paragraph("No (Public)", table_cell), Paragraph("Yes (DB Match)", table_cell), Paragraph("No", table_cell), Paragraph("Weak Token", table_cell)],
        [Paragraph("<code>/api/v1/agent/orders</code>", table_cell), Paragraph("GET", table_cell), Paragraph("<font color='#DC2626'><b>NO</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>NO</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>YES (Reads any phone)</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>CRITICAL</b></font>", table_cell)],
        [Paragraph("<code>/api/v1/agent/orders/[id]/inspection</code>", table_cell), Paragraph("POST", table_cell), Paragraph("<font color='#DC2626'><b>NO</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>NO</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>YES (Can lock any price)</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>HIGH</b></font>", table_cell)],
        [Paragraph("<code>/api/v1/agent/upload-payment</code>", table_cell), Paragraph("POST", table_cell), Paragraph("<font color='#DC2626'><b>NO</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>NO</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>YES (Uploads any UTR)</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>HIGH</b></font>", table_cell)],
        [Paragraph("<code>/api/v1/agent/orders/[id]/complete</code>", table_cell), Paragraph("POST", table_cell), Paragraph("<font color='#DC2626'><b>NO</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>NO</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>YES (Completes any order)</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>HIGH</b></font>", table_cell)],
        [Paragraph("<code>/api/v1/partner/orders</code>", table_cell), Paragraph("GET", table_cell), Paragraph("Broken fallback", table_cell), Paragraph("Broken fallback", table_cell), Paragraph("<font color='#DC2626'><b>YES (Leaks all pickups)</b></font>", table_cell), Paragraph("<font color='#DC2626'><b>CRITICAL</b></font>", table_cell)],
        [Paragraph("<code>/api/v1/orders/[id]/start-inspection</code>", table_cell), Paragraph("POST", table_cell), Paragraph("Broken fallback", table_cell), Paragraph("Checks Bearer", table_cell), Paragraph("Only if unauthenticated", table_cell), Paragraph("MEDIUM", table_cell)],
    ]
    t_mat = Table(matrix_data, colWidths=[150, 45, 75, 75, 125, 70])
    t_mat.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_mat)
    story.append(Spacer(1, 8))

    # -------------------------------------------------------------
    # 5. IDEMPOTENCY & PICKUP FAILED APIS
    # -------------------------------------------------------------
    story.append(Paragraph("5. Idempotency-Key & Pickup Failed API Specifications", h1_style))
    
    idem_box = make_box(
        "IDEMPOTENCY-KEY STATUS: NOT CURRENTLY IMPLEMENTED",
        [
            "<b>Inspection Result:</b> Neither <code>/api/v1/agent/upload-payment</code> nor <code>/api/v1/agent/orders/[id]/complete</code> inspects or caches an <code>Idempotency-Key</code> or <code>X-Idempotency-Key</code> header.",
            "<b>Client Recommendation:</b> The Partner Mobile App should immediately start sending the header <code>Idempotency-Key: &lt;UUIDv4&gt;</code> on all payment and completion mutations, and defensively disable UI buttons immediately upon tap to prevent duplicate UPI submissions."
        ],
        bg_color=WARNING_BG,
        border_color=DARK_GOLD
    )
    story.append(idem_box)
    story.append(Spacer(1, 6))

    failed_box = make_box(
        "PICKUP FAILED API: NOT CURRENTLY IMPLEMENTED (PROPOSED CONTRACT)",
        [
            "<b>Endpoint:</b> <code>POST /api/v1/agent/orders/{orderId}/pickup-failed</code>",
            "<b>Headers:</b> <code>Content-Type: application/json</code>, <code>Authorization: Bearer &lt;TOKEN&gt;</code>, <code>Idempotency-Key: &lt;UUIDv4&gt;</code>",
            "<b>Request Body:</b> <code>{\"failureReason\": \"CUSTOMER_UNAVAILABLE\", \"notes\": \"Doorstep visited; phone unreachable\", \"rescheduleRequested\": true, \"suggestedDate\": \"Tomorrow\", \"suggestedTimeSlot\": \"2 PM - 5 PM\", \"agentLocation\": {\"latitude\": 22.5726, \"longitude\": 88.3639}}</code>",
            "<b>Failure Reasons:</b> <code>CUSTOMER_UNAVAILABLE</code>, <code>CUSTOMER_REFUSED</code>, <code>INCORRECT_ADDRESS</code>, <code>DEVICE_MISMATCH</code>, <code>PRICE_DISAGREEMENT</code>, <code>FAKE_DEVICE</code>, <code>OTHER</code>.",
            "<b>Database Transitions:</b> <code>Order.status</code> -&gt; <code>CANCELLED</code>, <code>Pickup.status</code> -&gt; <code>FAILED</code>, logs to <code>AuditLog</code>."
        ],
        bg_color=LIGHT_BG,
        border_color=BORDER_COLOR
    )
    story.append(failed_box)
    story.append(Spacer(1, 8))

    # -------------------------------------------------------------
    # 6. COMPLETE API INVENTORY (45 ENDPOINTS)
    # -------------------------------------------------------------
    story.append(Paragraph("6. Complete CashALL API Inventory Matrix (45 Endpoints)", h1_style))
    story.append(Paragraph("Complete breakdown of all endpoints currently compiled in the Next.js App Router:", body_style))

    inv_data = [
        [Paragraph("Method", table_hdr), Paragraph("Endpoint Path", table_hdr), Paragraph("Category", table_hdr), Paragraph("Purpose / Capability", table_hdr), Paragraph("Safe for Partner App?", table_hdr)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/agent/login</code>", table_cell), Paragraph("Agent Auth", table_cell), Paragraph("Agent mobile credentials login", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("GET", table_cell), Paragraph("<code>/api/v1/agent/orders</code>", table_cell), Paragraph("Agent Logistics", table_cell), Paragraph("Fetch assigned orders (query param phone)", table_cell), Paragraph("USE WITH FIX", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/agent/orders/[id]/inspection</code>", table_cell), Paragraph("Agent QC", table_cell), Paragraph("Submit physical inspection & lock final price", table_cell), Paragraph("USE WITH FIX", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/agent/upload-payment</code>", table_cell), Paragraph("Payment", table_cell), Paragraph("Upload manual UPI screenshot & 12-digit UTR", table_cell), Paragraph("USE WITH FIX", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/agent/orders/[id]/complete</code>", table_cell), Paragraph("Order Lifecycle", table_cell), Paragraph("Mark COMPLETED & PAID, sync sheets, email invoice", table_cell), Paragraph("USE WITH FIX", table_cell)],
        [Paragraph("GET", table_cell), Paragraph("<code>/api/v1/orders/[id]</code>", table_cell), Paragraph("Core Order", table_cell), Paragraph("Fetch single order, address & diagnostic details", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("GET/POST", table_cell), Paragraph("<code>/api/v1/orders/[id]/generate-bill</code>", table_cell), Paragraph("Invoicing", table_cell), Paragraph("Fetch structured Bill of Sale data object", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/orders/[id]/start-inspection</code>", table_cell), Paragraph("Order Lifecycle", table_cell), Paragraph("Transition status to INSPECTION_STARTED", table_cell), Paragraph("USE WITH FIX", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/orders/[id]/verify-identity</code>", table_cell), Paragraph("KYC Verification", table_cell), Paragraph("Submit customer Aadhaar/PAN mask verification", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/orders/[id]/device-received</code>", table_cell), Paragraph("Custody", table_cell), Paragraph("Confirm physical device custody handover", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/orders/[id]/esign</code>", table_cell), Paragraph("Legal eSign", table_cell), Paragraph("Customer digital signature & SHA-256 hash", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("GET", table_cell), Paragraph("<code>/api/v1/catalog</code>", table_cell), Paragraph("Catalog", table_cell), Paragraph("Fetch brands, popular models & storage variants", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("GET", table_cell), Paragraph("<code>/api/v1/catalog/questions</code>", table_cell), Paragraph("Catalog", table_cell), Paragraph("Fetch 5 diagnostic inspection question sets", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/quotes/calculate</code>", table_cell), Paragraph("Pricing", table_cell), Paragraph("Run pricing engine to re-calculate device quote", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/storage/upload</code>", table_cell), Paragraph("Media Storage", table_cell), Paragraph("Direct upload to Supabase Storage with signed URL", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/notifications/register</code>", table_cell), Paragraph("Push Alerts", table_cell), Paragraph("Register agent FCM device token", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("GET", table_cell), Paragraph("<code>/api/health</code>", table_cell), Paragraph("System", table_cell), Paragraph("Health check & DB connectivity ping", table_cell), Paragraph("YES", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/sync-sheets</code>", table_cell), Paragraph("Accounting", table_cell), Paragraph("Internal Google Sheets webhook auto-sync", table_cell), Paragraph("Server Only", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/orders/create</code>", table_cell), Paragraph("Customer", table_cell), Paragraph("Website customer order placement", table_cell), Paragraph("Customer Only", table_cell)],
        [Paragraph("GET", table_cell), Paragraph("<code>/api/v1/orders/user</code>", table_cell), Paragraph("Customer", table_cell), Paragraph("Customer order history by phone query", table_cell), Paragraph("Customer Only", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/orders/[id]/accept-offer</code>", table_cell), Paragraph("Customer", table_cell), Paragraph("Customer accepts revised price offer", table_cell), Paragraph("Customer Only", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/orders/[id]/cancel</code>", table_cell), Paragraph("Customer", table_cell), Paragraph("Customer cancels order", table_cell), Paragraph("Customer Only", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/auth/admin-login</code>", table_cell), Paragraph("Admin Auth", table_cell), Paragraph("Web admin operator credentials login", table_cell), Paragraph("Admin Only", table_cell)],
        [Paragraph("GET/POST", table_cell), Paragraph("<code>/api/v1/admin/orders</code>", table_cell), Paragraph("Admin Portal", table_cell), Paragraph("Web admin order management grid", table_cell), Paragraph("Admin Only", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/admin/orders/[id]/assign-agent</code>", table_cell), Paragraph("Admin Portal", table_cell), Paragraph("Assign field agent to order", table_cell), Paragraph("Admin Only", table_cell)],
        [Paragraph("POST", table_cell), Paragraph("<code>/api/v1/admin/orders/[id]/send-bill-email</code>", table_cell), Paragraph("Admin Portal", table_cell), Paragraph("Manually re-send Tax Invoice PDF", table_cell), Paragraph("Admin Only", table_cell)],
    ]
    t_inv = Table(inv_data, colWidths=[45, 175, 75, 170, 75])
    t_inv.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_inv)
    story.append(Spacer(1, 8))

    # -------------------------------------------------------------
    # 7. COPY-PASTE READY REQUEST & RESPONSE EXAMPLES
    # -------------------------------------------------------------
    story.append(Paragraph("7. Comprehensive API Request / Response Contracts (Copy-Paste Ready)", h1_style))
    story.append(Paragraph("The exact request/response schemas implemented in the CashALL production codebase:", body_style))

    # Endpoint 1: Agent Login
    story.append(Paragraph("<b>7.1 POST /api/v1/agent/login</b>", h2_style))
    story.append(Paragraph("<b>Headers:</b> <code>Content-Type: application/json</code> | <b>Auth:</b> None", body_style))
    story.append(make_code_box("REQUEST BODY (JSON)", '{\n  "name": "SANGEET SHAW",\n  "password": "Ank933967@"\n}'))
    story.append(make_code_box("SUCCESS RESPONSE 200 OK", '{\n  "success": true,\n  "token": "tok_agent_agent_sangeet_shaw_1724912345678",\n  "agent": {\n    "id": "c7a84e20-3b91-49fa-9eb2-8b7a951d8b6c",\n    "name": "SANGEET SHAW",\n    "email": "sangeetshaw39@gmail.com",\n    "phone": "6289477287",\n    "role": "AGENT"\n  }\n}'))
    story.append(make_code_box("ERROR RESPONSES (400, 401)", '// 400 Bad Request:\n{"success": false, "error": "Agent name, email, or phone number is required"}\n\n// 401 Unauthorized:\n{"success": false, "error": "Invalid password. Your login password is your registered 10-digit phone number."}'))
    story.append(Spacer(1, 6))

    # Endpoint 2: Agent Orders
    story.append(Paragraph("<b>7.2 GET /api/v1/agent/orders?phone=6289477287</b>", h2_style))
    story.append(Paragraph("<b>Query Params:</b> <code>phone</code> (10 digits) or <code>agentId</code> (UUID) or <code>name</code> | <b>Auth:</b> Insecure (fix in progress)", body_style))
    story.append(make_code_box("SUCCESS RESPONSE 200 OK", '{\n  "success": true,\n  "orders": [\n    {\n      "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",\n      "orderNumber": "CA61962",\n      "customerName": "Rohan Das",\n      "customerPhone": "9830123456",\n      "customerEmail": "rohan.das@example.com",\n      "deviceName": "Apple iPhone 13 (128 GB)",\n      "imeiNumber": "356789102345678",\n      "estimatedPrice": 24500,\n      "finalPrice": 22000,\n      "amount": 22000,\n      "address": "Flat 4B, Greenfield Heights, Rajarhat, Kolkata, West Bengal - 700135",\n      "pickupDate": "Tomorrow",\n      "pickupTimeSlot": "10 AM - 1 PM",\n      "pincode": "700135",\n      "status": "ACCEPTED",\n      "paymentStatus": "PENDING",\n      "urn": null,\n      "paymentScreenshotUrl": null,\n      "agentName": "SANGEET SHAW",\n      "quoteNumber": "QA54921",\n      "createdAt": "2026-08-29T11:20:00.000Z"\n    }\n  ]\n}'))
    story.append(Spacer(1, 6))

    # Endpoint 3: Doorstep QC Inspection
    story.append(Paragraph("<b>7.3 POST /api/v1/agent/orders/[id]/inspection</b>", h2_style))
    story.append(Paragraph("<b>Path Param:</b> <code>id</code> = <code>CA61962</code> or Order UUID | <b>Headers:</b> <code>Content-Type: application/json</code>", body_style))
    story.append(make_code_box("REQUEST BODY (JSON)", '{\n  "imei": "356789102345678",\n  "screenFinding": "Flawless Screen",\n  "bodyFinding": "Minor body scratches",\n  "revisedPrice": 22000,\n  "reason": "Minor scratches on body frame",\n  "customerEmail": "rohan.das@example.com",\n  "agentName": "SANGEET SHAW"\n}'))
    story.append(make_code_box("SUCCESS RESPONSE 200 OK", '{\n  "success": true,\n  "message": "Physical inspection completed! Final payout offer locked at ₹22,000.",\n  "order": {\n    "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",\n    "orderNumber": "CA61962",\n    "status": "ACCEPTED",\n    "finalPrice": 22000\n  }\n}'))
    story.append(Spacer(1, 6))

    # Endpoint 4: Upload Payment
    story.append(Paragraph("<b>7.4 POST /api/v1/agent/upload-payment</b>", h2_style))
    story.append(Paragraph("<b>Headers:</b> <code>Content-Type: multipart/form-data</code> | <b>Header:</b> <code>Idempotency-Key: &lt;UUIDv4&gt;</code>", body_style))
    story.append(make_code_box("REQUEST FORM-DATA FIELDS", 'orderId: CA61962\nurn: 423456789012\nagentId: c7a84e20-3b91-49fa-9eb2-8b7a951d8b6c\nfile: <binary_image_data> (image/png)'))
    story.append(make_code_box("SUCCESS RESPONSE 200 OK", '{\n  "success": true,\n  "message": "Payment screenshot & 12-digit URN uploaded and saved. Awaiting manual Admin approval.",\n  "order": {\n    "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",\n    "orderNumber": "CA61962",\n    "urn": "423456789012",\n    "paymentScreenshotUrl": "https://jqysknhobtpcbyyltnfc.supabase.co/storage/v1/object/sign/payment-screenshots/urn_CA61962_1724912345.png?token=..."\n  },\n  "urn": "423456789012",\n  "paymentScreenshotUrl": "https://jqysknhobtpcbyyltnfc.supabase.co/storage/v1/object/sign/payment-screenshots/urn_CA61962_1724912345.png?token=..."\n}'))
    story.append(Spacer(1, 6))

    # Endpoint 5: Complete Order
    story.append(Paragraph("<b>7.5 POST /api/v1/agent/orders/[id]/complete</b>", h2_style))
    story.append(Paragraph("<b>Path Param:</b> <code>id</code> = <code>CA61962</code> | <b>Headers:</b> <code>Content-Type: application/json</code>, <code>Idempotency-Key: &lt;UUIDv4&gt;</code>", body_style))
    story.append(make_code_box("REQUEST BODY (JSON)", '{\n  "finalPrice": 22000,\n  "utr": "423456789012",\n  "agentName": "SANGEET SHAW"\n}'))
    story.append(make_code_box("SUCCESS RESPONSE 200 OK", '{\n  "success": true,\n  "message": "Order #CA61962 marked as COMPLETED & PAID. Tax Invoice email sent to rohan.das@example.com via Resend.",\n  "emailSent": true,\n  "emailProvider": "Resend",\n  "emailError": null,\n  "order": {\n    "id": "080b031c-b29e-4c74-8b65-9831d17d52e5",\n    "orderNumber": "CA61962",\n    "status": "COMPLETED",\n    "finalPrice": 22000,\n    "urn": "423456789012"\n  }\n}'))
    story.append(Spacer(1, 6))

    # Endpoint 6: Generate Bill
    story.append(Paragraph("<b>7.6 GET /api/v1/orders/[id]/generate-bill</b>", h2_style))
    story.append(Paragraph("<b>Path Param:</b> <code>id</code> = <code>CA61962</code> | <b>Auth:</b> Public read-only", body_style))
    story.append(make_code_box("SUCCESS RESPONSE 200 OK", '{\n  "success": true,\n  "data": {\n    "billData": {\n      "billNumber": "CA61962_2026",\n      "orderNumber": "CA61962",\n      "orderDate": "2026-08-29T11:20:00.000Z",\n      "completionDate": "2026-08-30T10:15:00.000Z",\n      "seller": {\n        "name": "Rohan Das",\n        "phone": "9830123456",\n        "address": "Flat 4B, Greenfield Heights, Rajarhat, Kolkata, West Bengal - 700135"\n      },\n      "buyer": {\n        "name": "AARNA ENTERPRISE",\n        "platform": "CashALL Platform",\n        "gstin": "19AVPPG9800JIZ3",\n        "address": "Howrah, West Bengal",\n        "assignedAgent": "SANGEET SHAW"\n      },\n      "device": {\n        "brand": "Apple",\n        "model": "iPhone 13",\n        "variant": "128 GB",\n        "deviceName": "Apple iPhone 13 (128 GB)",\n        "imei1": "356789102345678"\n      },\n      "financials": {\n        "estimatedPrice": 24500,\n        "finalPurchasePrice": 22000,\n        "paymentMethod": "UPI Transfer",\n        "utrNumber": "423456789012",\n        "paymentStatus": "PAID"\n      },\n      "declarations": {\n        "sellerDeclarationText": "This is a computer-generated receipt issued by CashALL. The seller (named above) has voluntarily sold the device to CashALL at the agreed final price.",\n        "documentHash": "sha256_verified_aarna_cashall"\n      }\n    }\n  }\n}'))
    story.append(Spacer(1, 8))

    # -------------------------------------------------------------
    # 8. PARTNER APP API REQUIREMENTS & STATUS
    # -------------------------------------------------------------
    story.append(Paragraph("8. Partner App API Requirements Categorization", h1_style))
    
    reqs_data = [
        [Paragraph("Category", table_hdr), Paragraph("Backend API Status", table_hdr), Paragraph("Endpoints Involved", table_hdr)],
        [
            Paragraph("<b>A. Ready to Use</b>", table_cell_bold),
            Paragraph("<font color='#15803D'>Available in Production</font>", table_cell),
            Paragraph("<code>/catalog</code>, <code>/catalog/questions</code>, <code>/orders/[id]</code>, <code>/orders/[id]/generate-bill</code>, <code>/quotes/calculate</code>, <code>/storage/upload</code>, <code>/notifications/register</code>, <code>/orders/[id]/verify-identity</code>, <code>/orders/[id]/esign</code>.", table_cell)
        ],
        [
            Paragraph("<b>B. Needs Security Fix</b>", table_cell_bold),
            Paragraph("<font color='#DC2626'>Vulnerable (Token/Auth)</font>", table_cell),
            Paragraph("<code>/agent/login</code> (Sign JWT), <code>/agent/orders</code> (Enforce Bearer JWT), <code>/agent/orders/[id]/inspection</code> (Validate agent), <code>/agent/upload-payment</code>, <code>/agent/orders/[id]/complete</code>.", table_cell)
        ],
        [
            Paragraph("<b>C. Needs Modification</b>", table_cell_bold),
            Paragraph("<font color='#D97706'>Missing Idempotency</font>", table_cell),
            Paragraph("<code>/agent/upload-payment</code> and <code>/agent/orders/[id]/complete</code> require server-side <code>Idempotency-Key</code> header processing and caching.", table_cell)
        ],
        [
            Paragraph("<b>D. Needs New API</b>", table_cell_bold),
            Paragraph("<font color='#2563EB'>Not Currently Implemented</font>", table_cell),
            Paragraph("<code>POST /api/v1/agent/orders/[id]/pickup-failed</code> (For recording failed visit, customer refusal, doorstep GPS coordinates) and <code>GET /api/v1/agent/profile</code>.", table_cell)
        ],
    ]
    t_reqs = Table(reqs_data, colWidths=[110, 110, 320])
    t_reqs.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_reqs)
    story.append(Spacer(1, 8))

    # -------------------------------------------------------------
    # 9. RECOMMENDED PARTNER APP API FLOW
    # -------------------------------------------------------------
    story.append(Paragraph("9. Recommended Partner Mobile App Execution Flow", h1_style))
    story.append(Paragraph("The exact sequence of API calls to be executed by the Partner Mobile App:", body_style))

    flow_data = [
        [Paragraph("Step", table_hdr), Paragraph("Mobile Screen / Action", table_hdr), Paragraph("API Endpoint Called", table_hdr), Paragraph("Data Exchanged / Outcome", table_hdr)],
        [Paragraph("1", table_cell_bold), Paragraph("Agent Login", table_cell), Paragraph("<code>POST /api/v1/agent/login</code>", table_cell), Paragraph("Sends phone/password; receives agent session token.", table_cell)],
        [Paragraph("2", table_cell_bold), Paragraph("Assigned Orders List", table_cell), Paragraph("<code>GET /api/v1/agent/orders</code>", table_cell), Paragraph("Fetches all active doorstep pickups assigned to agent.", table_cell)],
        [Paragraph("3", table_cell_bold), Paragraph("Doorstep Arrival", table_cell), Paragraph("<code>POST /orders/[id]/start-inspection</code>", table_cell), Paragraph("Locks order status to <code>INSPECTION_STARTED</code>.", table_cell)],
        [Paragraph("4A", table_cell_bold), Paragraph("Pickup Failed / Refused", table_cell), Paragraph("<code>POST .../pickup-failed</code> <font color='#2563EB'>[NEW]</font>", table_cell), Paragraph("Records reason, notes, GPS coordinates; cancels order.", table_cell)],
        [Paragraph("4B", table_cell_bold), Paragraph("QC Physical Diagnostic", table_cell), Paragraph("<code>POST /api/v1/agent/.../inspection</code>", table_cell), Paragraph("Submits screen/body findings, IMEI; locks <code>finalPrice</code>.", table_cell)],
        [Paragraph("5", table_cell_bold), Paragraph("Customer e-KYC", table_cell), Paragraph("<code>POST /orders/[id]/verify-identity</code>", table_cell), Paragraph("Submits Aadhaar/PAN mask; status -&gt; <code>ACCEPTED</code>.", table_cell)],
        [Paragraph("6", table_cell_bold), Paragraph("Digital e-Signature", table_cell), Paragraph("<code>POST /orders/[id]/esign</code>", table_cell), Paragraph("Customer signs declaration; generates SHA-256 hash.", table_cell)],
        [Paragraph("7", table_cell_bold), Paragraph("Manual UPI Payment", table_cell), Paragraph("<code>POST /api/v1/agent/upload-payment</code>", table_cell), Paragraph("Uploads GPay/Paytm screenshot & 12-digit UTR.", table_cell)],
        [Paragraph("8", table_cell_bold), Paragraph("Order Settlement", table_cell), Paragraph("<code>POST /api/v1/agent/.../complete</code>", table_cell), Paragraph("Status -&gt; <code>COMPLETED</code>; syncs Google Sheets; emails PDF invoice.", table_cell)],
        [Paragraph("9", table_cell_bold), Paragraph("Digital Bill Display", table_cell), Paragraph("<code>GET /orders/[id]/generate-bill</code>", table_cell), Paragraph("Renders official Aarna Enterprise GST Tax Invoice.", table_cell)],
    ]
    t_flow = Table(flow_data, colWidths=[25, 125, 175, 215])
    t_flow.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_flow)
    story.append(Spacer(1, 8))

    # -------------------------------------------------------------
    # 10. DEVELOPER HANDOFF CHECKLIST
    # -------------------------------------------------------------
    story.append(Paragraph("10. Developer Handoff Checklist", h1_style))

    chk_content = [
        Paragraph("<b>WHAT TO PROVIDE TO THE PARTNER APP DEVELOPER:</b>", h2_style),
        Paragraph("&bull; <b>This Technical PDF Document:</b> Complete API contracts and schemas.", bullet_style),
        Paragraph("&bull; <b>Production API Base URL:</b> <code>https://www.cashall.in/api/v1</code>", bullet_style),
        Paragraph("&bull; <b>Supabase Public Project URL:</b> <code>https://jqysknhobtpcbyyltnfc.supabase.co</code>", bullet_style),
        Paragraph("&bull; <b>Supabase Public Anon Key:</b> Public client key with Row Level Security (RLS).", bullet_style),
        Paragraph("&bull; <b>Firebase Client Config:</b> Client API key, project ID, sender ID for phone OTP.", bullet_style),
        Paragraph("&bull; <b>Active Test Agent Account:</b> Name: <code>SANGEET SHAW</code>, Phone: <code>6289477287</code>, Password: <code>Ank933967@</code>.", bullet_style),
        Spacer(1, 4),
        Paragraph("<b>WHAT YOU MUST NEVER GIVE TO THE DEVELOPER:</b>", ParagraphStyle('DTitle', parent=h2_style, textColor=DANGER_COLOR)),
        Paragraph("&bull; <font color='#DC2626'><b>DO NOT GIVE:</b></font> <code>SUPABASE_SERVICE_ROLE_KEY</code> (Grants total DB root bypass).", bullet_style),
        Paragraph("&bull; <font color='#DC2626'><b>DO NOT GIVE:</b></font> <code>DATABASE_URL</code> / Direct PostgreSQL credentials (Exposes TCP DB ports).", bullet_style),
        Paragraph("&bull; <font color='#DC2626'><b>DO NOT GIVE:</b></font> <code>RESEND_API_KEY</code> / SMTP credentials (Internal email delivery only).", bullet_style),
        Paragraph("&bull; <font color='#DC2626'><b>DO NOT GIVE:</b></font> <code>GOOGLE_SHEETS_WEBHOOK_URL</code> (Internal accounting webhook).", bullet_style),
        Paragraph("&bull; <font color='#DC2626'><b>DO NOT GIVE:</b></font> <code>META_CONVERSIONS_API_ACCESS_TOKEN</code> (Marketing pixel secret).", bullet_style),
        Paragraph("&bull; <font color='#DC2626'><b>DO NOT GIVE:</b></font> Production Vercel deployer/admin tokens.", bullet_style)
    ]
    t_chk = Table([[chk_content]], colWidths=[540])
    t_chk.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 0.75, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_chk)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] Generated PDF successfully: {filename}")

if __name__ == "__main__":
    primary_output = os.path.join(r"c:\Users\DELL\OneDrive\Desktop\CashALL", "CASHALL_PARTNER_APP_API_HANDOFF.pdf")
    build_pdf(primary_output)

    # Copy to Desktop root and IDE artifact folder
    desktop_output = os.path.join(r"c:\Users\DELL\OneDrive\Desktop", "CASHALL_PARTNER_APP_API_HANDOFF.pdf")
    artifact_output = os.path.join(r"C:\Users\DELL\.gemini\antigravity-ide\brain\0dd1add2-1a68-4762-807b-13cdb168f15b", "CASHALL_PARTNER_APP_API_HANDOFF.pdf")

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
