const SALARY_PATTERNS = [
  
  {
    // "Salary: 12 LPA" or "CTC: 12 LPA"
    regex: /(?:salary|ctc|compensation|package)\s*[:\-–]?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:[.,]\d+)?)\s*(?:lpa|l\.p\.a\.?|lakhs?\s*per\s*annum)/i,
    format: m => `${m[1]} LPA`
  },
  {
    // "CTC: ₹10,00,000 per annum"
    regex: /(?:ctc|cost\s*to\s*company)\s*[:\-–]?\s*(?:₹|rs\.?|inr)\s*(\d{1,3}(?:[,]\d{2,3})+)/i,
    format: m => `₹${m[1]} per annum`
  },
  {
    // Standalone "12 LPA"
    regex: /(\d+(?:\.\d+)?)\s*(?:lpa|l\.p\.a\.?)/i,
    format: m => `${m[1]} LPA`
  },
  // ── USD ranges ───────────────────────────────────────────
  {
    // "$120,000 - $150,000 per year"
    regex: /\$\s*(\d{1,3}(?:[,]\d{3})*(?:\.\d+)?)\s*(?:[-–—to]+)\s*\$?\s*(\d{1,3}(?:[,]\d{3})*(?:\.\d+)?)\s*(?:per\s*year|\/year|\/yr|annually|per\s*annum)?/i,
    format: m => `$${m[1]} - $${m[2]} per year`
  },
  {
    // "$58.65/hour to $181,000/year"
    regex: /\$\s*(\d{1,3}(?:\.\d+)?)\s*(?:\/hour|per\s*hour)\s*(?:to|-)\s*\$\s*(\d{1,3}(?:[,]\d{3})*)\s*(?:\/year|per\s*year)/i,
    format: m => `$${m[1]}/hour - $${m[2]}/year`
  },
  {
    // "$58.65/hour"
    regex: /\$\s*(\d{1,3}(?:\.\d+)?)\s*(?:\/hour|per\s*hour|hourly)/i,
    format: m => `$${m[1]} per hour`
  },
  {
    // "Salary: $176,000.00 - $242,000.00"
    regex: /salary\s*[:\-–]?\s*\$\s*(\d{1,3}(?:[,]\d{3})*(?:\.\d{2})?)\s*[-–—]\s*\$?\s*(\d{1,3}(?:[,]\d{3})*(?:\.\d{2})?)/i,
    format: m => `$${m[1]} - $${m[2]}`
  },
  {
    // "base compensation range: 61087 - 104364"
    regex: /(?:base\s*(?:compensation|pay|salary)\s*(?:range)?|compensation\s*range)[:\s]+\$?\s*(\d{4,6})\s*[-–—]\s*\$?\s*(\d{4,6})/i,
    format: m => `$${m[1]} - $${m[2]}`
  },
  {
    // "Global Comp $180,000 - $220,000"
    regex: /(?:global\s*comp|pay\s*range|compensation)[:\s]*\$\s*(\d{1,3}(?:[,]\d{3})*)\s*[-–—]\s*\$?\s*(\d{1,3}(?:[,]\d{3})*)/i,
    format: m => `$${m[1]} - $${m[2]}`
  },
  {
    // Single USD value
    regex: /\$\s*(\d{1,3}(?:[,]\d{3})*)\s*(?:per\s*year|\/year|annually)/i,
    format: m => `$${m[1]} per year`
  },
]

/**
 * Extract salary string from text.
 * @param {string} text - Raw JD or resume text
 * @returns {string|null} - Formatted salary string or null
 */
function extractSalary(text) {
  for (const { regex, format } of SALARY_PATTERNS) {
    const match = text.match(regex)
    if (match) return format(match)
  }
  return null
}

export { extractSalary }