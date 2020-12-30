const wait = require('./Wait');
const https = require('https');
const fs = require('fs');

const Rate = 30;

module.exports = function Events(bot) {
    bot.on('error', (err, id) => {
        if (id) Logger.error(`Error encountered on shard ${id}`);
        Logger.error(err);
    });

    bot.on('messageCreate', async (message) => {
        let match = message.content.match(/^launch(?: (.+))?/);
        if (!match) return;
        if (match[1]) bot.target = match[1];
        if (!bot.target) {
            Logger.error('No target specified.');
            return;
        }

		Logger.info(`Successfully connected as user ${bot.user.username}#${bot.user.discriminator}`);

        Logger.info(`Target is channel ${bot.target}`);

        bot.editStatus('online', {
            name: `good wallpapers.`,
            type: 3,
        });

        Logger.info('Getting the number of messages in the channel.');
        let messagesCount = (await bot.searchChannelMessages(bot.target, {})).totalResults;
        Logger.info(`There are ${messagesCount} messages in that channel.`);
		Logger.info(`Fetching messages information. This might take a while.`);
        let messages = await bot.getMessages(bot.target, messagesCount);
        Logger.info(`Messages fetched successfully`);
        let att = [];
        messages.forEach(m => {
            let match = m.content.match(/(https:\/\/.*?\.(?:png|jpg))/);
            if (match) att.push(match[1]);
            if (m.attachments === 0) return;
            m.attachments.forEach(a => {
                if (a.height) att.push(a.proxy_url);
            });
        });
        let ok = 0;
        let started = 0;
        let dirName = new Date().getTime().toString();
        fs.mkdirSync(dirName);
        for (let i = 0; i < att.length; i++) {
            Logger.info(`(${i}/${att.length}) Downloading file ${att[i]}`);
            let filename = att[i].split('/').pop().replace(/[^a-zA-Z0-9_.-]/g, '_');
            let stream = fs.createWriteStream(`./${dirName}/${i}_${filename}`);
            const request = https.get(att[i], (response) => {
                response.pipe(stream);
                response.once('end', async () => {
                    ok++;
                    Logger.info(`Finished downloading file ${filename}`);
                });
            });
			request.on('error', (err) => {
				ok++;
				Logger.warn(`Error downloading ${filename} !!! Deleting it to avoid corrupt files`);
				Logger.warn(err);
				fs.unlink(`./${dirName}/${i}_${filename}`, (e) => {
					Logger.warn(`Error deleting ${filename} !!!`);
					Logger.warn(e);
				});
			});
            started++;
            while (started - ok > Rate) {
                await wait(100);
            }
        }
        while (started - ok > 0) {
            Logger.info(`${started - ok} downloads remaining`);
            await wait(5000);
        }
        Logger.info(`Task finished!`);
    });
};
