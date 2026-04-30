const express = require('express');
const router = express.Router();
const multer = require('multer');
const exifr = require('exifr');
const pdfParse = require('pdf-parse');
const { callGemini, callGeminiVision, callGeminiVisionMultiple } = require('./geminiService');

const upload = multer({ storage: multer.memoryStorage() });

// Helper to calculate days between dates
const getDaysGap = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getActionFromScore = (score) => {
  if (score <= 30) return { level: 'LOW', action: 'Auto-approve reshipment or refund.' };
  if (score <= 70) return { level: 'MEDIUM', action: 'Manual review required.' };
  return { level: 'HIGH', action: 'Decline and Escalate.' };
};

// 1. Wardrobing
router.post('/wardrobing', async (req, res) => {
  try {
    const { purchase_date, return_date, baseline_rate, buyer_return_count } = req.body;
    let score = 0; // Scoring start from zero
    const penaltyBreakdown = [];

    // Step 1: Return Time Gap
    const gap = getDaysGap(purchase_date, return_date);
    if (gap > 4) {
      score += 30;
      penaltyBreakdown.push({ check: 'Purchase-to-Return Interval', reason: `Gap is > 4 days (${gap} days). High Risk.`, points: 30 });
    } else if (gap > 2) {
      score += 20;
      penaltyBreakdown.push({ check: 'Purchase-to-Return Interval', reason: `Gap is > 2 days (${gap} days). Moderate Risk.`, points: 20 });
    }

    // Step 2: Weekend Overlap Detection
    const checkWeekendOverlap = (start, end) => {
      let current = new Date(start);
      const endDate = new Date(end);
      while (current <= endDate) {
        const day = current.getDay();
        if (day === 0 || day === 6) return true; // 0 = Sunday, 6 = Saturday
        current.setDate(current.getDate() + 1);
      }
      return false;
    };

    const hasWeekend = checkWeekendOverlap(purchase_date, return_date);
    if (hasWeekend) {
      score += 25; // User requested: totally +25 points
      penaltyBreakdown.push({ check: 'Weekend Overlap', reason: 'Time period occurs between Saturday and Sunday. Extra points added.', points: 25 });
    }

    // Step 3: SKU Baseline Return Rate
    const rate = parseFloat(baseline_rate);
    if (rate < 20) {
      score += 25; // User requested: less than 20 add +25 points
      penaltyBreakdown.push({ check: 'Baseline Rate', reason: `SKU Return Rate < 20% (${rate}%). Flagged as Risky.`, points: 25 });
    }

    // Step 4: Ensure Score bounds
    score = Math.max(0, Math.min(100, score));
    const { level, action } = getActionFromScore(score);

    // AI Explanation
    const explanationPrompt = `Generate a 3-sentence plain-English explanation of why this return claim might be suspicious. Score is ${score}/100. Deductions were: ${JSON.stringify(penaltyBreakdown)}.`;
    let explanation = await callGemini(explanationPrompt);
    if (typeof explanation === 'object') explanation = JSON.stringify(explanation);

    res.json({ score, riskLevel: level, penaltyBreakdown, recommendedAction: action, explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Fake Damage (Enhanced)
router.post('/fake-damage', upload.single('damage_photo'), async (req, res) => {
  try {
    const {
      order_date,
      return_date,
      product_sku,
      damage_description,
      previous_damage_claims
    } = req.body;

    const file = req.file;
    let score = 100;
    const penaltyBreakdown = [];

    // ─────────────────────────────────────────────
    // STEP 1 — EXIF Metadata Integrity (max 25 pts)
    // ─────────────────────────────────────────────
    let exifDateStr = null;
    try {
      const exifData = await exifr.parse(file.buffer);
      if (exifData && exifData.DateTimeOriginal) {
        const photoDate = new Date(exifData.DateTimeOriginal);
        exifDateStr = photoDate.toISOString().split('T')[0];
        const oDate = new Date(order_date);
        const rDate = new Date(return_date);
        if (photoDate < oDate || photoDate > rDate) {
          score -= 25;
          penaltyBreakdown.push({
            check: 'EXIF Integrity',
            reason: `Photo date (${exifDateStr}) is outside the order–return window`,
            points: 25
          });
        }
      }
    } catch (e) {
      console.log('EXIF parsing failed:', e.message);
    }

    const base64Data = file.buffer.toString('base64');
    const mimeType = file.mimetype;

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2 — Return Interval Risk (max 25 pts)
    // Stricter: 2 days = high risk, >3 days = very high risk
    // ─────────────────────────────────────────────────────────────────────
    const returnGap = getDaysGap(order_date, return_date);
    if (returnGap > 3) {
      score -= 25;
      penaltyBreakdown.push({
        check: 'Return Interval',
        reason: `CRITICAL: Return filed ${returnGap} days after delivery (>3 days — very high risk)`,
        points: 25
      });
    } else if (returnGap >= 2) {
      score -= 20;
      penaltyBreakdown.push({
        check: 'Return Interval',
        reason: `HIGH RISK: Return filed ${returnGap} days after delivery (2–3 days — high risk)`,
        points: 20
      });
    }

    // ─────────────────────────────────────────────────────────────────────────────────────
    // STEP 3 — Internet / Stock Photo Detection via Gemini Vision (max 30 pts)
    // ─────────────────────────────────────────────────────────────────────────────────────
    const stockPhotoPrompt = `CRITICAL FRAUD CHECK: 
1. Is this image a STOCK PHOTO or does it exist anywhere on the internet (Amazon, Flipkart, Google Images, etc.)?
2. If this image is found online, it is 100% FRAUD.
3. Look for UI elements, watermarks, or "studio" lighting.
Reply ONLY in JSON: { "is_stock_photo": true/false, "confidence": number, "reason": "string" }`;

    const stockCheckResult = await callGeminiVision(stockPhotoPrompt, mimeType, base64Data);
    if (stockCheckResult && stockCheckResult.is_stock_photo === true && stockCheckResult.confidence > 50) {
      score -= 30;
      penaltyBreakdown.push({
        check: 'Internet Image Match',
        reason: `Image found in external databases/stock libraries: ${stockCheckResult.reason}`,
        points: 30
      });
    }

    // ────────────────────────────────────────────────────────────────
    // STEP 4 — Pixel / Digital Manipulation Detection (max 20 pts)
    // ────────────────────────────────────────────────────────────────
    const manipulationPrompt = `Perform a digital forensic analysis on this image. Specifically look for:
- Clone stamp or copy-paste patterns (repeating pixel regions)
- Inconsistent JPEG compression noise (higher noise in one region = local edit)
- Unnatural hard edges around the "damage" area suggesting it was pasted in
- Lighting or shadow direction inconsistencies on the damaged region vs rest of the product
- Color banding or hue shifts near the damage

Reply ONLY in this exact JSON format:
{
  "manipulation_detected": true or false,
  "confidence": number between 0 and 100,
  "reason": "one concise sentence explaining your finding"
}`;

    const manipResult = await callGeminiVision(manipulationPrompt, mimeType, base64Data);
    if (manipResult && manipResult.manipulation_detected === true && manipResult.confidence > 60) {
      score -= 20;
      penaltyBreakdown.push({
        check: 'Pixel Manipulation',
        reason: `Digital manipulation detected (${manipResult.confidence}% confidence): ${manipResult.reason}`,
        points: 20
      });
    }

    // ──────────────────────────────────────────────────────────────────────────────────────
    // STEP 5 — SKU + Description vs Image Structural Consistency (max 15 pts)
    // Check: does the visible damage in the photo actually match what the customer described,
    // AND is that damage physically possible for the stated product type?
    // ──────────────────────────────────────────────────────────────────────────────────────
    const consistencyPrompt = `You are a product damage verification expert for e-commerce returns.

Product Type (SKU): "${product_sku}"
Customer's Damage Description: "${damage_description}"

Look at the uploaded photo and answer BOTH questions:

1. Is the type of damage described ("${damage_description}") physically plausible 
   for a product of this type ("${product_sku}")? 
   For example: "screen crack" is plausible for glass, but not for a rubber mat.

2. Does the damage VISIBLE IN THE PHOTO actually match what the customer described ("${damage_description}")?
   For example: if the customer says "deep scratch" but the photo shows a completely unscathed product, that is a mismatch.

Reply ONLY in this exact JSON format:
{
  "is_plausible": true or false,
  "description_matches_photo": true or false,
  "reason": "one concise sentence explaining your overall finding"
}`;

    const consistencyResult = await callGeminiVision(consistencyPrompt, mimeType, base64Data);
    if (consistencyResult) {
      if (consistencyResult.is_plausible === false || consistencyResult.description_matches_photo === false) {
        score -= 15;
        const why = [];
        if (consistencyResult.is_plausible === false) why.push('damage type is implausible for this product');
        if (consistencyResult.description_matches_photo === false) why.push('visible damage does not match description');
        penaltyBreakdown.push({
          check: 'SKU + Description Consistency',
          reason: `${why.join(' and ')} — ${consistencyResult.reason}`,
          points: 15
        });
      }
    }

    // ─────────────────────────────────────────────
    // STEP 6 — Claim Velocity (max 10 pts)
    // ─────────────────────────────────────────────
    if (parseInt(previous_damage_claims) > 2) {
      score -= 10;
      penaltyBreakdown.push({
        check: 'Claim Velocity',
        reason: `Customer has ${previous_damage_claims} prior damage claims in the last 6 months (>2)`,
        points: 10
      });
    }

    score = Math.max(0, score);
    const { level, action } = getActionFromScore(score);

    // ─────────────────────────────────────────────
    // AI Explanation
    // ─────────────────────────────────────────────
    const explanationPrompt = `You are a fraud analyst explaining a result to a retail seller.
Write exactly 3 sentences in plain English explaining why this damage return claim received a fraud risk score of ${score}/100.
These were the suspicious signals detected: ${JSON.stringify(penaltyBreakdown)}.
Be specific and actionable — mention which checks failed and why.
Do not use bullet points. Just 3 flowing sentences.`;

    let explanation = await callGemini(explanationPrompt);
    if (typeof explanation === 'object') explanation = JSON.stringify(explanation);

    res.json({
      score,
      riskLevel: level,
      penaltyBreakdown,
      recommendedAction: action,
      explanation,
      exifDate: exifDateStr,
      returnGapDays: returnGap,
      stockPhotoCheck: stockCheckResult || null,
      manipulationCheck: manipResult || null,
      consistencyCheck: consistencyResult || null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Return Ring (Simpler Seller-Data Approach)
router.post('/return-ring', async (req, res) => {
  try {
    const { 
      product_name, 
      product_price, 
      return_count_7days, 
      normal_return_rate, 
      pincodes, 
      timestamps, 
      payment_methods, 
      return_reasons 
    } = req.body;

    let score = 100;
    const signals = [];

    // SIGNAL 1 — SKU Return Velocity (max 30 pts)
    const velocity_ratio = return_count_7days / (normal_return_rate || 1);
    let vDeduction = 0;
    if (velocity_ratio >= 5) vDeduction = 30;
    else if (velocity_ratio >= 3) vDeduction = 20;
    else if (velocity_ratio >= 2) vDeduction = 10;
    
    if (parseFloat(product_price) >= 2000 && velocity_ratio >= 3) vDeduction += 5;
    vDeduction = Math.min(35, vDeduction);
    score -= vDeduction;
    signals.push({
      signal: "SKU Return Velocity",
      detected: vDeduction > 0,
      deduction: vDeduction,
      detail: `Returns are ${velocity_ratio.toFixed(1)}x the normal weekly rate.`
    });

    // SIGNAL 2 — Pincode Cluster (max 25 pts)
    const counts = {};
    pincodes.forEach(p => counts[p] = (counts[p] || 0) + 1);
    const max_pincode_count = Math.max(...Object.values(counts));
    const unique_pincodes = Object.keys(counts).length;
    
    let pDeduction = 0;
    if (max_pincode_count >= 3) pDeduction = 25;
    else if (max_pincode_count === 2) pDeduction = 10;

    if (pincodes.length > 4 && unique_pincodes <= 2) pDeduction += 5;
    pDeduction = Math.min(30, pDeduction);
    score -= pDeduction;

    const dupPincodes = Object.entries(counts)
      .filter(([_, count]) => count > 1)
      .map(([pincode, count]) => ({ pincode, count }));

    signals.push({
      signal: "Pincode Clustering",
      detected: pDeduction > 0,
      deduction: pDeduction,
      detail: max_pincode_count > 1 
        ? `Pincode clustering detected across ${pincodes.length} orders.` 
        : "No significant pincode clustering found.",
      duplicate_pincodes: dupPincodes
    });

    // SIGNAL 3 — Return Timing Burst (max 20 pts)
    const sortedTimes = timestamps.map(t => new Date(t)).sort((a, b) => a - b);
    const time_window_hours = (sortedTimes[sortedTimes.length - 1] - sortedTimes[0]) / (1000 * 60 * 60);
    
    let tDeduction = 0;
    if (time_window_hours <= 12) tDeduction = 20;
    else if (time_window_hours <= 48) tDeduction = 15;
    else if (time_window_hours <= 96) tDeduction = 8;

    let nearSimultaneous = false;
    for (let i = 0; i < sortedTimes.length - 1; i++) {
      if ((sortedTimes[i+1] - sortedTimes[i]) / (1000 * 60) <= 30) {
        nearSimultaneous = true;
        break;
      }
    }
    if (nearSimultaneous) tDeduction += 5;
    tDeduction = Math.min(25, tDeduction);
    score -= tDeduction;

    signals.push({
      signal: "Timing Burst",
      detected: tDeduction > 0,
      deduction: tDeduction,
      detail: `All returns filed within ${time_window_hours.toFixed(1)} hours.`,
      window_hours: time_window_hours,
      near_simultaneous: nearSimultaneous
    });

    // SIGNAL 4 — Payment Method Pattern (max 15 pts)
    let mDeduction = 0;
    const hasCOD = payment_methods.includes("Cash on Delivery (COD)");
    if (payment_methods.length === 1 && hasCOD) mDeduction = 15;
    else if (hasCOD && payment_methods.length > 1) mDeduction = 8;

    if (payment_methods.length === 1 && return_count_7days >= 4) mDeduction += 5;
    mDeduction = Math.min(20, mDeduction);
    score -= mDeduction;

    signals.push({
      signal: "Payment Uniformity",
      detected: mDeduction > 0,
      deduction: mDeduction,
      detail: hasCOD ? "High concentration of untraceable COD payments." : "Standard payment diversity."
    });

    // SIGNAL 5 — Return Reason Uniformity (max 10 pts)
    let rDeduction = 0;
    if (return_reasons.length === 1) rDeduction = 10;
    else if (return_reasons.length === 2) rDeduction = 5;
    score -= rDeduction;

    signals.push({
      signal: "Reason Uniformity",
      detected: rDeduction > 0,
      deduction: rDeduction,
      detail: `Customers used only ${return_reasons.length} unique return reason(s).`
    });

    const finalScore = Math.max(0, score);
    const riskScore = 100 - finalScore; // Risk is high when deductions are high

    let riskLevel = "LOW";
    let verdict = "Likely Coincidence";
    let action = "These returns appear to be coincidence. Process each return as per your standard policy. Monitor this SKU for the next 7 days.";

    if (riskScore > 70) {
      riskLevel = "HIGH";
      verdict = "Confirmed Ring";
      action = "FREEZE all these return requests immediately. Do not process any refund. Report this pattern to your platform's fraud team with all Order IDs as evidence. File a formal escalation through Seller Support.";
    } else if (riskScore > 30) {
      riskLevel = "MEDIUM";
      verdict = "Suspected Ring";
      action = "Do NOT process any of these refunds yet. Physically verify each returned item before issuing any refund. Request the customer to return the product first. Check if pincodes belong to same apartment complex by searching on India Post pincode finder.";
    }

    const platformSteps = {
      amazon: "Seller Central → Performance → Account Health → Contact Us → Report Fraud → Attach all Order IDs and this analysis report",
      flipkart: "Seller Hub → Help → Raise a Ticket → Select 'Return Fraud' → Upload Order IDs and pattern evidence",
      other: "Contact your platform's Seller Support helpline. Provide all Order IDs, the product SKU, and explain the pattern: same product, same area, same time window."
    };

    // AI Analysis
    const aiPrompt = `A seller has detected a suspicious return pattern for their product '${product_name}' priced at ₹${product_price}. In the last 7 days they received ${return_count_7days} returns when their normal rate is ${normal_return_rate} per week. The fraud detection score is ${riskScore}/100 — ${verdict}. Key signals found: ${signals.map(s => s.signal).join(', ')}. In 3 sentences, explain to the seller in simple language why this pattern looks like a coordinated return ring and what their single most important next step is. Do not use bullet points.`;
    
    let explanation = await callGemini(aiPrompt);
    if (typeof explanation === 'object') explanation = JSON.stringify(explanation);

    res.json({
      score: riskScore,
      risk: riskLevel,
      verdict,
      signals,
      duplicate_pincodes: dupPincodes,
      timing_window_hours: time_window_hours,
      near_simultaneous: nearSimultaneous,
      recommended_action: action,
      platform_steps: platformSteps,
      explanation
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Friendly Fraud
router.post('/friendly-fraud', async (req, res) => {
  try {
    const { delivery_timestamp, claim_timestamp, post_delivery_engagement, purchase_date, is_new_account, past_inr_claims, same_device_used } = req.body;
    let riskScore = 0;
    const penaltyBreakdown = [];

    const dTime = new Date(delivery_timestamp);
    const cTime = new Date(claim_timestamp);
    const gapMins = (cTime - dTime) / (1000 * 60);

    // Step 1: Delivery Confirmation Gap
    if (gapMins > 0 && gapMins <= 20) {
      riskScore += 60;
      penaltyBreakdown.push({ 
        check: 'Critical Delivery Gap', 
        reason: `Claim filed within ${gapMins.toFixed(1)} minutes of delivery (Extremely High Risk)`, 
        points: 60 
      });
    } else if (gapMins > 0 && gapMins < 1440) { // < 24 hours
      riskScore += 25;
      penaltyBreakdown.push({ 
        check: 'Delivery Confirmation Gap', 
        reason: `Claim filed within ${(gapMins/60).toFixed(1)} hours of delivery`, 
        points: 25 
      });
    }

    // Step 2
    if (post_delivery_engagement === true || post_delivery_engagement === 'true') {
      riskScore += 30;
      penaltyBreakdown.push({ check: 'Post-Delivery Engagement', reason: 'Customer engaged after delivery before dispute', points: 30 });
    }

    // Step 3
    const pDate = new Date(purchase_date);
    const daysSince = (cTime - pDate) / (1000 * 60 * 60 * 24);
    if (daysSince > 80) {
      riskScore += 20;
      penaltyBreakdown.push({ check: '89-Day Rule', reason: `Claim filed ${daysSince.toFixed(0)} days after purchase (>80)`, points: 20 });
    }

    // Step 4
    if (is_new_account === true || is_new_account === 'true' || parseInt(past_inr_claims) >= 2) {
      riskScore += 15;
      penaltyBreakdown.push({ check: 'Account Tenure & LTV', reason: 'New account or >=2 past INR claims', points: 15 });
    }

    // Step 5
    if (same_device_used === true || same_device_used === 'true') {
      riskScore += 10;
      penaltyBreakdown.push({ check: 'Device/IP Consistency', reason: 'Dispute filed from same device as order', points: 10 });
    }

    riskScore = Math.min(100, riskScore);

    let level = 'LOW';
    let action = 'Auto-approve. Likely genuine mistake.';
    if (riskScore >= 31 && riskScore <= 70) { level = 'MEDIUM'; action = 'Manual review. Contact customer, send delivery photo.'; }
    if (riskScore > 70) { level = 'HIGH'; action = 'Decline. Build Compelling Evidence package for bank.'; }

    const explanationPrompt = `Generate a 3-sentence plain-English explanation of why this friendly fraud claim might be suspicious. Risk score is ${riskScore}/100. Deductions were: ${JSON.stringify(penaltyBreakdown)}.`;
    let explanation = await callGemini(explanationPrompt);
    if (typeof explanation === 'object') explanation = JSON.stringify(explanation);

    res.json({ score: riskScore, riskLevel: level, penaltyBreakdown, recommendedAction: action, explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Receipt Fraud
router.post('/receipt-fraud', upload.fields([{ name: 'retailer_receipt' }, { name: 'customer_receipt' }]), async (req, res) => {
  try {
    const retailerFile = req.files['retailer_receipt'][0];
    const customerFile = req.files['customer_receipt'][0];
    const { order_amount } = req.body;

    const extractText = async (file) => {
      if (file.mimetype === 'application/pdf') {
        const data = await pdfParse(file.buffer);
        return data.text;
      }
      return ""; // Images handled by Vision
    };

    const retailerText = await extractText(retailerFile);
    const customerText = await extractText(customerFile);

    const prompt = `You are a forensic document examiner. You will receive TWO receipt images:
    - IMAGE 1: The RETAILER'S ORIGINAL receipt (The Source of Truth)
    - IMAGE 2: The CUSTOMER'S SUBMITTED receipt (The potentially manipulated document)

    Perform an "Image Reversing" Forensic Process:
    1. READ both images in full detail.
    2. DESCRIBE Image 1 (Retailer): Extract all key text, layout features, fonts, and totals.
    3. DESCRIBE Image 2 (Customer): Extract the same from the customer's version.
    4. COMPARE & REVERSE: Identify exactly where the customer's image deviates from the original. Look for "reversed" logic, altered digits, font mismatches, and visual artifacts of digital tampering (blurring, patching).

    Original Order Amount on file: ₹${order_amount}

    FORENSIC CHECKLIST:
    - Digit Manipulation: Was a '1' changed to a '7'? Was a '0' added?
    - Content Reversing: Did they change the items to higher-value products?
    - Visual Artifacts: Check for inconsistent pixel noise or "ghosting" around the total amount.
    - Alignment: Are the characters perfectly aligned, or is there a 1-2 pixel shift suggesting an overlay?

    Respond ONLY with this valid JSON object:
    {
      "tampering_detected": boolean,
      "confidence": number (0-100),
      "verdict": "MATCHED" | "TAMPERED" | "SUSPICIOUS",
      "retailer_receipt_description": "Detailed description of the original receipt content.",
      "customer_receipt_description": "Detailed description of the submitted receipt content.",
      "forensic_reversing_analysis": "Expert breakdown of exactly what was modified or 'reversed' in the customer's version.",
      "mismatches": [
        {
          "field": "string",
          "original_value": "string",
          "customer_value": "string", 
          "severity": "HIGH" | "MEDIUM" | "LOW",
          "note": "Forensic observation"
        }
      ],
      "summary": "3 sentence summary of the forensic reversal findings.",
      "recommended_action": "Next steps for the retailer."
    }`;

    const filesToPass = [
      { base64Data: retailerFile.buffer.toString('base64'), mimeType: retailerFile.mimetype },
      { base64Data: customerFile.buffer.toString('base64'), mimeType: customerFile.mimetype }
    ];

    const result = await callGeminiVisionMultiple(prompt, filesToPass);
    res.json(result || { tampering_detected: false, confidence: 0, summary: 'API call failed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. INR Abuse
router.post('/inr-abuse', async (req, res) => {
  try {
    const { carrier_delivered, gps_matches_address, claim_filed_hours_after_delivery, past_inr_claims, has_delivery_photo, has_signature, pincode_theft_risk } = req.body;
    let riskScore = 0;
    const penaltyBreakdown = [];

    if ((carrier_delivered === true || carrier_delivered === 'true') && (gps_matches_address === true || gps_matches_address === 'true')) {
      riskScore += 35;
      penaltyBreakdown.push({ check: 'Carrier GPS Conflict', reason: 'Carrier delivered and GPS matches address', points: 35 });
    }

    if (parseInt(claim_filed_hours_after_delivery) < 2) {
      riskScore += 20;
      penaltyBreakdown.push({ check: 'Immediate Claim Filing', reason: 'Claim filed < 2 hours after delivery', points: 20 });
    }

    if (parseInt(past_inr_claims) >= 2) {
      riskScore += 20;
      penaltyBreakdown.push({ check: 'Account INR History', reason: '>= 2 past INR claims', points: 20 });
    }

    if (has_delivery_photo === true || has_delivery_photo === 'true' || has_signature === true || has_signature === 'true') {
      riskScore += 15;
      penaltyBreakdown.push({ check: 'Package Proof', reason: 'Carrier provided photo or signature', points: 15 });
    }

    if (pincode_theft_risk === 'Low') {
      riskScore += 10;
      penaltyBreakdown.push({ check: 'Neighborhood Risk', reason: 'Low theft risk pin code', points: 10 });
    }

    riskScore = Math.min(100, riskScore);

    let level = 'LOW';
    let action = 'Auto-approve reshipment or refund. Likely porch piracy or carrier error.';
    if (riskScore >= 31 && riskScore <= 70) { level = 'MEDIUM'; action = 'Manual review. Ask customer to check with neighbors. Wait 24 hours.'; }
    if (riskScore > 70) { level = 'HIGH'; action = 'Decline. Send customer the Proof of Delivery package.'; }

    const explanationPrompt = `Generate a 3-sentence plain-English explanation of why this INR claim might be suspicious. Risk score is ${riskScore}/100. Deductions were: ${JSON.stringify(penaltyBreakdown)}.`;
    let explanation = await callGemini(explanationPrompt);
    if (typeof explanation === 'object') explanation = JSON.stringify(explanation);

    res.json({ score: riskScore, riskLevel: level, penaltyBreakdown, recommendedAction: action, explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
