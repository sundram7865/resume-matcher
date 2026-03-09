import fs       from 'fs'
import path     from 'path'
import pdfParse from 'pdf-parse'
import mammoth  from 'mammoth'

import { extractName }                 from '../extractors/nameExtractor.js'
import { extractSkills }               from '../extractors/skillsExtractor.js'
import { extractExperienceFromResume } from '../extractors/experienceExtractor.js'
import { extractSalary }               from '../extractors/salaryExtractor.js'

/**
 * Extract text from a PDF file using pdf-parse.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function fromPDF(filePath) {
  const buffer = fs.readFileSync(filePath)
  const data   = await pdfParse(buffer)
  return data.text
}

/**
 * Extract text from a DOCX file using mammoth.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function fromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath })
  return result.value
}

/**
 * Extract text from a plain TXT file.
 * @param {string} filePath
 * @returns {string}
 */
function fromTXT(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

/**
 * Get raw text from any supported file type.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.pdf':   return await fromPDF(filePath)
    case '.docx':
    case '.doc':   return await fromDOCX(filePath)
    case '.txt':
    case '.text':  return fromTXT(filePath)
    default:
      throw new Error(`Unsupported file type: ${ext}. Use PDF, DOCX, or TXT.`)
  }
}

/**
 * Parse a resume file and return structured data.
 * @param {string} filePath
 * @returns {Promise<object>}
 */
async function parseResumeFile(filePath) {
  const rawText = await extractText(filePath)
  return buildResumeData(rawText)
}

/**
 * Parse a resume from raw text string (for API text-input mode).
 * @param {string} rawText
 * @returns {object}
 */
function parseResumeText(rawText) {
  return buildResumeData(rawText)
}

/**
 * Run all extractors on raw text and return structured object.
 * @param {string} rawText
 * @returns {object}
 */
function buildResumeData(rawText) {
  return {
    name:              extractName(rawText),
    skills:            extractSkills(rawText),
    yearOfExperience:  extractExperienceFromResume(rawText),
    salaryExpectation: extractSalary(rawText),
    rawText,
  }
}

export { parseResumeFile, parseResumeText, extractText }