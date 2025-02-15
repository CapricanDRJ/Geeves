const {
    SlashCommandBuilder,
} = require("@discordjs/builders")
const {
    PermissionFlagsBits,
    ChannelType,
    MessageFlagsBitField
} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const db = require('better-sqlite3')('./db/geeves.db', {
    verbose: console.log
});
const MessageFlags = MessageFlagsBitField.Flags;
const end_of_life = 10 * 24 * 3600; // //10*24*3600 = 10 days
const chanProperties = { // type: [name, leader, restricted]
    0: ["category", false, false],
    1: ["private", false, false],
    2: ["restricted", false, true],
    3: ["leader", true, true],
    4: ["afk", false, false]
};
const awayBoard = require('../../awayBoard.js');
let wsnewThrottle = 0; //limit the usage to once every x minutes for /ws

async function checkTemplate(guildId) {
    let template = await db.prepare('SELECT * FROM template WHERE guild = ? ORDER BY type ASC').all(guildId);
    if (!template || template?.length == 0) { //install template if it does not exist, then requery the results.
        template = [{
            guild: guildId,
            name: 'whitestar',
            type: 0,
        }, {
            guild: guildId,
            name: 'chat',
            type: 1,
        }, {
            guild: guildId,
            name: 'orders',
            type: 2,
        }, {
            guild: guildId,
            name: 'leaders',
            type: 3,
        }, {
            guild: guildId,
            name: 'afk',
            type: 4,
        }];
        await db.prepare('DELETE FROM template WHERE guild = ?').run(guildId); // reset to defaults
        const insert = db.prepare('INSERT INTO template (guild, name, type) VALUES (@guild, @name, @type)');
        const insertMany = db.transaction((chans) => {
            for (const chan of chans) insert.run(chan);
        });
        insertMany(template);
    };
    return template;
};

const ships = [{
    name: 'Battleship',
    value: 'Battleship'
}, {
    name: 'Squishie',
    value: 'Squishie'
}, {
    name: 'Transport',
    value: 'Transport'
}, {
    name: 'Miner',
    value: 'Miner'
}, {
    name: 'Flagship',
    value: 'Flagship'
}];

function addEmojis(args) {
    let msg = String(args).split(' ');
    switch (msg[0].toLowerCase()) {
        case 'work':
            msg[0] = awayBoard.myEmojis.Work.inline;
            break;
        case 'working':
            msg[0] = awayBoard.myEmojis.Work.inline;
            break;
        case 'battleship':
            msg[0] = awayBoard.myEmojis.Battleship.inline;
            break;
        case 'bs':
            msg[0] = awayBoard.myEmojis.Battleship.inline;
            break;
        case 'transport':
            msg[0] = awayBoard.myEmojis.Transport.inline;
            break;
        case 'ts':
            msg[0] = awayBoard.myEmojis.Transport.inline;
            break;
        case 'miner':
            msg[0] = awayBoard.myEmojis.Miner.inline;
            break;
        case 'squishie':
            msg[0] = awayBoard.myEmojis.Squishie.inline;
            break;
        case 'squishy':
            msg[0] = awayBoard.myEmojis.Squishie.inline;
            break;
        case 'sq':
            msg[0] = awayBoard.myEmojis.Squishie.inline;
            break;
        case 'flagship':
            msg[0] = awayBoard.myEmojis.Flagship.inline;
            break;
        case 'fs':
            msg[0] = awayBoard.myEmojis.Flagship.inline;
            break;
        case 'sleep':
            msg[0] = awayBoard.myEmojis.Sleep.inline;
            break;
        case 'sleeping':
            msg[0] = awayBoard.myEmojis.Sleep.inline;
            break;
        case 'zzz':
            msg[0] = awayBoard.myEmojis.Sleep.inline;
            break;
        case 'away':
            msg[0] = awayBoard.myEmojis.Away.inline;
            break;
    };
    return msg;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ws') // The name of the slash command
        .setDescription("WS channel role and timer management") // A short description about the slash command.
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
            .setName('new')
            .setDescription('Create a set of whitestar channels for the following users')
            .addUserOption(option => option.setName('user1').setDescription('Select user').setRequired(true))
            .addUserOption(option => option.setName('user2').setDescription('Select user'))
            .addUserOption(option => option.setName('user3').setDescription('Select user'))
            .addUserOption(option => option.setName('user4').setDescription('Select user'))
            .addUserOption(option => option.setName('user5').setDescription('Select user'))
            .addUserOption(option => option.setName('user6').setDescription('Select user'))
            .addUserOption(option => option.setName('user7').setDescription('Select user'))
            .addUserOption(option => option.setName('user8').setDescription('Select user'))
            .addUserOption(option => option.setName('user9').setDescription('Select user'))
            .addUserOption(option => option.setName('user10').setDescription('Select user'))
        )
        .addSubcommandGroup((group) =>
            group
            .setName('template')
            .setDescription('Change, alter, or remove the default channels for whitestar channel creation')
            .addSubcommand((subcommand) =>
                subcommand.setName('list').setDescription('List current template for this discord'),
            )
            .addSubcommand((subcommand) =>
                subcommand
                .setName('add')
                .setDescription('Add a channel to the template for this discord.')
                .addStringOption((option) =>
                    option
                    .setName('type')
                    .setDescription('What type of channel to add to the template?')
                    .addChoices({
                        name: 'category',
                        value: 'category'
                    }, {
                        name: 'private',
                        value: 'private'
                    }, {
                        name: 'restricted',
                        value: 'restricted'
                    }, {
                        name: 'leader',
                        value: 'leader'
                    }, {
                        name: 'afk',
                        value: 'afk'
                    }, )
                    .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                    .setName('name')
                    .setDescription('Name of channel to add to template')
                    .setRequired(true)
                )
            )
            .addSubcommand((subcommand) =>
                subcommand
                .setName('delete')
                .setDescription('Deletes a channel from the template')
                .addStringOption((option) =>
                    option
                    .setName('name')
                    .setDescription('Name of channel to add to template')
                    .setRequired(true)
                    .setAutocomplete(true)
                )
            )
            .addSubcommand((subcommand) =>
                subcommand
                .setName('roles')
                .setDescription('Default roles to add to every whitestar')
                .addRoleOption(option => option.setName('role1').setDescription('Role to add to every new whitestar.').setRequired(true))
                .addRoleOption(option => option.setName('role2').setDescription('Additional role to add to every new whitestar.'))
                .addRoleOption(option => option.setName('role3').setDescription('Additional role to add to every new whitestar.'))
                .addRoleOption(option => option.setName('role4').setDescription('Additional role to add to every new whitestar.'))
                .addRoleOption(option => option.setName('role5').setDescription('Additional role to add to every new whitestar.'))
            )
            .addSubcommand((subcommand) =>
                subcommand
                .setName('officer')
                .setDescription('Tell me what your officer role is for using /ws new')
                .addRoleOption(option => option.setName('role').setDescription('Officer role to use /ws new').setRequired(true))
            )
        )
        .addSubcommandGroup((group) =>
            group
            .setName('leader')
            .setDescription('Add or remove leader role (Can be used by anyone with the leader role)')
            .addSubcommand((subcommand) =>
                subcommand
                .setName('add')
                .setDescription('Add a member to leaders.')
                .addUserOption(option => option.setName('user1').setDescription('Select user').setRequired(true))
                .addUserOption(option => option.setName('user2').setDescription('Select user'))
                .addUserOption(option => option.setName('user3').setDescription('Select user'))
                .addUserOption(option => option.setName('user4').setDescription('Select user'))
                .addUserOption(option => option.setName('user5').setDescription('Select user'))
            )
            .addSubcommand((subcommand) =>
                subcommand
                .setName('remove')
                .setDescription('Remove a member from leaders.')
                .addUserOption(option => option.setName('user1').setDescription('Select user').setRequired(true))
                .addUserOption(option => option.setName('user2').setDescription('Select user'))
                .addUserOption(option => option.setName('user3').setDescription('Select user'))
                .addUserOption(option => option.setName('user4').setDescription('Select user'))
                .addUserOption(option => option.setName('user5').setDescription('Select user'))
            )
        )
        .addSubcommandGroup((group) =>
            group
            .setName('member')
            .setDescription('Add or remove member role (Can be used by anyone with the member role)')
            .addSubcommand((subcommand) =>
                subcommand
                .setName('add')
                .setDescription('Add a member.')
                .addUserOption(option => option.setName('user1').setDescription('Select user').setRequired(true))
                .addUserOption(option => option.setName('user2').setDescription('Select user'))
                .addUserOption(option => option.setName('user3').setDescription('Select user'))
                .addUserOption(option => option.setName('user4').setDescription('Select user'))
                .addUserOption(option => option.setName('user5').setDescription('Select user'))
            )
            .addSubcommand((subcommand) =>
                subcommand
                .setName('remove')
                .setDescription('Remove a member.')
                .addUserOption(option => option.setName('user1').setDescription('Select user').setRequired(true))
                .addUserOption(option => option.setName('user2').setDescription('Select user'))
                .addUserOption(option => option.setName('user3').setDescription('Select user'))
                .addUserOption(option => option.setName('user4').setDescription('Select user'))
                .addUserOption(option => option.setName('user5').setDescription('Select user'))
            )
        )
        .addSubcommandGroup((group) =>
            group
            .setName('guest')
            .setDescription('Add or remove guest from non sensitive channels. They will not be pinged by role.')
            .addSubcommand((subcommand) =>
                subcommand
                .setName('add')
                .setDescription('Add a guest.')
                .addUserOption(option => option.setName('user').setDescription('Select user').setRequired(true))
            )
            .addSubcommand((subcommand) =>
                subcommand
                .setName('remove')
                .setDescription('Remove a guest')
                .addUserOption(option => option.setName('user').setDescription('Select user').setRequired(true))
            )
        )
        .addSubcommand((subcommand) =>
            subcommand
            .setName('afk')
            .setDescription('General timers')
            .addNumberOption(option => option.setName('hours').setDescription('Can be any of the following: 1.3, 6, 0, 0.2'))
            .addNumberOption(option => option.setName('minutes').setDescription('Minutes'))
            .addStringOption(option => option.setName('message').setDescription('Your message.'))
            .addMentionableOption(option => option.setName('who').setDescription('Who to mention?'))
        )
        .addSubcommand((subcommand) =>
            subcommand
            .setName('enemy')
            .setDescription('Report enemy ship destruction.')
            .addStringOption((option) =>
                option
                .setName('ship')
                .setDescription('Which ship?')
                .addChoices(...ships)
                .setRequired(true)
            )
            .addStringOption(option => option.setName('who').setDescription('Who lost the ship?').setAutocomplete(true))
            .addNumberOption(option => option.setName('hours').setDescription('How long ago? ex: 1.3, 6, 0'))
            .addNumberOption(option => option.setName('minutes').setDescription('How long ago? ex: 1, 60, 8'))
        )
        .addSubcommand((subcommand) =>
            subcommand
            .setName('allied')
            .setDescription('Report allied ship destruction')
            .addStringOption((option) =>
                option
                .setName('ship')
                .setDescription('Which ship?')
                .addChoices(...ships)
                .setRequired(true)
            )
            .addUserOption(option => option.setName('who').setDescription('Who lost a ship?'))
            .addNumberOption(option => option.setName('hours').setDescription('How long ago? ex: 1.3, 6, 0'))
            .addNumberOption(option => option.setName('minutes').setDescription('How long ago? ex: 1, 60, 8'))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('who')
            .setDescription('List of leaders and members in this whitestar')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('nova')
            .setDescription('Set nova time for the afk board.')
            .addStringOption(option => option.setName('time').setDescription('Enter the nova time ex: "2d1h3m", "1h25m", "5m", "5d", or "expire"').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('opponents')
            .setDescription('The list of your opponents in the whitestar, this will be required for some of the afk functions.')
            .addStringOption(option => option.setName('opponent1').setDescription('First opponent.').setRequired(true))
            .addStringOption(option => option.setName('opponent2').setDescription('Second opponent.').setRequired(true))
            .addStringOption(option => option.setName('opponent3').setDescription('Third opponent.').setRequired(true))
            .addStringOption(option => option.setName('opponent4').setDescription('Fourth opponent.').setRequired(true))
            .addStringOption(option => option.setName('opponent5').setDescription('Fifth opponent.').setRequired(true))
            .addStringOption(option => option.setName('opponent6').setDescription('Sixth opponent.'))
            .addStringOption(option => option.setName('opponent7').setDescription('Seventh opponent.'))
            .addStringOption(option => option.setName('opponent8').setDescription('Eighth opponent.'))
            .addStringOption(option => option.setName('opponent9').setDescription('Ninth opponent.'))
            .addStringOption(option => option.setName('opponent10').setDescription('Tenth opponent.'))
        ),
    async execute(interaction) {
        if (!interaction.channel.isTextBased()) return;
        if (!interaction.guild.members.me.permissionsIn(interaction.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
            await interaction.reply({
                content: 'Sorry, I am missing permission to post here.(view channel/send messages)',
                flags: MessageFlags.Ephemeral
            });
            return;
        }
        if (interaction.isAutocomplete()) {
            if (interaction.options.getSubcommandGroup() == 'template' && interaction.options.getSubcommand() == 'delete') { // ws template delete options
                let template = await checkTemplate(interaction.guildId);
                console.log(template);
                let templateList = [];
                for (ii in template) {
                    await templateList.push({
                        name: "#ws()_" + String(template[ii].name),
                        value: String(template[ii].name)
                    })
                };
                interaction.respond(templateList).catch(console.error);
            };
            if (interaction.options.getSubcommand() == 'enemy') {
                const role = await db.prepare('SELECT mRoleId FROM channels WHERE guild = ? AND channelId = ?').get(interaction.guildId, interaction.channelId);
                if (!!role) {
                    const opponents = await db.prepare('SELECT opponents FROM whiteStar WHERE guild = ? AND mRoleId = ?').get(interaction.guildId, role.mRoleId);
                    const enemies = await JSON.parse(opponents.opponents);
                    let enemyList = [];
                    if (enemies.length > 0) {
                        for (ab in enemies) {
                            await enemyList.push({
                                name: String(enemies[ab]),
                                value: String(enemies[ab])
                            });

                        }
                        interaction.respond(enemyList).catch(console.error);
                    }
                }
            }
        } else {
            //<GuildMember>.roles.highest.position will return a number that you can compare with other role positions
            console.log(interaction.commandName);
            console.log("here");
            if (interaction.commandName === 'ws') {
                //check if bot has permission
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
                        content: `I am missing the following permissions: ${missingPermissionsNames.join(', ')}.`,
                        flags: MessageFlags.Ephemeral
                    });

                    return; // Stop execution if there are missing permissions
                }
                await interaction.deferReply(); // Do this at the top, and all below will be editReply. Otherwise error crashes the btoa.
                let subCommand = await interaction.options.getSubcommand();
                let subCommandGroup = await interaction.options.getSubcommandGroup();
                switch (subCommandGroup) {
                    case null:
                        switch (subCommand) {
                            case 'new':
                                startWS();
                                break;
                            case 'who':
                                replyWho();
                                break;
                            case 'nova':
                                nova();
                                break;
                            case 'opponents':
                                opponent();
                                break;
                            case 'afk':
                                afk('afk');
                                break;
                            case 'allied':
                                afk('allied');
                                break;
                            case 'enemy':
                                afk('enemy');
                                break;
                            default:
                                // code block
                        }
                        break;
                    case 'template':
                        template();
                        break;
                    case 'leader':
                        leader();
                        break;
                    case 'member':
                        member();
                        break;
                    case 'guest':
                        guest();
                        break;
                    default:
                        //code block

                }
                async function checkPermissions(level) {
                    //new and template for manage roles and manage channels
                    //member for has member
                    //leader for has leader
                    //guest for has leader
                    //who for has member
                    //opponent for has leader
                    //nova for has leader
                    //const isOfficer = interaction.member.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles], true);
                    const officerRole = db.prepare('SELECT officer FROM management WHERE guild = ?').get(interaction.guildId)?.officer;
                    const isOfficer = interaction.member.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles], true) || (officerRole && interaction.member.roles.cache.has(officerRole));
                    const checkRoles = await db.prepare('SELECT * FROM channels WHERE guild = ? AND channelId = ?').get(interaction.guildId, interaction.channelId);
                    if (!!checkRoles) { //if it doesn't exist, lets return false.
                        const mRoleId = await interaction.guild.roles.cache.get(checkRoles.mRoleId);
                        const lRoleId = await interaction.guild.roles.cache.get(checkRoles.lRoleId);
                        if (!!!mRoleId || !!!lRoleId) { //Could not find the roles that were recorded
                            interaction.editReply({
                                content: "Sorry, I do not understand why the roles I have recorded no longer exist. Potentially discord lag"
                            });
                            return false;
                        };
                        switch (level) {
                            case 1: //member
                                if (interaction.member.roles.cache.has(checkRoles.mRoleId) || isOfficer) return [checkRoles.mRoleId, checkRoles.lRoleId];
                                else {
                                    interaction.editReply({
                                        content: "This is above your permission levels."
                                    });
                                    return false;
                                };
                                break;
                            case 2: //leader
                                if (interaction.member.roles.cache.has(checkRoles.lRoleId) || isOfficer) return [checkRoles.mRoleId, checkRoles.lRoleId];
                                else {
                                    interaction.editReply({
                                        content: "This is above your permission levels."
                                    });
                                    return false;
                                };
                                break;
                            case 3: //officer
                                if (isOfficer) return [checkRoles.mRoleId, checkRoles.lRoleId];
                                else {
                                    interaction.editReply({
                                        content: "This is above your permission levels."
                                    });
                                    return false;
                                };
                                break;
                            default:
                                interaction.editReply({
                                    content: "Sorry, weird stuff is happening."
                                });
                                return false;
                        }
                    } else {
                        interaction.editReply({
                            content: "Sorry, I could not identify which whitestar this goes with. Potentially this command was used in a channel that is not related to a whitestar."
                        });
                        return false;
                    }
                };

                async function template() {
                    const officerRole = db.prepare('SELECT officer FROM management WHERE guild = ?').get(interaction.guildId)?.officer;
                    if (interaction.member.permissions.has([PermissionFlagsBits.Administrator], true) || (officerRole && interaction.member.roles.cache.has(officerRole))) {
                        const chanTypes = ['category', 'private', 'restricted', 'leader', 'afk'];
                        async function replyTemplate() {
                            let template = await checkTemplate(interaction.guildId);
                            let msg = "\n```\n" + String("Type").padEnd(12) + "Name\n";
                            for (i in template) {
                                msg += "" + String(chanTypes[template[i].type] + ":").padEnd(11) + " #ws()_" + template[i].name + "\n";
                            };
                            msg += "```"
                            interaction.editReply({
                                content: msg
                            });
                        };
                        switch (subCommand) {
                            case 'list':
                                replyTemplate();
                                break;
                            case 'add':
                                let templateCount = await db.prepare('SELECT COUNT(*) AS count FROM template WHERE guild = ?').get(interaction.guildId).count;
                                if (templateCount > 11) {
                                    interaction.editReply({
                                        content: "Too many channels, delete one first."
                                    });
                                    return;
                                };
                                let type = chanTypes.indexOf(String(interaction.options.get("type").value).toLowerCase());
                                let addName = String(interaction.options.get("name").value).replace(/[\[\]\{\}\(\)\+\;\$\\]/gm).substring(0, 20);
                                if (type == -1 || addName.length < 1) {
                                    interaction.editReply({
                                        content: "Sorry, I did not understand that."
                                    });
                                    return;
                                } else {
                                    if (type == 4) db.prepare('DELETE FROM template WHERE guild = ? AND type = 4').run(interaction.guildId);
                                    if (type == 0) db.prepare('DELETE FROM template WHERE guild = ? AND type = 0').run(interaction.guildId);
                                    db.prepare('INSERT INTO template (guild, name, type) VALUES (?,?,?)').run(interaction.guildId, addName, type);
                                    replyTemplate();
                                };
                                break;
                            case 'delete':
                                let delName = String(interaction.options.get("name").value).replace(/[\[\]\{\}\(\)\+\;\$\\]/gm).substring(0, 20);
                                if (delName.length < 1) {
                                    interaction.editReply({
                                        content: "Sorry, I did not understand that."
                                    });
                                    return;
                                } else
                                    db.prepare('DELETE FROM template WHERE guild = ? AND name = ?').run(interaction.guildId, delName);
                                replyTemplate();
                                break;
                            case 'officer':
                                const officerRole = interaction.options.get("role")?.role;
                                if (!officerRole || !officerRole.id) {
                                    interaction.editReply({
                                        content: "Sorry, I did not receive a valid role."
                                    });
                                    return;
                                }

                                // Update the database with the officer role ID
                                db.prepare(`
                                        INSERT INTO management (guild, officer) 
                                        VALUES (?, ?) 
                                        ON CONFLICT(guild) 
                                        DO UPDATE SET officer = excluded.officer
                                    `).run(interaction.guildId, officerRole.id);

                                interaction.editReply({
                                    content: `Officer role has been successfully set to: ${officerRole.name}`
                                });
                                break;
                            case 'roles':
                                let newRoles = [];
                                for (i = 1; i < 6; i++) {
                                    const theRole = interaction.options.getRole('role' + i);
                                    if (!!theRole) {
                                        newRoles.push(theRole.id);
                                    }
                                };
                                newRoles = [...new Set(newRoles)]; //remove any duplicates
                                db.prepare(`
                                        INSERT INTO management (guild, extraRoles) 
                                        VALUES (?, ?) 
                                        ON CONFLICT(guild) 
                                        DO UPDATE SET extraRoles = excluded.extraRoles
                                    `).run(interaction.guildId, JSON.stringify(newRoles));
                                let msg = "";
                                for (i in newRoles) {
                                    msg += "<@&" + newRoles[i] + ">";
                                };
                                interaction.editReply({
                                    content: "Added " + msg + " to default whitestar roles."
                                });
                                break;
                            default:
                                console.log("no idea");
                        }
                    } else
                        interaction.editReply({
                            content: "Must have administrator permission to access templates."
                        })
                };
                async function leader() {
                    const roleIds = await checkPermissions(2); //2=leader
                    if (!roleIds) return; //reply already sent
                    for (i = 1; i < 16; i++) {
                        const theUser = await interaction.options.getMember('user' + i);
                        if (theUser) {
                            switch (subCommand) {
                                case 'add':
                                    await theUser.roles.add(roleIds[1]).catch(console.log);
                                    break;
                                case 'remove':
                                    await theUser.roles.remove(roleIds[1]).catch(console.log);
                                    break;
                                default:
                                    return; //this would be bad, get out of here.
                            };
                            wait(1000)
                        };
                    };
                    replyWho();
                };

                async function member() {
                    const roleIds = await checkPermissions(1); //1=member
                    if (!roleIds) return; //reply already sent
                    for (i = 1; i < 16; i++) {
                        const theUser = await interaction.options.getMember('user' + i);
                        if (theUser) {
                            switch (subCommand) {
                                case 'add':
                                    await theUser.roles.add(roleIds[0]).catch(console.log);
                                    break;
                                case 'remove':
                                    await theUser.roles.remove(roleIds[0]).catch(console.log);
                                    break;
                                default:
                                    return; //this would be bad, get out of here.
                            };
                            wait(1000)
                        };
                    };
                    replyWho();
                };

                async function guest() {
                    const roleIds = await checkPermissions(2); //2=leader
                    if (roleIds) {
                        const channels = await db.prepare('SELECT * FROM channels WHERE guild = ? AND mRoleId = ?').all(interaction.guildId, roleIds[0]);
                        channels.shift(); //first in array is category, lets skip it.
                        const theUser = await interaction.options.getMember('user');
                        for (y in channels) {
                            if (chanProperties[channels[y].cType][1]) continue; //skip the leaders channels
                            let yChannel = await interaction.guild.channels.cache.get(channels[y].channelId);
                            switch (subCommand) {
                                case 'add':
                                    let permissionObject = {
                                        ViewChannel: true,
                                        SendMessages: true
                                    }
                                    if (chanProperties[channels[y].cType][2]) permissionObject.SendMessages = false;
                                    await yChannel.permissionOverwrites.create(theUser.id, permissionObject, "Adding guest to view channels per " + interaction.user.displayName).catch(console.error);
                                    wait(1000);
                                    break;
                                case 'remove':
                                    await yChannel.permissionOverwrites.delete(theUser.id, "Removing guest from channels per " + interaction.user.displayName).catch(console.error);
                                    wait(1000);
                                    break;
                                default:
                                    return; //this would be bad, get out of here.
                            }
                        };
                        interaction.editReply({
                            content: "OK"
                        })


                    }
                };

                async function replyWho() {
                    const checkRoles = await db.prepare('SELECT mRoleId,lRoleId FROM channels WHERE guild = ? AND channelId = ?').get(interaction.guildId, interaction.channelId);
                    if (!!checkRoles) {
                        const mRoleId = await interaction.guild.roles.cache.get(checkRoles.mRoleId);
                        const lRoleId = await interaction.guild.roles.cache.get(checkRoles.lRoleId);
                        if (!!mRoleId || !!lRoleId) {
                            const leadusers = lRoleId.members.map((member) => member.displayName);
                            const roleusers = mRoleId.members.map((member) => member.displayName);
                            let msg = '**' + leadusers.length + ' Leaders:**\n``` ' + leadusers.join(', ') + '```';
                            msg += '\n**' + roleusers.length + ' Members:**\n``` ' + roleusers.join(', ') + '```'
                            interaction.editReply({
                                content: msg
                            })
                        } else {
                            interaction.editReply({
                                content: "The roles associated with this channel appears to be missing."
                            })
                        }
                    } else {
                        interaction.editReply({
                            content: "Sorry, I could not identify which whitestar this goes with. Potentially this command was used in a channel that is not related to a whitestar."
                        })
                    }
                }

                async function nova() {
                    const roleIds = await checkPermissions(2); //2=leader
                    if (!roleIds) return;
                    const inputTime = String(interaction.options.getString('time')).replace(/\s/g, "");
                    if (inputTime == "expire") {
                        db.prepare('UPDATE whitestar SET lifeTime = ? WHERE guild = ? AND mRoleId = ?').run('0', interaction.guildId, roleIds[0]);
                        interaction.editReply({
                            content: 'Channels and role will expire shortly'
                        });
                        return;
                    }
                    let day;
                    let hour;
                    let minute;
                    day = inputTime.match(/(\d+)[d]/i);
                    hour = inputTime.match(/(\d+)[h]/i);
                    minute = inputTime.match(/(\d+)[m]/i);
                    if (day == 0 && hour == 0 && minute == 0) {
                        interaction.editReply({
                            content: "Syntax error, I did not understand the time."
                        });
                    }
                    if (!day) day = 0;
                    else day = Number(day[1]);
                    if (!hour) hour = 0;
                    else hour = Number(hour[1]);
                    if (!minute) minute = 0;
                    else minute = Number(minute[1]);
                    if (!isNaN(day) && !isNaN(hour) && !isNaN(minute)) { // we got all the matches 1=day 2=h 3=m
                        const endTime = (day * 24 * 60 * 60) +
                            (hour * 60 * 60) +
                            (minute * 60) +
                            Math.floor(Date.now() / 1000);
                        const WwiteStarMsg = "<@&" + roleIds[0] + "> Preparation period ends.";
                        db.prepare('Delete FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ?').run(interaction.guildId, roleIds[0], WwiteStarMsg, '10');
                        if ((endTime - 388800) > (Date.now() / 1000)) {
                            db.prepare('INSERT INTO awayTimers (guild, mRoleId, lifeTime, what, who) VALUES(?,?,?,?,?)').run(interaction.guildId, roleIds[0], (endTime - 388800), WwiteStarMsg, '10');
                            //388800 = 4.5 days, the exact time of the whitestar. So we can calculate when it goes live.
                        };
                        db.prepare('UPDATE whitestar SET lifeTime = ?, novaDone = 1 WHERE guild = ? AND mRoleId = ?').run(endTime, interaction.guildId, roleIds[0]);
                        interaction.editReply({
                            content: 'Set Nova timer for: ' + day + 'd' + hour + 'h' + minute + 'm'
                        });
                        awayBoard.makeAwayBoard(interaction.guild, roleIds[0], false);
                    } else {
                        interaction.editReply({
                            content: "Syntax error, I did not understand the time."
                        });
                    }
                };
                async function opponent() {
                    const roleIds = await checkPermissions(2); //2=leader//error reply is handled here if it doesn't exist.
                    if (roleIds) {
                        const opponents = [];
                        for (i = 1; i < 16; i++) {
                            const theUser = await interaction.options.getString('opponent' + i);
                            if (!!theUser) {
                                let theOpponent = String(theUser).slice(0, 20);
                                if (opponents.indexOf(theOpponent) == -1) opponents.push(theOpponent); //unique values only
                            }
                        };
                        if (opponents.length > 0) db.prepare('UPDATE whitestar SET opponents = ? WHERE guild = ? AND mRoleId = ?').run(JSON.stringify(opponents), interaction.guildId, roleIds[0]);
                        interaction.editReply({
                            content: "OK."
                        });
                    }
                };
                async function afk(mType) {
                    const checkRoles = await db.prepare('SELECT * FROM channels WHERE guild = ? AND channelId = ?').get(interaction.guildId, interaction.channelId);
                    if (!!checkRoles) { //if it doesn't exist, lets return false.
                        const minutes = interaction.options.getNumber('minutes');
                        const hours = interaction.options.getNumber('hours');
                        let mTime = 0;
                        let hTime = 0;
                        if (minutes) mTime = Number(minutes) * 60;
                        if (hours) hTime = Number(hours) * 3600;
                        let who;
                        let what = "";
                        let msg = "**" + awayBoard.displayTime(hTime + mTime) + "** ";
                        let noticeTime;
                        let emoji = "";
                        switch (mType) {
                            case 'allied':
                                what = '\u200B';
                                const aShip = interaction.options.getString('ship');
                                const aWho = interaction.options.getUser('who');
                                const aShipType = (aShip === "Transport" || aShip === "Miner") ? "Squishie" : aShip;
                                if (aWho && aShip != 'FS') {
                                    who = aWho.id;
                                    msg += "<@" + aWho.id + "> ";
                                } else who = interaction.user.id;
                                if (aShip == 'FS') {
                                    what += "<@&" + checkRoles.mRoleId + ">";
                                    who = '10';
                                };
                                emoji = awayBoard.myEmojis[aShip].inline;
                                msg += what;
                                noticeTime = Math.floor((Date.now() / 1000) + awayBoard.myEmojis[aShip].time - (hTime + mTime));
                                const existingRecord = await db.prepare('SELECT 1 FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ? AND emoji = ?')
                                    .get(interaction.guildId, checkRoles.mRoleId, what, who, emoji);
                                if (existingRecord) await awayBoard.db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ? AND emoji = ?')
                                    .run(interaction.guildId, checkRoles.mRoleId, what, who, emoji)
                                else
                                    await awayBoard.db.prepare('UPDATE whitestar SET ' + aShipType + ' = ' + aShipType + ' + 1 WHERE guild = ? AND mRoleId = ?').run(interaction.guildId, checkRoles.mRoleId);
                                break;
                            case 'enemy':
                                what = '\u200B';
                                const eShip = interaction.options.getString('ship');
                                const eWho = interaction.options.getString('who');
                                const eShipType = (eShip === "Transport" || eShip === "Miner") ? "Squishie" : eShip;
                                emoji = awayBoard.myEmojis['Enemy' + eShip].inline;
                                who = '0';
                                if (eWho && eShip != 'Flagship') what += eWho;
                                msg += what;
                                noticeTime = Math.floor((Date.now() / 1000) + awayBoard.myEmojis['Enemy' + eShip].time - (hTime + mTime));
                                const existingERecord = await db.prepare('SELECT 1 FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ? AND emoji = ?')
                                    .get(interaction.guildId, checkRoles.mRoleId, what, who, emoji);
                                if (existingERecord) await awayBoard.db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND emoji = ? AND who = ?')
                                    .run(interaction.guildId, checkRoles.mRoleId, what, emoji, who);
                                else
                                    await awayBoard.db.prepare('UPDATE whitestar SET Enemy' + eShipType + ' = Enemy' + eShipType + ' + 1 WHERE guild = ? AND mRoleId = ?').run(interaction.guildId, checkRoles.mRoleId);
                                break;
                            case 'afk':
                                const gWho = interaction.options.getMentionable('who');
                                const gNotice = interaction.options.getString('message');
                                if (gWho) {
                                    if (gWho.name) {
                                        what += "<@&" + gWho.id + ">⠀⠀";
                                        who = '10';
                                    } else who = gWho.id;
                                } else {
                                    who = interaction.user.id;
                                    msg += "<@" + interaction.user.id + "> ";
                                };
                                if (gNotice) {
                                    let aemoji = addEmojis(gNotice);
                                    if (awayBoard.myEmojisInline.includes(aemoji[0]))
                                        emoji = aemoji.shift();
                                    what += aemoji.join(' ');
                                };
                                if (what.length == 0 && emoji == "") emoji = awayBoard.myEmojis.Away.inline;
                                msg += what;
                                noticeTime = Math.floor((Date.now() / 1000) + (hTime + mTime));
                                break;
                            default:
                                try {
                                    interaction.editReply({
                                        content: "This is a strange error that should never happen"
                                    });
                                } catch {
                                    console.log
                                };
                                return;
                        };
                        await db.prepare('INSERT INTO awayTimers (guild, mRoleId, lifeTime, what, who, fromwho, emoji) VALUES(?,?,?,?,?,?,?)').run(interaction.guildId, checkRoles.mRoleId, noticeTime, what, who, interaction.user.id, emoji);
                        try {
                            interaction.editReply({
                                content: "/ws " + mType + " \n" + msg
                            });
                        } catch {
                            console.log
                        };
                        awayBoard.makeAwayBoard(interaction.guild, checkRoles.mRoleId, false);
                    } else {
                        interaction.editReply({
                            content: "Sorry, I could not identify which whitestar this goes with. Potentially this command was used in a channel that is not related to a whitestar."
                        });
                        return false;
                    }
                };
                async function startWS() {
                    async function getColour() {
                        const colours = [0x00a455, 0x8877ee, 0xcc66dd, 0x50a210, 0x3f88fd, 0x6388c8, 0xf032c9, 0xdd6699, 0xf94965, 0x888888, 0x3399bb, 0x339988, 0xbc8519, 0x9988AA, 0xec5a74, 0xaa66ee, 0xf05d14, 0xaa8877, 0x998800, 0x779900, 0x78906c, 0x77958b, 0x5d98ab, 0x4790d8, 0x8888bb, 0xaa77aa, 0xcc66aa, 0xbb7788];
                        const used = await db.prepare('SELECT colour FROM whiteStar WHERE guild = ?').all(interaction.guildId);
                        const usedColours = used.map((a) => a.colour);
                        let newColour = colours.filter(x => !usedColours.includes(x))
                        return newColour[Math.floor(Math.random() * newColour.length)]
                    };
                    const rColour = await getColour();
                    console.log("cache size is" + interaction.guild.channels.cache.size);
                    if (interaction.guild.channels.cache.size + 50 > 500) {
                        interaction.editReply("Error: Discord channel safety limit reached. Your discord has " + interaction.guild.channels.cache.size + " channels");
                        return;
                    };
                    const officerRole = db.prepare('SELECT officer FROM management WHERE guild = ?').get(interaction.guildId)?.officer;
                    const isOfficer = interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
                        interaction.member.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles]) ||
                        (officerRole && interaction.member.roles.cache.has(officerRole));
                    if (isOfficer) {
                        const currentTime = Date.now();
                        const COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes in milliseconds
                        if (wsnewThrottle && currentTime - wsnewThrottle < COOLDOWN_PERIOD) {
                            const remainingTime = ((COOLDOWN_PERIOD - (currentTime - wsnewThrottle)) / 60000).toFixed(2); // in minutes, to two decimal places
                            interaction.editReply(`Please wait ${remainingTime} minutes before using this command again.`);
                            return;
                        };
                        wsnewThrottle = currentTime;
                        async function findnextWS() {
                            let num = 0; //start at 1
                            let nextWS = '';
                            do {
                                num++;
                                nextWS = 'WS' + num;
                                console.log(nextWS);
                            } while (interaction.guild.roles.cache.find((role) => role.name === nextWS));
                            return nextWS;
                        };
                        async function newRole(nextWS) {
                            const mRoleId = await interaction.guild.roles.create({
                                name: nextWS,
                                color: rColour,
                                mentionable: true,
                            }).then((role) => role.id).catch(console.error);
                            console.log('role id?: ' + mRoleId);
                            return mRoleId;
                        };
                        let template = await checkTemplate(interaction.guildId);
                        if (template[Number(template.length) - 1].type != 4) {
                            interaction.editReply({
                                content: "Error: Missing afk channel from template. Please use **/ws template** to correct"
                            });
                            return;
                        };
                        if (template[0].type != 0) {
                            interaction.editReply({
                                content: "Error: Missing category from template. Please use **/ws template** to correct"
                            });
                            return;
                        };

                        const nextWS = await findnextWS();
                        const mRoleId = await newRole(nextWS);
                        const lRoleId = await newRole(nextWS + 'Lead');
                        const chanList = [];
                        //need to create check, if role creation failed, do not move ahead
                        //create category
                        let newPosition = 0;
                        let inputChan = interaction.guild.channels.cache.get(interaction.channelId);
                        // Exit if inputChan is null
                        if (!inputChan) {
                            console.log('Input channel not found.');
                            return;
                        }
                        // Traverse up the hierarchy until we find the top-level channel or category
                        while (inputChan?.parent) {
                            inputChan = inputChan.parent;
                        }
                        newPosition = inputChan.position + 1;
                        const wsCat = await interaction.guild.channels.create({
                            name: "" + nextWS + "_" + template[0].name,
                            type: ChannelType.GuildCategory,
                            position: newPosition,
                            permissionOverwrites: [
                                {
                                    id: interaction.client.user.id,
                                    allow: [PermissionFlagsBits.ViewChannel,PermissionFlagsBits.ManageChannels, PermissionFlagsBits.AddReactions]
                                }
                            ]
                        }).catch(console.log);
                        if (wsCat) {
                            await wsCat.setPosition(newPosition).catch(console.log);
                            db.prepare('INSERT INTO channels (guild, channelId, mRoleId, lRoleId, cType) VALUES(?,?,?,?,?)').run(interaction.guildId, wsCat.id, mRoleId, lRoleId, '0');
                            //chanList.push(wsCat.id); remove to not push category into the list.
                            //end create category

                            async function createchan(chname, cat, mRoleId, lRoleId, cType) {
                                const leader = chanProperties[cType][1];
                                const restricted = chanProperties[cType][2];
                                const eRoles = await db.prepare('SELECT extraRoles FROM management WHERE guild = ?').get(interaction.guildId);
                                const extraRoles = eRoles ? JSON.parse(eRoles.extraRoles) : []; //collection of roles to add to new channels, ideal for other bots
                                let permissions = [{
                                    id: interaction.guildId,
                                    allow: [PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory],
                                    deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                                }, {
                                    id: mRoleId,
                                    allow: leader ? [] : restricted ? [PermissionFlagsBits.ViewChannel] : [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                                }, {
                                    id: lRoleId,
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                                }, {
                                    id: interaction.client.user.id,
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.AddReactions],
                                }];
                                for (i in extraRoles) {
                                    const extraRole = await interaction.guild.roles.cache.get(extraRoles[i]);
                                    if (!!extraRole)
                                        permissions.push({
                                            id: extraRoles[i],
                                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                                        })
                                };
                                try {
                                    const channel = await interaction.guild.channels.create({
                                        name: chname,
                                        type: ChannelType.GuildText,
                                        parent: cat,
                                        permissionOverwrites: permissions,
                                        reason: 'To be deleted in a few days by Geeves',
                                    }).catch(console.log);
                                    if (channel) {
                                        db.prepare('INSERT INTO channels (guild, channelId, mRoleId, lRoleId, cType) VALUES(?,?,?,?,?)').run(interaction.guildId, channel.id, mRoleId, lRoleId, cType);
                                        console.log(channel.id);
                                        return channel.id;
                                    } else return null;
                                } catch (error) {
                                    console.log(error);
                                    return null;
                                }
                            };
                            async function uploadimage(chId, imageId) {
                                try {
                                    const channel = await interaction.client.channels.resolve(chId);
                                    const msg = await channel.send({
                                        files: [
                                            './files/' + imageId + '.png',
                                        ],
                                    });
                                    msg.pin();
                                } catch (e) {
                                    // report error to user?
                                    console.log(e);
                                }
                            };
                            async function sendHelp(chId) {
                                try {
                                    const channel = await interaction.client.channels.resolve(chId);
                                    const msg = await channel.send({
                                        content: "```The following commands are required for proper function:\n\/ws opponents\n\/ws nova\n\nTo change default channel names and default roles added such as additional bots, server Admins may use\n/ws template```"
                                    });
                                    msg.pin();
                                } catch (e) {
                                    // report error to user?
                                    console.log(e);
                                }
                            };

                            let awayChId = "";
                            for (q in template) {
                                if (template[q].type == 0) continue; //skip category
                                let chan = await createchan(nextWS + '_' + template[q].name, wsCat.id, mRoleId, lRoleId, template[q].type);
                                await wait(1500); //wait 1.5 seconds to ensure no flooding and all channels create properly.
                                if (chan) {
                                    chanList.push(chan);
                                    if (template[q].type == 4) awayChId = chan;
                                    if (template[q].type == 2) await uploadimage(chan, 'whitestar');
                                    if (template[q].type == 3) await sendHelp(chan);
                                }
                            };
                            if (chanList.length == 0) {
                                await interaction.guild.roles.cache.find((r) => r.name == nextWS)?.delete();
                                await interaction.guild.roles.cache.find((r) => r.name == nextWS + 'lead')?.delete();
                                interaction.editReply({
                                    content: "I am broken"
                                });
                                return;
                            };
                            await db.prepare('INSERT INTO whiteStar (guild, mRoleId, lifeTime, awayChId, colour) VALUES(?,?,?,?,?)').run(interaction.guildId, mRoleId, Math.floor((Date.now() / 1000) + end_of_life), awayChId, rColour);
                            //await db.prepare('INSERT INTO whiteStar (guild, mRoleId, lifeTime, awayChId) VALUES(?,?,?,?)').run(interaction.guildId, mRoleId, Math.floor((Date.now() / 1000)), awayChId);

                            await interaction.member.roles.add(mRoleId).catch(console.log);
                            wait(1000);
                            await interaction.member.roles.add(lRoleId).catch(console.log);
                            wait(1000);
                            for (i = 1; i < 16; i++) {
                                const theUser = await interaction.options.getMember('user' + i);
                                if (theUser) {
                                    await theUser.roles.add(mRoleId).catch(console.log);
                                    wait(1000)
                                };
                            };
                            let message = `created Category ${wsCat.name} with Channels `;
                            for (y in chanList) {
                                message += `<#${chanList[y]}> `;
                            };
                            message += `and Roles: <@&${mRoleId}> and <@&${lRoleId}>`;
                            try {
                                await interaction.editReply({
                                    content: message,
                                });
                            } catch (error) {
                                console.log("message post error, generally ignore " + error);
                            }
                            interaction.guild.channels.cache.get(chanList[0]).send({
                                content: message,
                                allowedMentions: {
                                    parse: ["roles"]
                                },
                            });

                        } else {
                            interaction.editReply({
                                content: "An unknown error occured, cancelling"
                            });
                        }
                    } else {
                        interaction.editReply({
                            content: "You must have the \"Manage Channels\" and \"Manage Roles\", Administrator, or Officer role to use this command."
                        });
                        return false;
                    };

                };


            };


        };
    }
}
