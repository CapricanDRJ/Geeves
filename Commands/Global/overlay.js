const {
    SlashCommandBuilder,
    AttachmentBuilder,
    PermissionFlagsBits
} = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("overlay") // The name of the slash command
        .setDescription("Creates overlay of whitestar with coordinates") // A short description about the slash command.
        .addAttachmentOption((option) => option
            .setRequired(true)
            .setName("image")
            .setDescription("Crop an image of the whitestar to the edge of the actual whitestar borders then upload.")),
    async execute(interaction) {
        console.log('overlay');
        if(!interaction.channel.viewable) {
            await interaction.reply({
                content: 'I have no access to this channel',
                ephemeral: true
            });
            return;
        }
        if(!interaction.guild.members.me.permissionsIn(interaction.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
            await interaction.reply({
                content: 'Sorry, I am missing permission to post here.',
                ephemeral: true
            });
            return;
        }
        if (interaction.commandName === 'overlay') {
            const Jimp = require('jimp');
            const attachment = await interaction.options.getAttachment("image");
            // Ensure attachment exists and check file size (less than 20MB)
            if (!attachment) {
                await interaction.reply({
                    content: "Please upload a valid image file.",
                    ephemeral: true
                });
                return;
            }
            
            if (attachment.size > 20 * 1024 * 1024) {
                await interaction.reply({
                    content: "The file is too large. Please upload an image smaller than 20MB.",
                    ephemeral: true
                });
                return;
            }
            try {
		await interaction.deferReply();
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
                            .setName("Whitestar.png")
                            .setDescription("Overlay of Whitestar");

                        interaction.editReply({
                            files: [att],
                            ephemeral: false
                        })
                    });
                } else {
                    interaction.editReply({
                        content: "Sorry, that did not make sense to me",
                        ephemeral: true
                    })
                };
            } catch (error) {
                console.error(error);
                await interaction.EditReply({
                    content: "There was an error processing the image. Please make sure you uploaded a valid image file.",
                    ephemeral: true
                });
            }

        }
    }
}
