const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const emojis = [{
    name: 'Hardcore',
    id: '1252343807287103529',
    desc: "**Slot 1**\n\u2800\u2800🔹2 hour check-ins\n\u2800\u2800🔹Use AFK\n\u2800\u2800🔹Disband when required\n\u2800\u2800🔹Contribute to strategy\n\u2800\u2800🔹Tactical teamwork\n",
    limited: true
}, {
    name: 'Relaxed',
    id: '1252343805710041151',
    desc: "**Slot 2**\n\u2800\u2800🔹8 hour check-ins\n\u2800\u2800🔹Use AFK\n\u2800\u2800🔹Disband when required\n\u2800\u2800🔹Contribute to strategy\n",
    limited: true
}, {
    name: 'NoPref',
    id: '1242253099934945420',
    desc: "**No Preference**\n\u2800\u2800🔹Will run if/where needed\n",
    limited: true
}, {
    name: 'Lead',
    id: '1248742114192523474',
    desc: "**Lead/Help Lead**\n",
    limited: false
}, {
    name: 'HaveAlt',
    id: '1212909512298725436',
    desc: "**My Alt is available**\n",
    limited: false
}, {
    name: 'Out',
    id: '1242253096369917973',
    desc: "**Prefer Not to Run**\n",
    limited: true
}, {
    name: 'Suspend',
    id: '1242296723129237654',
    desc: false,
    limited: false
}];

const headerContent = ".";

let signupMsg = "Whitestar Signup, currently in alpha testing\n\n";

for (a in emojis) {
    if (emojis[a].desc) signupMsg += "<:" + emojis[a].name + ":" + emojis[a].id + ">  " + emojis[a].desc + "\n"
};
//signupMsg += "We try to take your preferences into account but slot 1 roster will always take precedence over the casual run.";

let size = emojis.length;
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
        .setCustomId(emojis[nCount].name)
        .setEmoji(emojis[nCount].id)
        .setStyle(ButtonStyle.Secondary),
    );
}
const defButtons = row;

function closethedb() {
    db.close();
    console.log('close the db connection');
    process.exit();
};

const db = require('better-sqlite3')('db/geeves.db', {
    verbose: console.log
});

var displayName = {};

   let getDisplayName = async function getdisplayname(interaction, id, maxlength) {
        if (displayName[id]) return displayName[id];
        let member = await interaction.guild.members.cache.get(id);
        if (!member)
            memberr = await interaction.guild.members.fetch(id, {
                force: true,
                withPresences: false
            }).catch(console.log);
        if (!member) {
            member = await interaction.guild.members.cache.get(id);
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

module.exports = {
	getDisplayName,
    emojis,
    signupMsg,
    defButtons,
    closethedb,
    db,
    headerContent,
    displayName
}
