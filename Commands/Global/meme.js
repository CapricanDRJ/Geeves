const fs = require("node:fs")
const fileTest = new RegExp(/(\w+)/);
const extensionTest = new RegExp(/^.*\.(jpg|gif|png|jpeg)$/i);

const {
    SlashCommandBuilder,
    AttachmentBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Collection of whitestar related memes')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('meme')
            .setDescription('Which one?')
            .setAutocomplete(true)
            .setRequired(true))
        .addUserOption(option => option.setName('who').setDescription('Select person to annoy.'))
        .addAttachmentOption((option) => option
            .setName("upload")
            .setDescription("Unless you have explicit permission, this will fail.")),
    async execute(interaction) {
        if (interaction.isAutocomplete()) {
            const memeDir = fs.readdirSync("./files/memes");
            const memes = [];
            for (xz in memeDir) {
                memes.push({
                    name: fileTest.test(memeDir[xz]) ? String(memeDir[xz]).match(fileTest)[0] : '🤷',
                    value: String(memeDir[xz])
                })
            };
            interaction.respond(memes).catch(console.error);
        } else {
        const memeFile = interaction.options.getString('meme');
        const who = interaction.options.getUser('who');
        const attachment = await interaction.options.getAttachment("upload");
        const authorized = ['115211754081878021', '454459089720967168', '426723001266995207', '499571330103115806', '283485587191758849', '509498956179439628', '455453866046259211'];
        if (attachment && attachment.hasOwnProperty('url') && attachment.hasOwnProperty('name')) {
            if(!!!extensionTest.test(attachment.name)) {
                interaction.reply({
                    content: "Not a file type that I allow",
                    ephemeral: true
                });
                return;
            }
            let localFile = String('./files/memes/' + attachment.name).replace(/_/g, ' ');
            if (await fs.existsSync(localFile)) {
                interaction.reply({
                    content: "Error, file exists.",
                    ephemeral: true
                });
            } else {
                if (authorized.indexOf(interaction.user.id) > -1) {
                    const request = require('request').defaults({
                        encoding: null
                    });
                    await request.get(attachment.url, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            fs.writeFile(localFile, body, 'binary', (err) => {
                                console.log(err)
                            })
                        }
                    });
                    interaction.reply({
                        content: String(attachment.name).replace(/_/g, ' ') + " Added.",
                        ephemeral: false
                    });
                } else
                    interaction.reply({
                        content: "Error, unauthorized.",
                        ephemeral: true
                    });
            };
        } else {
            let msg = "";
            if (who) msg = '<@' + who.id + '> ';
            const memeDir = fs.readdirSync("./files/memes");
            msg += fileTest.test(memeDir[xz]) ? String(memeDir[xz]).match(fileTest)[0] : '🤷';
            if (memeDir.indexOf(memeFile) > -1) {
                const attachment = new AttachmentBuilder('./files/memes/' + memeFile, {
                    name: memeFile
                });
                interaction.reply({
                    content: msg,
                    ephemeral: false,
                    files: [attachment],
                    parse: ['users', 'roles']
                })
            } else
                interaction.reply({
                    content: "That is not one of my memes",
                    ephemeral: true
                });
        }
    }
  }
}
