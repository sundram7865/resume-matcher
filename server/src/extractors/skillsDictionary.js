

const SKILLS_DICTIONARY = {
  languages: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c',
    'ruby', 'go', 'golang', 'rust', 'kotlin', 'swift', 'scala', 'php',
    'perl', 'r', 'matlab', 'fortran', 'cobol', 'haskell', 'dart',
    'lua', 'bash', 'shell', 'powershell', 'groovy', 'assembly', 'julia'
  ],
  frontend: [
    'react', 'reactjs', 'angular', 'angularjs', 'vue', 'vuejs', 'svelte',
    'nextjs', 'next.js', 'nuxtjs', 'html', 'html5', 'css', 'css3',
    'sass', 'scss', 'less', 'bootstrap', 'tailwind', 'tailwindcss',
    'material-ui', 'mui', 'jquery', 'webpack', 'vite', 'babel',
    'redux', 'mobx', 'zustand', 'graphql', 'apollo'
  ],
  backend: [
    'node', 'nodejs', 'express', 'expressjs', 'fastify', 'nestjs',
    'spring', 'spring boot', 'django', 'flask', 'fastapi', 'rails',
    'laravel', 'asp.net', '.net', 'gin', 'fiber', 'grpc',
    'rest', 'restful', 'microservices', 'serverless'
  ],
  databases: [
    'mysql', 'postgresql', 'postgres', 'sqlite', 'sql server', 'mssql',
    'oracle', 'mongodb', 'redis', 'cassandra', 'couchdb', 'dynamodb',
    'firestore', 'firebase', 'elasticsearch', 'neo4j', 'influxdb',
    'sql', 'nosql', 'db2'
  ],
  cloud_devops: [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'helm',
    'terraform', 'ansible', 'chef', 'jenkins', 'gitlab ci', 'github actions',
    'circleci', 'ci/cd', 'cicd', 'nginx', 'apache', 'linux', 'unix',
    'prometheus', 'grafana', 'kibana', 'elk', 'splunk', 'devops',
    'devsecops', 'cloudformation', 'pulumi'
  ],
  data_ml: [
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'sklearn', 'pandas', 'numpy', 'scipy', 'matplotlib',
    'spark', 'hadoop', 'kafka', 'airflow', 'nlp', 'computer vision',
    'neural network', 'bert', 'gpt', 'data pipeline', 'etl',
    'tableau', 'power bi', 'looker', 'reinforcement learning'
  ],
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'svn', 'jira', 'confluence',
    'agile', 'scrum', 'kanban', 'tdd', 'bdd', 'jest', 'mocha', 'chai',
    'pytest', 'junit', 'selenium', 'cypress', 'playwright', 'postman',
    'swagger', 'openapi', 'maven', 'gradle', 'npm', 'yarn',
    'sonarqube', 'eslint', 'rabbitmq', 'activemq', 'sqs',
    'oauth', 'jwt', 'ssl', 'tls', 'rest api', 'api',
    'mpi', 'openmp', 'cuda', 'hpc', 'fpga', 'rtos', 'embedded'
  ],
  domain: [
    'full stack', 'fullstack', 'sdlc', 'oop', 'system design',
    'microservices', 'distributed systems', 'ui/ux', 'responsive design',
    'blockchain', 'web3', 'solidity', 'protobuf', 'yaml', 'json',
    'typescript', 'opengl', 'signal processing', 'linear algebra'
  ]
}

// All skills flattened into one array
const ALL_SKILLS = Object.values(SKILLS_DICTIONARY).flat()

// Alias map: variations → canonical name
const SKILL_ALIASES = {
  'node.js':        ['nodejs', 'node js', 'node'],
  'react':          ['reactjs', 'react.js'],
  'angular':        ['angularjs', 'angular.js'],
  'vue':            ['vuejs', 'vue.js'],
  'next.js':        ['nextjs', 'next js'],
  'c++':            ['cpp', 'c/c++'],
  'c#':             ['csharp', 'c sharp'],
  '.net':           ['dotnet', 'dot net'],
  'kubernetes':     ['k8s'],
  'postgresql':     ['postgres'],
  'scikit-learn':   ['sklearn'],
  'elasticsearch':  ['elastic search'],
  'ci/cd':          ['cicd', 'ci cd', 'continuous integration', 'continuous deployment'],
  'rest api':       ['restful api', 'restful', 'rest apis'],
  'spring boot':    ['spring-boot', 'springboot'],
  'machine learning': ['ml'],
  'deep learning':  ['dl'],
  'docker':         ['containerization'],
  'agile':          ['agile methodology'],
  'tdd':            ['test driven development'],
  'microservices':  ['micro services', 'micro-services'],
  'ui/ux':          ['ui ux', 'ux/ui'],
  'github actions': ['gh actions'],
  'gitlab ci':      ['gitlab-ci', 'gitlab cicd'],
}

// Reverse alias map: alias → canonical
const ALIAS_TO_CANONICAL = {}
for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_TO_CANONICAL[alias.toLowerCase()] = canonical.toLowerCase()
  }
}

module.exports = { SKILLS_DICTIONARY, ALL_SKILLS, SKILL_ALIASES, ALIAS_TO_CANONICAL }