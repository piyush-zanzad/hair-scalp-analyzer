import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime

class PDFReportGenerator:
    @staticmethod
    def generate(
        output_pdf_path: str,
        patient_name: str,
        patient_email: str,
        patient_gender: str,
        scan_date: datetime,
        original_img_path: str,
        heatmap_img_path: str,
        hair_stage: str,
        hair_confidence: float,
        hair_severity: str,
        disease_name: str,
        disease_confidence: float,
        disease_severity: str,
        hair_recommendations: list,
        disease_recommendations: list,
        doctor_notes: str = ""
    ):
        # Setup document
        doc = SimpleDocTemplate(
            output_pdf_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Define Custom Styles for a Medical Report
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0F52BA'), # Clinical Blue
            spaceAfter=6
        )
        
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748B'), # Slate gray
            spaceAfter=15
        )
        
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=10,
            spaceAfter=8,
            keepWithNext=True
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['BodyText'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )
        
        body_bold = ParagraphStyle(
            'BodyBold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        meta_label = ParagraphStyle(
            'MetaLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569')
        )
        
        meta_val = ParagraphStyle(
            'MetaVal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#1E293B')
        )

        bullet_style = ParagraphStyle(
            'Bullet',
            parent=body_style,
            leftIndent=15,
            firstLineIndent=-10,
            spaceBefore=3,
            spaceAfter=3
        )
        
        story = []
        
        # --- HEADER SECTION ---
        story.append(Paragraph("AI HAIR & SCALP DIAGNOSTICS REPORT", title_style))
        story.append(Paragraph(f"Generated automatically via Deep Learning Diagnostic Scan • {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#E2E8F0'), spaceAfter=15))
        
        # --- PATIENT INFO TABLE ---
        patient_data = [
            [
                Paragraph("Patient Name:", meta_label), Paragraph(patient_name, meta_val),
                Paragraph("Scan Date:", meta_label), Paragraph(scan_date.strftime("%Y-%m-%d %H:%M"), meta_val)
            ],
            [
                Paragraph("Patient Email:", meta_label), Paragraph(patient_email, meta_val),
                Paragraph("Gender:", meta_label), Paragraph(patient_gender.capitalize(), meta_val)
            ]
        ]
        
        patient_table = Table(patient_data, colWidths=[1.25*inch, 2.25*inch, 1.0*inch, 2.75*inch])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0,0), (-1,-1), 0.25, colors.HexColor('#F1F5F9')),
        ]))
        story.append(patient_table)
        story.append(Spacer(1, 15))
        
        # --- DIAGNOSTIC SUMMARY TABLE ---
        story.append(Paragraph("Diagnostic Summary", section_heading))
        summary_headers = [
            Paragraph("Analysis Category", meta_label),
            Paragraph("Detected Condition / Stage", meta_label),
            Paragraph("Confidence", meta_label),
            Paragraph("Clinical Severity", meta_label)
        ]
        
        hair_row = [
            Paragraph("<b>Hair Loss Stage</b>", body_style),
            Paragraph(hair_stage, body_style),
            Paragraph(f"{hair_confidence*100:.1f}%", body_style),
            Paragraph(f"<font color='{PDFReportGenerator._get_severity_color(hair_severity)}'><b>{hair_severity}</b></font>", body_style)
        ]
        
        disease_row = [
            Paragraph("<b>Scalp Disease</b>", body_style),
            Paragraph(disease_name, body_style),
            Paragraph(f"{disease_confidence*100:.1f}%", body_style),
            Paragraph(f"<font color='{PDFReportGenerator._get_severity_color(disease_severity)}'><b>{disease_severity}</b></font>", body_style)
        ]
        
        summary_table = Table([summary_headers, hair_row, disease_row], colWidths=[2.0*inch, 2.5*inch, 1.25*inch, 1.5*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0,0), (-1,-1), 0.25, colors.HexColor('#E2E8F0')),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 15))
        
        # --- IMAGES SECTION ---
        story.append(Paragraph("Visual Analysis & Feature Activation Heatmap (Grad-CAM)", section_heading))
        
        # Check if files exist and scale them
        img_cells = []
        col_widths = []
        
        if os.path.exists(original_img_path):
            original_flowable = Image(original_img_path, width=3.25*inch, height=2.44*inch)
            img_cells.append(original_flowable)
            col_widths.append(3.5*inch)
        else:
            img_cells.append(Paragraph("[Original scan missing]", body_style))
            col_widths.append(3.5*inch)
            
        if os.path.exists(heatmap_img_path):
            heatmap_flowable = Image(heatmap_img_path, width=3.25*inch, height=2.44*inch)
            img_cells.append(heatmap_flowable)
            col_widths.append(3.5*inch)
        else:
            img_cells.append(Paragraph("[Grad-CAM visualization missing]", body_style))
            col_widths.append(3.5*inch)
            
        images_table = Table([img_cells], colWidths=col_widths)
        images_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(images_table)
        
        # Labels for images
        labels_table = Table([[
            Paragraph("<font color='#64748B'><b>Figure A:</b> Original Preprocessed Scan</font>", body_style),
            Paragraph("<font color='#64748B'><b>Figure B:</b> Grad-CAM Highlighted Region</font>", body_style)
        ]], colWidths=col_widths)
        labels_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('PADDING', (0,0), (-1,-1), 2),
        ]))
        story.append(labels_table)
        story.append(Spacer(1, 15))
        
        # --- CLINICAL RECOMMENDATIONS ---
        story.append(Paragraph("Targeted Clinical Recommendations", section_heading))
        
        # Hair Loss Recommendations
        story.append(Paragraph("<b>Hair Loss Management:</b>", body_bold))
        for rec in hair_recommendations:
            story.append(Paragraph(f"• {rec}", bullet_style))
        story.append(Spacer(1, 6))
        
        # Scalp Disease Recommendations
        story.append(Paragraph("<b>Scalp Hygiene & Treatment:</b>", body_bold))
        for rec in disease_recommendations:
            story.append(Paragraph(f"• {rec}", bullet_style))
        story.append(Spacer(1, 15))
        
        # --- DOCTOR NOTES SECTION ---
        story.append(Paragraph("Clinical Practitioner / Doctor Notes", section_heading))
        notes_box_data = [[Paragraph(doctor_notes if doctor_notes else "No clinical practitioner notes added yet. Use the dashboard to update practitioner comments for this record.", body_style)]]
        notes_table = Table(notes_box_data, colWidths=[7.25*inch])
        notes_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFFBEB')), # Warm amber tint
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 10),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#FDE68A')),
        ]))
        story.append(notes_table)
        
        # Build Document
        doc.build(story)
        
    @staticmethod
    def _get_severity_color(severity: str) -> str:
        s = severity.lower()
        if "normal" in s or "healthy" in s:
            return "#10B981" # Green
        elif "mild" in s:
            return "#3B82F6" # Blue
        elif "moderate" in s:
            return "#F59E0B" # Amber
        elif "severe" in s or "critical" in s:
            return "#EF4444" # Red
        return "#1E293B"
