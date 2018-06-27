const logger = require('ournet.logger');

export interface ILogger {
    error(message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
}

export default logger as ILogger

if (process.env.NODE_ENV === 'production') {
    logger.loggly({
        tags: ['horo-notifier', 'app'],
        json: true
    });
    logger.removeConsole();
}
