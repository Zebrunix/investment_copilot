export type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

export class Logger {
  private static formatError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    return error;
  }

  private static createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? this.formatError(data) : undefined
    };
  }

  static info(message: string, data?: any) {
    const entry = this.createLogEntry('info', message, data);
    console.log(`[${entry.timestamp}] INFO: ${entry.message}`, entry.data || '');
  }

  static warn(message: string, data?: any) {
    const entry = this.createLogEntry('warn', message, data);
    console.warn(`[${entry.timestamp}] WARN: ${entry.message}`, entry.data || '');
  }

  static error(message: string, error?: any) {
    const entry = this.createLogEntry('error', message, error);
    console.error(`[${entry.timestamp}] ERROR: ${entry.message}`, entry.data || '');
  }
}

export default Logger;