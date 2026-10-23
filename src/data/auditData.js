export const PROCESSES = [
  {
    id: 'maintenance',
    title: 'Plant Maintenance',
    code: 'MAINT-04',
    icon: 'Wrench',
    badge: '2 Checkpoints Ready',
    description: 'Equipment health, preventive schedules, downtime prevention and breakdown mitigation.',
    checkpointsCount: 2,
    active: true,
  },
  {
    id: 'production-planning',
    title: 'Production Planning',
    code: 'PLAN-01',
    icon: 'CalendarClock',
    badge: 'Empty',
    description: 'Demand forecasting, master production schedule (MPS), capacity allocation.',
    checkpointsCount: 0,
    active: false,
  },
  {
    id: 'production',
    title: 'Shop Floor Production',
    code: 'PROD-02',
    icon: 'Factory',
    badge: 'Empty',
    description: 'Cycle time validation, shift output reconciliation, scrap and WIP tracking.',
    checkpointsCount: 0,
    active: false,
  },
  {
    id: 'quality',
    title: 'Quality Assurance',
    code: 'QA-03',
    icon: 'ShieldCheck',
    badge: 'Empty',
    description: 'Incoming inspection, first-piece inspection, non-conformance & PPM audits.',
    checkpointsCount: 0,
    active: false,
  },
];

export const MAINTENANCE_CHECKPOINTS = [
  {
    id: 'pm-compliance',
    name: 'PM Compliance (%)',
    category: 'Preventive Maintenance',
    riskTested: 'Slippage in planned preventive maintenance leading to unchecked equipment deterioration and plant bottlenecks.',
    inputData: 'PM Plan Vs Actual (PM Schedule, PM Completion Date, Machine Master, PM Frequency)',
    requiredData: 'PM Plan Vs Actual (PM Schedule, PM Completion Date, Machine Master, PM Frequency)',
    methodPrompt: 'Act as a professional reliability and maintenance data analyst. Analyze PM compliance using PM Schedule, PM Completion Date, Machine Master and PM Frequency. First check missing machine IDs, inconsistent machine names, blank scheduled dates, completion dates before schedule, duplicate PM schedules, missing status and invalid frequency. Normalize machine names. For every machine, compute total PM scheduled, completed on/before due date, late PMs bucketed into 1-5 days, 6-10 days and more than 10 days, Not Done PMs and Adherence % = on-time completions / total scheduled. Flag machines below 70% adherence only where 2 or more PMs were scheduled. Deliver Excel workbook with tabs: Raw Data, Observation Summary, Data Quality Check, PM Compliance Working, Machine-wise PM Ranking, Late PM Ageing, Monthly Trend and README. Observation Summary should cover low compliance, delayed PMs, not done PMs and recommendations.',
    excelTabs: [
      'Raw Data',
      'Observation Summary',
      'Data Quality Check',
      'PM Compliance Working',
      'Machine-wise PM Ranking',
      'Late PM Ageing',
      'Monthly Trend',
      'README'
    ],
    qualityChecks: [
      'Missing machine IDs check',
      'Inconsistent machine names resolution',
      'Blank scheduled dates check',
      'Completion dates before schedule detection',
      'Duplicate PM schedules elimination',
      'Missing status and invalid frequency filter'
    ],
    calculationRule: 'Rule-Based Analytics Engine using Python Pandas, combined with data validation and KPI calculations: Adherence % = on-time completions / total scheduled. Flag machines below 70% adherence only where 2 or more PMs were scheduled.',
    methodology: 'Rule-Based Analytics Engine using Python Pandas, combined with data validation and KPI calculations',
    agingBuckets: ['On-Time / Before Due', 'Late 1–5 Days', 'Late 6–10 Days', 'Late >10 Days', 'Not Done PMs'],
    defaultSelected: true,
    metrics: {
      complianceRate: '88.9%',
      machinesAnalyzed: 668,
      lowAdherenceCount: 87,
      criticalCount: 41,
      topOutlierPlant: 'CHETAK (62.3% adherence)'
    }
  },
  {
    id: 'pm-effectiveness',
    name: 'PM Effectiveness',
    category: 'Preventive Maintenance',
    riskTested: 'Ineffective PM task definitions, generic check-sheets and deferred maintenance leading to recurring high-impact breakdowns.',
    inputData: `1. PM Plan vs Actual
2. Breakdown history (PM History, Breakdown History, Machine Master, Breakdown Date, PM Date)`,
    requiredData: `1. PM Plan vs Actual
2. Breakdown history (PM History, Breakdown History, Machine Master, Breakdown Date, PM Date)`,
    methodPrompt: 'Act as a professional reliability and maintenance auditor. Analyze PM effectiveness using PM History, Breakdown History, Machine Master, Breakdown Date and PM Date. First check machine name inconsistencies, missing PM dates, missing breakdown dates, breakdown duration outliers, duplicate PM/breakdown records and blank reason fields. Normalize machine IDs across PM and breakdown files. Identify low PM adherence machines and pull related breakdown history. For each machine compute breakdown count, total breakdown hours, average duration, max breakdown duration, count of high-impact breakdowns above 75th percentile and most common breakdown reason/category. Deliver Excel workbook with tabs: Raw Data - PM, Raw Data - Breakdown, Observation Summary, Data Quality Check, PM Effectiveness Working, Low Adherence x Breakdown, Machine-wise Reliability Summary, Breakdown Reason Pareto and README. Observation Summary should identify repeated failures despite PM and ineffective PM scope/frequency.',
    excelTabs: [
      'Raw Data - PM',
      'Raw Data - Breakdown',
      'Observation Summary',
      'Data Quality Check',
      'PM Effectiveness Working',
      'Low Adherence x Breakdown',
      'Machine-wise Reliability Summary',
      'Breakdown Reason Pareto',
      'README'
    ],
    qualityChecks: [
      'Machine name inconsistencies cross-check',
      'Missing PM dates and missing breakdown dates check',
      'Breakdown duration outlier analysis',
      'Duplicate PM/breakdown records deduplication',
      'Blank reason fields detection',
      'Machine ID normalization across PM & Breakdown files'
    ],
    calculationRule: 'Reliability Engineering + Pareto Analysis as the core, XGBoost for optional future breakdown-risk prediction, and Isolation Forest for anomaly detection: Identify low PM adherence machines, detect high-impact outliers (>6.45 hrs) and repeated failures despite PM.',
    methodology: 'Reliability Engineering + Pareto Analysis as the core, XGBoost for optional future breakdown-risk prediction, and Isolation Forest for anomaly detection.',
    defaultSelected: true,
    metrics: {
      totalBreakdownHours: '11,948 hrs',
      uniqueFailureReasons: 444,
      repeatBreakdownLoss: '₹18.4 Lakhs',
      preventableLossRatio: '38.2%'
    }
  }
];

export const INITIAL_FILES = [
  {
    id: 'doc-1',
    name: 'PM_Plan_Vs_Actual_Schedule_Master.xlsx',
    size: '2.4 MB',
    rows: 12480,
    type: 'excel',
    inputCategory: 'PM Plan Vs Actual (PM Schedule, PM Completion Date, Machine Master, PM Frequency)',
    usedFor: ['PM Compliance (%)', 'PM Effectiveness'],
    status: 'validated',
    uploadTime: 'Just now',
    records: 12480,
    lossIdentified: '12,480 PM line-items analyzed: 87 machines below 70% adherence (where ≥2 PMs scheduled)'
  },
  {
    id: 'doc-2',
    name: 'Breakdown_History_Register_FY25-26.xlsx',
    size: '3.1 MB',
    rows: 8420,
    type: 'excel',
    inputCategory: 'Breakdown history (PM History, Breakdown History, Machine Master, Breakdown Date, PM Date)',
    usedFor: ['PM Effectiveness'],
    status: 'validated',
    uploadTime: 'Just now',
    records: 8420,
    lossIdentified: '11,948 total breakdown hours: High-impact events >75th percentile (>6.45 hrs) identified'
  },
  {
    id: 'doc-3',
    name: 'Machine_Master_and_Checksheet_Guidelines.xlsx',
    size: '1.8 MB',
    rows: 597,
    type: 'excel',
    inputCategory: 'Machine Master, Frequency & Checksheet Specifications',
    usedFor: ['PM Compliance (%)', 'PM Effectiveness'],
    status: 'validated',
    uploadTime: 'Just now',
    records: 597,
    lossIdentified: 'Master normalized: 597 unique machines across 6 shops mapped to PM & Breakdown registers'
  }
];

export const SAMPLE_OBSERVATIONS = [
  {
    id: 1,
    theme: 'Spindle health checked only ANNUALLY on Gear Shapers, with ~25% PM adherence → Repeat spindle failures',
    machines: 'GSP 35 (adh 25%, 223.8 hrs BD), GSP 15 (adh 25%, 70.6 hrs), GSP 33 (adh 25%)',
    gap: 'Spindle checkpoints (noise, belt tension, hydrostatic pressure) are scheduled only Yearly/Half-yearly, and those PMs slip 10+ days.',
    risk: 'Slow-onset degradation goes unnoticed until catastrophic failure requiring external Siemens tuning specialists.',
    quantifiedLoss: '294 hrs unplanned spindle downtime | Estimated financial loss: ₹6.4 Lakhs ($7,800)',
    suggestion: 'Elevate spindle checks to monthly condition-based tasks with vibration trend card; hard-gate spindle PM closure so late execution auto-escalates to Plant Head.'
  },
  {
    id: 2,
    theme: 'Recurring failure mode (spindle OIL-SEAL wear) is completely absent from PM check-sheet',
    machines: 'CG 22 Grinder (0% adherence, identical failure twice: 44.1 hrs + 5.0 hrs = 49.1 hrs downtime)',
    gap: 'The CG 22 sheet verifies hydraulic pressure but has ZERO checkpoint for spindle oil-seal wear or internal lube seal condition.',
    risk: 'Defect is repaired repeatedly rather than prevented. Contaminants threaten precision tolerances of ground automotive gears.',
    quantifiedLoss: '49.1 hrs lost production on high-precision line | Estimated loss: ₹1.2 Lakhs + component rework risk',
    suggestion: 'Add quarterly lube-seal & oil-seal inspection checkpoint to CG 22 and sister grinders; mandate an FMEA check-sheet update whenever identical failure recurs within 12 months.'
  },
  {
    id: 3,
    theme: 'Deferred & "Not Done" PMs on machines NOT RELEASED by production precede severe breakdown events',
    machines: 'CNC 14 (adh 20%, 3 PMs late + 1 Not Done → 129 hrs BD), SQF 05 Sealed Quench Furnace (adh 50%, elevator failure 10.2 hrs)',
    gap: 'Production shifts do not release bottleneck machines for scheduled maintenance windows without penalty.',
    risk: 'Critical machines run to failure. In sealed-quench furnaces, missed PMs risk batch contamination and furnace refractory safety.',
    quantifiedLoss: '139.2 hrs total bottleneck downtime | Estimated loss: ₹4.8 Lakhs + furnace thermal risk',
    suggestion: 'Institute a mandatory PM-Release Service Level Agreement (SLA) with production sign-off. Flag "Machine Not Released" as an executive KPI on weekly Operations reviews.'
  },
  {
    id: 4,
    theme: 'Delayed electrical cleaning PM directly correlates with connector-oiling drive failures',
    machines: 'GHB 42 Gear Hobber (0% adherence, high-impact C-drive fault 11.1 hrs due to connector oiling)',
    gap: 'Quarterly tasks "Clean system fan & connectors" and "Clean oil & dust" exist but were postponed 18+ days.',
    risk: 'Oil mist and metal fines accumulate on drive connectors, inducing nuisance short circuits and drive fault lockouts.',
    quantifiedLoss: '13.6 hrs stoppage on high-demand hobbing line | Estimated loss: ₹35,000 idle time',
    suggestion: 'Enforce strict 48-hour closure SLA for electrical enclosure sanitation; install IP-65 sealed gaskets on chronically exposed drive boxes.'
  }
];

export const PARETO_CATEGORIES = [
  { name: 'Electrical / Motor / Drive', hours: 1903, pct: 28.5, color: '#3b82f6' },
  { name: 'Mechanical Wear & Breakage', hours: 1782, pct: 26.7, color: '#6366f1' },
  { name: 'Hydraulic & Lubrication', hours: 1145, pct: 17.1, color: '#0ea5e9' },
  { name: 'Pneumatics & Sensors', hours: 890, pct: 13.3, color: '#f59e0b' },
  { name: 'Tooling & Fixtures', hours: 560, pct: 8.4, color: '#10b981' },
  { name: 'Other Unclassified', hours: 402, pct: 6.0, color: '#94a3b8' }
];

export const TOP_LOSS_MACHINES = [
  { id: 'CNC-16', name: 'CNC-16 Lathe', bdHours: 941, events: 14, adherence: '33%', plant: 'CHETAK', lossValue: '₹2.82 L', highImpactEvents: 5 },
  { id: 'GHB-43', name: 'GHB 43 Hobber', bdHours: 593.6, events: 6, adherence: '25%', plant: 'CHETAK', lossValue: '₹1.78 L', highImpactEvents: 3 },
  { id: 'GSP-35', name: 'GSP 35 Shaper', bdHours: 223.8, events: 3, adherence: '25%', plant: 'CHETAK', lossValue: '₹0.67 L', highImpactEvents: 3 },
  { id: 'GSV-15', name: 'GSV 15 Shaper', bdHours: 154.1, events: 9, adherence: '50%', plant: 'CHETAK', lossValue: '₹0.46 L', highImpactEvents: 2 },
  { id: 'CNC-14', name: 'CNC 14 Lathe', bdHours: 129.1, events: 4, adherence: '20%', plant: 'CHETAK', lossValue: '₹0.38 L', highImpactEvents: 2 }
];

export const MONTHLY_BREAKDOWN_DATA = [
  { month: 'Oct 2025', count: 68, hours: 978, chetak: 42, forging: 7, tejas: 5, ojas: 5, shakti: 5, ht: 4 },
  { month: 'Nov 2025', count: 72, hours: 1035, chetak: 45, forging: 6, tejas: 5, ojas: 6, shakti: 5, ht: 5 },
  { month: 'Dec 2025', count: 78, hours: 1120, chetak: 49, forging: 7, tejas: 6, ojas: 5, shakti: 6, ht: 5 },
  { month: 'Jan 2026', count: 74, hours: 1065, chetak: 46, forging: 7, tejas: 6, ojas: 5, shakti: 5, ht: 5 },
  { month: 'Feb 2026', count: 61, hours: 875, chetak: 37, forging: 6, tejas: 5, ojas: 4, shakti: 5, ht: 4 },
  { month: 'Mar 2026', count: 67, hours: 960, chetak: 41, forging: 6, tejas: 6, ojas: 4, shakti: 6, ht: 4 },
  { month: 'Apr 2026', count: 71, hours: 1020, chetak: 44, forging: 7, tejas: 5, ojas: 5, shakti: 5, ht: 5 },
  { month: 'May 2026', count: 65, hours: 935, chetak: 40, forging: 6, tejas: 5, ojas: 5, shakti: 5, ht: 4 },
  { month: 'Jun 2026', count: 69, hours: 990, chetak: 43, forging: 6, tejas: 6, ojas: 4, shakti: 5, ht: 5 },
  { month: 'Jul 2026', count: 73, hours: 1050, chetak: 45, forging: 7, tejas: 5, ojas: 5, shakti: 6, ht: 5 },
  { month: 'Aug 2026', count: 70, hours: 1010, chetak: 43, forging: 7, tejas: 5, ojas: 5, shakti: 5, ht: 5 },
  { month: 'Sep 2026', count: 63, hours: 910, chetak: 37, forging: 6, tejas: 5, ojas: 5, shakti: 4, ht: 6 }
];

export const PLANT_BREAKDOWN_TOTALS = [
  { id: 'chetak', name: 'CHETAK', count: 512, pct: 61.6, hours: 7360, status: 'Critical Outlier', color: '#ef4444' },
  { id: 'forging', name: 'Forging Shop', count: 78, pct: 9.4, hours: 1120, status: 'Controlled', color: '#3b82f6' },
  { id: 'tejas', name: 'Tejas Plant', count: 64, pct: 7.7, hours: 920, status: 'Controlled', color: '#06b6d4' },
  { id: 'shakti', name: 'Shakti Line', count: 62, pct: 7.5, hours: 890, status: 'Stable', color: '#10b981' },
  { id: 'ojas', name: 'Ojas Unit', count: 58, pct: 7.0, hours: 830, status: 'Stable', color: '#8b5cf6' },
  { id: 'ht', name: 'Heat Treatment (HT)', count: 57, pct: 6.8, hours: 828, status: 'Controlled', color: '#f59e0b' }
];

export const MONTHLY_MACHINE_BREAKDOWNS = {
  'Oct 2025': [
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '04-Oct-2025', duration: 18.5, reason: 'Turret index sensor fault & drive overload', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'GSP-35', machineName: 'GSP 35 Shaper', date: '11-Oct-2025', duration: 115.2, reason: 'Catastrophic spindle bearing seizure & noise', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CG-22', machineName: 'CG 22 Grinder', date: '19-Oct-2025', duration: 44.1, reason: 'Internal lubrication leakage - spindle oil-seal wear', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-14', machineName: 'CNC 14 Lathe', date: '26-Oct-2025', duration: 32.4, reason: 'Spindle chuck clamping cylinder hydraulic seal blowout', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-04', machineName: 'FRG 04 1600T Press', date: '08-Oct-2025', duration: 8.2, reason: 'Clutch air regulator diaphragm rupture', category: 'Pneumatics', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-12', machineName: 'TJS 12 VMC', date: '15-Oct-2025', duration: 4.5, reason: 'ATC arm tool holder jam during tool change', category: 'Tooling', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-07', machineName: 'OJS 07 Hobber', date: '22-Oct-2025', duration: 3.8, reason: 'Coolant pump motor thermal overload tripping', category: 'Electrical', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-03', machineName: 'SHK 03 Broaching', date: '17-Oct-2025', duration: 6.0, reason: 'Hydraulic oil filter high differential pressure alarm', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'SQF-05', machineName: 'SQF 05 Furnace', date: '29-Oct-2025', duration: 10.2, reason: 'Inner quench elevator mechanism chain link fracture', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'Nov 2025': [
    { plant: 'CHETAK', machineId: 'GHB-43', machineName: 'GHB 43 Hobber', date: '05-Nov-2025', duration: 142.5, reason: 'Main hob spindle drive gear teeth spalling & wear', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '14-Nov-2025', duration: 28.0, reason: 'X-axis ball screw backlash & encoder error', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'GSV-15', machineName: 'GSV 15 Shaper', date: '21-Nov-2025', duration: 34.6, reason: 'Hydrostatic rail pressure drop and belt slippage', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-01', machineName: 'FRG 01 1000T Press', date: '10-Nov-2025', duration: 6.5, reason: 'Induction heater coil water flow sensor interlock', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-09', machineName: 'TJS 09 HMC', date: '18-Nov-2025', duration: 7.1, reason: 'B-axis rotary table index clamping failure', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-02', machineName: 'OJS 02 Shaper', date: '25-Nov-2025', duration: 4.2, reason: 'Cutter head lubrication delivery line choking', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-11', machineName: 'SHK 11 Lathe', date: '12-Nov-2025', duration: 3.5, reason: 'Chip conveyor jam and overload pin shearing', category: 'Mechanical Wear', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'HT-02', machineName: 'HT 02 Carburizer', date: '27-Nov-2025', duration: 8.4, reason: 'Atmosphere circulation fan bearing abnormal noise', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'Dec 2025': [
    { plant: 'CHETAK', machineId: 'GHB-43', machineName: 'GHB 43 Hobber', date: '02-Dec-2025', duration: 210.0, reason: 'Lubrication starvation leading to bronze bushing seizure', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'GSP-35', machineName: 'GSP 35 Shaper', date: '12-Dec-2025', duration: 68.0, reason: 'Siemens external drive tuning & spindle feedback error', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-14', machineName: 'CNC 14 Lathe', date: '20-Dec-2025', duration: 48.5, reason: 'Main spindle bearings thermal runaway during roughing', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'GHB-42', machineName: 'GHB 42 Hobber', date: '27-Dec-2025', duration: 11.1, reason: 'Drive connector oil mist contamination & short circuit', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-06', machineName: 'FRG 06 Trimming', date: '09-Dec-2025', duration: 5.2, reason: 'Pneumatic cylinder seal wear and air leakage', category: 'Pneumatics', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-05', machineName: 'TJS 05 Lathe', date: '16-Dec-2025', duration: 4.8, reason: 'Coolant leak into electrical cabinet junction box', category: 'Electrical', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-14', machineName: 'OJS 14 Grinder', date: '23-Dec-2025', duration: 6.8, reason: 'Wheel dressing diamond feed screw binding', category: 'Tooling', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-05', machineName: 'SHK 05 Hobber', date: '15-Dec-2025', duration: 4.0, reason: 'Hydraulic clamping pressure switch malfunction', category: 'Pneumatics', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'SQF-02', machineName: 'SQF 02 Furnace', date: '29-Dec-2025', duration: 9.0, reason: 'Door pneumatic cylinder packing leakage & heat loss', category: 'Pneumatics', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'Jan 2026': [
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '06-Jan-2026', duration: 125.0, reason: 'Servo drive power module blowout and cabinet overheating', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'GSV-15', machineName: 'GSV 15 Shaper', date: '14-Jan-2026', duration: 42.0, reason: 'Guide way counter-weight wire rope fraying & safety stop', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CG-22', machineName: 'CG 22 Grinder', date: '22-Jan-2026', duration: 5.0, reason: 'Repeat oil-seal wear leakage into work area', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-02', machineName: 'FRG 02 Billet Shear', date: '10-Jan-2026', duration: 8.5, reason: 'Blade hydraulic locking cylinder pressure bypass', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-18', machineName: 'TJS 18 VMC', date: '19-Jan-2026', duration: 3.5, reason: 'Spindle chiller flow sensor dirty / clogged', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-09', machineName: 'OJS 09 Lathe', date: '26-Jan-2026', duration: 5.4, reason: 'Hydraulic chuck foot-pedal microswitch defective', category: 'Electrical', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-08', machineName: 'SHK 08 Shaper', date: '17-Jan-2026', duration: 6.2, reason: 'Crank stroke adjustment gear pin sheared', category: 'Mechanical Wear', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'HT-04', machineName: 'HT 04 Washer', date: '30-Jan-2026', duration: 7.2, reason: 'Alkaline spray pump impeller cavitation & vibration', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'Feb 2026': [
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '04-Feb-2026', duration: 64.0, reason: 'Hydraulic turret clamping Belleville washer failure', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-14', machineName: 'CNC 14 Lathe', date: '15-Feb-2026', duration: 28.2, reason: 'Z-axis linear glass scale optical sensor contamination', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'GHB-43', machineName: 'GHB 43 Hobber', date: '23-Feb-2026', duration: 82.0, reason: 'Differential lead gear train backlash and tooth breakage', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-03', machineName: 'FRG 03 Hammer', date: '09-Feb-2026', duration: 7.0, reason: 'Die holder wedge loose during continuous stamping', category: 'Tooling', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-04', machineName: 'TJS 04 Grinder', date: '18-Feb-2026', duration: 4.0, reason: 'Wheel spindle balancing weight loose', category: 'Mechanical Wear', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-12', machineName: 'OJS 12 Lathe', date: '22-Feb-2026', duration: 3.2, reason: 'Tailstock quill pneumatic clamp seal leaking', category: 'Pneumatics', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-02', machineName: 'SHK 02 Hobber', date: '12-Feb-2026', duration: 5.8, reason: 'Index worm gear lubrication pump relay burned', category: 'Electrical', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'SQF-01', machineName: 'SQF 01 Furnace', date: '26-Feb-2026', duration: 9.8, reason: 'Radiant heating tube burner ignition flame scanner failed', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'Mar 2026': [
    { plant: 'CHETAK', machineId: 'GSP-35', machineName: 'GSP 35 Shaper', date: '08-Mar-2026', duration: 40.6, reason: 'Spindle noise, belt tension & hydrostatic guide pressure', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '19-Mar-2026', duration: 52.0, reason: 'C-axis spindle brake pad worn to backing plate', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'GSV-15', machineName: 'GSV 15 Shaper', date: '28-Mar-2026', duration: 26.5, reason: 'Ram return stroke hydraulic cushion valve blocked', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-05', machineName: 'FRG 05 Press', date: '11-Mar-2026', duration: 8.8, reason: 'Main flywheel bronze bushing overheating', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-15', machineName: 'TJS 15 VMC', date: '22-Mar-2026', duration: 4.6, reason: 'Through-spindle coolant rotary union high pressure seal blowout', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-05', machineName: 'OJS 05 Hobber', date: '14-Mar-2026', duration: 3.9, reason: 'Hob arbor clamping nut threads stripped', category: 'Tooling', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-07', machineName: 'SHK 07 Lathe', date: '25-Mar-2026', duration: 5.5, reason: 'Spindle drive resolver cable insulation stripped', category: 'Electrical', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'HT-05', machineName: 'HT 05 Pit', date: '30-Mar-2026', duration: 8.0, reason: 'Pit furnace retort lid seal gasket burned through', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'Apr 2026': [
    { plant: 'CHETAK', machineId: 'GHB-43', machineName: 'GHB 43 Hobber', date: '04-Apr-2026', duration: 92.1, reason: 'Hob slide hydraulic counter-balance manifold cracked', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '16-Apr-2026', duration: 110.0, reason: 'Turret index servomotor feedback encoder destroyed', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-14', machineName: 'CNC 14 Lathe', date: '24-Apr-2026', duration: 20.0, reason: 'Not Done deferred PM backlog: Way-lube pump motor burned', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-02', machineName: 'FRG 02 Press', date: '09-Apr-2026', duration: 6.4, reason: 'Lubrication header distributor block piston jammed', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-08', machineName: 'TJS 08 HMC', date: '18-Apr-2026', duration: 5.0, reason: 'Pallet changer shuttle interlock limit switch damaged', category: 'Electrical', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-11', machineName: 'OJS 11 Shaper', date: '27-Apr-2026', duration: 4.4, reason: 'Work table worm wheel tooth flank pitting', category: 'Mechanical Wear', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-09', machineName: 'SHK 09 Grinder', date: '12-Apr-2026', duration: 6.8, reason: 'Hydrodynamic spindle oil temperature controller sensor open', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'SQF-03', machineName: 'SQF 03 Furnace', date: '29-Apr-2026', duration: 11.0, reason: 'Quench oil circulation agitator motor shaft bearing seized', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'May 2026': [
    { plant: 'CHETAK', machineId: 'GSV-15', machineName: 'GSV 15 Shaper', date: '07-May-2026', duration: 31.0, reason: 'Spindle noise, belt tension & hydrostatic guide pressure', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '18-May-2026', duration: 84.5, reason: 'Main spindle drive transistor bridge module failure', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-01', machineName: 'FRG 01 1000T', date: '11-May-2026', duration: 7.5, reason: 'Pneumatic clutch air exhaust muffler choked', category: 'Pneumatics', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-02', machineName: 'TJS 02 Lathe', date: '23-May-2026', duration: 4.2, reason: 'Hydraulic power pack pressure filter clogged', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-03', machineName: 'OJS 03 Hobber', date: '15-May-2026', duration: 3.6, reason: 'Coolant manifold directional valve sticky', category: 'Pneumatics', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-04', machineName: 'SHK 04 Lathe', date: '28-May-2026', duration: 5.2, reason: 'Door safety guard interlock solenoid coil burned', category: 'Electrical', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'HT-01', machineName: 'HT 01 Pit', date: '30-May-2026', duration: 9.5, reason: 'Gas carburizing flowmeter proportioning valve sticky', category: 'Pneumatics', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'Jun 2026': [
    { plant: 'CHETAK', machineId: 'GHB-43', machineName: 'GHB 43 Hobber', date: '03-Jun-2026', duration: 67.0, reason: 'Index change gear bracket mounting bolt sheared', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '14-Jun-2026', duration: 145.0, reason: 'Turret index drive motor internal winding insulation breakdown', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'GSV-15', machineName: 'GSV 15 Shaper', date: '25-Jun-2026', duration: 20.0, reason: 'Ram counterbalance hydraulic valve pressure hunting', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-04', machineName: 'FRG 04 1600T', date: '10-Jun-2026', duration: 8.0, reason: 'Billet discharge transfer arm pneumatic cylinder seal blown', category: 'Pneumatics', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-14', machineName: 'TJS 14 VMC', date: '21-Jun-2026', duration: 4.8, reason: 'Spindle tool unclamp hydraulic booster seal leaking', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-08', machineName: 'OJS 08 Lathe', date: '17-Jun-2026', duration: 3.5, reason: 'Hydraulic steady rest clamp cylinder pressure drop', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-06', machineName: 'SHK 06 Shaper', date: '27-Jun-2026', duration: 6.0, reason: 'Crank pin bronze bushing clearance excessive', category: 'Mechanical Wear', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'SQF-04', machineName: 'SQF 04 Furnace', date: '29-Jun-2026', duration: 10.5, reason: 'Quench tank oil cooling heat exchanger tube leakage', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'Jul 2026': [
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '08-Jul-2026', duration: 185.0, reason: 'Turret index sensor & drive electronics repeated failure', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-14', machineName: 'CNC 14 Lathe', date: '19-Jul-2026', duration: 30.0, reason: 'Hydraulic chuck drawbar thread stripped from delayed PM', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-06', machineName: 'FRG 06 Trimming', date: '12-Jul-2026', duration: 9.0, reason: 'Upper tool holder guide pillar bronze sleeve scored', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-11', machineName: 'TJS 11 HMC', date: '24-Jul-2026', duration: 4.4, reason: 'Spindle internal lubrication pressure transducer failed', category: 'Electrical', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-01', machineName: 'OJS 01 Hobber', date: '16-Jul-2026', duration: 3.8, reason: 'Tailstock quill hydraulic lock lever pin bent', category: 'Tooling', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-10', machineName: 'SHK 10 Lathe', date: '26-Jul-2026', duration: 5.6, reason: 'Chuck clamping pressure proportional valve sticky', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'SQF-05', machineName: 'SQF 05 Furnace', date: '31-Jul-2026', duration: 8.5, reason: 'Vestibule inner door hoist wire rope tension sensor fault', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'Aug 2026': [
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '05-Aug-2026', duration: 98.0, reason: 'X-axis servo motor optical encoder cable signal loss', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'GSV-15', machineName: 'GSV 15 Shaper', date: '17-Aug-2026', duration: 25.0, reason: 'Spindle noise, belt tension & hydrostatic guide pressure', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-03', machineName: 'FRG 03 Hammer', date: '11-Aug-2026', duration: 8.2, reason: 'Main steam cylinder piston ring blowby and pressure loss', category: 'Pneumatics', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-07', machineName: 'TJS 07 VMC', date: '22-Aug-2026', duration: 4.0, reason: 'Linear way lube pressure switch false tripping', category: 'Electrical', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-10', machineName: 'OJS 10 Grinder', date: '15-Aug-2026', duration: 5.0, reason: 'Grinding wheel spindle drive flat belt frayed', category: 'Mechanical Wear', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-01', machineName: 'SHK 01 Broach', date: '27-Aug-2026', duration: 6.5, reason: 'Main pulling ram hydraulic cylinder rod gland seal leaking', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'HT-03', machineName: 'HT 03 Quench', date: '30-Aug-2026', duration: 9.0, reason: 'Quench oil circulation pump mechanical seal failure', category: 'Hydraulic & Lube', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ],
  'Sep 2026': [
    { plant: 'CHETAK', machineId: 'CNC-16', machineName: 'CNC-16 Lathe', date: '03-Sep-2026', duration: 89.0, reason: 'Turret index faults & drive electronics repeated trip', category: 'Electrical', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'CHETAK', machineId: 'CNC-14', machineName: 'CNC 14 Lathe', date: '14-Sep-2026', duration: 22.0, reason: 'Spindle bearings thermal expansion and seizure', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Forging Shop', machineId: 'FRG-05', machineName: 'FRG 05 Press', date: '09-Sep-2026', duration: 7.8, reason: 'Main brake lining worn beyond permissible limits', category: 'Mechanical Wear', severity: 'High Impact (>6.45h)', status: 'Closed' },
    { plant: 'Tejas Plant', machineId: 'TJS-16', machineName: 'TJS 16 HMC', date: '20-Sep-2026', duration: 4.2, reason: 'B-axis rotary table clamp proximity sensor dirty', category: 'Electrical', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Ojas Unit', machineId: 'OJS-06', machineName: 'OJS 06 Shaper', date: '16-Sep-2026', duration: 3.5, reason: 'Work arbor clamp nut loose during cutting cycle', category: 'Tooling', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Shakti Line', machineId: 'SHK-12', machineName: 'SHK 12 Lathe', date: '25-Sep-2026', duration: 5.0, reason: 'Hydraulic power unit return line oil filter clogged', category: 'Hydraulic & Lube', severity: 'Standard (<6.45h)', status: 'Closed' },
    { plant: 'Heat Treatment (HT)', machineId: 'SQF-02', machineName: 'SQF 02 Furnace', date: '28-Sep-2026', duration: 8.8, reason: 'Atmosphere gas flow solenoid valve failure', category: 'Pneumatics', severity: 'High Impact (>6.45h)', status: 'Closed' }
  ]
};

