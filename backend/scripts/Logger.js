const ENV = process.env.NODE_ENV
const RAW_LEVEL = (process.env.LOG_LEVEL || '').toLowerCase()
const LOG_DISABLED = String(process.env.LOG_DISABLED || '').toLowerCase() === 'true'

const LEVELS = { error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6 }
const DEFAULT_LEVEL = ENV === 'production' ? 'error' : 'debug'

let currentLevel = (() => {
	if (LOG_DISABLED) return 'off'
	if (RAW_LEVEL === 'off' || RAW_LEVEL === 'none' || RAW_LEVEL === 'silent') return 'off'
	if (RAW_LEVEL && LEVELS[RAW_LEVEL] !== undefined) return RAW_LEVEL
	return DEFAULT_LEVEL
})()

function shouldLog(level) {
	if (currentLevel === 'off') return false
	const msg = LEVELS[level]
	const cur = LEVELS[currentLevel]
	if (msg === undefined || cur === undefined) return true
	return msg <= cur
}

function formatPrefix(level) {
	return `[${new Date().toISOString()}] [${level.toUpperCase()}]`
}

function log(level, ...args) {
	if (!shouldLog(level)) return
	const prefix = formatPrefix(level)
	if (level === 'error') {
		console.error(prefix, ...args)
	} else if (level === 'warn') {
		console.warn(prefix, ...args)
	} else {
		console.log(prefix, ...args)
	}
}

const logger = {
	error: (...args) => log('error', ...args),
	warn: (...args) => log('warn', ...args),
	info: (...args) => log('info', ...args),
	http: (...args) => log('http', ...args),
	verbose: (...args) => log('verbose', ...args),
	debug: (...args) => log('debug', ...args),
	silly: (...args) => log('silly', ...args),
	setLevel: (lvl) => {
		if (!lvl) return
		const l = String(lvl || '').toLowerCase()
		if (l === 'off' || l === 'none' || l === 'silent') currentLevel = 'off'
		else if (LEVELS[l] !== undefined) currentLevel = l
	},
	enable: () => { if (currentLevel === 'off') currentLevel = DEFAULT_LEVEL },
	disable: () => { currentLevel = 'off' },
	isEnabled: () => currentLevel !== 'off',
	level: () => currentLevel,
}

export default logger

