const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActivityType
} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const myEmojis = {
    E: '<:E:1028931983293808690>',
    Friendly: {
        BS: ['<:battleship:1028931981934854235>', 18 * 3600],
        TS: ['<:transport:1028931981033082930>', 18 * 3600],
        MR: ['<:miner:1028931980039028797>', 18 * 3600],
        SQ: ['<:squishie:1028931979103711232>', 18 * 3600],
        FS: ['<:flagship:1028931978172579870>', 16 * 3600]
    },
    Enemy: {
        BS: ['<:enemyBattleship:1028931977375658094>', 18 * 3600],
        TS: ['<:enemyTransport:1028931976373223444>', 18 * 3600],
        MR: ['<:enemyMiner:1028931975274303549>', 18 * 3600],
        SQ: ['<:enemySquishie:1028931974448021564>', 18 * 3600],
        FS: ['<:enemyFlagship:1028931973563027456>', 16 * 3600]
    },
    Sleep: '💤',
    Work: '⌚',
    Away: '🤷',
    Morning: '🥱',
    Marvin: '<:Marvin:1028931972694814760>',
    Nova: '<:Nova:1028931971688190012>',
    Whitestar: '<:Whitestar:1028931971688190012>',
};
const myButtons = [{
    id: '⌚',
    name: '⌚',
    time: 4 * 3600,
    inline: "⌚",
    past: "has returned!",
    post: "Should be present for a HS break"
}, {
    id: '💤',
    name: '💤',
    time: 8 * 3600,
    inline: "💤",
    past: "just woke up",
    post: "Should be awake now"
}, {
    id: '1028931981934854235', // friendlybs
    name: 'battleship',
    time: 18 * 3600,
    inline: "<:battleship:1028931981934854235>",
    past: "set their battleship as back",
    post: "is due to return"
}, {
    id: '1028931979103711232',
    name: 'squishie',
    time: 18 * 3600,
    inline: "<:squishie:1028931979103711232>",
    past: "set their squshie as back",
    post: "is due to return"
}, {
    id: '1028931978172579870',
    name: 'flagship',
    time: 16 * 3600,
    inline: "<:flagship:1028931978172579870>",
    past: "",
    post: "is due to return"
}, {
    id: '1028931977375658094',
    name: 'enemyBattleship',
    time: 18 * 3600,
    inline: "<:enemyBattleship:1028931977375658094>",
    past: "",
    post: ""
}, {
    id: '1028931974448021564',
    name: 'enemySquishie',
    time: 18 * 3600,
    inline: "<:enemySquishie:1028931974448021564>",
    past: "",
    post: ""
}, {
    id: '1028931973563027456',
    name: 'enemyFlagship',
    time: 16 * 3600,
    inline: "<:enemyFlagship:1028931973563027456>",
    past: "set the enemy battleship as returned",
    post: "is due to return"
}, {
    id: '🗑',
    name: 'RemoveTimer',
    time: 0,
    past: "",
    post: ""
}];
const afkContent = [
"AWAY LIST ",
0x8b0000,
"Time⠀⠀User / Reason\n",
"/ws afk /ws allied /ws enemy\n⠀",
"`Empty`"
];//move to constants file later

let size = myButtons.length;
let row = [];
for (nCount = 0; nCount < size; nCount++) {
    if (nCount >= 15) {
        break;
    }
    const r = Math.floor(nCount/5);
    if (!row[r]) {
        row[r] = new ActionRowBuilder();
    }
    row[r].addComponents(
        new ButtonBuilder()
        .setCustomId(myButtons[nCount].name)
        .setEmoji(myButtons[nCount].id)
        .setStyle(ButtonStyle.Secondary),
    );
}
const defButtons = row;

const db = require('better-sqlite3')('db/geeves.db', {
    verbose: console.log
});

var displayName = {};

async function postAFKs(guild) {
	   const curTime = Math.floor(Date.now() / 1000);
      const whiteStar = await db.prepare('SELECT * from whiteStar WHERE guild = ?').all(guild.id);
      if (!whiteStar) return;
      for (i in whiteStar) { //iterate through multiple whitestars on the same server
		  //if it's just for edit do <Client | Guild>.channels.cache.get(channelId).messages.edit(messageId, { content })
         const afkChan = await guild.channels.cache.get(whiteStar[i].awayChId);
         if(!afkChan)continue;
      let posted = false;
            if ((whiteStar[i].lifeTime - curTime) < 0 && (whiteStar[i].novaDone < 2)) {//they only get one nova per whitestar set of channels
                posted = true;
               db.prepare('UPDATE whiteStar SET novaDone = 2 WHERE guild = ? AND mRoleId = ?').run(guild.id, whiteStar[i].mRoleId);
               const fs = require('fs');
               const novaFiles = await fs.readdirSync('./files/novaFiles/');
               afkChan.send({
                  content: '  <@&' + whiteStar[i].mRoleId + '> Whitestar has gone nova\n\nChannels and Roles will be deleted 12 hours from now',
                  allowedMentions: {
                     parse: ["roles"]
                  },
                  files: ['./files/novaFiles/' + novaFiles[Math.floor(Math.random() * novaFiles.length)]],
               });
            };
            const mRole = await guild.roles.cache.get(whiteStar[i].mRoleId);
            if (!mRole) continue; //no idea, but that does not make sense.
	  const afkTimers = await db.prepare('SELECT * FROM awayTimers WHERE mRoleId = ? AND guild = ? AND lifeTime < ? ORDER BY lifeTime ASC').all(whiteStar[i].mRoleId, guild.id, curTime);
if(afkTimers.length > 0) {
      for(n in afkTimers) {
        let awayTimer = afkTimers[n];
         const afkChan = await guild.channels.cache.get(whiteStar[i].awayChId);
               posted = true;
               let msgNotice = '';
               let pingable = ['users', 'roles'];
               let per = "";
               switch (awayTimer.who) {
                  case '0':
                     msgNotice += myEmojis.E + '`nemy` ' + awayTimer.what;
                     pingable = [];
                     break;
                  case '10':
                    msgNotice += awayTimer.what;
                    if(awayTimer.fromWho) per = '⠀⠀Per: <@' + awayTimer.fromWho + '>';
                    break;
                  case '20':
                     msgNotice += '  <@&' + whiteStar[i].mRoleId + '>  ' + awayTimer.what;
                     if(!!awayTimer.fromWho) per = '⠀⠀Per: <@' + awayTimer.fromWho + '>';
                     break;
                  default:
                     msgNotice += '  <@' + awayTimer.who + '>  ' + awayTimer.what;
                     if(!!awayTimer.fromWho && awayTimer.fromWho != awayTimer.who) per = '⠀⠀Per: <@' + awayTimer.fromWho + '>';
               };
               if(per == "")
               await afkChan.send({
                content: msgNotice,
                allowedMentions: {
                   parse: pingable
                }
             })
             else
               await afkChan.send({
                  content: msgNotice,
                  allowedMentions: {
                     parse: pingable
                  }
               }).then((sentMessage) => sentMessage.edit({
                content: msgNotice + per
            }));
	 };
     await db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND lifeTime < ?').run(guild.id, whiteStar[i].mRoleId, curTime);//if there were any above, delete them now. 
    };
         makeAwayBoard(guild, whiteStar[i].mRoleId, posted);//after posting all the messages, we update the away list.
      };
   };


async function getDisplayName(guild, id, maxlength) {
        if (displayName[id]) return displayName[id];
        let member = await guild.members.cache.get(id);
        if (!member)
            memberr = await guild.members.fetch(id, {
                force: true,
                withPresences: false
            }).catch(console.log);
        if (!member) {
            member = await guild.members.cache.get(id);
            console.log("did member cache work the second time? " + member); //Usually it does
        }
        if (!member)
            return "🤷(Left the server)"; //Empty handle
        else {
            let Handle;
            if (member.nickname) Handle = member.nickname;
            else Handle = member.user.username;
            if (maxlength) {
                if (Handle.length > maxlength)
                    Handle = Handle.slice(0, maxlength);
            };
            displayName[id] = Handle;
            return Handle;
        };
    };
	    async function cacheNames(guild) {
        let members = await guild.members.fetch({
            force: true,
            withPresences: false
        });
        members.forEach((member) => {
            let Handle;
            if (member.nickname) Handle = member.nickname;
            else Handle = member.user.username;
            displayName[member.id] = Handle;
        });
    };
    
async function makeAwayBoard(guild, mRoleId, posted) {
    const curTime = Math.floor(Date.now() / 1000);
    const afkTimers = await db.prepare('SELECT * FROM awayTimers WHERE mRoleId = ? AND guild = ? ORDER BY lifeTime ASC').all(mRoleId, guild.id);
    const whiteStar = await db.prepare('SELECT * FROM whiteStar WHERE guild = ? AND mRoleId = ?').get(guild.id, mRoleId);
    let msgArray = [];
    let enemyList = [];
    if (!whiteStar) return; //no idea where stuff is, but no where to post.
if(!whiteStar.awayChId) return;
    let afkChan = await guild.channels.cache.get(whiteStar.awayChId);
    if (!afkChan) return;
        let wsRole = await guild.roles.cache.get(whiteStar.mRoleId);
        if(!wsRole)return;
        let novaTime = ((whiteStar.lifeTime - curTime) / 3600);
                let days, hours, minutes, neg = "";
                if (novaTime < 0) neg = "-";

                if (novaTime < 0) {
                    novaTime = (curTime - whiteStar.lifeTime) / 3600;
                    neg = '-';
                };
                let novaMsg = "" + myEmojis.Nova + neg + "**" 
                days = Math.floor(novaTime / 24);
                novaMsg += days ? days+"d" : "";
                hours = Math.floor(novaTime) - (days * 24);
                novaMsg += hours ? hours+"h" : "";
                minutes = Math.floor((novaTime * 60) - (days * 24 * 60) - (hours * 60));
                novaMsg += minutes + "m**\n";
                let msg = "";
        if(whiteStar.novaDone == 0) msg += '**0m**⠀⠀'+myEmojis.Whitestar+'`/ws nova` has not been set.\n';
        if(whiteStar.novaDone == 2) {
            let delTime = (((whiteStar.lifeTime+12 * 3600) - curTime) / 3600);
            if(delTime < 1) msg += "**"+Math.floor(delTime * 60) + "m";
            else msg += "**" + Math.floor(delTime * 10) / 10 + "h";
            msg += '**⠀⠀'+myEmojis.Whitestar+'<@&' + whiteStar.mRoleId + '> Deletion, or **/ws nova expire** to expedite\n';
        };
        for (n in afkTimers) {
            const awayTimer = afkTimers[n];//without this, the information sometimes changes. really odd bug
            let curLine = "";
            let t = ((awayTimer.lifeTime - curTime) / 3600);
                if (t < 1)
                    curLine += "**" + Math.floor(t * 60) + "m";
                else
                    curLine += "**" + Math.floor(t * 10) / 10 + "h";
                let padding = 8;
                if (curLine.indexOf(".") == -1) padding = padding - 1;
                msg += curLine.padEnd(padding, '⠀'); //'⠀');
                msg += "**";
                curLine = "";
                switch (awayTimer.who) {
                    case "0":
                        msg += "" + myEmojis.E + "`nemy`⠀⠀";
                        break;
                    case "10"://role notice
                        msg += "" + myEmojis.Whitestar;
                        break;
                    default:
                        curLine += '`';
                        curLine += await getDisplayName(guild, awayTimer.who);
                        curLine += '` ⠀⠀';
                        break;
                };
                msg += curLine;
                msg += awayTimer.what;
                if (awayTimer.fromWho)
                    if (awayTimer.who != '0' && awayTimer.fromWho != awayTimer.who) msg += "⠀⠀-" + await getDisplayName(guild, awayTimer.fromWho);
                msg += "\n";
                if (msg.length > 1800 || ((msg.length > 800) && (msgArray.length > 0))) {
                    msgArray.push(msg);
                    msg = "";
                };
        };
        if (msg.length > 0) msgArray.push(msg);
        if (msg.length == 0 && msgArray.length == 0) msgArray.push(afkContent[4]);
        const embed = new EmbedBuilder()
            .setTitle(afkContent[0] + ' ' + novaMsg)
            .setColor(whiteStar.colour)
            .setDescription(afkContent[2] + '\n' + msgArray[0])
            .setTimestamp()
            .setFooter({
                text: afkContent[3]
            })
            .setThumbnail(guild.iconURL());
        let xx = 1;
        if (msgArray[xx]) {
            do {
                embed.addFields({
                    name: afkContent[2],
                    value: msgArray[xx],
                    inline: false
                });
                xx++;
            } while (xx < msgArray.length && xx < 3);
        }
        if (msgArray[xx]) embed.addFields({
            name: '**Message limit exceeded, not all messages shown**',
            value: 'All afks are recorded, later afks will be shown as newer ones expire',
            inline: false
        });
       afkChan.messages.fetch().then((messages) => {
    afkChan.bulkDelete(messages.filter((msg) => ((((Number(msg.createdTimestamp) / 1000) + 43000) < curTime && msg.author.bot && msg.id != whiteStar.awayMsgId) || 
    msg.author.id != guild.members.me.id || 
    (msg.content == '' && msg.author.bot && msg.id != whiteStar.awayMsgId)))); // 43000 = 12 hours in seconds
    }).catch(console.error);
    let msgCheck = await afkChan.messages.fetch({limit: 1}).then((value) => value.first());
    if(!msgCheck) posted = true;
    else if (msgCheck.id != whiteStar.awayMsgId) posted = true;
let awayMsg = false;
if(whiteStar.awayMsgId) awayMsg = await afkChan.messages.cache.get(whiteStar.awayMsgId);//this would be bad if the cache was not just updated via fetch above.
    if (posted && awayMsg) {
        try { await awayMsg.delete(); }catch{console.log};
    awayMsg = false;
    };
        if (posted || !awayMsg) {
            afkChan.send({
                embeds: [embed],
               components: defButtons
            }).then(msgNew => {
                if (msgNew.id) db.prepare('UPDATE whitestar SET awayMsgId = ? WHERE guild = ? AND mRoleId = ?').run(msgNew.id, guild.id, whiteStar.mRoleId);
            }).catch(console.log);
        } else {
            awayMsg.edit({
                embeds: [embed],
               components: defButtons
            }).catch(error => {
                console.log("deletion detected"); //weird caatch, sometimes happens.
                afkChan.send({
                    embeds: [embed],
               components: defButtons
                }).then(msgNew => {
                    if (msgNew.id) db.prepare('UPDATE whitestar SET awayMsgId = ? WHERE guild = ? AND mRoleId = ?').run(msgNew.id, guild.id, whiteStar.mRoleId);
                }).catch(console.log);
            });
        };
};
function removeDeadAFKs() {
    db.prepare('DELETE FROM awayTimers WHERE lifeTime < ?').run(Math.floor((Date.now() / 1000)) - (12 * 3600)); // 12 hours grace and delete
};
async function delExpiredChans(guild) {
    const curTime = Math.floor(Date.now() / 1000);
    const timeCheck = curTime - 12 * 3600; //12 hours after timestamp, we expire
    const expired = await db.prepare('SELECT * FROM whiteStar WHERE guild = ? AND lifeTime < ?').get(guild.id, timeCheck);
    if (expired) {
        const expiredChan = await db.prepare('SELECT * FROM channels WHERE guild = ? AND mRoleId = ?').all(guild.id, expired.mRoleId);
        const delRole = await guild.roles.cache.get(expiredChan[0].mRoleId); //anyone should have the same value
        const delRoleLead = await guild.roles.cache.get(expiredChan[0].lRoleId);
        if (delRole) await delRole.delete('Time expired').catch((err) => console.log('error deleting role: ' + err.message));
        if (delRoleLead) await delRoleLead.delete('Time expired').catch((err) => console.log('error deleting leader role: ' + err.message));
        for (i in expiredChan) {
            const channel = await guild.channels.cache.get(expiredChan[i].channelId);
            if (channel) await channel.delete('time expired').catch((err) => console.log('error deleting message: ' + err.message));
            db.prepare('DELETE FROM channels WHERE guild = ? AND mRoleId = ? AND channelId = ?').run(guild.id, expiredChan[i].mRoleId, expiredChan[i].channelId);
        };
        db.prepare('DELETE FROM whiteStar WHERE guild = ? AND mRoleId = ?').run(guild.id, expired.mRoleId);
    };
};
   
module.exports = {
    afkContent,
    myButtons,
    defButtons,
    db,
    cacheNames,
    makeAwayBoard,
    postAFKs,
    removeDeadAFKs,
    delExpiredChans,
    myEmojis
}
