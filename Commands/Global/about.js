const {
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlagsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js")
const MessageFlags = MessageFlagsBitField.Flags;

// Global configuration
const HOME_DISCORD_URL = 'https://discord.gg/nmajBkGEJz';
const HOME_DISCORD_NAME = 'The Star League';
const HOME_EMOJI_ID = '1412891992329031793';
const BOOST_EMOJI_ID = '1412891911366115460';
const THUMBNAIL_URL = 'https://capricandrj.github.io/discord_bots_legal/botabout.png';

// English translations only
const translations = {
    en: {
        description: 'Learn about these bots and their creator',
        title: 'As others collect coins or build models, I build bots. The reward is seeing communities enjoy them.',
        message2: `Support this bot's Discord <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL})\nHelp our community flourish with your <a:boost:${BOOST_EMOJI_ID}> boost.`,
        footer: 'Made with passion, shared with joy',
        bugReports: '🛠 Bug Reports & Suggestions',
        discussions: '💬 Bot Discussions'
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("Learn about these bots and their creator"),
    async execute(interaction) {
        console.log('about');
        if (interaction.commandName === 'about') {
            const t = translations.en;
            
            const embed = new EmbedBuilder()
                .setColor(0x7289DA)
                .setTitle(t.title)
                .setDescription(t.message2)
                .setThumbnail(THUMBNAIL_URL)
                .setFooter({ text: t.footer })
                .setTimestamp();

            // Community buttons
            const communityButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel(t.bugReports)
                    .setURL('https://discord.gg/KMmmaeQa3T'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel(t.discussions)
                    .setURL('https://discord.gg/nmajBkGEJz')
            );

            // Bot install buttons (row 1)
            const botButtons1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Hades' Star ELO")
                    .setEmoji('🤖')
                    .setURL('https://discord.com/oauth2/authorize?client_id=1198035340955504670'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Hades' Star RS Q")
                    .setEmoji('🤖')
                    .setURL('https://discord.com/oauth2/authorize?client_id=1055503950067007569'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Hades' Star Trader")
                    .setEmoji('🤖')
                    .setURL('https://discord.com/oauth2/authorize?client_id=1279978547569491968'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Hades' Star Tech")
                    .setEmoji('🤖')
                    .setURL('https://discord.com/oauth2/authorize?client_id=1313578638460846173')
            );

            // Bot install buttons (row 2)
            const botButtons2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel('BiteFinder')
                    .setEmoji('🤖')
                    .setURL('https://discord.com/oauth2/authorize?client_id=1331700134568005743'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel('SubScriber')
                    .setEmoji('🤖')
                    .setURL('https://discord.com/application-directory/1381686215715192932'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Persona')
                    .setEmoji('🤖')
                    .setURL('https://discord.com/oauth2/authorize?client_id=1216792017078583467')
            );

            interaction.reply({
                embeds: [embed],
                components: [communityButtons, botButtons1, botButtons2],
                flags: MessageFlags.Ephemeral
            });
        }
    }
}