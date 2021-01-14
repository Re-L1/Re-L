const {
    Client,
    MessageEmbed,
    MessageAttachment
} = require("discord.js");
const client = new Client();
const levels = require("./src/JSON/levels.json");

const prefix = "$";

const { welcomeChannel, token } = require("./config.json");

const images = require("./src/JSON/images.json");


const {
    createCanvas,
    loadImage,
    registerFont
} = require("canvas");

registerFont('./src/fonts/Dubai-Bold.ttf', {
    family: 'Dubai'
});


["load"].forEach(handler => {
    require(`./src/${handler}`)(client);
});


// JSON
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('./src/JSON/users.json');
const db = low(adapter);


client.on('ready', () => console.log(`Logged in as ${client.user.tag}`));
var users = {};

client.on('guildMemberAdd', async (member) => {

    const avatar = await loadImage(member.user.displayAvatarURL({
        format: 'png'
    }));

    const background = client.bgs['welcomeBackground'];
    const canvas = createCanvas(832, 260);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.beginPath();

    ctx.arc(150, 136, 96, 0, Math.PI * 2, true)


    ctx.clip()
    ctx.closePath();


    ctx.drawImage(avatar, 50, 35, 200, 200);

    ctx.strokeStyle = "#FF69B4";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    
    ctx.font = "37px Dubai";
    ctx.fillStyle = "#FF69B4";
    ctx.textAlign = "left";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.fillText(member.user.tag, 250, 100)
    ctx.fillText(`Welcome to Our Server`, 260, 150)

    const attachment = new MessageAttachment(canvas.toBuffer());
    client.channels.cache.get(welcomeChannel).send(attachment);
});

client.on('message', async message => {
    if (message.author.bot) return;
    let id = message.author.id;

    if (users[id] === undefined) users[id] = {
        count: 1,
    };

    setup(message.author.id);

    let user = users[id];
    if (user.count === 8) {
        addExpText(message.author.id, 300);

        let checkLevel = textLevelUp(message.author.id);
        let av = message.member.user.displayAvatarURL({
            dynamic: true,
            format: 'png'
        });

        if (checkLevel) message.reply(new MessageEmbed().setAuthor("NEW LEVELUP", av).addField(`Congratulations You Leveled up to ${checkLevel.level+1}!`, "**__nice__**").setThumbnail(av).setFooter(`Made by Mai`));
        user.count = 0;
    }
    user.count++;
});


// for commands
client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    // if (cmd === `emit`) {
    //     client.emit('guildMemberAdd', message.member);
    // }
    if (cmd === `help`) {
        let embed = new MessageEmbed()
        .setAuthor(`${client.user.username}'s Commands`)
        .setThumbnail(message.author.displayAvatarURL({dynamic: true, format: 'png'}))
        .addField("Utility Commands", `\`profile\` \`top\` \`bg\``)
        .addField("Fun Commands", `\`hug\` \`pat\` \`avatar\``)
        .setFooter(`Made By Mai`)
        message.channel.send(embed)
    }

    if (cmd === `profile` || cmd === `p`) {
        let mentioned = message.mentions.members.first() || message.member;

        let data = await getUser(mentioned.id);

        let {
            textExp,
            textLevel,
            bg
        } = !data ? {
            textExp: 0,
            textLevel: 1,
            bg: 'n1'
        } : data;

        const avatar = await loadImage(message.author.displayAvatarURL({
            format: 'png'
        }));

        const background = client.bgs[bg];
        const canvas = createCanvas(500, 500);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.save();

        ctx.beginPath();

        ctx.arc(250, 150, 98, 0, Math.PI * 2, true)


        ctx.clip()
        ctx.closePath();


        ctx.drawImage(avatar, 150, 50, 200, 200);

        ctx.strokeStyle = "#36369E";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();


        ctx.font = "35px Dubai";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.fillText(`Level: ${textLevel}`, 250, 300)
        ctx.fillText(`Experience: ${textExp}`, 250, 350)

        const attachment = new MessageAttachment(canvas.toBuffer())

        message.channel.send(attachment);
    }


    if (cmd === 'top') {
        let chat = getTopChat(5);


        let avatar = client.user.displayAvatarURL({
            dynamic: true,
            format: 'png'
        });

        let embed = new MessageEmbed()
            .setAuthor(`Mai`, avatar)
            .setThumbnail(message.author.displayAvatarURL({
                dynamic: true,
                format: 'png'
            }))
            .addField(`TOP ${chat.length} CHAT 💬`, chat.map((m, i) => `${message.author.id !== m.user ? `#${i+ 1}` : `**#${i + 1}**`} | <@!${m.user}> Text XP: \`${m.textExp}\``).join("\n"), true)
            .setFooter(`Requested by ${message.author.tag}`, avatar)
            .setTimestamp()
        message.channel.send(embed);
    }
    if (cmd === `bg`) {

        let parameter = args[0];
        if (parameter && parameter === 'set') {
            let secondParameter = args[1];
            if (secondParameter && client.bgs["n" + secondParameter] !== undefined) {
                setup(message.author.id);
                let user = db.get('users').get(message.author.id);
                let newBg = `n${secondParameter}`;

                if (user.value().bg === newBg) return message.reply(`This is your primary background already!`);

                db.get('users').get(message.author.id).set('bg', `n${secondParameter}`).write();

                message.reply(`Done!`)
            } else if (!secondParameter) return message.reply("**Usage:**\`$bg set backgroundNumber\`");
            else return message.reply("This background does not exist.");
        } else {
            let pages = [];
            let images = [`https://i.imgur.com/wPwOhd8.png`, 'https://i.imgur.com/N0AmXDf.png', 'https://i.imgur.com/EaVjYzi.jpg', 'https://i.imgur.com/2IvH0fe.png'];
            images.map(m => {
                let embed = new MessageEmbed()
                    .setDescription(`To pick this type \`$bg set ${images.indexOf(m) + 1}\``)
                    .setImage(m);
                pages.push(embed);
            });

            if (pages instanceof Array && pages.length > 0) await pageHandler(pages, message.channel, message.author);
        }
    }

    if (cmd === `avatar` || cmd === `av`) {
        let mentioned = message.mentions.users.first() || message.author;
        let embed = new MessageEmbed()
        embed
            .setAuthor(`${mentioned.username}#${mentioned.discriminator}`, mentioned.displayAvatarURL({
                size: 2048
            }))
            .setDescription(`[Avatar Link](${mentioned.displayAvatarURL({format:'png',dynamic: true,size:2048})})`)
            .setImage(`${mentioned.displayAvatarURL({format:'png',dynamic: true,size:2048})}`)
            .setColor("36393e")
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({
                size: 2048
            }))
        message.channel.send(embed)
    }

    if (cmd === `pat`) {
        let mentioned = message.mentions.users.first() || message.author;
        let randomImage = images.pat[Math.floor(Math.random() * images.pat.length)];

        let embed = new MessageEmbed()
            .setAuthor(`${mentioned.id === message.author.id ? "Patting yourself!" : `${message.author.tag} is patting ${mentioned.tag}`}`, message.member.user.displayAvatarURL({
                dynamic: true,
                format: 'png'
            }))
            .setImage(randomImage)
            .setTimestamp()
        message.channel.send(embed);
    }

    if (cmd === `hug`) {
        let mentioned = message.mentions.users.first() || message.author;
        let randomImage = images.hug[Math.floor(Math.random() * images.hug.length)];

        let embed = new MessageEmbed()
            .setAuthor(`${mentioned.id === message.author.id ? "Hugging yourself!" : `${message.author.tag} is hugging ${mentioned.tag}`}`, message.member.user.displayAvatarURL({
                dynamic: true,
                format: 'png'
            }))
            .setImage(randomImage)
            .setTimestamp()
        message.channel.send(embed);
    }

});



client.login(token);

const pageHandler = async (pages, channel, author) => {
    if (pages.length == 0) return;
    let page = 0;
    let msg = await channel.send(pages[page].setFooter(`Page: ${page+1} of ${pages.length} Made by Mai`));
    await msg.react("◀")
    await msg.react("▶")
    let opts = {
        time: 300000
    };
    const backwardsFilter = (reaction, user) => reaction.emoji.name === '◀' && user.id === author.id;
    const forwardsFilter = (reaction, user) => reaction.emoji.name === '▶' && user.id === author.id;
    const backwards = msg.createReactionCollector(backwardsFilter, opts);
    const forwards = msg.createReactionCollector(forwardsFilter, opts);
    backwards.on("collect", async r => {
        r.users.remove(author);
        await msg.react("▶")
        if (pages[page - 1]) {
            page--
            pages[page].setFooter(`Page: ${page+1} of ${pages.length} Made by Mai`)
            msg.edit(pages[page]);
        }
    });
    forwards.on("collect", async r => {
        r.users.remove(author);
        if (pages[page + 1]) {
            page++
            pages[page].setFooter(`Page: ${page+1} of ${pages.length} Made by Mai`)
            msg.edit(pages[page]);
        }
    });
}

function setup(userID) {
    let data = db.get('users');
    if (!data.value()) db.defaults({
        users: {},
    }).write();

    let user = data.get(userID).value();
    if (user) return 'exists';

    let object = {
        user: userID,
        textLevel: 1,
        textExp: 0,
        bg: 'n1'
    };

    db.get('users').set(userID, object).write();
}

function getUser(userID) {
    let data = db.get('users').get(userID);
    return data.value();
}

function textLevelUp(userID) {
    let user = db.get('users').get(userID);

    let level = user.value().textLevel;
    let exp = user.value().textExp;

    if (level === 100) return;

    let algorithm = LevelingAlgorithm(level, level === 100 ? false : true);
    if (exp >= algorithm) {
        user.set('textLevel', level + 1).write();
        return {
            level
        };
    } else {
        return false;
    }
}

function LevelingAlgorithm(level, nxtLvlBoolean) {
    level = parseInt(level);
    let lvl = nxtLvlBoolean === true ? levels[level + 1] : levels[level];

    return lvl.xp;


    // THE ALGORITHM THAT MADE LEVELS.JSON <Azoqz>
    // let object = {};
    // for (let level = 1; level <= 100; level++) {
    //     let xp = level < 40 ? 300 * Math.round(level * (level + 1) / 2) : 333 * Math.round(level * (level + 1) / 2);
    //     object[level] = {
    //         xp: xp
    //     }
    // }
    // return object;
}

function addExpText(userID, gain) {
    let user = db.get('users').get(userID);
    if (!user.value()) setup(userID);

    let exp = user.value().textExp;

    user.set('textExp', exp + gain).write();
}


function getTopChat(number) {
    return Object.values(db.get('users').value()).sort((a, b) => b.textExp - a.textExp).slice(0, number);
}