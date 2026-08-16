import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

pdf_path = r"C:\Users\DELL\.gemini\antigravity-ide\brain\54c12800-0e00-4cca-9925-dce28f008bb3\CashALL_Bill_CA36738_Kundan_Kumar_Singh.pdf"

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    rightMargin=36,
    leftMargin=36,
    topMargin=36,
    bottomMargin=36
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle(
    'TitleStyle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=22,
    textColor=colors.HexColor('#FFD700'),
    spaceAfter=4
)

subtitle_style = ParagraphStyle(
    'SubTitleStyle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    textColor=colors.HexColor('#CCCCCC'),
    spaceAfter=2
)

right_header_style = ParagraphStyle(
    'RightHeaderStyle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=14,
    textColor=colors.HexColor('#FFD700'),
    alignment=2
)

right_meta_style = ParagraphStyle(
    'RightMetaStyle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    textColor=colors.HexColor('#EEEEEE'),
    alignment=2
)

section_heading = ParagraphStyle(
    'SectionHeading',
    parent=styles['Heading2'],
    fontName='Helvetica-Bold',
    fontSize=11,
    textColor=colors.HexColor('#111111'),
    spaceBefore=10,
    spaceAfter=6
)

normal_text = ParagraphStyle(
    'NormalText',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    textColor=colors.HexColor('#333333'),
    leading=12
)

bold_text = ParagraphStyle(
    'BoldText',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=9,
    textColor=colors.HexColor('#111111'),
    leading=12
)

green_bold = ParagraphStyle(
    'GreenBold',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=11,
    textColor=colors.HexColor('#008000'),
    leading=14
)

elements = []

# --- HEADER TABLE ---
header_data = [
    [
        Paragraph("CashALL", title_style) if True else "",
        Paragraph("PURCHASE RECEIPT", right_header_style)
    ],
    [
        Paragraph("India's Transparent Device Recommerce<br/>www.cashall.in | Helpline: 7003216788", subtitle_style),
        Paragraph("<b>Bill No:</b> BILL-CA36738-2026<br/><b>Date:</b> 16 August 2026", right_meta_style)
    ]
]

header_table = Table(header_data, colWidths=[270, 270])
header_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#111111')),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('PADDING', (0,0), (-1,-1), 12),
]))

elements.append(header_table)
elements.append(Spacer(1, 10))

# --- STATUS BANNER ---
status_data = [[
    Paragraph("<b>STATUS: TRANSACTION COMPLETED</b> — Device Acquired & Payment Transferred via Instant UPI", ParagraphStyle('StatusStyle', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#005500')))
]]
status_table = Table(status_data, colWidths=[540])
status_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#E8F5E9')),
    ('BORDER', (0,0), (-1,-1), 1, colors.HexColor('#A5D6A7')),
    ('PADDING', (0,0), (-1,-1), 8),
    ('ALIGN', (0,0), (-1,-1), 'CENTER')
]))
elements.append(status_table)
elements.append(Spacer(1, 12))

# --- SELLER & ORDER INFO GRID ---
seller_info = Paragraph(
    "<b>Name:</b> Kundan Kumar Singh<br/>"
    "<b>Paid To Account:</b> Kundan Kumar Singh<br/>"
    "<b>Payment Date:</b> 16 August 2026, 9:16 PM<br/>"
    "<b>Status:</b> Payment Verified & Success",
    normal_text
)

order_info = Paragraph(
    "<b>Order ID:</b> CA36738<br/>"
    "<b>Quote Valuation ID:</b> CAQ-367384<br/>"
    "<b>Transaction Type:</b> Doorstep Device Buyback<br/>"
    "<b>Inspection Status:</b> Verified & Completed",
    normal_text
)

grid_data = [
    [Paragraph("<b>SELLER DETAILS</b>", section_heading), Paragraph("<b>ORDER DETAILS</b>", section_heading)],
    [seller_info, order_info]
]
grid_table = Table(grid_data, colWidths=[270, 270])
grid_table.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('PADDING', (0,0), (-1,-1), 4),
]))
elements.append(grid_table)
elements.append(Spacer(1, 12))

elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#DDDDDD'), spaceBefore=4, spaceAfter=12))

# --- DEVICE PURCHASED TABLE ---
device_table_data = [
    [
        Paragraph("<b>Device Purchased</b>", ParagraphStyle('TH1', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white)),
        Paragraph("<b>Details & Storage</b>", ParagraphStyle('TH2', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white)),
        Paragraph("<b>Estimated Price</b>", ParagraphStyle('TH3', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white, alignment=2)),
        Paragraph("<b>Final Price Paid</b>", ParagraphStyle('TH4', fontName='Helvetica-Bold', fontSize=9, textColor=colors.white, alignment=2)),
    ],
    [
        Paragraph("<b>OPPO A33</b>", bold_text),
        Paragraph("64 GB Storage (Physical Inspection Verified)", normal_text),
        Paragraph("Rs. 2,889", normal_text),
        Paragraph("<b>Rs. 2,700</b>", green_bold)
    ]
]
device_table = Table(device_table_data, colWidths=[150, 190, 100, 100])
device_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#222222')),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('PADDING', (0,0), (-1,-1), 8),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E0E0E0')),
    ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#F9F9F9')),
]))
elements.append(device_table)
elements.append(Spacer(1, 14))

# --- PAYMENT SUMMARY ---
summary_data = [
    [Paragraph("Initial Online Estimated Quote:", normal_text), Paragraph("Rs. 2,889.00", normal_text)],
    [Paragraph("Doorstep Physical Inspection Adjustment:", normal_text), Paragraph("- Rs. 189.00", normal_text)],
    [Paragraph("<b>TOTAL FINAL AMOUNT TRANSFERRED:</b>", ParagraphStyle('SumB', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#006600'))), Paragraph("<b>Rs. 2,700.00</b>", green_bold)]
]
summary_table = Table(summary_data, colWidths=[380, 160])
summary_table.setStyle(TableStyle([
    ('ALIGN', (1,0), (1,-1), 'RIGHT'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('PADDING', (0,0), (-1,-1), 4),
    ('LINEABOVE', (0,2), (1,2), 1, colors.HexColor('#006600')),
]))
elements.append(summary_table)
elements.append(Spacer(1, 16))

# --- LEGAL DECLARATION ---
terms_heading = Paragraph("<b>LEGAL SALE & PURCHASE DECLARATION</b>", section_heading)
terms_body = Paragraph(
    "1. The seller (<b>Kundan Kumar Singh</b>) confirms voluntary sale and transfer of full legal ownership of the specified device (<b>OPPO A33, 64 GB</b>) to <b>CashALL</b> for the agreed final amount of <b>Rs. 2,700.00</b>.<br/>"
    "2. Full payment has been transferred to the seller's account on <b>16 August 2026, 9:16 PM</b>.<br/>"
    "3. The seller confirms the device is free from any legal encumbrances, locks, or financial claims.<br/>"
    "4. This digital receipt serves as the official legal purchase agreement and payment confirmation.",
    ParagraphStyle('TermsText', fontName='Helvetica', fontSize=8, textColor=colors.HexColor('#555555'), leading=11)
)

elements.append(terms_heading)
elements.append(terms_body)
elements.append(Spacer(1, 20))

# --- FOOTER ---
footer_text = Paragraph(
    "<center><b>Thank you for choosing CashALL — India's Most Transparent Device Recommerce Platform</b><br/>"
    "CashALL | cashall.in | Helpline: 7003216788</center>",
    ParagraphStyle('FooterText', fontName='Helvetica', fontSize=8, textColor=colors.HexColor('#777777'), leading=11)
)
elements.append(footer_text)

doc.build(elements)
print("PDF generated successfully at:", pdf_path)
