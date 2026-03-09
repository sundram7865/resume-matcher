import { extractSkills }           from './Skillsextractor.js'
import { extractSalary }           from './salaryExtractor.js'
import { extractExperienceFromJD } from './experienceExtractor.js'

// Headers that signal "required skills" section
const REQUIRED_HEADERS = [
  /required\s+(?:qualifications?|skills?|experience|technologies)/i,
  /must\s+have/i,
  /minimum\s+qualifications?/i,
  /basic\s+qualifications?/i,
  /mandatory\s+(?:skills?|requirements?)/i,
  /(?:skills?|qualifications?)\s+required/i,
  /what\s+you\s+need/i,
  /key\s+(?:skills?|requirements?|qualifications?)/i,
]

// Headers that signal "optional/nice-to-have" section
const OPTIONAL_HEADERS = [
  /(?:good|nice)\s+to\s+have/i,
  /preferred\s+(?:qualifications?|skills?|experience)/i,
  /desired\s+(?:qualifications?|skills?|experience|multipliers?)/i,
  /optional\s+(?:skills?|requirements?)/i,
  /bonus\s+(?:skills?|points?)/i,
  /what\s+we'?d?\s+like/i,
  /additional\s+(?:skills?|qualifications?)/i,
  /plus(?:es)?/i,
]

// Headers that reset section to "other" (not skills-related)
const OTHER_HEADERS = [
  /^responsibilities/i,
  /^what\s+you'?ll?\s+do/i,
  /^overview/i,
  /^about\s+(?:the\s+)?(?:role|company|us)/i,
  /^compensation/i,
  /^benefits/i,
  /^equal\s+opportunity/i,
  /^disclaimer/i,
  /^closing/i,
]

/**
 * Split JD text into required/optional/other sections.
 * @param {string} text
 * @returns {{ required: string, optional: string, other: string }}
 */
function splitSections(text) {
  const lines = text.split('\n')
  let current = 'other'
  const sections = { required: [], optional: [], other: [] }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { sections[current].push(line); continue }

    if (REQUIRED_HEADERS.some(r => r.test(trimmed))) {
      current = 'required'
    } else if (OPTIONAL_HEADERS.some(r => r.test(trimmed))) {
      current = 'optional'
    } else if (OTHER_HEADERS.some(r => r.test(trimmed))) {
      current = 'other'
    }

    sections[current].push(line)
  }

  return {
    required: sections.required.join('\n'),
    optional: sections.optional.join('\n'),
    other:    sections.other.join('\n'),
  }
}

/**
 * Extract job role title from JD text.
 * @param {string} text
 * @returns {string}
 */
function extractRoleTitle(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Check first 8 lines for a role-like short line
  for (const line of lines.slice(0, 8)) {
    if (
      line.length > 5 && line.length < 80 &&
      /engineer|developer|scientist|architect|analyst|programmer|designer/i.test(line) &&
      !/http|@|\.com|apply|equal|opportunity/i.test(line)
    ) {
      return line
    }
  }

  // Fallback patterns
  const patterns = [
    /(?:position|role|job\s*title|title)\s*[:\-–]\s*(.{5,60})/i,
    /(?:seeking|hiring|looking\s+for)\s+(?:a\s+)?(.{5,60}(?:engineer|developer|analyst))/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1].trim()
  }

  return 'Software Engineer'
}

/**
 * Generate a short about-role summary (first meaningful paragraph).
 * @param {string} text
 * @returns {string}
 */
function generateSummary(text) {
  // Try to find overview/opportunity paragraph
  const overviewPattern = /(?:position\s+overview|the\s+opportunity|about\s+this\s+role|job\s+description|overview)[:\s]*\n+([\s\S]{80,400}?)(?:\n\n|\n[A-Z•])/i
  const m = text.match(overviewPattern)
  if (m) {
    return m[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 300)
  }

  // Fallback: first substantial paragraph
  const paragraphs = text.split(/\n\n+/).map(p => p.replace(/\n/g, ' ').trim())
  for (const para of paragraphs) {
    if (
      para.length >= 80 && para.length <= 600 &&
      !/^[•\-*\d]/.test(para) &&
      !/equal\s+opportunity|affirmative|compensation|benefit|disclaimer/i.test(para)
    ) {
      return para.substring(0, 300).trim()
    }
  }

  return text.substring(0, 200).replace(/\n/g, ' ').trim()
}

/**
 * Master JD processor — runs all extractors and returns structured data.
 * @param {string} jdText - Raw JD text
 * @param {string} jobId  - Job ID string
 * @returns {object}      - Fully extracted JD object
 */
function processJobDescription(jdText, jobId) {
  const sections = splitSections(jdText)

  // Extract skills per section
  const requiredSkills = extractSkills(sections.required || jdText)
  const optionalSkills = extractSkills(sections.optional)
    .filter(s => !requiredSkills.includes(s))

  // If section splitting didn't work, all skills go to required
  const allSkills = [...new Set([...requiredSkills, ...optionalSkills])]

  return {
    jobId,
    role:               extractRoleTitle(jdText),
    aboutRole:          generateSummary(jdText),
    salary:             extractSalary(jdText),
    requiredExperience: extractExperienceFromJD(jdText),
    requiredSkills:     requiredSkills.length > 0 ? requiredSkills : allSkills,
    optionalSkills:     optionalSkills,
    allSkills,
    rawText:            jdText,
  }
}

export { processJobDescription, splitSections, extractRoleTitle }