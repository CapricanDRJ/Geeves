const {
    SlashCommandBuilder,
    AttachmentBuilder,
    PermissionFlagsBits
} = require("discord.js");

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
        if (!interaction.channel.viewable) {
            await interaction.reply({
                content: 'I have no access to this channel',
                ephemeral: true
            });
            return;
        }
        if (!interaction.guild.members.me.permissionsIn(interaction.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
            await interaction.reply({
                content: 'Sorry, I am missing permission to post here.',
                ephemeral: true
            });
            return;
        }
        if (interaction.commandName === 'overlay') {
            const Jimp = require('jimp');
            const fname = 'c' + Math.floor(Math.random() * 10000) + '.png';
            const attachment = interaction.options.getAttachment("image");

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

            // Attempt to verify and process the image
            try {
                const baseImage = await Jimp.read(attachment.url);
                const overlayImage = await Jimp.read('./wsOverlay.png');

                await overlayImage.resize(baseImage.bitmap.width, baseImage.bitmap.height);
                await baseImage.composite(overlayImage, 0, 0);

                const buffer = await baseImage.getBufferAsync(Jimp.MIME_PNG);
                const att = new AttachmentBuilder(buffer, { name: fname });

                await interaction.reply({
                    files: [att],
                    ephemeral: false
                });
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "There was an error processing the image. Please make sure you uploaded a valid image file.",
                    ephemeral: true
                });
            }
        }
    }
};
