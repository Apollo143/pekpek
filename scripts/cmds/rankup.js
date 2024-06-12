const deltaNext = global.GoatBot.configCommands.envCommands.rank.deltaNext;
const expToLevel = exp => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
const { drive } = global.utils;

module.exports = {
	config: {
		name: "rankup",
		version: "1.2",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Bật/tắt thông báo level up",
			en: "Turn on/off level up notification"
		},
		longDescription: {
			vi: "Bật/tắt thông báo level up",
			en: "Turn on/off level up notification"
		},
		category: "rank",
		guide: {
			en: "{pn} [on | off]"
		},
		envConfig: {
			deltaNext: 5
		}
	},

	langs: {
		vi: {
			syntaxError: "Sai cú pháp, chỉ có thể dùng {pn} on hoặc {pn} off",
			turnedOn: "Đã bật thông báo level up",
			turnedOff: "Đã tắt thông báo level up",
			notiMessage: "𝚅ẻ đẹ𝚙/𝚜ự 𝚖ệ𝚝 𝚖ỏ𝚒 𝚌ủ𝚊 𝚋ạ𝚗 đã đạ𝚝 𝚝ớ𝚒 𝚖ứ𝚌 độ %1"
		},
		en: {
			syntaxError: "Syntax error, only use {pn} on or {pn} off",
			turnedOn: "Turned on level up notification",
			turnedOff: "Turned off level up notification",
			notiMessage: "𝚈𝚘𝚞𝚛 𝚔𝚊𝚐𝚊𝚗𝚍𝚊𝚑𝚊𝚗/𝚔𝚊𝚙𝚘𝚐𝚒𝚊𝚗 𝚛𝚎𝚊𝚌𝚑 𝚕𝚎𝚟𝚎𝚕 %1"
		}
	},

	onStart: async function ({ message, event, threadsData, args, getLang }) {
		if (!["on", "off"].includes(args[0]))
			return message.reply(getLang("syntaxError"));
		await threadsData.set(event.threadID, args[0] == "on", "settings.sendRankupMessage");
		return message.reply(args[0] == "on" ? getLang("turnedOn") : getLang("turnedOff"));
	},

	onChat: async function ({ threadsData, usersData, event, message, getLang }) {
		const threadData = await threadsData.get(event.threadID);
		const sendRankupMessage = threadData.settings.sendRankupMessage;
		if (!sendRankupMessage)
			return;
		const { exp } = await usersData.get(event.senderID);
		const currentLevel = expToLevel(exp);
		if (currentLevel > expToLevel(exp - 1)) {
			const forMessage = {
				body: getLang("notiMessage", currentLevel)
			};
			if (threadData.data.rankup?.attachments?.length > 0) {
				const files = threadData.data.rankup.attachments;
				const attachments = files.reduce((acc, file) => {
					acc.push(drive.getFile(file, "stream"));
					return acc;
				}, []);
				forMessage.attachment = (await Promise.allSettled(attachments))
					.filter(({ status }) => status == "fulfilled")
					.map(({ value }) => value);
			}
			message.reply(forMessage);
		}
	}
};