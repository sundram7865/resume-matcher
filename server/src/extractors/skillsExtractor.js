
import { ALL_SKILLS, ALIAS_TO_CANONICAL } from './skillsDictionary.js'

/**
 * Normalize text for matching
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s#+.\-/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Escape special regex characters in a skill string
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Convert canonical skill name to display name
 * @param {string} skill
 * @returns {string}
 */
function prettifySkill(skill) {
  const DISPLAY_MAP = {
    'javascript':     'JavaScript',
    'typescript':     'TypeScript',
    'python':         'Python',
    'java':           'Java',
    'c++':            'C++',
    'c#':             'C#',
    'c':              'C',
    'ruby':           'Ruby',
    'go':             'Go',
    'golang':         'Go',
    'rust':           'Rust',
    'kotlin':         'Kotlin',
    'swift':          'Swift',
    'scala':          'Scala',
    'php':            'PHP',
    'bash':           'Bash',
    'shell':          'Shell',
    'powershell':     'PowerShell',
    'react':          'React',
    'angular':        'Angular',
    'vue':            'Vue.js',
    'svelte':         'Svelte',
    'next.js':        'Next.js',
    'html':           'HTML5',
    'html5':          'HTML5',
    'css':            'CSS3',
    'css3':           'CSS3',
    'sass':           'Sass',
    'tailwind':       'Tailwind CSS',
    'bootstrap':      'Bootstrap',
    'jquery':         'jQuery',
    'redux':          'Redux',
    'graphql':        'GraphQL',
    'node':           'Node.js',
    'nodejs':         'Node.js',
    'node.js':        'Node.js',
    'express':        'Express.js',
    'spring boot':    'Spring Boot',
    'spring':         'Spring',
    'django':         'Django',
    'flask':          'Flask',
    'fastapi':        'FastAPI',
    'rails':          'Ruby on Rails',
    'laravel':        'Laravel',
    'asp.net':        'ASP.NET',
    '.net':           '.NET',
    'grpc':           'gRPC',
    'rest':           'REST API',
    'rest api':       'REST API',
    'microservices':  'Microservices',
    'mysql':          'MySQL',
    'postgresql':     'PostgreSQL',
    'postgres':       'PostgreSQL',
    'sqlite':         'SQLite',
    'mongodb':        'MongoDB',
    'redis':          'Redis',
    'cassandra':      'Cassandra',
    'elasticsearch':  'Elasticsearch',
    'dynamodb':       'DynamoDB',
    'firebase':       'Firebase',
    'sql':            'SQL',
    'nosql':          'NoSQL',
    'db2':            'DB2',
    'aws':            'AWS',
    'azure':          'Azure',
    'gcp':            'GCP',
    'docker':         'Docker',
    'kubernetes':     'Kubernetes',
    'k8s':            'Kubernetes',
    'terraform':      'Terraform',
    'ansible':        'Ansible',
    'jenkins':        'Jenkins',
    'ci/cd':          'CI/CD',
    'cicd':           'CI/CD',
    'linux':          'Linux',
    'unix':           'Unix',
    'git':            'Git',
    'github':         'GitHub',
    'gitlab':         'GitLab',
    'kafka':          'Apache Kafka',
    'spark':          'Apache Spark',
    'hadoop':         'Hadoop',
    'airflow':        'Apache Airflow',
    'tensorflow':     'TensorFlow',
    'pytorch':        'PyTorch',
    'keras':          'Keras',
    'scikit-learn':   'scikit-learn',
    'sklearn':        'scikit-learn',
    'pandas':         'Pandas',
    'numpy':          'NumPy',
    'machine learning': 'Machine Learning',
    'deep learning':  'Deep Learning',
    'nlp':            'NLP',
    'computer vision':'Computer Vision',
    'agile':          'Agile',
    'scrum':          'Scrum',
    'kanban':         'Kanban',
    'devops':         'DevOps',
    'tdd':            'TDD',
    'jest':           'Jest',
    'pytest':         'pytest',
    'junit':          'JUnit',
    'selenium':       'Selenium',
    'cypress':        'Cypress',
    'postman':        'Postman',
    'swagger':        'Swagger',
    'jira':           'Jira',
    'prometheus':     'Prometheus',
    'grafana':        'Grafana',
    'kibana':         'Kibana',
    'rabbitmq':       'RabbitMQ',
    'nginx':          'Nginx',
    'ui/ux':          'UI/UX',
    'mpi':            'MPI',
    'openmp':         'OpenMP',
    'cuda':           'CUDA',
    'hpc':            'HPC',
    'fpga':           'FPGA',
    'rtos':           'RTOS',
    'embedded':       'Embedded Systems',
    'full stack':     'Full Stack',
    'sdlc':           'SDLC',
    'oop':            'OOP',
    'system design':  'System Design',
    'protobuf':       'Protobuf',
    'solidity':       'Solidity',
    'fortran':        'Fortran',
    'cobol':          'COBOL',
    'matlab':         'MATLAB',
  }
  return DISPLAY_MAP[skill.toLowerCase()] ||
    skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/**
 * Main skill extraction function.
 * @param {string} text - Raw JD or resume text
 * @returns {string[]} - Array of prettified skill names
 */
function extractSkills(text) {
  const normalized = normalizeText(text)
  const found = new Set()

  // Layer 1: Match every skill in dictionary using word-boundary regex
  for (const skill of ALL_SKILLS) {
    const escaped = escapeRegex(skill)
    const pattern = new RegExp(`(?<![\\w#+])${escaped}(?![\\w#+])`, 'i')
    if (pattern.test(normalized)) {
      found.add(skill.toLowerCase())
    }
  }

  // Layer 2: Resolve aliases (e.g. "k8s" → "kubernetes")
  for (const [alias, canonical] of Object.entries(ALIAS_TO_CANONICAL)) {
    const escaped = escapeRegex(alias)
    const pattern = new RegExp(`(?<![\\w#+])${escaped}(?![\\w#+])`, 'i')
    if (pattern.test(normalized)) {
      found.add(canonical.toLowerCase())
    }
  }

  // Layer 3: Extract from "skills: x, y, z" context patterns
  const contextPattern = /(?:skills?|technologies|tools?|stack|proficient in|experience with|expertise in)[:\s]+([^\n.]{5,200})/gi
  let match
  while ((match = contextPattern.exec(text)) !== null) {
    const tokens = normalizeText(match[1])
      .split(/[,•·|;\s\/]+/)
      .map(t => t.trim())
      .filter(Boolean)
    for (const token of tokens) {
      if (ALL_SKILLS.includes(token)) found.add(token)
      if (ALIAS_TO_CANONICAL[token]) found.add(ALIAS_TO_CANONICAL[token])
    }
  }

  // Layer 4: Handle "C/C++" slash-separated pairs
  const slashPairs = normalized.match(/\b(\w[\w+#]*)\s*\/\s*(\w[\w+#]*)\b/g) || []
  for (const pair of slashPairs) {
    for (const part of pair.split('/').map(p => p.trim().toLowerCase())) {
      if (ALL_SKILLS.includes(part)) found.add(part)
    }
  }

  return [...found].map(s => prettifySkill(s)).sort()
}

export { extractSkills, normalizeText, prettifySkill }