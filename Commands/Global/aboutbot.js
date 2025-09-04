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
const HOME_EMOJI_ID = '1412896964617572403';
const BOOST_EMOJI_ID = '1412896914487115796';
const THUMBNAIL_URL = 'https://capricandrj.github.io/discord_bots_legal/botabout.png';

const translations = {
    en: {
        description: 'Learn about these bots and their creator',
        title: 'As others collect coins or build models, I build bots. The reward is seeing communities enjoy them.',
        message2: `Support this bot's Discord <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL})\nHelp our community flourish with your <a:boost:${BOOST_EMOJI_ID}> boost.`,
        footer: 'Made with passion, shared with joy',
        bugReports: '🛠 Bug Reports & Suggestions',
        discussions: '💬 Bot Discussions'
    },
    de: {
        description: 'Erfahre mehr über diese Bots und ihren Ersteller',
        title: 'Wie andere Münzen sammeln oder Modelle bauen, baue ich Bots. Die Belohnung ist es, Gemeinschaften dabei zu sehen, wie sie Freude daran haben.',
        message2: `Unterstütze dieses Bots Discord <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL})\nHilf unserer Gemeinschaft zu gedeihen mit deinem <a:boost:${BOOST_EMOJI_ID}> Boost.`,
        footer: 'Mit Leidenschaft gemacht, mit Freude geteilt',
        bugReports: '🛠 Fehlermeldungen & Vorschläge',
        discussions: '💬 Bot-Diskussionen'
    },
    "zh-CN": {
        description: '了解这些机器人及其创作者',
        title: '就像别人收集硬币或制作模型一样，我制作机器人。奖励是看到社区享受它们。',
        message2: `支持这个机器人的 Discord <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL})\n用你的 <a:boost:${BOOST_EMOJI_ID}> 加速来帮助我们的社区繁荣发展。`,
        footer: '用热情制作，用喜悦分享',
        bugReports: '🛠 错误报告和建议',
        discussions: '💬 机器人讨论'
    },
    ko: {
        description: '이 봇들과 제작자에 대해 알아보기',
        title: '다른 사람들이 동전을 수집하거나 모델을 만드는 것처럼, 저는 봇을 만듭니다. 보상은 커뮤니티가 그것들을 즐기는 것을 보는 것입니다.',
        message2: `이 봇의 Discord <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL}) 를 지원하세요\n당신의 <a:boost:${BOOST_EMOJI_ID}> 부스트로 우리 커뮤니티가 번영하도록 도와주세요.`,
        footer: '열정으로 만들고, 기쁨으로 공유합니다',
        bugReports: '🛠 버그 신고 및 제안',
        discussions: '💬 봇 토론'
    },
    ru: {
        description: 'Узнайте об этих ботах и их создателе',
        title: 'Как другие собирают монеты или строят модели, я создаю ботов. Награда — видеть, как сообщества получают от них удовольствие.',
        message2: `Поддержите Discord этого бота <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL})\nПомогите нашему сообществу процветать своим <a:boost:${BOOST_EMOJI_ID}> бустом.`,
        footer: 'Сделано со страстью, поделено с радостью',
        bugReports: '🛠 Сообщения об ошибках и предложения',
        discussions: '💬 Обсуждения ботов'
    },
    uk: {
        description: 'Дізнайтеся про цих ботів та їх творця',
        title: 'Як інші збирають монети чи будують моделі, я створюю ботів. Нагорода — бачити, як спільноти насолоджуються ними.',
        message2: `Підтримайте Discord цього бота <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL})\nДопоможіть нашій спільноті процвітати своїм <a:boost:${BOOST_EMOJI_ID}> бустом.`,
        footer: 'Зроблено з пристрастю, поділено з радістю',
        bugReports: '🛠 Повідомлення про помилки та пропозиції',
        discussions: '💬 Обговорення ботів'
    },
    "es-ES": {
        description: 'Conoce estos bots y su creador',
        title: 'Como otros coleccionan monedas o construyen modelos, yo construyo bots. La recompensa es ver a las comunidades disfrutarlos.',
        message2: `Apoya el Discord de este bot <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL})\nAyuda a nuestra comunidad a prosperar con tu <a:boost:${BOOST_EMOJI_ID}> impulso.`,
        footer: 'Hecho con pasión, compartido con alegría',
        bugReports: '🛠 Informes de errores y sugerencias',
        discussions: '💬 Discusiones de bots'
    },
    tr: {
        description: 'Bu botlar ve yaratıcısı hakkında bilgi edinin',
        title: 'Diğerleri madeni para toplar veya model yapar gibi, ben botlar yaparım. Ödül, toplulukların onlardan keyif aldığını görmektir.',
        message2: `Bu botun Discord'unu <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL}) destekleyin\n<a:boost:${BOOST_EMOJI_ID}> boost'unuzla topluluğumuzun gelişmesine yardım edin.`,
        footer: 'Tutkuyla yapıldı, sevinçle paylaşıldı',
        bugReports: '🛠 Hata raporları ve öneriler',
        discussions: '💬 Bot tartışmaları'
    },
    pl: {
        description: 'Dowiedz się o tych botach i ich twórcy',
        title: 'Tak jak inni zbierają monety lub budują modele, ja buduję boty. Nagrodą jest oglądanie, jak społeczności się nimi cieszą.',
        message2: `Wspieraj Discord tego bota <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL})\nPomóż naszej społeczności rozkwitać swoim <a:boost:${BOOST_EMOJI_ID}> boostem.`,
        footer: 'Stworzone z pasją, dzielone z radością',
        bugReports: '🛠 Zgłoszenia błędów i sugestie',
        discussions: '💬 Dyskusje o botach'
    },
    fr: {
        description: 'Découvrez ces bots et leur créateur',
        title: 'Comme d\'autres collectionnent des pièces ou construisent des modèles, je construis des bots. La récompense est de voir les communautés en profiter.',
        message2: `Soutenez le Discord de ce bot <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL})\nAidez notre communauté à prospérer avec votre <a:boost:${BOOST_EMOJI_ID}> boost.`,
        footer: 'Fait avec passion, partagé avec joie',
        bugReports: '🛠 Rapports de bugs et suggestions',
        discussions: '💬 Discussions sur les bots'
    },
    ja: {
        description: 'これらのボットとその制作者について学ぶ',
        title: '他の人がコインを集めたりモデルを作ったりするように、私はボットを作ります。報酬はコミュニティがそれらを楽しんでいるのを見ることです。',
        message2: `このボットのDiscord <:home:${HOME_EMOJI_ID}> [${HOME_DISCORD_NAME}](${HOME_DISCORD_URL}) をサポートしてください\nあなたの <a:boost:${BOOST_EMOJI_ID}> ブーストで私たちのコミュニティが繁栄するのを手伝ってください。`,
        footer: '情熱を込めて作られ、喜びと共に共有されています',
        bugReports: '🛠 バグ報告と提案',
        discussions: '💬 ボットに関するディスカッション'
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("aboutbot")
        .setDescription("Learn about these bots and their creator"),
    async execute(interaction) {
        if (interaction.commandName === 'aboutbot') {
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
                components: [communityButtons, botButtons1, botButtons2]
            });
        }
    }
}