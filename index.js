const Discover = require('./src/Discover');
const winston = require('winston');

process.on('uncaughtException', (err) => {
    console.error(err);
});

global.Logger = winston.createLogger({
    levels: winston.config.npm.levels,
    format: winston.format.printf(info => {
        let date = new Date();
        return `[${date.getDate()}/${(date.getMonth() + 1)}/${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}][${info.level.toUpperCase()}] ${info.message}`;
    }),
});
Logger.add(new winston.transports.Console({ level: 'verbose' }));

const args = process.argv.slice(2);

if (args.length === 0) {
    Logger.error('Invalid number of arguments');
    process.exit(1);
}

const context = {
    token: args[0],
    channelId: args[1] ? args[1] : null,
};

const bot = new Discover(context);

Logger.verbose('Connecting the bot. Awaiting for `launch channelID` command.');

bot.connect();
