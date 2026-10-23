import PptxGenJS from 'pptxgenjs';

/**
 * Generates and downloads a single-page formal executive PowerPoint (.pptx) presentation
 * matching the standard Protiviti Internal Maintenance Audit Observation template.
 * 
 * 16:9 Widescreen (13.333" x 7.5").
 * Binds dynamically to live ingested PM and Breakdown analysis data.
 * 
 * @param {Object} templateConfig - Uploaded template metadata (companyName, etc.)
 * @param {Array} chatbotSlides - Ignored (single-slide mode requested)
 * @param {Object} analysisData - Live maintenance audit analytics object
 */
export async function exportAuditPptx(templateConfig = {}, chatbotSlides = [], analysisData = null) {
  const pptx = new PptxGenJS();
  
  // Strict 16:9 Modern Widescreen Layout Definition (13.333" x 7.5")
  pptx.defineLayout({ name: 'LAYOUT_16x9_WIDE', width: 13.333, height: 7.5 });
  pptx.layout = 'LAYOUT_16x9_WIDE';
  
  const company = templateConfig.companyName || 'Protiviti Member Firm';
  pptx.author = templateConfig.author || 'Internal Audit & Advisory';
  pptx.company = company;
  pptx.title = '1. PREVENTIVE MAINTENANCE PROGRAM DESIGN & EXECUTION GAPS DRIVING HIGH-IMPACT EQUIPMENT BREAKDOWNS';
  pptx.subject = 'Internal Reliability & Preventive Maintenance Audit Observation';

  // Dynamic analysis data or fallback to benchmark
  const m = analysisData?.metrics || {};
  const isLive = !!analysisData?.isLiveAnalyzed;

  const machineCount = (m.machinesAnalyzed !== null && m.machinesAnalyzed !== undefined && m.machinesAnalyzed !== 'NULL')
    ? Number(m.machinesAnalyzed).toLocaleString()
    : '597';
  
  const pmOrders = (analysisData?.pmRowsCount || 2156).toLocaleString();
  const bdCount = (analysisData?.bdRowsCount || 831).toLocaleString();
  const bdHours = (m.totalBreakdownHours !== null && m.totalBreakdownHours !== undefined && m.totalBreakdownHours !== 'NULL')
    ? String(m.totalBreakdownHours)
    : '11,948 hrs';
  
  const complianceRate = (m.complianceRate !== null && m.complianceRate !== undefined && m.complianceRate !== 'NULL')
    ? String(m.complianceRate)
    : '87.9%';
  
  const lowAdherenceCount = (m.lowAdherenceCount !== null && m.lowAdherenceCount !== undefined && m.lowAdherenceCount !== 'NULL')
    ? Number(m.lowAdherenceCount).toLocaleString()
    : '79';

  const outlierShop = m.topOutlierPlant?.name || 'CHETAK';

  // Dynamic evidence generation
  let evidenceText = "GSP 35 (25%) – spindle failures 223.8 hrs; CG 22 (0%) – oil-seal failure twice, 49.1 hrs; CNC 14 (20%, PM 'Not Done – not released') – 129 hrs; SQF 05 furnace (2 PMs 'Not Done') – elevator 10.2 hrs; GHB 42 (0%) – late cleaning PM – connector-oiling fault 11.1 hrs.";
  const candidateMachines = (Array.isArray(analysisData?.worstCombinedCases) && analysisData.worstCombinedCases.length > 0)
    ? analysisData.worstCombinedCases
    : (Array.isArray(analysisData?.topLossMachines) ? analysisData.topLossMachines : []);
  if (isLive && candidateMachines.length > 0) {
    const list = candidateMachines.slice(0, 5).map(mach => {
      const name = mach.name || mach.id;
      const adh = mach.adherence !== undefined 
        ? (String(mach.adherence).includes('%') ? mach.adherence : `${mach.adherence}%`) 
        : 'N/A';
      const hrs = mach.hours || mach.bdHours || 0;
      const reason = mach.failure_mode || mach.reason || mach.primaryReason || 'breakdown stoppage';
      return `${name} (${adh}) – ${reason} ${hrs} hrs`;
    });
    if (list.length > 0) evidenceText = list.join('; ') + '.';
  }

  // Top 5 machines concentration
  let top5Pct = '29';
  if (isLive && Array.isArray(analysisData?.topLossMachines) && analysisData.topLossMachines.length > 0) {
    const totalSiteHrs = parseFloat(String(bdHours).replace(/[^0-9.]/g, '')) || 1;
    const top5Hrs = analysisData.topLossMachines.slice(0, 5).reduce((acc, x) => acc + (x.hours || x.bdHours || 0), 0);
    if (totalSiteHrs > 0 && top5Hrs > 0) {
      top5Pct = Math.round((top5Hrs / totalSiteHrs) * 100);
    }
  }

  const TEAL = '2E7D9E';
  const RED = 'C00000';
  const BORDER_COLOR = 'CBD5E1';
  const TITLE_COLOR = '1B6488';
  const TEXT_DARK = '0F172A';
  const TEXT_BODY = '334155';
  const TEXT_MUTED = '64748B';

  // ==========================================
  // SINGLE SLIDE GENERATION
  // ==========================================
  const slide = pptx.addSlide();

  // Thin outer border around the entire slide
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.25, y: 0.25, w: 12.833, h: 7.0,
    fill: { color: 'FFFFFF' },
    line: { color: BORDER_COLOR, width: 1 }
  });

  // Slide Title
  slide.addText('1. PREVENTIVE MAINTENANCE PROGRAM DESIGN & EXECUTION GAPS DRIVING HIGH-IMPACT EQUIPMENT BREAKDOWNS', {
    x: 0.45, y: 0.35, w: 12.433, h: 0.45,
    fontSize: 12.5, bold: true, color: TITLE_COLOR, fontFace: 'Calibri'
  });

  // -------------------------------------------------------------
  // LEFT HEADER: Observation Bar + Operational Oval + [H] Red Box
  // -------------------------------------------------------------
  const leftX = 0.45;
  const leftW = 7.60;
  const rightX = 8.15;
  const rightW = 4.733;

  slide.addShape(pptx.ShapeType.rect, {
    x: leftX, y: 0.85, w: leftW, h: 0.38,
    fill: { color: TEAL }
  });

  slide.addText('Observation', {
    x: leftX + 0.15, y: 0.88, w: 1.6, h: 0.30,
    fontSize: 10.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri'
  });

  // Design & System labels
  slide.addText('Design', {
    x: leftX + 2.4, y: 0.88, w: 0.8, h: 0.30,
    fontSize: 8.5, color: 'FFFFFF', fontFace: 'Calibri', align: 'center'
  });
  slide.addText('System', {
    x: leftX + 3.4, y: 0.88, w: 0.8, h: 0.30,
    fontSize: 8.5, color: 'FFFFFF', fontFace: 'Calibri', align: 'center'
  });

  // Operational circled in white oval
  slide.addShape(pptx.ShapeType.roundRect, {
    x: leftX + 4.4, y: 0.87, w: 1.4, h: 0.32,
    fill: { color: TEAL },
    line: { color: 'FFFFFF', width: 1.5 }
  });
  slide.addText('Operational', {
    x: leftX + 4.4, y: 0.88, w: 1.4, h: 0.30,
    fontSize: 8.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center'
  });

  // Red [H] High Risk Box
  slide.addShape(pptx.ShapeType.rect, {
    x: leftX + leftW - 0.45, y: 0.85, w: 0.45, h: 0.38,
    fill: { color: RED }
  });
  slide.addText('H', {
    x: leftX + leftW - 0.45, y: 0.87, w: 0.45, h: 0.32,
    fontSize: 12, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center'
  });

  // -------------------------------------------------------------
  // RIGHT HEADER: Recommendations Bar
  // -------------------------------------------------------------
  slide.addShape(pptx.ShapeType.rect, {
    x: rightX, y: 0.85, w: rightW, h: 0.38,
    fill: { color: TEAL }
  });
  slide.addText('Recommendations', {
    x: rightX, y: 0.88, w: rightW, h: 0.30,
    fontSize: 10.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center'
  });

  // -------------------------------------------------------------
  // LEFT CONTENT BOX: Background + Observation Points 1, 2, 3
  // -------------------------------------------------------------
  slide.addShape(pptx.ShapeType.rect, {
    x: leftX, y: 1.23, w: leftW, h: 4.15,
    fill: { color: 'FFFFFF' },
    line: { color: BORDER_COLOR, width: 1 }
  });

  slide.addText([
    { text: 'Background: ', options: { bold: true, color: TEXT_DARK } },
    { text: `The plant maintains ~${machineCount} machines across six shops under a monthly / quarterly / annual Preventive Maintenance (PM) program governed by machine-wise PM check-sheets. PM adherence and equipment breakdowns (BD) are logged separately. We analysed ${pmOrders} PM line-items and ${bdCount} breakdown events for FY'25-26 and correlated the low-adherence / high-impact machines against their PM check-sheets.\n\n`, options: { color: TEXT_BODY } },
    
    { text: 'Observation:\n', options: { bold: true, color: TEXT_DARK } },
    { text: '1. Design gap – PM check sheet scope & frequency not aligned to actual failure modes : ', options: { bold: true, color: TEXT_DARK } },
    { text: 'Failure-precursor parameters are absent or scheduled too infrequently – spindle vibration/noise, belt and hydrostatic pressure on shapers/grinders are checked only Yearly / Half-yearly, and recurring failure modes are not codified at all (e.g., CG 22 has no spindle oil-seal checkpoint). The PM design therefore cannot detect the failures that drive most downtime.\n\n', options: { color: TEXT_BODY } },
    
    { text: '2. Design gap – unreliable adherence monitoring & escalation : ', options: { bold: true, color: TEXT_DARK } },
    { text: 'The MIS \'Ageing Bucket\' is inconsistent with the recorded delay (PMs 6+ days late tagged \'Before due date\'), overstating adherence and masking low performers; no threshold or escalation exists for repeat \'Not Done\' PMs.\n\n', options: { color: TEXT_BODY } },
    
    { text: '3. Process gap – low adherence & deferred PMs precede high-impact breakdowns (transactional evidence) : ', options: { bold: true, color: TEXT_DARK } },
    { text: `Against overall on-time adherence of ${complianceRate}, ${lowAdherenceCount} machines fall below 70% (≥2 PMs). Evidence: ${evidenceText}\n\n`, options: { color: TEXT_BODY } },
    
    { text: `Note : Downtime is concentrated – top 5 machines drive ~${top5Pct}% of ~${bdHours} BD hrs; fixing PM scope/frequency & release discipline on ~10 critical machines removes most high-impact downtime (single event > 6.45 hrs).`, options: { underline: true, italic: true, color: '1E293B' } }
  ], {
    x: leftX + 0.12, y: 1.28, w: leftW - 0.24, h: 4.05,
    fontSize: 7.4, fontFace: 'Calibri', lineSpacing: 10.5
  });

  // -------------------------------------------------------------
  // RIGHT CONTENT BOX: Recommendations + Management Response
  // -------------------------------------------------------------
  slide.addShape(pptx.ShapeType.rect, {
    x: rightX, y: 1.23, w: rightW, h: 4.15,
    fill: { color: 'FFFFFF' },
    line: { color: BORDER_COLOR, width: 1 }
  });

  // Upper part: Recommendations bullets
  slide.addText([
    { text: '• Redesign PM check-sheets on an FMEA basis – ', options: { bold: true, color: TEXT_DARK } },
    { text: 'add missing checkpoints (spindle oil-seal, connector integrity) and raise failure-precursor checks (spindle vibration/noise, belt, hydrostatic pressure) to monthly / quarterly condition-based tasks\n\n', options: { color: TEXT_BODY } },
    
    { text: '• Correct the MIS ageing-bucket logic and set a hard adherence threshold ', options: { bold: true, color: TEXT_DARK } },
    { text: 'with auto-escalation for repeat "Not Done" / >10-day-late PMs\n\n', options: { color: TEXT_BODY } },
    
    { text: '• Institute a PM-release SLA with production sign-off; ', options: { bold: true, color: TEXT_DARK } },
    { text: 'protect bottleneck & critical assets', options: { color: TEXT_BODY } }
  ], {
    x: rightX + 0.12, y: 1.28, w: rightW - 0.24, h: 1.95,
    fontSize: 7.7, fontFace: 'Calibri', lineSpacing: 11
  });

  // Sub-header bar: Management Response / Action Plan
  slide.addShape(pptx.ShapeType.rect, {
    x: rightX, y: 3.32, w: rightW, h: 0.32,
    fill: { color: TEAL }
  });
  slide.addText('Management Response / Action Plan', {
    x: rightX, y: 3.34, w: rightW, h: 0.28,
    fontSize: 9.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center'
  });

  // Lower part: Management Response content lines
  slide.addText([
    { text: '1. Plant Head and Operations Manager agreed to establish a binding PM-Release SLA with production shift leads effective Nov 1, 2026.\n\n' },
    { text: '2. Engineering team is updating the Grinder and Shaper PM check-sheets to mandate monthly vibration logs and quarterly oil-seal replacements.\n\n' },
    { text: `3. Dedicated weekend maintenance sprint scheduled for ${outlierShop} plant to eliminate overdue backlog.\n\n` },
    { text: 'Target Implementation: Q4 FY26 | Owner: Head of Plant Operations', options: { bold: true, color: TEXT_DARK } }
  ], {
    x: rightX + 0.12, y: 3.70, w: rightW - 0.24, h: 1.60,
    fontSize: 7.4, color: TEXT_MUTED, fontFace: 'Calibri', lineSpacing: 10
  });

  // -------------------------------------------------------------
  // BOTTOM 4 PARAMETER BOXES: Root Cause, Risk/Impact, Resp, Annex
  // -------------------------------------------------------------
  const botY = 5.46;
  const botHeaderH = 0.26;
  const botBoxH = 1.25;

  const b1X = 0.45;
  const b1W = 3.65;

  const b2X = 4.18;
  const b2W = 3.65;

  const b3X = 7.91;
  const b3W = 2.80;

  const b4X = 10.79;
  const b4W = 2.093;

  // Box 1: Root Cause
  slide.addShape(pptx.ShapeType.rect, { x: b1X, y: botY, w: b1W, h: botHeaderH, fill: { color: TEAL } });
  slide.addText('Root Cause', { x: b1X, y: botY + 0.02, w: b1W, h: botHeaderH - 0.04, fontSize: 8.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center' });
  slide.addShape(pptx.ShapeType.rect, { x: b1X, y: botY + botHeaderH, w: b1W, h: botBoxH - botHeaderH, fill: { color: 'FFFFFF' }, line: { color: BORDER_COLOR, width: 1 } });
  slide.addText('• PM check-sheets designed generically rather than derived from machine-specific failure modes (FMEA); failure-precursor checks are under-frequent or absent. No governance to enforce PM release / completion (deferrals & \'Not Done\' accepted without escalation); adherence reporting unreliable due to mislabeled ageing buckets.', {
    x: b1X + 0.08, y: botY + botHeaderH + 0.05, w: b1W - 0.16, h: botBoxH - botHeaderH - 0.1,
    fontSize: 7.0, color: TEXT_BODY, fontFace: 'Calibri', lineSpacing: 9.5
  });

  // Box 2: Risk / Potential Impact
  slide.addShape(pptx.ShapeType.rect, { x: b2X, y: botY, w: b2W, h: botHeaderH, fill: { color: TEAL } });
  slide.addText('Risk / Potential Impact', { x: b2X, y: botY + 0.02, w: b2W, h: botHeaderH - 0.04, fontSize: 8.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center' });
  slide.addShape(pptx.ShapeType.rect, { x: b2X, y: botY + botHeaderH, w: b2W, h: botBoxH - botHeaderH, fill: { color: 'FFFFFF' }, line: { color: BORDER_COLOR, width: 1 } });
  slide.addText(`• Recurring high-impact breakdowns & extended unplanned downtime (~${bdHours} BD hrs, FY'25-26)\n• Higher maintenance cost & longer MTTR\n• Furnace batch-quality & safety exposure`, {
    x: b2X + 0.08, y: botY + botHeaderH + 0.05, w: b2W - 0.16, h: botBoxH - botHeaderH - 0.1,
    fontSize: 7.0, color: TEXT_BODY, fontFace: 'Calibri', lineSpacing: 9.5
  });

  // Box 3: Responsibility and Target Date
  slide.addShape(pptx.ShapeType.rect, { x: b3X, y: botY, w: b3W, h: botHeaderH, fill: { color: TEAL } });
  slide.addText('Responsibility and Target Date', { x: b3X, y: botY + 0.02, w: b3W, h: botHeaderH - 0.04, fontSize: 8.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center' });
  slide.addShape(pptx.ShapeType.rect, { x: b3X, y: botY + botHeaderH, w: b3W, h: botBoxH - botHeaderH, fill: { color: 'FFFFFF' }, line: { color: BORDER_COLOR, width: 1 } });
  slide.addText('Responsibility – Plant Operations Head & Maintenance Engineering Lead\nTimeline – Q4 FY 2025–26', {
    x: b3X + 0.08, y: botY + botHeaderH + 0.08, w: b3W - 0.16, h: botBoxH - botHeaderH - 0.15,
    fontSize: 7.2, color: TEXT_BODY, fontFace: 'Calibri', lineSpacing: 10
  });

  // Box 4: Annexures
  slide.addShape(pptx.ShapeType.rect, { x: b4X, y: botY, w: b4W, h: botHeaderH, fill: { color: TEAL } });
  slide.addText('Annexures', { x: b4X, y: botY + 0.02, w: b4W, h: botHeaderH - 0.04, fontSize: 8.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center' });
  slide.addShape(pptx.ShapeType.rect, { x: b4X, y: botY + botHeaderH, w: b4W, h: botBoxH - botHeaderH, fill: { color: 'FFFFFF' }, line: { color: BORDER_COLOR, width: 1 } });
  slide.addText('Attachments if any\n• PM Check-sheet Gap Analysis\n• Machine Breakdown Pareto Register', {
    x: b4X + 0.08, y: botY + botHeaderH + 0.08, w: b4W - 0.16, h: botBoxH - botHeaderH - 0.15,
    fontSize: 7.0, color: TEXT_BODY, fontFace: 'Calibri', lineSpacing: 9.5
  });

  // -------------------------------------------------------------
  // FOOTER: Slide Number + Confidentiality Notice + Protiviti Logo
  // -------------------------------------------------------------
  const footerY = 6.82;

  // Slide Number "1"
  slide.addText('1', {
    x: 0.45, y: footerY, w: 0.5, h: 0.30,
    fontSize: 8.5, color: TEXT_MUTED, fontFace: 'Calibri'
  });

  // Copyright and confidentiality disclaimer
  slide.addText('© 2025-Protiviti India Member Private Limited. - Confidential\nThis document is for your organization\'s internal use only and should not be copied or distributed to any third party.', {
    x: 1.10, y: footerY, w: 9.5, h: 0.32,
    fontSize: 6.5, color: TEXT_MUTED, fontFace: 'Calibri', lineSpacing: 8
  });

  // Protiviti branding
  slide.addText('protiviti', {
    x: 11.20, y: footerY, w: 1.68, h: 0.30,
    fontSize: 13, bold: true, color: '334155', fontFace: 'Calibri', align: 'right'
  });

  // Download presentation
  await pptx.writeFile({ fileName: 'Plant_Maintenance_Audit_Observation_FY26.pptx' });
}
