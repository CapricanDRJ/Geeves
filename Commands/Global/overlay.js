const {
    SlashCommandBuilder,
    AttachmentBuilder,
    MessageFlagsBitField
} = require("discord.js")
const MessageFlags = MessageFlagsBitField.Flags;

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
        if (interaction.commandName === 'overlay') {
            const { Jimp } = require('jimp');
            const attachment = await interaction.options.getAttachment("image");
            // Ensure attachment exists and check file size (less than 20MB)
            if (!attachment) {
                await interaction.reply({
                    content: "Please upload a valid image file.",
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
console.log("attachment size "+attachment.size);
            if (attachment.size > 20 * 1024 * 1024) {
                await interaction.reply({
                    content: "The file is too large. Please upload an image smaller than 20MB.",
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
            try {
		await interaction.deferReply();
                if (attachment.hasOwnProperty('url') && attachment.hasOwnProperty('name')) {
                    const WSimages = [];
                    WSimages.push(await Jimp.read(attachment.url));
                    WSimages.push(await Jimp.read('./files/wsOverlay.png'));
                    await Promise.all(WSimages).then(function(data) {
                        return Promise.all(WSimages);
                    }).then(async function(data) {
                        await data[1].resize({ w: attachment.width, h: attachment.height });
                        await data[0].composite(data[1], 0, 0);
    const buffer = await data[0].getBuffer(data[0].mime);

                        let att = await new AttachmentBuilder()
                            .setFile(buffer)
                            .setName("Whitestar.png")
                            .setDescription("Overlay of Whitestar");

                        interaction.editReply({
                            files: [att]
                        })
                    });
                } else {
                    interaction.editReply({
                        content: "Sorry, that did not make sense to me",
                        flags: MessageFlags.Ephemeral
                    })
                };
            } catch (error) {
                console.error(error);
                await interaction.editReply({
                    content: "There was an error processing the image. Please make sure you uploaded a valid image file.",
                    flags: MessageFlags.Ephemeral
                });
            }

        }
    }
}
