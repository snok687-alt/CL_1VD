// logger.js - Advanced Logging System
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'logs');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOG_FILES = 5;

// สร้าง logs directory ถ้ายังไม่มี
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL 
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] 
  : LOG_LEVELS.INFO;

/**
 * Format log message
 */
function formatLog(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...data
  };
  
  return JSON.stringify(logData);
}

/**
 * Write to log file
 */
function writeToFile(filename, content) {
  const filepath = path.join(LOG_DIR, filename);
  
  try {
    // Check file size
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > MAX_LOG_SIZE) {
        rotateLogFile(filename);
      }
    }
    
    fs.appendFileSync(filepath, content + '\n');
  } catch (error) {
    console.error('❌ Failed to write log:', error.message);
  }
}

/**
 * Rotate log files
 */
function rotateLogFile(filename) {
  for (let i = MAX_LOG_FILES - 1; i > 0; i--) {
    const oldFile = path.join(LOG_DIR, `${filename}.${i}`);
    const newFile = path.join(LOG_DIR, `${filename}.${i + 1}`);
    
    if (fs.existsSync(oldFile)) {
      if (i === MAX_LOG_FILES - 1) {
        fs.unlinkSync(oldFile);
      } else {
        fs.renameSync(oldFile, newFile);
      }
    }
  }
  
  const currentFile = path.join(LOG_DIR, filename);
  const firstRotate = path.join(LOG_DIR, `${filename}.1`);
  
  if (fs.existsSync(currentFile)) {
    fs.renameSync(currentFile, firstRotate);
  }
}

/**
 * Logger class
 */
class Logger {
  constructor(module = 'app') {
    this.module = module;
  }
  
  log(level, message, data = {}) {
    const levelNum = LOG_LEVELS[level.toUpperCase()];
    
    if (levelNum > CURRENT_LOG_LEVEL) {
      return;
    }
    
    const logMessage = formatLog(level, message, {
      module: this.module,
      ...data
    });
    
    // Console output
    const emoji = {
      ERROR: '❌',
      WARN: '⚠️',
      INFO: 'ℹ️',
      DEBUG: '🔍'
    };
    
    console.log(`${emoji[level.toUpperCase()]} [${this.module}] ${message}`, 
      Object.keys(data).length > 0 ? data : '');
    
    // File output
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-${level.toLowerCase()}.log`;
    writeToFile(filename, logMessage);
    
    // Separate file for errors
    if (level === 'ERROR') {
      writeToFile(`${date}-error.log`, logMessage);
    }
  }
  
  error(message, data = {}) {
    this.log('ERROR', message, data);
  }
  
  warn(message, data = {}) {
    this.log('WARN', message, data);
  }
  
  info(message, data = {}) {
    this.log('INFO', message, data);
  }
  
  debug(message, data = {}) {
    this.log('DEBUG', message, data);
  }
}

// Export singleton instance
const logger = new Logger('system');

// Export Logger class for module-specific loggers
logger.Logger = Logger;

module.exports = logger;