let menuCache = {};
setInterval(menuCacheClean, 14400 * 1000);
async function menuCacheClean() {
    console.log("menuCache size " + Object.keys(menuCache).length);
    for (iii in menuCache) {
        if (menuCache[iii].timestamp < (Math.floor(Date.now() / 1000) - 14400)) delete menuCache[iii];
    }
};
const awayBoard = require('../../awayBoard.js');
const {
    ActivityType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    PermissionsBitField
} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const cs = require('../../roster.js');
const pAfkKeys = ['Drone', 'Combat', 'Shield', 'Econ'];
const personalAfkIds = pAfkKeys.flatMap(category => {
        if (awayBoard.myEmojis[category]) {
            const categoryId = awayBoard.myEmojis[category].id;
            const subModuleIds = Object.values(awayBoard.myEmojis[category])
                .filter(subModule => typeof subModule === 'object' && subModule !== null && subModule.hasOwnProperty('id'))
                .map(subModule => subModule.id);
            return [categoryId, ...subModuleIds];
        }
        return [];
    });
const timeButtons = [];
const personalButtonCache = {};
// Function to create action rows for a category
function createPersonalButtonCache(category) {
    const menuButtons = [];
    const subModules = Object.keys(awayBoard.myEmojis[category]).filter(subKey => {
        const subModule = awayBoard.myEmojis[category][subKey];
        return typeof subModule === 'object' && subModule !== null && subModule.hasOwnProperty('id');
    });

    let actionRow = new ActionRowBuilder();
    for (let i = 0; i < subModules.length; i++) {
        const module = subModules[i];
        const subModule = awayBoard.myEmojis[category][module];
        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId(subModule.id)
                .setEmoji(subModule.id)
                .setStyle(2) // 2 is grey
        );

        // Add the action row to the menuButtons and create a new one after every 5 buttons
        if ((i + 1) % 5 === 0 || i === subModules.length - 1) {
            menuButtons.push(actionRow);
            actionRow = new ActionRowBuilder();
        }
    }

    menuButtons.unshift(...timeButtons); // Add timeButtons at the beginning
    return menuButtons;
}
timeButtons[0] = new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('hours')
        .setPlaceholder('How many hours ago?')
        .addOptions({
            label: '0',
            value: '0',
        }, {
            label: '1',
            value: '1',
        }, {
            label: '2',
            value: '2',
        }, {
            label: '3',
            value: '3',
        }, {
            label: '4',
            value: '4',
        }, {
            label: '5',
            value: '5',
        }, {
            label: '6',
            value: '6',
        }, {
            label: '7',
            value: '7',
        }, {
            label: '8',
            value: '8',
        }, {
            label: '9',
            value: '9',
        }, {
            label: '10',
            value: '10',
        }, {
            label: '11',
            value: '11',
        }, {
            label: '12',
            value: '12',
        }, {
            label: '13',
            value: '13',
        }, {
            label: '14',
            value: '14',
        }, {
            label: '15',
            value: '15',
        }, {
            label: '16',
            value: '16',
        }, {
            label: '17',
            value: '17',
        }, {
            label: '18',
            value: '18',
        }, {
            label: '19',
            value: '19',
        }, {
            label: '20',
            value: '20',
        }, {
            label: '21',
            value: '21',
        }, {
            label: '22',
            value: '22',
        }, {
            label: '23',
            value: '23',
        }, {
            label: '24',
            value: '24',
        })
    );
timeButtons[1] = new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('minutes')
        .setPlaceholder('How many minutes ago?')
        .addOptions({
            label: '0m/.0h',
            value: '0',
        }, {
            label: '5m/.08h.',
            value: '5',
        }, {
            label: '10m/.17h',
            value: '10',
        }, {
            label: '15m/.25h',
            value: '15',
        }, {
            label: '20m/.33h',
            value: '20',
        }, {
            label: '25m/.42h',
            value: '25',
        }, {
            label: '30m/.5h',
            value: '30',
        }, {
            label: '35m/.58h',
            value: '35',
        }, {
            label: '40m/.67h',
            value: '40',
        }, {
            label: '45m/.75h',
            value: '45',
        }, {
            label: '50m/.83h',
            value: '50',
        }, {
            label: '55m/.92h',
            value: '55',
        })
    );
module.exports = async(client, interaction) => {
    if (!interaction.isCommand() && !interaction.isContextMenuCommand() && !interaction.isButton() && !interaction.isAutocomplete() && !interaction.isStringSelectMenu()) return; // When the interaction is not a command, not a contextmenu, or not a button, it will not execute.
    if (interaction.isStringSelectMenu()) {
        if (menuCache.hasOwnProperty(interaction.message.id)) {
            menuCache[interaction.message.id][interaction.customId] = interaction.values[0];
        } else {
            menuCache[interaction.message.id] = [];
            menuCache[interaction.message.id][interaction.customId] = interaction.values[0];
            menuCache[interaction.message.id].timeStamp = Math.floor(Date.now() / 1000);
        };
        interaction.deferUpdate();
        return;
    };
   const requiredPermissions = [
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages
    ];

    const missingPermissions = requiredPermissions.filter(permission => !interaction.guild.members.me.permissions.has(permission));

    if (missingPermissions.length > 0) {
      // Correctly mapping permission bits to human-readable strings
      const missingPermissionsNames = missingPermissions.map(permission => {
        return Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key] === permission);
      });
      console.log(`Guild: ${interaction.guild.name} (ID: ${interaction.guild.id}), Missing permissions: ${missingPermissionsNames.join(', ')}`);
      // Sending an ephemeral reply to inform the user about the missing permissions
      await interaction.reply({
        content: `The bot is missing the following permissions: ${missingPermissionsNames.join(', ')}.`,
        ephemeral: true
      });

      return; // Stop execution if there are missing permissions
    }


    if (interaction.isButton()) {

        const buttonPushed = cs.emojis.map(object => object.name).indexOf(interaction.customId);
        if (buttonPushed > -1) { //if it is not on my list, we ignore. (for signup)
            const checkExists = await cs.db.prepare('SELECT messageId FROM roster WHERE serverId = ? AND messageId = ?');
            const checkResults = checkExists.get(interaction.guildId, interaction.message.id);
            if (checkResults == undefined) {
                interaction.message.edit({
                        components: []
                    })
                    .then(() => console.log('Buttons removed from the message.'))
                    .catch(console.error);
            } else {
                const finduser = await cs.db.prepare('SELECT userId FROM roster WHERE serverId = ? AND messageId = ? AND userId = ?').get(interaction.guildId, interaction.message.id, interaction.user.id);
                if (finduser == undefined) await cs.db.prepare('INSERT INTO roster (serverId, channelId, messageId, userId) VALUES(?,?,?,?)').run(interaction.guildId, interaction.channel.id, interaction.message.id, interaction.user.id);
                let embed = new EmbedBuilder()
                    .setTitle("White Star Signup!")
                    .setColor(0xf2f2e9)
                    .setDescription(cs.signupMsg);
                if (buttonPushed == undefined) {
                    interaction.reply({
                        content: `Error: Absolute weirdness, it is like I fell into a black hole where I can hear colors!`,
                        ephemeral: true
                    });
                    return;
                };
                //last button of the group is always the close/open signup button


                const checkclosed = await cs.db.prepare('SELECT closed FROM roster WHERE serverId = ? and messageId = ?').get(interaction.guildId, interaction.message.id);
                let closed = checkclosed.closed;
                if ((cs.emojis.length - 1) == buttonPushed) { //last emoji in the mix is always the completion emoji.
                    if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles) && interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                        if (!closed) embed.setTitle("**Signup Closed**");
                        closed = !closed;
                        cs.db.prepare("UPDATE roster SET closed = ?,created_at = strftime('%s', 'now') WHERE serverId = ? AND messageId = ?").run(Number(closed), interaction.guildId, interaction.message.id); //does not matter who it is, we'll just grab one record later to check.
                    } else {
                        await interaction.reply({ // And you inform the users that you have found an error.
                            content: `Not Authorized!`,
                            ephemeral: true
                        });
                        return; //stop here, they hit an unauthorized button.
                    };
                } else if (closed) {
                    //do reply here.
                    interaction.reply({ // And you inform the users that signups are closed.
                        content: `Sorry, signups are now closed.`,
                        ephemeral: true
                    })
                    return;
                };
                let limited = "";
                if (cs.emojis[buttonPushed].limited)
                    for (z in cs.emojis) {
                        if (cs.emojis[z].limited && z != buttonPushed)
                            limited += ",n" + z + " = 0";
                    }

                //toggle boolean, really just 1,0
                await cs.db.prepare('UPDATE roster SET n' + buttonPushed + ' = ((n' + buttonPushed + ' | 1) - (n' + buttonPushed + ' & 1))' + limited + ' WHERE  serverId = ? AND messageId = ? AND userId = ?').run(interaction.guildId, interaction.message.id, interaction.user.id);

                let lists = [];
                let clist = [];
                for (i = 0; i < cs.emojis.length - 1; i++) {
                    lists[i] = "";
                    const category = "n" + i;
                    const eUsers = await cs.db.prepare('SELECT userId FROM roster WHERE serverId = ? AND messageId = ? AND ' + category + ' = 1').all(interaction.guildId, interaction.message.id);
                    clist.push(Object.keys(eUsers).length);
                    for (y in eUsers) {
                        let Handle = interaction.guild.members.cache.get(eUsers[y].userId)?.displayName || 'Unknown User';
                        lists[i] += "" + Handle + "\n";
                    };
                    if (lists[i] == "") lists[i] = "Empty";

                    embed.addFields({
                        name: "<:" + cs.emojis[i].name + ":" + cs.emojis[i].id + ">  " + clist[i],
                        value: lists[i],
                        inline: true
                    })
                };
                await wait(500);
                await interaction.deferUpdate();
                interaction.editReply({
                    content: cs.headerContent,
                    ephemeral: false,
                    embeds: [embed],
                    allowedMentions: {
                        parse: ["roles"]
                    },
                    components: cs.defButtons
                });
            };
	 return;
        };

        let afkId = interaction.customId;
        if (menuCache[interaction.message.id] && menuCache[interaction.message.id].hasOwnProperty('ship')) afkId = menuCache[interaction.message.id].ship; //if this is the second time around, we have a cache.
        const button = awayBoard.myEmojis[afkId];
        let posted = false;
        const wsRole = await awayBoard.db.prepare('SELECT mRoleId FROM channels WHERE guild = ? AND channelId = ?').get(interaction.guildId, interaction.channelId);
        const whiteStar = await awayBoard.db.prepare('SELECT * FROM whiteStar WHERE guild = ? AND mRoleId = ?').get(interaction.guildId, wsRole.mRoleId);
        switch (interaction.customId) {
            case 'Work':
                afkBreak();
                break;
            case 'Sleep':
                afkBreak();
                break;
            case 'Battleship':
                destroyedShip();
                break;
            case 'Squishie':
                destroyedShip();
                break;
            case 'Flagship':
                flagship();
                break;
            case 'CheckIn':
                afkBreak();
                break;
            case 'EnemyBattleship':
                destroyedShip(true);
                break;
            case 'EnemySquishie':
                destroyedShip(true);
                break;
            case 'EnemyFlagship':
                flagship();
                break;
            case 'WasteBasket':
                printTimers();
                break;
            case 'Cancel':
                ackTimers(true);
                break;
            case 'Delete':
                ackTimers();
                break;
            case 'List':
                personalBoard(true);
                break;
            default:
                if (personalAfkIds.indexOf(interaction.customId) !== -1) personalAfk();
                else whichShip();
                break;
        };

        async function personalBoard(reply) {
            const afkTimers = await awayBoard.db.prepare('SELECT * FROM awayTimers WHERE mRoleId = ? AND guild = ? AND who = ? AND personal = 1 ORDER BY lifeTime ASC').all(wsRole.mRoleId, interaction.guildId, interaction.user.id);
            let description = ``;
            if (afkTimers.length > 0) {
                for (const awayTimer of afkTimers) {
                    description += `${awayTimer.what} <t:${awayTimer.lifeTime}:R> <t:${awayTimer.lifeTime}:f>\n`;
                }
            } else description = "All modules available";
            const embed = new EmbedBuilder()
                .setTitle('Personal Module Timers')
                .setColor(whiteStar.colour)
                .setDescription(description);
            if(reply) {
                interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            } else return embed;
        }
        async function personalAfk() {
            const category = pAfkKeys.find(key => awayBoard.myEmojis[key].id === interaction.customId);
            if (category !== undefined) {
                if (!personalButtonCache[category]) {
                    personalButtonCache[category] = createPersonalButtonCache(category);
                }
       
                const message = await interaction.reply({
                    content: "**Note:** Timers do not include effect duration.",
                    ephemeral: true,
                    fetchReply: true,
                    components: personalButtonCache[category]
                });
                menuCache[message.id] = {
                    hours: 0,
                    minutes: 0,
                    timeStamp: Math.floor(Date.now() / 1000),
                    ship: interaction.customId,
                };
            } else {
                let foundObject = null;

                for (const key of pAfkKeys) {
                    const subKeys = Object.keys(awayBoard.myEmojis[key]);
                    
                    for (const subKey of subKeys) {
                        const subCategory = awayBoard.myEmojis[key][subKey];
                        if (typeof subCategory === 'object' && subCategory !== null && subCategory.id === interaction.customId) {
                            foundObject = subCategory;
                            break;
                        }
                    }
                    if (foundObject) {
                        break;
                    }
                };
                if(foundObject !== null) {
                    const { hours, minutes } = menuCache[interaction.message.id] || { hours: 0, minutes: 0 };
                    const lifeTime = Math.floor((Date.now() / 1000) + foundObject.time - ((hours * 3600) + (minutes * 60)));
                    await awayBoard.db.prepare('INSERT INTO awayTimers (guild, mRoleId, lifeTime, what, who, personal) VALUES(?,?,?,?,?,?)').run(interaction.guildId, wsRole.mRoleId, lifeTime, foundObject.inline, interaction.user.id,1);
                    const embed = await personalBoard();
                    interaction.update({
                        embeds: [embed],
                        components: []
                    });
                } else {
                    interaction.update({
                        content: 'An error occured',
                        components: []
                    });
                }
            }
        }
        
        async function ackTimers(cancelled) {
            if (cancelled) {
                interaction.update({
                    content: "OK.",
                    components: []
                }).catch(console.log);
            } else {
                if (menuCache[interaction.message.id] != undefined) {
                    await awayBoard.db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND lifeTime = ? AND fromWho = ?')
                        .run(interaction.guildId, wsRole.mRoleId, String(menuCache[interaction.message.id].afkMessage).split('.')[1], interaction.user.id);
                    awayBoard.makeAwayBoard(interaction.guild, wsRole.mRoleId, posted);
                    interaction.update({
                        content: "OK.",
                        components: []
                    }).catch(console.log);
                } else {
                    interaction.update({
                        content: "Error, no message selected.",
                        components: []
                    }).catch(console.log);
                }
            };
            if (menuCache.hasOwnProperty(interaction.message.id)) delete menuCache[interaction.message.id];
        };

        async function printTimers() {
            const awayTimers = await awayBoard.db.prepare('SELECT what,lifeTime FROM awayTimers WHERE guild = ? AND mRoleId = ? AND (who = ? OR fromWho = ?)').all(interaction.guildId, wsRole.mRoleId, interaction.user.id, interaction.user.id);
            // console.log(awayTimers); //figure out what empty looks like
            if (awayTimers.length < 1) {
                interaction.reply({
                    content: "No messages available.",
                    components: [],
                    ephemeral: true
                }).catch(console.log);
            }
            const curTime = Math.floor(Date.now() / 1000);
            let dropDown = [];
            for (xa in awayTimers) {
                const t = ((awayTimers[xa].lifeTime - curTime) / 3600);
                let time;
                if (t < 1)
                    time = String(Math.floor(t * 60) + "m").padEnd(5, '⠀');
                else
                    time = String(Math.floor(t * 10) / 10 + "h").padEnd(5, '⠀');;
                if (time.indexOf(".") > -1) time += '⠀';
                dropDown.push({
                    label: String(time + awayTimers[xa].what).replace(/<:(\w+):\d+>/g, "$1"),
                    value: String(xa + ".") + String(awayTimers[xa].lifeTime) //added the xa+"." to prevent the odd time that two messages have the same lifeTime and cause a bot crash.
                })
            };
            let selectMenu = [];
            selectMenu[0] = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId('afkMessage')
                    .setPlaceholder('Select afk?')
                    .addOptions(...dropDown));
            selectMenu[1] = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("Delete")
                    .setLabel("Delete")
                    .setStyle(4), //4 is red
                )
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("Cancel")
                    .setLabel("Cancel")
                    .setStyle(2), //4 is red
                );
            interaction.reply({
                components: selectMenu,
                ephemeral: true
            }).catch(console.log);
        };

        async function whichShip() {
            let who, what;
            if (!menuCache[interaction.message.id]) {
                interaction.update({
                    content: 'A strange error has occured.',
                    ephemeral: true,
                    components: []
                });
                return; //catch
            };
            if (interaction.customId == 'OK') {
                if (button.id == awayBoard.myEmojis.EnemyFlagship.id) {
                    who = '0'
                    what = button.inline;
                } else {
                    who = '10'
                    what = "<@&" + wsRole.mRoleId + ">⠀⠀" + button.inline;
                }
            } else {
                console.log(interaction.customId);
                console.log("here");
                const opponents = await JSON.parse(whiteStar.opponents);
                if (!!opponents[Number(interaction.customId)]) {
                    who = '0';
                    what = button.inline + " " + opponents[interaction.customId];
                } else { //otherwise friendly *** add an extra check here for later to ensure userid.
                    who = interaction.customId;
                    what = button.inline;
                };
            };
            const lifeTime = Math.floor((Date.now() / 1000) + button.time - ((menuCache[interaction.message.id].hours * 3600) + (menuCache[interaction.message.id].minutes * 60)));
            const prepareCheck = await awayBoard.db.prepare('SELECT 1 FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ? LIMIT 1');
            const checkExists = await prepareCheck.get(interaction.guildId, wsRole.mRoleId, what, who);
            if (checkExists != undefined)
                await awayBoard.db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ?')
                .run(interaction.guildId, wsRole.mRoleId, what, who); //remove previous versions if they exist, we overwrite with the new one technically.
            else
                awayBoard.db.prepare('UPDATE whitestar SET ' + button.name + ' = ' + button.name + ' + 1 WHERE guild = ? AND mRoleId = ?').run(interaction.guildId, wsRole.mRoleId);
            await awayBoard.db.prepare('INSERT INTO awayTimers (guild, mRoleId, lifeTime, what, who, fromwho) VALUES(?,?,?,?,?,?)').run(interaction.guildId, wsRole.mRoleId, lifeTime, what, who, interaction.user.id);
            interaction.update({
                content: "OK.",
                components: []
            }).catch(console.log);
            delete menuCache[interaction.message.id];
            awayBoard.makeAwayBoard(interaction.guild, wsRole.mRoleId, posted);
        };

        async function destroyedShip(enemy) {
            let menuButtons = [];
            if (enemy) {
                const opponents = await JSON.parse(whiteStar.opponents);
                if (opponents.length < 1) { //do something if the opponents list is not populated yet. alert to it?
                    interaction.reply({
                        content: "Error, please setup the opponents first. **/ws opponents**",
                        components: []
                    }).catch(console.log);
                    return;
                } else
                    for (bCount = 0; bCount < opponents.length; bCount++) {
                        if (bCount > 14) {
                            break;
                        }
                        const r = Math.floor(bCount / 5);
                        if (!menuButtons[r]) {
                            menuButtons[r] = new ActionRowBuilder();
                        }
                        menuButtons[r].addComponents(
                            new ButtonBuilder()
                            .setCustomId(String(bCount))
                            .setLabel(String(opponents[bCount]).slice(0, 20))
                            .setStyle(4), //4 is red
                        );
                    };
            } else {
                //friendly 
                const mRoleId = await interaction.guild.roles.cache.get(wsRole.mRoleId);
                let bCount = 0;
                const tagCheck = new RegExp(/\[[\s\S]*\](.*)$/i); //remove corp tags
                for (const [key, value] of mRoleId.members) {
                    let displayName = String(value.displayName);
                    if (!!tagCheck.test(displayName)) {
                        let displayNameTest = displayName.match(tagCheck);
                        if (displayNameTest.length == 2)
                            if (displayNameTest[1].length > 4) displayName = displayNameTest[1];
                    };
                    displayName = displayName.slice(0, 20);
                    const r = Math.floor(bCount / 5);
                    if (!menuButtons[r]) {
                        menuButtons[r] = new ActionRowBuilder();
                    }
                    menuButtons[r].addComponents(
                        new ButtonBuilder()
                        .setCustomId(value.id)
                        .setLabel(displayName)
                        .setStyle(1), //1 is bluef
                    )
                    bCount++;
                    if (bCount > 14) { //counting starts at zero, max (14)15 due to rules of 5 per row and 5 rows max. buttonbar takes up 2 rows. 3 rows for people.
                        break;
                    };
                };
            };
            menuButtons = timeButtons.concat(menuButtons); //Put the drop down menus first.
            const message = await interaction.reply({ //add try catch later
                ephemeral: true,
                fetchReply: true,
                components: menuButtons
            });
            menuCache[message.id] = {
                hours: 0,
                minutes: 0,
                timeStamp: Math.floor(Date.now() / 1000),
                ship: interaction.customId,
            };
            awayBoard.makeAwayBoard(interaction.guild, wsRole.mRoleId, posted);
        };

        async function flagship(enemy) {
            let who = '10';
            let bStyle = 1;
            if (enemy) {
                who = '0';
                bStyle = 4; //4 is red
            };
            let menuButtons = [];
            menuButtons[0] = new ActionRowBuilder();
            menuButtons[0].addComponents(
                new ButtonBuilder()
                .setCustomId("OK")
                .setLabel("OK")
                .setStyle(bStyle)
            );
            menuButtons = timeButtons.concat(menuButtons); //Put the drop down menus first.
            const message = await interaction.reply({
                ephemeral: true,
                fetchReply: true,
                components: menuButtons
            });
            menuCache[message.id] = {
                hours: 0,
                minutes: 0,
                timeStamp: Math.floor(Date.now() / 1000),
                ship: interaction.customId,
            };
        };
        async function afkBreak() {
            const checkEntry = await awayBoard.db.prepare('SELECT * FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ?').get(interaction.guildId, wsRole.mRoleId, button.inline, interaction.user.id);
            if (!checkEntry) {
                interaction.deferUpdate();
                await awayBoard.db.prepare('INSERT INTO awayTimers (guild, mRoleId, lifeTime, what, who, fromWho) VALUES(?,?,?,?,?,?)')
                    .run(interaction.guildId, wsRole.mRoleId, Math.floor(Date.now() / 1000 + button.time), button.inline, interaction.user.id, interaction.user.id);
            } else {
                posted = true
                await interaction.channel.send({
                    content: " <@" + interaction.user.id + "> " + checkEntry.what + " " + button.past+" <t:"+Math.floor(Date.now() / 1000)+":R>",
                    allowedMentions: {
                        parse: ['users', 'roles']
                    },
                    ephemeral: false
                });
                await awayBoard.db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ? AND fromWho = ?')
                    .run(interaction.guildId, wsRole.mRoleId, button.inline, interaction.user.id, interaction.user.id);
            };
            awayBoard.makeAwayBoard(interaction.guild, wsRole.mRoleId, posted);
        };
    };
    if (interaction.isCommand() || interaction.isContextMenuCommand() || interaction.isAutocomplete()) { // If the command is a command or an contextmenu, it will run the below code.
        const command = client.commands.get(interaction.commandName) // This is the command (It's the same for ContextMenu as a ContextMenuCommand is just the same as a slash command, only the difference is that ContextMenuCommands are ran through an User Interface.
        if (!command) return // If the command does not exists, return again.
        try {
            await command.execute(interaction) // Try to execute the command.
        } catch (err) {
            if (err) console.error(err) // If it fails, it returns an error.
            await interaction.reply({ // And you inform the users that you have found an error.
                content: "You found an error!",
                ephemeral: true
            })
        }
    }
}
