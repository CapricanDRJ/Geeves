const {
    PermissionsBitField,
    EmbedBuilder,
    MessageFlagsBitField,
    PermissionFlagsBits,
    SlashCommandBuilder
} = require('discord.js');
const cs = require("../../roster.js");
const MessageFlags = MessageFlagsBitField.Flags;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("signup")
        .setDescription("White star sign up roster")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionsBitField.ManageRoles),
    async execute(interaction) {
        if(!interaction.channel.isTextBased()) return;
        if(!interaction.guild.members.me.permissionsIn(interaction.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
            await interaction.reply({
                content: 'Sorry, I am missing permission to post here.(view channel/send messages)',
                flags: MessageFlags.Ephemeral
            });
            return;
        }
if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles) && interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            let embed = new EmbedBuilder()
                .setTitle("White Star Signup!")
                .setColor(0xf2f2e9)
                .setDescription(cs.signupMsg);
        for (i = 0; i < cs.emojis.length-1; i++) {
                embed.addFields({
                    name: "<:" + cs.emojis[i].name + ":" + cs.emojis[i].id + ">  0",
                    value: "Empty",
                    inline: true
                })
            };
            const message = await interaction.reply({
                content: cs.headerContent,
                withResponse: true,
                embeds: [embed],
                 allowedMentions: { parse: ["roles"] },
                components: cs.defButtons
            });
            const messageId = message.resource?.message?.id;
            if(messageId) cs.db.prepare('INSERT INTO roster(serverId,channelId,messageId,userId) VALUES(?,?,?,?)').run(interaction.guildId, interaction.channel.id, messageId, interaction.user.id); 
        } else interaction.reply({
            content: "Not Authorized",
            flags: MessageFlags.Ephemeral 
        })
    }
};
