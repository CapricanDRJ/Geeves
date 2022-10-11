const {
    SlashCommandBuilder,
} = require("@discordjs/builders")
//const PermissionFlagsBits 
//https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/understanding/roles.md
const {
    PermissionFlagsBits,
    ChannelType,
    ActivityType,
    AttachmentBuilder
} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const db = require('better-sqlite3')('./db/geeves.db', {
    verbose: console.log
});
const end_of_life = 10 * 24 * 3600; // //10*24*3600 = 10 days
const chanProperties = { // type: [name, leader, restricted]
    0: ["category", false, false],
    1: ["private", false, false],
    2: ["restricted", false, true],
    3: ["leader", true, true],
    4: ["afk", false, false]
};
async function checkTemplate(guildId) {
    let template = await db.prepare('SELECT * FROM template WHERE guild = ? ORDER BY type ASC').all(guildId);
    console.log(template);
    if (template.length == 0) console.log("yes");
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
    value: 'BS'
}, {
    name: 'Squishie',
    value: 'SQ'
}, {
    name: 'Transport',
    value: 'TS'
}, {
    name: 'Miner',
    value: 'MR'
}, {
    name: 'Flagship',
    value: 'FS'
}];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ws') // The name of the slash command
        .setDescription("Manage roles and users in bulk") // A short description about the slash command.
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
            .addUserOption(option => option.setName('user11').setDescription('Select user'))
            .addUserOption(option => option.setName('user12').setDescription('Select user'))
            .addUserOption(option => option.setName('user13').setDescription('Select user'))
            .addUserOption(option => option.setName('user14').setDescription('Select user'))
            .addUserOption(option => option.setName('user15').setDescription('Select user'))
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
            .setDescription('General afk')
            .addStringOption(option => option.setName('message').setDescription('Your message.').setRequired(true))
            .addNumberOption(option => option.setName('hours').setDescription('Can be any of the following: 1.3, 6, 0, 0.2').setRequired(true))
            .addNumberOption(option => option.setName('minutes').setDescription('Minutes'))
            .addMentionableOption(option => option.setName('who').setDescription('Who to mention?'))
        )
        .addSubcommand((subcommand) =>
            subcommand
            .setName('overlay')
            .setDescription('Creates overlay of whitestar with coordinates')
            .addAttachmentOption((option)=> option
            .setRequired(true)
            .setName("image")
            .setDescription("Crop an image of the whitestar to the edge of the actual whitestar borders then upload."))
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
            .addStringOption(option => option.setName('who').setDescription('Who lost the ship?').setRequired(true).setAutocomplete(true))
            .addNumberOption(option => option.setName('hours').setDescription('How long ago? ex: 1.3, 6, 0').setRequired(true))
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
            .addNumberOption(option => option.setName('hours').setDescription('How long ago? ex: 1.3, 6, 0').setRequired(true))
            .addNumberOption(option => option.setName('minutes').setDescription('How long ago? ex: 1, 60, 8'))
            .addUserOption(option => option.setName('who').setDescription('Who lost a ship?'))
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
            .addStringOption(option => option.setName('opponent11').setDescription('Eleventh opponent.'))
            .addStringOption(option => option.setName('opponent12').setDescription('Twelfth opponent.'))
            .addStringOption(option => option.setName('opponent13').setDescription('Thirteenth opponent.'))
            .addStringOption(option => option.setName('opponent14').setDescription('Fourteenth opponent.'))
            .addStringOption(option => option.setName('opponent15').setDescription('Fifteenth opponent.'))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('expire')
            .setDescription('Queues the whitestar channels for deletion. (Usually less than 1 minute)')
        ),
    async execute(interaction) {
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
                console.log(role);
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
            if (interaction.commandName === 'ws') {
                //check if bot has permission
                if (!interaction.guild.members.me.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageRoles])) {
                    interaction.reply({
                        content: "Sorry, I am missing permissions.",
                        ephemeral: true
                    });
                    return;
                };
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
                            case 'overlay':
                                overlay();
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
                    const isOfficer = interaction.member.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles], true);
                    const checkRoles = await db.prepare('SELECT * FROM channels WHERE guild = ? AND channelId = ?').get(interaction.guildId, interaction.channelId);
                    console.log(checkRoles);
                    if (!!checkRoles) { //if it doesn't exist, lets return false.
                        const mRoleId = await interaction.guild.roles.cache.get(checkRoles.mRoleId);
                        const lRoleId = await interaction.guild.roles.cache.get(checkRoles.lRoleId);
                        if (!!!mRoleId || !!!lRoleId) { //Could not find the roles that were recorded
                            interaction.editReply({
                                content: "Sorry, I do not understand why the roles I have recorded no longer exist. Potentially discord lag",
                                ephemeral: true
                            });
                            return false;
                        };
                        switch (level) {
                            case 1: //member
                                if (interaction.member.roles.cache.has(checkRoles.mRoleId) || isOfficer) return [checkRoles.mRoleId, checkRoles.lRoleId];
                                else {
                                    interaction.editReply({
                                        content: "This is above your permission levels.",
                                        ephemeral: true
                                    });
                                    return false;
                                };
                                break;
                            case 2: //leader
                                if (interaction.member.roles.cache.has(checkRoles.lRoleId) || isOfficer) return [checkRoles.mRoleId, checkRoles.lRoleId];
                                else {
                                    interaction.editReply({
                                        content: "This is above your permission levels.",
                                        ephemeral: true
                                    });
                                    return false;
                                };
                                break;
                            case 3: //officer
                                if (isOfficer) return [checkRoles.mRoleId, checkRoles.lRoleId];
                                else {
                                    interaction.editReply({
                                        content: "This is above your permission levels.",
                                        ephemeral: true
                                    });
                                    return false;
                                };
                                break;
                            default:
                                interaction.editReply({
                                    content: "Sorry, weird stuff is happening.",
                                    ephemeral: true
                                });
                                return false;
                        }
                    } else {
                        interaction.editReply({
                            content: "Sorry, I could not identify which whitestar this goes with. Potentially this command was used in a channel that is not related to a whitestar.",
                            ephemeral: true
                        });
                        return false;
                    }
                };

                async function template() {
                    if (interaction.member.permissions.has([PermissionFlagsBits.ManageGuild], true)) {
                        const chanTypes = ['category', 'private', 'restricted', 'leader', 'afk'];
                        async function replyTemplate() {
                            let template = await checkTemplate(interaction.guildId);
                            let msg = "\n```\n" + String("Type").padEnd(12) + "Name\n";
                            for (i in template) {
                                msg += "" + String(chanTypes[template[i].type] + ":").padEnd(11) + " #ws()_" + template[i].name + "\n";
                            };
                            msg += "```"
                            interaction.editReply({
                                content: msg,
                                ephemeral: true
                            });
                        };
                        const isOfficer = interaction.member.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles], true);
                        if (!isOfficer) {
                            interaction.editReply({
                                content: "This is intended for officers only. I identify an officer by those who can manage channels and roles.",
                                ephemeral: true
                            });
                        } else
                            switch (subCommand) {
                                case 'list':
                                    replyTemplate();
                                    break;
                                case 'add':
                                    let type = chanTypes.indexOf(String(interaction.options.get("type").value).toLowerCase());
                                    let addName = String(interaction.options.get("name").value).replace(/[\[\]\{\}\(\)\+\;\$\\]/gm).substring(0, 20);
                                    if (type == -1 || addName.length < 1) {
                                        interaction.editReply({
                                            content: "Sorry, I did not understand that.",
                                            ephemeral: true
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
                                            content: "Sorry, I did not understand that.",
                                            ephemeral: true
                                        });
                                        return;
                                    } else
                                        db.prepare('DELETE FROM template WHERE guild = ? AND name = ?').run(interaction.guildId, delName);
                                    replyTemplate();
                                    break;
                                case 'roles':
                                    let newRoles = [];
                                    for(i = 1; i < 6; i++) {
                                        const theRole = interaction.options.getRole('role'+i);
                                        if(!!theRole) {
                                            newRoles.push(theRole.id);
                                        }
                                    };
                                    newRoles = [...new Set(newRoles)];//remove any duplicates
                                    db.prepare('DELETE FROM management WHERE guild = ?').run(interaction.guildId);//rather than update, lets remove. Maybe change later if we need more information in management.
                                    db.prepare('INSERT INTO management (guild, extraRoles) VALUES(?,?)').run(interaction.guildId, JSON.stringify(newRoles));
                                    let msg = "";
                                    for(i in newRoles) {
                                        msg += "<@&" + newRoles[i] + ">";
                                    };
                                    interaction.editReply({
                                        content: "Added "+msg+" to default whitestar roles.",
                                        ephemeral: true
                                    });
                                    break;
                                default:
                                    console.log("no idea");
                            }
                    } else
                        interaction.editReply({
                            content: "Must have administrator permission to access templates.",
                            ephemeral: true
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
                            content: "OK",
                            ephemeral: true
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
                                content: msg,
                                ephemeral: false
                            })
                        } else {
                            interaction.editReply({
                                content: "The roles associated with this channel appears to be missing.",
                                ephemeral: false
                            })
                        }
                    } else {
                        interaction.editReply({
                            content: "Sorry, I could not identify which whitestar this goes with. Potentially this command was used in a channel that is not related to a whitestar.",
                            ephemeral: false
                        })
                    }
                }

                async function nova() {
                    const awayBoard = require('../../awayBoard.js');
                    const roleIds = await checkPermissions(2); //2=leader
                    const inputTime = String(interaction.options.getString('time')).replace(/\s/g, "");
                    if (inputTime == "expire") {
                        db.prepare('UPDATE whitestar SET lifeTime = ? WHERE guild = ? AND mRoleId = ?').run('0', interaction.guildId, roleIds[0]);
                        interaction.editReply({
                            content: 'Channels and role will expire shortly',
                            ephemeral: true
                        });
                        return;
                    }
                    let day;
                    let hour;
                    let minute;
                    day = inputTime.match(/(\d+)[d]/i);
                    hour = inputTime.match(/(\d+)[h]/i);
                    minute = inputTime.match(/(\d+)[m]/i);
                    if(day == 0 && hour == 0 && minute == 0) {
                        interaction.editReply({
                            content: "Syntax error, I did not understand the time.",
                            ephemeral: true
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
                            console.log(endTime - 388800 );             
                            console.log(Math.floor((Date.now() / 1000)));
                            if((endTime - 388800) > (Date.now() / 1000)) {
                                const WwiteStarMsg = "<@&"+roleIds[0]+">⠀⠀Preparation period ends.";
                                db.prepare('Delete FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ?').run(interaction.guildId, roleIds[0], WwiteStarMsg, '10');
                                db.prepare('INSERT INTO awayTimers (guild, mRoleId, lifeTime, what, who) VALUES(?,?,?,?,?)').run(interaction.guildId, roleIds[0], (endTime - 388800), WwiteStarMsg, '10');
                            //388800 = 4.5 days, the exact time of the whitestar. So we can calculate when it goes live.
                            };
                        db.prepare('UPDATE whitestar SET lifeTime = ?, novaDone = 1 WHERE guild = ? AND mRoleId = ?').run(endTime, interaction.guildId, roleIds[0]);
                        interaction.editReply({
                            content: 'Set Nova timer for: ' + day + 'd' + hour + 'h' + minute + 'm',
                            ephemeral: true
                        });
                        awayBoard.makeAwayBoard(interaction.guild, roleIds[0], false);
                    } else {
                        interaction.editReply({
                            content: "Syntax error, I did not understand the time.",
                            ephemeral: true
                        });
                    }
                };
                async function opponent() {
                    const roleIds = await checkPermissions(2); //2=leader
                    if (roleIds) {
                        const opponents = [];
                        for (i = 1; i < 16; i++) {
                            const theUser = await interaction.options.getString('opponent' + i);
                            if (!!theUser) {
                                let theOpponent = String(theUser).slice(0, 20);
                                if(opponents.indexOf(theOpponent) == -1) opponents.push(theOpponent);//unique values only
                            }
                        };
                        if (opponents.length > 0) db.prepare('UPDATE whitestar SET opponents = ? WHERE guild = ? AND mRoleId = ?').run(JSON.stringify(opponents), interaction.guildId, roleIds[0]);
                        interaction.editReply({
                            content: "OK.",
                            ephemeral: true
                        });
                    } else 
                    interaction.editReply({
                        content: "Syntax error, I did not understand that.",
                        ephemeral: true
                    });
                };


                async function afk(mType) {
                    const awayBoard = require('../../awayBoard.js');
                    const checkRoles = await db.prepare('SELECT * FROM channels WHERE guild = ? AND channelId = ?').get(interaction.guildId, interaction.channelId);
                    if (!!checkRoles) { //if it doesn't exist, lets return false.
                        const minutes = interaction.options.getNumber('minutes');
                        const hours = interaction.options.getNumber('hours');
                        let mTime = 0;
                        let hTime = 0;
                        if (minutes) mTime = Number(minutes) * 60;
                        if (hours) hTime = Number(hours) * 3600;
                        /**
CREATE TABLE IF NOT EXISTS "awayTimers" (
"guild"TEXT NOT NULL,
"mRoleId"TEXT NOT NULL,
"lifeTime"INTEGER NOT NULL,
"what"TEXT NOT NULL,
"who"TEXT NOT NULL,
"fromWho" TEXT);
 */
                        let who;
                        let what = "";
                        let msg = "";
                        let noticeTime;
                        switch (mType) {
                            case 'allied':
                                const aShip = interaction.options.getString('ship');
                                console.log(aShip);
                                const aWho = interaction.options.getUser('who');
                                if (aWho && aShip != 'FS') {
                                    who = aWho.id;
                                    msg += "<@"+aWho.id+"> ";
                                } else who = interaction.user.id;
                                if(aShip == 'FS') {
                                    what = "<@&" + checkRoles.mRoleId + ">⠀⠀" + awayBoard.myEmojis.Friendly[aShip][0];
                                    who = '10';
                                    msg = what;
                                } else what = awayBoard.myEmojis.Friendly[aShip][0];
                                msg += what;
                                noticeTime = Math.floor((Date.now() / 1000) + awayBoard.myEmojis['Friendly'][aShip][1] - (hTime + mTime));
                                await awayBoard.db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ?')
                                .run(interaction.guildId, checkRoles.mRoleId, what, who); //remove previous versions if they exist, we overwrite with the new one technically. 
                                break;
                            case 'enemy':
                                const eShip = interaction.options.getString('ship');
                                const eWho = interaction.options.getString('who');
                                what = awayBoard.myEmojis.Enemy[eShip][0];
                                who = '0';
                                console.log(eShip);
                                if (eWho && eShip != 'FS') what += " " + eWho;
                                msg = what;
                                noticeTime = Math.floor((Date.now() / 1000) + awayBoard.myEmojis['Enemy'][eShip][1] - (hTime + mTime));
                                await awayBoard.db.prepare('DELETE FROM awayTimers WHERE guild = ? AND mRoleId = ? AND what = ? AND who = ?')
                                .run(interaction.guildId, checkRoles.mRoleId, what, who); //remove previous versions if they exist, we overwrite with the new one technically. 
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
                                    msg += "<@"+interaction.user.id+"> ";
                                };
                                if (gNotice) what += gNotice;
                                msg += what;
                                noticeTime = Math.floor((Date.now() / 1000) + (hTime + mTime));
                                break;
                            default:
                                // code block
                        };
                        await db.prepare('INSERT INTO awayTimers (guild, mRoleId, lifeTime, what, who, fromwho) VALUES(?,?,?,?,?,?)').run(interaction.guildId, checkRoles.mRoleId, noticeTime, what, who, interaction.user.id);
                        try {
                            interaction.editReply({
                                content: "/ws afk "+mType+" "+msg,
                                ephemeral: false
                            });
                        } catch {
                            console.log
                        };
                        awayBoard.makeAwayBoard(interaction.guild, checkRoles.mRoleId, false);
                    } else {
                        interaction.editReply({
                            content: "Sorry, I could not identify which whitestar this goes with. Potentially this command was used in a channel that is not related to a whitestar.",
                            ephemeral: true
                        });
                        return false;
                    }
                };

                async function overlay() {
                    const Jimp = require('jimp');
                    const fname = 'Whitestar' + Math.floor(Math.random() * 10000) + '.png';
            const attachment = await interaction.options.getAttachment("image");
                        if (attachment.hasOwnProperty('url') && attachment.hasOwnProperty('name')) {
                            const WSimages = [];
                            WSimages.push(Jimp.read(attachment.url));
                            WSimages.push(Jimp.read('./files/wsOverlay.png'));
                            await Promise.all(WSimages).then(function(data) {
                                return Promise.all(WSimages);
                            }).then(async function(data) {
                                await data[1].resize(attachment.width, attachment.height);
                                await data[0].composite(data[1], 0, 0);
                                let att = await new AttachmentBuilder()
                                .setFile(await data[0].getBufferAsync(Jimp.MIME_PNG))
                                .setName(fname)
                                .setDescription("Overlay of Whitestar");
            
                interaction.editReply({
                                        files: [att],
                  ephemeral: false 
                })
                            });
                        } else {
                interaction.reply({
                  content: "Sorry, that did not make sense to me",
                  ephemeral: true 
                })
                        };
                }




                async function startWS() {
                    async function getColour() {
                        const colours = ['0x00a455', '0x8877ee', '0xcc66dd', '0x50a210', '0x3f88fd', '0x6388c8', '0xf032c9', '0xdd6699', '0xf94965', '0x888888', '0x3399bb', '0x339988', '0xbc8519', '0x9988AA', '0xec5a74', '0xaa66ee', '0xf05d14', '0xaa8877', '0x998800', '0x779900', '0x78906c', '0x77958b', '0x5d98ab', '0x4790d8', '0x8888bb', '0xaa77aa', '0xcc66aa', '0xbb7788'];
                        const used = await db.prepare('SELECT colour FROM whiteStar WHERE guild = ?').all(interaction.guildId);
                        const usedColours = used.map((a) => a.colour);
                        let newColour = colours.filter(x => !usedColours.includes(x))
                        return newColour[Math.floor(Math.random() * newColour.length)]
                    };
                    const rColour = await getColour();
                    if (interaction.member.permissions.has([PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles], true)) {
                        async function findnextWS() {
                            let num = -1;
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
                                content: "Error: Missing afk channel from template. Please use **/ws template** to correct",
                                ephemeral: true
                            });
                            return;
                        };
                        if (template[0].type != 0) {
                            interaction.editReply({
                                content: "Error: Missing category from template. Please use **/ws template** to correct",
                                ephemeral: true
                            });
                            return;
                        };

                        const nextWS = await findnextWS();
                        const mRoleId = await newRole(nextWS);
                        const lRoleId = await newRole(nextWS + 'Lead');
                        const chanList = [];
                        //need check, if role creation failed, do not move ahead


                        //create category
                        let newPosition = 0;
                        //interaction.channelId
                        let inputChan = interaction.guild.channels.cache.get(interaction.channelId);
                        if (inputChan?.parent)
                            newPosition = inputChan.parent.position;
                        else newPosition = inputChan.position;
                        console.log("NP>>>.. " + newPosition);
                        const wsCat = await interaction.guild.channels.create({
                            name: "" + nextWS + "_" + template[0].name,
                            type: ChannelType.GuildCategory,
                            position: newPosition,
                        }).catch(console.log);
                        db.prepare('INSERT INTO channels (guild, channelId, mRoleId, lRoleId, cType) VALUES(?,?,?,?,?)').run(interaction.guildId, wsCat.id, mRoleId, lRoleId, '0');
                        chanList.push(wsCat.id);
                        //end create category

                        async function createchan(chname, cat, mRoleId, lRoleId, cType) {
                            const leader = chanProperties[cType][1];
                            const restricted = chanProperties[cType][2];
                            const eRoles = await db.prepare('SELECT extraRoles FROM management WHERE guild = ?').get(interaction.guildId);
                            const extraRoles = JSON.parse(eRoles.extraRoles); //collection of roles to add to new channels, ideal for other bots
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
                                if(!!extraRole)
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
                                    content: "```The following commands are required for proper function:\n\/ws opponents\n\/ws nova\n```"
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
                            if (chan) {
                                chanList.push(chan);
                                if (template[q].type == 4) awayChId = chan;
                                if (template[q].type == 2) await uploadimage(chan, 'whitestar');
                                if (template[q].type == 3) await sendHelp(chan);
                            }
                        };
                        if (chanList.length == 0) {
                            await interaction.guild.roles.cache.find((r) => r.name == nextWS).delete();
                            await interaction.guild.roles.cache.find((r) => r.name == nextWS + 'lead').delete();
                            interaction.editReply({
                                content: "I am broken",
                                ephemeral: true
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
                        let message = 'created Category <#' + chanList.shift() + '> with Channels ';
                        for (y in chanList) {
                            message += '<#' + chanList[y] + '> ';
                        };
                        message += 'and Roles: <@&' + mRoleId + '> and <@&' + lRoleId + '>';
                        await interaction.editReply({
                            content: message,
                        });
                        interaction.guild.channels.cache.get(chanList[0]).send({
                            content: message,
                            allowedMentions: {
                                parse: ["roles"]
                            },
                        });
                    } else {
                        interaction.editReply({
                            content: "You must have the \"Manage Channels\" and \"Manage Roles\" permissions to use this command.",
                            ephemeral: true
                        });
                        return false;
                    };


                };



            };


        };
    }
}
