const MONTH_MAP = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
}

/**
 * Round years to 1 decimal place
 * @param {number} years
 * @param {number} months
 * @returns {number}
 */
function toDecimal(years, months = 0) {
  return Math.round((parseFloat(years) + parseFloat(months) / 12) * 10) / 10
}

/**
 * Extract years from explicit text patterns.
 * @param {string} text
 * @returns {number|null}
 */
function extractExplicit(text) {
  const patterns = [
    // "3-5 years of experience" → average
    /(\d+)\s*[-–to]+\s*(\d+)\s*\+?\s*years?\s*(?:of\s+)?(?:relevant\s+|related\s+)?experience/i,
    // "5+ years of experience"
    /(\d+)\s*\+\s*years?\s*(?:of\s+)?(?:relevant\s+|related\s+)?experience/i,
    // "minimum 4 years"
    /(?:minimum|min\.?|at\s+least)\s*(\d+)\s*years?\s*(?:of\s+)?experience/i,
    // "5 years of experience"
    /(\d+)\s*years?\s*(?:of\s+)?(?:relevant\s+|related\s+|professional\s+)?experience/i,
    // "experience: 5+ years"
    /experience\s*[:\-–]\s*(\d+)\s*\+?\s*years?/i,
    // "Bachelor's with 5+ years"
    /(?:bachelor'?s?|master'?s?|phd)\s*(?:degree)?\s*(?:with|and|\+)\s*(\d+)\s*\+?\s*years?/i,
    // "5 yrs"
    /(\d+)\s*yrs?\s*(?:of\s+)?experience/i,
    // "7-10 years"
    /(\d+)\s*[-–]\s*(\d+)\s*years?\s*(?:of\s+)?(?:related\s+)?experience/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      // If range match (two capture groups), take the average
      if (match[2] && !isNaN(match[2])) {
        return toDecimal((parseInt(match[1]) + parseInt(match[2])) / 2)
      }
      return toDecimal(match[1])
    }
  }
  return null
}

/**
 * Extract total years of experience from date ranges in resume text.
 * Merges overlapping date ranges to avoid double-counting.
 * @param {string} text
 * @returns {number|null}
 */
function extractFromDateRanges(text) {
  // Pattern: "Month YYYY – Month YYYY" or "YYYY – YYYY" or "Month YYYY – Present"
  const datePattern = /(?:([a-z]+)\.?\s+)?(\d{4})\s*[-–—to]+\s*(?:([a-z]+)\.?\s+)?(\d{4}|present|current|now)/gi

  const ranges = []
  let match

  while ((match = datePattern.exec(text)) !== null) {
    const startMonthStr = match[1]?.toLowerCase()
    const startYear = parseInt(match[2])
    const endMonthStr = match[3]?.toLowerCase()
    const endYearStr = match[4].toLowerCase()

    const isPresent = ['present', 'current', 'now'].includes(endYearStr)
    const now = new Date()

    const startMonth = MONTH_MAP[startMonthStr] ?? 0
    const endYear = isPresent ? now.getFullYear() : parseInt(endYearStr)
    const endMonth = isPresent ? now.getMonth() : (MONTH_MAP[endMonthStr] ?? 11)

    // Sanity check: valid year range
    if (
      startYear >= 1990 &&
      startYear <= now.getFullYear() &&
      endYear >= startYear
    ) {
      const startMs = new Date(startYear, startMonth).getTime()
      const endMs = new Date(endYear, endMonth).getTime()
      if (endMs > startMs) {
        ranges.push({ startMs, endMs })
      }
    }
  }

  if (ranges.length === 0) return null

  // Sort by start date
  ranges.sort((a, b) => a.startMs - b.startMs)

  // Merge overlapping ranges
  const merged = [{ ...ranges[0] }]
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1]
    if (ranges[i].startMs <= last.endMs) {
      last.endMs = Math.max(last.endMs, ranges[i].endMs)
    } else {
      merged.push({ ...ranges[i] })
    }
  }

  // Sum total time
  const totalMs = merged.reduce((sum, r) => sum + (r.endMs - r.startMs), 0)
  const totalYears = totalMs / (1000 * 60 * 60 * 24 * 365.25)

  return totalYears > 0.5 ? toDecimal(totalYears) : null
}

/**
 * For resumes: try date ranges first (more accurate), then explicit.
 * @param {string} text
 * @returns {number|null}
 */
function extractExperienceFromResume(text) {
  const fromDates = extractFromDateRanges(text)
  if (fromDates !== null && fromDates > 0) return fromDates
  return extractExplicit(text)
}

/**
 * For JDs: explicit mentions only (no date ranges in JDs).
 * @param {string} text
 * @returns {number|null}
 */
function extractExperienceFromJD(text) {
  // Check for fresher / entry level first
  if (/\b(?:fresher|entry.?level|fresh\s*graduate|0\s*years?|no\s*experience)\b/i.test(text)) {
    return 0
  }
  return extractExplicit(text)
}

export { extractExperienceFromResume, extractExperienceFromJD }