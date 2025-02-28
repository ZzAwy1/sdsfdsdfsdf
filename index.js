const express = require('express');
const app = express();
const fs = require('fs');
require('dotenv').config(); // تحميل متغيرات البيئة من .env

const { 
    Client, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ActivityType
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.User]
});

// ✅ تشغيل سيرفر Express
app.get('/', (req, res) => res.send('Bot is Running!'));
app.listen(3000, () => console.log('✅ Express server is ready.'));

// ✅ تحميل الإعدادات
let config = { prefix: "+", ownerID: "648150735648849930" };
if (fs.existsSync('config.json')) {
    config = JSON.parse(fs.readFileSync('config.json'));
}

// ✅ تسجيل الدخول باستخدام التوكن المخزن في `.env`
client.login(process.env.TOKEN).catch(err => console.log("❌ Error logging in:", err.message));

// ✅ أوامر الديسكورد
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🔹 تغيير البريفكس (فقط للأونر)
    if (command === "setprefix") {
        if (message.author.id !== config.ownerID) return message.reply("🚫 | هذا الأمر مخصص للأونر فقط!");
        if (!args[0]) return message.reply("⚠️ | الرجاء تحديد البريفكس الجديد!");

        config.prefix = args[0];
        fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
        message.reply(`✅ | تم تغيير البريفكس إلى: \`${config.prefix}\``);
    }
});

if (!message.content.startsWith(prefix) || message.author.bot) return; // التأكد من أن البوت لا يرد على نفسه

const args = message.content.slice(prefix.length).trim().split(/ +/);
const command = args.shift().toLowerCase();

    // 🔹 أمر تغيير حالة البوت
if (command === "setstatus") { 
    const comp = new ActionRowBuilder();

    function newButton(style, customId, label) {
        let styles = {
            azrq: ButtonStyle.Primary,
            rmade: ButtonStyle.Secondary,
            akdr: ButtonStyle.Success,
            a7mr: ButtonStyle.Danger
        };
        let btn = new ButtonBuilder()
            .setStyle(styles[style])
            .setCustomId(customId)
            .setLabel(label);
        return btn;
    }

    let embed = new EmbedBuilder()
        .setDescription("🟢 | online \n 🟡 | idle\n🔴 | dnd\n🎥 | streaming");

    // إنشاء الأزرار وإضافتها إلى `comp`
    const button1 = newButton("rmade", "onlinestatus", "🟢");
    const button2 = newButton("rmade", "idlestatus", "🟡");
    const button3 = newButton("rmade", "dndstatus", "🔴");
    const button4 = newButton("rmade", "streamstatus", "🎥");

    comp.addComponents(button1, button2, button3, button4);

    // جعل الدالة `async` لتجنب الأخطاء
    (async () => {
        const sendstatu = await message.channel.send({ embeds: [embed], components: [comp] });

        const filter = (i) => i.user.id === message.author.id;
        const collector = sendstatu.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (int) => {
            if (int.customId === 'onlinestatus') { 
                await client.user.setStatus('online');
                await int.update({ content: '**تم تعيين حالة البوت : 🟢**', embeds: [], components: [] });
            } else if (int.customId === 'idlestatus') { 
                await client.user.setStatus('idle');
                await int.update({ content: '**تم تعيين حالة البوت : 🟡**', embeds: [], components: [] });
            } else if (int.customId === 'dndstatus') { 
                await client.user.setStatus('dnd');
                await int.update({ content: '**تم تعيين حالة البوت : 🔴**', embeds: [], components: [] });
            } else if (int.customId === 'streamstatus') { 
                await client.user.setPresence({
                    activities: [{
                        name: "ZzAwy", 
                        type: ActivityType.Streaming, 
                        url: "https://www.twitch.tv/help"
                    }],
                    status: 'online'
                });
                await int.update({ content: '**تم تعيين حالة البوت على ستريمنج 🎥**', embeds: [], components: [] });
            }
        });
    })();
}

    // 🔹 أمر "say"
    if (command === "say") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("🚫 | ليس لديك الصلاحية لاستخدام هذا الأمر.");
        }

        let text = args.join(" ");
        if (!text) return message.reply("⚠️ | الرجاء إدخال النص الذي تريد إرساله!");

        message.delete().catch(() => {});
        message.channel.send(text);
    }
// منشن بوت
client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // منع استجابة البوت لنفسه

    // التحقق مما إذا كان البوت تم منشنه في الرسالة
    if (message.mentions.has(client.user) && !message.mentions.everyone) {
        return message.reply("**في الخدمة**");
    }
});

// ping
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.content.trim().toLowerCase() === "ping") {
        const pingEmbed = new EmbedBuilder()
            .setColor("#3498db")
            .setTitle("🏓 معلومات البوت")
            .setDescription("اضغط على أحد الأزرار لرؤية المعلومات المطلوبة.")
            .setFooter({ text: "بوت الديسكورد الخاص بك", iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('check_ping')
                .setLabel('📡 سرعة الاتصال')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('uptime')
                .setLabel('⏳ وقت التشغيل')
                .setStyle(ButtonStyle.Success)
        );

        const sentMessage = await message.channel.send({ embeds: [pingEmbed], components: [row] });

        const filter = i => i.user.id === message.author.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'check_ping') {
                const ping = Date.now() - message.createdTimestamp;
                const apiPing = client.ws.ping;
                await interaction.update({
                    content: `🏓 **Pong!**\n📡 **Latency:** \`${ping}ms\`\n⚡ **API Ping:** \`${apiPing}ms\``,
                    embeds: [],
                    components: []
                });
            }

            if (interaction.customId === 'uptime') {
                let totalSeconds = Math.floor(client.uptime / 1000);
                let days = Math.floor(totalSeconds / 86400);
                let hours = Math.floor((totalSeconds % 86400) / 3600);
                let minutes = Math.floor((totalSeconds % 3600) / 60);
                let seconds = totalSeconds % 60;

                let uptimeString = `⏳ وقت التشغيل:\n\`${days}\` يوم, \`${hours}\` ساعة, \`${minutes}\` دقيقة, \`${seconds}\` ثانية.`;

                await interaction.update({
                    content: uptimeString,
                    embeds: [],
                    components: []
                });
            }
        });
    }
});

// ✅ تحميل بيانات المستخدمين
let userData = {};
let onlineUsers = {};  // تخزين الأعضاء الأونلاين
let offlineUsers = new Set(); // تخزين الأعضاء الأوفلاين

if (fs.existsSync("userdata.json")) {
    userData = JSON.parse(fs.readFileSync("userdata.json", "utf8"));
} else {
    fs.writeFileSync("userdata.json", JSON.stringify({}, null, 2));
    userData = {};
}


// ✅ تحديث الإيمبد كل 3 ثواني
async function updateEmbed() {
    try {
        if (!config.panelChannel) return;
        let channel = client.channels.cache.get(config.panelChannel);
        if (!channel) return;

        let onlineList = Object.keys(onlineUsers).map(userId => `<@${userId}>`);
        let offlineList = Object.keys(userData).filter(userId => !onlineUsers[userId]).map(userId => `<@${userId}>`);

        const embed = new EmbedBuilder()
            .setTitle("🟢 | قائمة الأونلاين و الأوفلاين")
            .addFields(
                { name: "✅ الأعضاء الأونلاين:", value: onlineList.length ? onlineList.join("\n") : "لا أحد متصل حاليًا", inline: true },
                { name: "❌ الأعضاء الأوفلاين:", value: offlineList.length ? offlineList.join("\n") : "لا أحد أوفلاين حاليًا", inline: true }
            )
            .setColor("Blue")
            .setFooter({ text: "يتم التحديث تلقائيًا كل 3 ثواني" });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("login").setLabel("✅ تسجيل دخول").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("logout").setLabel("❌ تسجيل خروج").setStyle(ButtonStyle.Danger)
        );

        if (!panelMessage) {
            panelMessage = await channel.send({ embeds: [embed], components: [buttons] });
        } else {
            await panelMessage.edit({ embeds: [embed], components: [buttons] });
        }
    } catch (error) {
        console.error("⚠️ | خطأ أثناء تحديث الإيمبد:", error);
    }
}
setInterval(updateEmbed, 3000);

// ✅ تفاعل مع الأزرار
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    let userId = interaction.user.id;

    if (interaction.customId === "login") {
        if (!userData[userId]) userData[userId] = { onlineTime: 0, offlineTime: 0, lastLogin: 0 };
        if (!onlineUsers[userId]) {
            onlineUsers[userId] = Date.now();
            userData[userId].lastLogin = Date.now();
            offlineUsers.delete(userId);
            fs.writeFileSync("userdata.json", JSON.stringify(userData, null, 2));
        }
        await interaction.reply({ content: "✅ تم تسجيل دخولك!", ephemeral: true });
    } else if (interaction.customId === "logout") {
        if (onlineUsers[userId]) {
            let totalOnline = Math.floor((Date.now() - onlineUsers[userId]) / 1000);
            userData[userId].onlineTime += totalOnline;
            delete onlineUsers[userId];
        }
        offlineUsers.add(userId);
        fs.writeFileSync("userdata.json", JSON.stringify(userData, null, 2));
        await interaction.reply({ content: "❌ تم تسجيل خروجك!", ephemeral: true });
    }
});

// ✅ أوامر `mytime` و `top`
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "mytime") {
        let userId = message.author.id;
        let userStats = userData[userId] || { onlineTime: 0 };
        let currentOnline = onlineUsers[userId] ? Math.floor((Date.now() - onlineUsers[userId]) / 1000) : 0;
        let totalOnline = Math.floor((userStats.onlineTime + currentOnline) / 60);

        return message.reply(`🕒 | لقد كنت أونلاين لمدة **${totalOnline} دقيقة**.`);
    }
});

    // 🏆 أمر `top` لعرض أكثر الأشخاص أونلاين
 client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "top") {
        let sortedUsers = Object.entries(userData)
            .map(([userId, data]) => {
                let currentOnline = onlineUsers[userId] ? Math.floor((Date.now() - onlineUsers[userId]) / 1000) : 0;
                return [userId, data.onlineTime + currentOnline];
            })
            .filter(([_, time]) => time > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        if (sortedUsers.length === 0) return message.reply("⚠️ | لا يوجد بيانات حتى الآن!");

        let leaderboard = sortedUsers.map(([userId, time], index) =>
            `**${index + 1}.** <@${userId}> - 🕒 **${Math.floor(time / 60)} دقيقة**`
        ).join("\n");

        const embed = new EmbedBuilder()
            .setTitle("🏆 | قائمة أكثر الأشخاص أونلاين")
            .setDescription(leaderboard)
            .setColor("#FFD700");

        return message.reply({ embeds: [embed] });
    }
});

// ✅ تعيين روم البانل
let panelMessage = null; // تعريف المتغير في البداية
client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "setpanel") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ | ليس لديك صلاحية لاستخدام هذا الأمر.");
        }

        let channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply("⚠️ | الرجاء منشن القناة التي تريد تعيينها");
        }

        // تحديث التكوين وحفظه
        config.panelChannel = channel.id;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

        await message.reply(`✅ | تم تعيين روم التسجيل: ${channel}`);
        updateEmbed();
    }
});

// 🔹 أمر "خط"
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    let color = "#FFD700"; // اللون الذهبي
    let line = config.Line; // جلب الخط من config.json

    // 🖋️ إرسال الخط عند كتابة "لاين" أو "line" أو "خط"
    if (["لاين", "line", "خط"].includes(message.content.toLowerCase())) {
        message.delete();
        const embed = new EmbedBuilder()
            .setColor(color)
            .setImage(line);

        message.channel.send({ embeds: [embed] });
    }

    // 🔧 أمر `setline` لتحديث الخط
    if (message.content.startsWith("setline")) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("🚫 | ليس لديك صلاحية استخدام هذا الأمر.");
        }

        let args = message.content.split(" ");
        if (args.length < 2) return message.reply("⚠️ | الرجاء إدخال رابط الخط الجديد! \nمثال: `setline https://example.com/image.png`");

        let newLine = args[1];
        config.Line = newLine;

        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

        message.reply(`✅ | تم تحديث الخط بنجاح إلى: ${newLine}`);
    }
});

//serverlink
const link = "https://discord.gg/sneo"; // ضع رابط سيرفرك هنا

client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // منع الرد على البوتات

    if (["link", "لينك"].includes(message.content.toLowerCase())) {
        message.channel.send(`**Welcome In __${message.guild.name}__  
        Link The Server: ${link}  
        __Enjoy Bro!!__**`);
    }
});

//hide show unlock lock

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🔐 تأكد من وجود الرتبة وصلاحياتها
    let modRole = message.guild.roles.cache.get(config.modRole);
    if (!modRole) return message.reply("⚠️ | لم يتم العثور على الرتبة المحددة، تأكد من إعدادات الـ ID في `config.json`!");

    if (!message.member.roles.cache.has(modRole.id)) {
        return message.reply("❌ | ليس لديك الصلاحيات لاستخدام هذا الأمر!");
    }

    let channel = message.channel;

    if (command === "hide") {
        await channel.permissionOverwrites.edit(message.guild.id, { ViewChannel: false });
        return message.reply("🔒 | تم إخفاء القناة بنجاح!");
    }

    if (command === "show") {
        await channel.permissionOverwrites.edit(message.guild.id, { ViewChannel: true });
        return message.reply("👁️ | تم إظهار القناة بنجاح!");
    }

    if (command === "lock") {
        await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
        return message.reply("🔒 | تم قفل القناة، لا يمكن لأي شخص الكتابة هنا!");
    }

    if (command === "unlock") {
        await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: true });
        return message.reply("🔓 | تم فتح القناة، يمكن للجميع الكتابة الآن!");
    }
});

//////// tA3ref
const prefix = config.prefix;
const taxChannel = config.taxChannel;
const embedColor = config.embedColor;
const lineImage = config.lineImage;

// ⚚・─━━━❲❲ Transfer line ❳❳━━━─・⚚ \\
const { imageURL } = require("./config.json"); // تحميل الرابط من الكونفج

client.on("messageCreate", async (message) => {
    // إذا أردت تشغيله في روم معين، أزل الـ //
    // if (message.channel.id !== "trans id") return;

    if (message.content.includes("has transferred") || 
        message.content.includes("Successfully transferred") || 
        message.content.includes("gold to")) {
        
        await message.channel.send({
            files: [imageURL] // إرسال الصورة من الكونفج
        });
    }
});
// ⚚・─━━━❲❲ Auto tax ❳❳━━━─・⚚ \\
client.on("messageCreate", async (message) => {
    if (message.author.bot || message.channel.id !== taxChannel) return;

    let args = message.content.trim();
    if (args.endsWith("m")) args = args.replace(/m/gi, "") * 1000000;
    else if (args.endsWith("k")) args = args.replace(/k/gi, "") * 1000;
    else if (args.endsWith("b")) args = args.replace(/b/gi, "") * 1000000000;

    let args2 = parseInt(args);
    if (!args2 || isNaN(args2) || args2 < 1) {
        return message.reply("> ** Error: It Must Be A Valid Number ⚠⚠ **");
    }

    let tax = Math.floor(args2 * (20) / (19) + (1));
    await message.reply(`__**${tax}**__`);
});

// ⚚・─━━━❲❲ +tax ❳❳━━━─・⚚ \\
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "tax") {
        let args1 = args.join(" ");
        if (args1.endsWith("m")) args1 = args1.replace(/m/gi, "") * 1000000;
        else if (args1.endsWith("k")) args1 = args1.replace(/k/gi, "") * 1000;
        else if (args1.endsWith("b")) args1 = args1.replace(/b/gi, "") * 1000000000;

        let args2 = parseInt(args1);
        if (!args2 || isNaN(args2) || args2 < 1) {
            return message.reply("> ** Error: It Must Be A Valid Number ⚠⚠ **");
        }

        let tax = Math.floor(args2 * (20) / (19) + (1));
        let tax2 = Math.floor(args2 * (20) / (19) + (1) - args2);
        let tax3 = Math.floor(tax2 * (20) / (19) + (1));
        let tax4 = Math.floor(tax2 + tax3 + args2);

        let row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("first_embed")
                .setLabel("Mediator")
                .setEmoji("💰")
                .setStyle(ButtonStyle.Success)
        );

        let row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("2_embed")
                .setLabel("Back")
                .setEmoji("🔙")
                .setStyle(ButtonStyle.Danger)
        );

        let m = await message.reply({ content: `__**${tax}**__`, components: [row] });

        let collector = m.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 3600000,
            max: 2
        });

        collector.on("collect", async (i) => {
            if (i.customId === "first_embed") {
                await m.edit({ content: `__**${tax4}**__`, components: [row2] });
            } else if (i.customId === "2_embed") {
                await m.edit({ content: `__**${tax}**__`, components: [row] });
            }
            await i.deferUpdate();
        });
    }
});

//emoji
const settings = {
    emojiRoom: null,
    stickerRoom: null
};
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(" ");
    const command = args.shift().toLowerCase();

    if (command === `${prefix}setemoji`) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.reply("❌ ليس لديك صلاحية **إدارة الإيموجيات والستيكرات**!");
        }

        settings.emojiRoom = message.channel.id;
        message.reply("✅ **تم تعيين هذا الروم لإضافة الإيموجيات!** 🎉");
    }

    else if (command === `${prefix}setsticker`) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.reply("❌ ليس لديك صلاحية **إدارة الإيموجيات والستيكرات**!");
        }

        settings.stickerRoom = message.channel.id;
        message.reply("✅ **تم تعيين هذا الروم لإضافة الستكرات!** 🎉");
    }

    else if (command === `${prefix}delete-room`) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.reply("❌ ليس لديك صلاحية **إدارة الإيموجيات والستيكرات**!");
        }

        settings.emojiRoom = null;
        settings.stickerRoom = null;
        message.reply("✅ **تم إزالة إعدادات الرومات بنجاح!** 🗑️");
    }
});

client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    if (settings.emojiRoom && message.channel.id === settings.emojiRoom) {
        const emojiMatch = message.content.match(/<a?:\w+:(\d+)>/);
        if (emojiMatch) {
            const emojiID = emojiMatch[1];
            try {
                const emoji = await message.guild.emojis.create({
                    attachment: `https://cdn.discordapp.com/emojis/${emojiID}.png`,
                    name: `custom_${emojiID}`
                });
                message.reply(`✅ **تمت إضافة الإيموجي بنجاح!** ${emoji}`);
            } catch (error) {
                console.error(error);
                message.reply("❌ **حدث خطأ أثناء إضافة الإيموجي!**");
            }
        }
    }
});

client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    if (settings.stickerRoom && message.channel.id === settings.stickerRoom) {
        if (message.stickers.size > 0) {
            const sticker = message.stickers.first();
            try {
                await message.guild.stickers.create({
                    file: sticker.url,
                    name: `custom_${sticker.id}`,
                    tags: sticker.name
                });
                message.reply(`✅ **تمت إضافة الستكر بنجاح!** 🏷️`);
            } catch (error) {
                console.error(error);
                message.reply("❌ **حدث خطأ أثناء إضافة الستكر!**");
            }
        }
    }
});

// صور
client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "صور") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply("❌ ليس لديك صلاحية **إدارة القنوات**!");
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply("❌ منشن الشخص الذي تريد إعطاءه صلاحية إرسال الصور!");
        }

        const channel = message.channel; // القناة التي كتب فيها الأمر
        try {
            await channel.permissionOverwrites.edit(member, {
                AttachFiles: true // إعطاء صلاحية إرسال الصور
            });

            message.reply(`✅ تم منح <@${member.id}> صلاحية إرسال الصور في <#${channel.id}> فقط!`);
        } catch (error) {
            console.error(error);
            message.reply("❌ حدث خطأ أثناء محاولة منح الصلاحية!");
        }
    }
});
/////////sasasas
client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.id !== config.feedbackChannelId) return;

    // إنشاء زرار اختيار عدد النجوم
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('star_1').setLabel('⭐').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('star_2').setLabel('⭐⭐').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('star_3').setLabel('⭐⭐⭐').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('star_4').setLabel('⭐⭐⭐⭐').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('star_5').setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Primary),
    );

    // إرسال الرسالة الأساسية التي سيتم تعديلها لاحقًا
    const feedbackMsg = await message.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🔹 Feedback System')
                .setDescription('يرجى اختيار عدد النجوم المناسبة لتقييمك!')
                .setFooter({ text: 'شكراً لرأيك ❤️' })
        ],
        components: [row]
    });

    // إنشاء كولكتور لاستقبال ردود الأزرار
    const filter = (interaction) => interaction.isButton() && interaction.message.id === feedbackMsg.id;
    const collector = message.channel.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
            return interaction.reply({ content: '❌ لا يمكنك تقييم فيدباك شخص آخر!', ephemeral: true });
        }

        // استخراج عدد النجوم من الـ ID للزر
        const stars = interaction.customId.split('_')[1];

        // إنشاء الإيمبد المعدل بعد اختيار النجوم
        const updatedEmbed = new EmbedBuilder()
            .setColor('#00ff99')
            .setTitle('💬 Feedback Received')
            .setDescription(`**التقييم:** ${message.content}`)
            .addFields(
                { name: '👤 من:', value: `${message.author}`, inline: true },
                { name: '⭐ عدد النجوم:', value: '⭐'.repeat(stars), inline: true }
            )
            .setTimestamp();

        // تعديل نفس الرسالة وإزالة الأزرار
        await feedbackMsg.edit({ 
            embeds: [updatedEmbed], 
            components: [] 
        });

        // إضافة رياكشن قلب على الرسالة الأصلية
const emoji = message.guild.emojis.cache.get('1344418406035619841'); // ضع ID الإيموجي هنا

if (emoji) {
    await message.react(emoji);
} else {
    console.log('❌ لم يتم العثور على الإيموجي.');
}

        collector.stop(); // إيقاف الكولكتور
    });

    collector.on('end', () => {
        feedbackMsg.edit({ components: [] }).catch(() => {});
    });
});

// help
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // تقسيم الرسالة للحصول على البريفكس والأمر
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // التحقق من البريفكس أولًا
    if (!message.content.startsWith(config.prefix)) return;
    if (command === "help") {
        const helpEmbed = new EmbedBuilder()
            .setTitle("**:sparkles: مرحبًا بك في قائمة أوامر بوت السيستم**")
            .setDescription(
"🔹 استعرض الأوامر المتاحة من خلال القائمة أدناه.\n" +
"🔹 اختر الفئة المناسبة للحصول على التفاصيل المطلوبة."
)
            .setColor("#FFD700");

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("help_menu")
            .setPlaceholder("📜 اختر فئة الأوامر")
            .addOptions([
                {
                    label: "أوامر الأونر",
                    description: "أوامر خاصة بالأونر",
                    value: "owner_commands",
                    emoji: "👑"
                },
                {
                    label: "أوامر عامة",
                    description: "أوامر عامة للمستخدمين",
                    value: "general_commands",
                    emoji: "🌍"
                },
                {
                    label: "إلغاء",
                    description: "لا أريد اختيار أي شيء",
                    value: "cancel",
                    emoji: "❌"
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await message.channel.send({ embeds: [helpEmbed], components: [row] });
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    
    if (interaction.customId === "help_menu") {
        let updatedEmbed;

        if (interaction.values[0] === "owner_commands") {
            updatedEmbed = new EmbedBuilder()
                .setTitle("👑 أوامر الأونر")
                .setDescription(
    `${config.prefix} **setprefix**\n` +
    `${config.prefix} **setstatus**\n` +
    `${config.prefix} **ping**`
)

                .setColor("#FF0000");
        } else if (interaction.values[0] === "general_commands") {
            updatedEmbed = new EmbedBuilder()
                .setTitle("🌍 أوامر عامة")
.setDescription(
    `${config.prefix} **embed**\n` +
    `${config.prefix} **say**\n` +
    `${config.prefix} **لينك** - **link**\n` +
    `${config.prefix} **خط** - **line**\n` +
    `${config.prefix} **tax**\n` +
    `${config.prefix} **show**\n` +
    `${config.prefix} **hide**\n` +
    `${config.prefix} **ف** - **أمر فتح الروم**\n` +
    `${config.prefix} **ق** - **أمر قفل الروم**`
)

                .setColor("#0000FF");
        }

        await interaction.update({ embeds: [updatedEmbed] });
    }
});

// ssتحميل الإعدادات
let startTime = Date.now();
let embedMessage = null;

// لما البوت يشتغل
client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);

    if (config.channelId && config.messageId) {
        try {
            let channel = await client.channels.fetch(config.channelId);
            embedMessage = await channel.messages.fetch(config.messageId);
        } catch (error) {
            console.log('❌ لم يتم العثور على الرسالة السابقة، سيتم إرسال رسالة جديدة.');
        }
    }
    updateEmbed();
    setInterval(updateEmbed, 3000);
});

// تحديث الرسالة
async function updateEmbed() {
    let uptime = Math.floor((Date.now() - startTime) / 1000);
    let embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('⚡ حالة البوت')
        .addFields(
            { name: '👨‍💻 المطور', value: '<@648150735648849930>', inline: true },
            { name: '⏳ مدة التشغيل', value: `${uptime} ثانية`, inline: true },
            { name: '📌 عدد السيرفرات', value: `${client.guilds.cache.size}`, inline: true },
            { name: '👥 عدد المستخدمين', value: `${client.users.cache.size}`, inline: true }
        )
        .setTimestamp();

    if (embedMessage) {
        await embedMessage.edit({ embeds: [embed] });
    }
}

// استقبال الأوامر بالبريفكس

client.on('messageCreate', async message => {
    if (!message.content.startsWith('!')) return; // التأكد أن الرسالة تبدأ بـ !
    if (message.author.bot) return; // تجاهل رسائل البوت

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'seton') {
        let channel = message.mentions.channels.first();
        if (!channel || channel.type !== ChannelType.GuildText) {
            return message.reply('❌ يجب تحديد قناة نصية مثل: `!seton #general`');
        }

        let embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('⚡ حالة البوت')
            .setDescription('🔄 يتم تحديث البيانات كل 3 ثوان...')
            .setTimestamp();

        let msg = await channel.send({ embeds: [embed] });

        config.channelId = channel.id;
        config.messageId = msg.id;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

        embedMessage = msg;
        message.reply(`✅ تم تعيين القناة بنجاح: ${channel}`);
    }
});
