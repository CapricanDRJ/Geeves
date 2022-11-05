const fs = require("node:fs")
const fileTest = new RegExp(/(.+?)\.[^\.]+$/);
const extensionTest = new RegExp(/^.*\.(jpg|gif|png|jpeg)$/i);

const {
    SlashCommandBuilder,
    AttachmentBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Collection of whitestar related memes')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('meme')
            .setDescription('Type the name of the meme, or type list for a list of options').setRequired(true))
        .addUserOption(option => option.setName('who').setDescription('Select person to annoy.'))
        .addAttachmentOption((option) => option
            .setName("upload")
            .setDescription("Unless you have explicit permission, this will fail.")),
    async execute(interaction) {
        if(!interaction.channel.isTextBased()) return;
        if(!interaction.guild.members.me.permissionsIn(interaction.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
            await interaction.reply({
                content: 'Sorry, I am missing permission to post here.(view channel/send messages)',
                ephemeral: true
            });
            return;
        }
        if (interaction.isAutocomplete()) {
            const memeDir = fs.readdirSync("./files/memes");
            const memes = [];
            for (xz in memeDir) {
                memes.push({
                    name: fileTest.test(memeDir[xz]) ? String(memeDir[xz]).match(fileTest)[1] : '🤷',
                    value: String(memeDir[xz])
                })
            };
            interaction.respond(memes).catch(console.error);
        } else {
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
            };
            if(attachment.size > 6000000) {//6mb file limit
                interaction.reply({
                    content: "Sorry, file too large. It must be under 6mb.",
                    ephemeral: true
                });
                return;
            };
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
            const memeDir = fs.readdirSync("./files/memes");
            const memeFile = interaction.options.getString('meme');
            const memes = [];
            for (xz in memeDir) {
                memes.push(fileTest.test(memeDir[xz]) ? String(memeDir[xz]).match(fileTest)[1] : '🤷');
            };
            if(String(memeFile).toLowerCase() == "options" || String(memeFile).toLowerCase() == "list") {
                interaction.reply({
                    content: memes.join('\n'),
                    ephemeral: true
                })
            } else {
            if(memeFile == null) {
                const attachment = new AttachmentBuilder('./files/marvin.jpg', {
                    name: "marvin.jpg"
                });
                interaction.reply({
                    content: "No meme entered",
                    ephemeral: false,
                    files: [attachment],
                    parse: ['users', 'roles']
                })
                return;
            }
            for(xy in memes) {
                memes[xy] = String(memes[xy]).toLowerCase().replaceAll(' ','');
            };
            let selectedMeme = memes.indexOf(String(memeFile).toLowerCase().replaceAll(' ',''));
            if (selectedMeme > -1) {
                let msg = "";
                if (who) msg = '<@' + who.id + '> ';
                msg += fileTest.test(memeDir[selectedMeme]) ? String(memeDir[selectedMeme]).match(fileTest)[1] : '🤷';
                const attachment = new AttachmentBuilder('./files/memes/' + memeDir[selectedMeme], {
                    name: memeDir[selectedMeme]
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
}
