import winston from 'winston';
import { format } from 'winston';
const { combine, timestamp, label, printf } = format;

function coloredString(color_name: string, str: string) {
	const colors = {
		black: '30',
		red: '31',
		green: '32',
		yellow: '33',
		blue: '34',
		magenta: '35',
		cyan: '36',
		white: '37'
	} as { [key: string]: string };

	const color = colors[color_name] || '37';

	return `\x1b[${color}m${str}\x1b[0m`;
}

const myFormat = printf(({ level, message, label, timestamp, meta }) => {
	const level_colors = {
		info: 'green',
		warn: 'yellow',
		error: 'red'
	} as { [key: string]: string };

	const datetime = new Date(timestamp).toLocaleString();

	return `${coloredString('white', datetime)} [${coloredString(level_colors[level], level.toUpperCase())}] ${message} ${meta ? JSON.stringify(meta, null, 2) : ''}`;
});

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	//defaultMeta: { service: 'user-service' },
	transports: [
		//
		// - Write all logs with importance level of `error` or less to `error.log`
		// - Write all logs with importance level of `info` or less to `combined.log`
		//
		//   new winston.transports.File({ filename: 'error.log', level: 'error' }),
		//   new winston.transports.File({ filename: 'combined.log' })
		new winston.transports.Console({
			format: winston.format.combine(label({ label: 'backend' }), timestamp(), myFormat)
		})
	]
});

export default logger;
