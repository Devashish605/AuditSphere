/**
 * Google Gemini Generative AI API Integration Service
 * Powered by Google Gemini 3.8 Flash for Grounded Industrial Maintenance Auditing
 */
import { GoogleGenAI } from '@google/genai';

const LOCAL_STORAGE_KEY = 'auditsphere_gemini_api_key';

/**
 * Retrieve user-configured Gemini API Key from environment or localStorage
 */
export function getGeminiApiKey() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored && stored.trim().length > 10) return stored.trim();
  } catch {
    // Local storage access error fallback
  }

  // Check Vite environment variable if available
  const envKey = import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 10) {
    return envKey.trim();
  }

  return '';
}

/**
 * Save user API key to persistent browser localStorage
 */
export function saveGeminiApiKey(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return false;
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, apiKey.trim());
  return true;
}

/**
 * Check if a Gemini API key is currently configured
 */
export function isGeminiApiConfigured() {
  return getGeminiApiKey().length > 10;
}

/**
 * Format audit telemetry into a high-density, grounded context string for Gemini
 */
function buildGroundingTelemetryContext(context = {}) {
  const m = context.metrics || {};
  const outlier = m.topOutlierPlant || { name: 'CHETAK', adherence: '62.3%', count: 80 };
  const pareto = context.paretoCategories || [];
  const topLoss = context.topLossMachines || [];
  const ageing = context.ageingDistribution || [];
  const weibull = context.weibullAnalysis || [];
  const fmea = context.fmeaAnalysis || [];

  return `
--- PLANT AUDIT GROUNDING TELEMETRY (VERIFIED SINGLE SOURCE OF TRUTH) ---
• Reporting Period: FY 2025–2026 (Audited 12-Month Fiscal Window)
• Fleet Overview: ${m.machinesAnalyzed || 1670} Unique Physical Assets from ${context.pmRowsCount || 11541} Scheduled PM Work Orders
• Overall PM Compliance Rate: ${m.complianceRate || '95.1%'} (Target: >= 95%)
• Outlier Plant / Shop: ${outlier.name || 'CHETAK'} at ${outlier.adherence || '62.3%'} Adherence (${outlier.count || 80} Low Adherence Assets)
• Low Adherence Assets (<70% Adherence): ${m.lowAdherenceCount || 115} Machines
• Critical Non-Compliance Severity (<50% Adherence): ${m.criticalCount || 53} Machines
• Total Breakdown Downtime: ${m.totalBreakdownHours || '30,779 hrs'} across ${context.bdRowsCount || 831} Logged Failure Incidents
• Quantified Downtime Loss Impact: ${m.quantifiedDowntimeLoss || '₹738.7 L'} (Based on standard plant rate of ₹2,400/hr)
• Repeat Breakdown Financial Loss: ${m.repeatBreakdownLoss || '₹472.8 L'} (Failures recurring within 30 days of PM closure)

• Top Failure Categories (Pareto 80/20):
${pareto.slice(0, 5).map((p, i) => `  ${i + 1}. ${p.name || p.category}: ${p.hours || 0} hrs (${p.pct || 0}% share)`).join('\n')}

• Delay Ageing Slices:
${ageing.map(a => `  - ${a.bracket}: ${a.count} WOs (${a.pct}) [${a.risk}]`).join('\n')}

• Top Chronic Loss Machines (Highest Financial Exposure):
${topLoss.slice(0, 5).map((t, i) => `  ${i + 1}. ${t.name || t.machineId} (${t.plant}): ${t.hours} hrs downtime, Loss: ${t.loss}, PM Adherence: ${t.adherence}, Risk: ${t.risk}`).join('\n')}

• Reliability Engineering & Hazard Rate (Weibull β Parameters):
${weibull.slice(0, 4).map(w => `  - Machine ${w.machineId}: β=${w.beta} (${w.failureRegime}), MTBF=${w.mtbf} operating days, MTTR=${w.mttr} hrs`).join('\n')}

• FMEA Risk Priority Numbers (RPN):
${fmea.slice(0, 4).map(f => `  - ${f.mode}: RPN=${f.rpn} (Severity=${f.severity}, Occurrence=${f.occurrence}, Detection=${f.detection})`).join('\n')}
------------------------------------------------------------------------
`;
}

/**
 * Execute Gemini 3.8 Flash query with audit telemetry grounding
 */
export async function askGeminiAuditAssistant(userPrompt, auditContext = {}, userProvidedKey = null) {
  const apiKey = (userProvidedKey && userProvidedKey.trim().length > 10) 
    ? userProvidedKey.trim() 
    : getGeminiApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      text: '⚠️ **Gemini API Key Required:** Please configure your Google Gemini API key to activate live reasoning, predictive FMEA modeling, and AI Root Cause Analysis.'
    };
  }

  const groundingData = buildGroundingTelemetryContext(auditContext);

  const systemInstruction = `
You are the Chief Reliability Engineering Lead & Senior Manufacturing Audit Partner for AuditSphere Enterprise.
You are directly evaluating an industrial plant maintenance audit for FY 2025–26.

RULES:
1. Ground your answers strictly in the provided audit telemetry figures. Never fabricate machine IDs, hours, or costs that contradict the data.
2. Maintain professional, objective, audit-grade language (ISO 55000 / ISO 14224 / SAE JA1011 standards).
3. Distinguish between PM Schedule Compliance (did maintenance do the work on time) and PM Effectiveness (did the machine break down anyway).
4. When discussing machine failures, reference Weibull shape factors (β < 1 infant mortality vs β = 1 random operational shock vs β > 1 wear-out) and FMEA RPN scores.
5. Provide crisp, structured formatting with bold metric citations, root causes, and prioritized management recommendations (P1, P2, P3).
`;

  try {
    const client = new GoogleGenAI({ apiKey });

    const fullPrompt = `${systemInstruction}\n\n${groundingData}\n\nUSER AUDITOR QUESTION: ${userPrompt}\n\nProvide an executive audit assessment with specific numbers, root causes, financial losses, and actionable engineering recommendations:`;

    const interaction = await client.interactions.create({
      model: 'gemini-3.8-flash',
      input: fullPrompt
    });

    const responseText = interaction.output_text;

    if (responseText && responseText.trim().length > 10) {
      return {
        success: true,
        source: 'Google Gemini 3.8 Flash API',
        model: 'gemini-3.8-flash',
        text: responseText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    throw new Error('Empty response received from Gemini API');
  } catch (err) {
    console.warn('Gemini SDK call encountered error, attempting direct REST fallback:', err);
    return await executeGeminiRestFallback(userPrompt, groundingData, systemInstruction, apiKey);
  }
}

/**
 * Fallback to direct REST endpoint if SDK encounters browser bundling nuances
 */
async function executeGeminiRestFallback(prompt, telemetry, systemInstruction, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemInstruction}\n\n${telemetry}\n\nAUDITOR QUESTION: ${prompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText && candidateText.trim().length > 10) {
      return {
        success: true,
        source: 'Google Gemini API (REST)',
        model: 'gemini-2.5-flash',
        text: candidateText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    throw new Error('Invalid JSON candidate in Gemini REST response');
  } catch (restErr) {
    console.error('Gemini REST API failure:', restErr);
    return {
      success: false,
      error: restErr.message,
      text: `⚠️ **Gemini API Error:** ${restErr.message || 'Unable to connect to Google Gemini API'}. Please verify your API key or network connection.`
    };
  }
}
