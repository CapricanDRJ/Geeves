const {
  Client,
  GatewayIntentBits,
  Collection,
  ActivityType,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');
const Config = require("./geeves.json")
const {
  REST
} = require('@discordjs/rest')
const {
  Routes
} = require('discord-api-types/v9')
const fs = require("node:fs")
const client = new Client({
  intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessages
  ],
});
const awayBoard = require('./awayBoard.js');
const Database = require('better-sqlite3');
const db = new Database('db/geeves.db');
// Command Handling
client.commands = new Collection();

client.once('ready', (server) => {
  async function checkTimers() {
      await client.guilds.cache.forEach(async (guild) => {
          if (guild.members.me.permissions.has([
                  PermissionFlagsBits.ManageRoles,
                  PermissionFlagsBits.ManageChannels,
                  PermissionFlagsBits.ManageMessages,
                  PermissionFlagsBits.EmbedLinks,
                  PermissionFlagsBits.AttachFiles,
                  PermissionFlagsBits.UseExternalEmojis
              ])) { //broken if the permissions are removed anyway
              await awayBoard.delExpiredChans(guild);
              await awayBoard.postAFKs(guild);
          }
      });
  };
  setTimeout(checkTimers, 500);
  setInterval(checkTimers, 60 * 1000); //every minute
  awayBoard.removeDeadAFKs();//gets it on restart
  console.log('Ready!');
});

fs.readdirSync('./Events').forEach(dirs => {
  const EventFiles = fs.readdirSync(`./Events/${dirs}`)
      .filter(file =>
          file.endsWith('.js')
      )

  for (const file of EventFiles) {
      const EventName = file.split(".")[0]
      const Event = require(`./Events/${dirs}/${file}`)
      client.on(EventName, Event.bind(null, client))
  }
})
const commands = [];
fs.readdirSync('./Commands').forEach(dirs => {
  const CommandFiles = fs.readdirSync(`./Commands/${dirs}`)
      .filter(file =>
          file.endsWith('.js')
      )
  for (const file of CommandFiles) {
      console.log(CommandFiles);
      const command = require(`./Commands/${dirs}/${file}`)
      commands.push(command.data.toJSON())
      client.commands.set(command.data.name, command)
  }
})

const rest = new REST({
  version: '9'
}).setToken(Config.Token);
(async () => {
  try {
      console.log('Started refreshing application (/) commands.');

      await rest.put(
          Routes.applicationCommands(Config.ClientID), {
              body: commands
          },
      );
      console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
        console.error(error);
	process.exit(0);
  }
})();

// Error handler to catch unhandled errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1); // Exit with code 1 on error
});

// Error handler to handle Discord API errors
client.on('error', (error) => {
  if (error.message.includes('Service Unavailable')) {
    console.error('Discord API is currently down. Exiting bot...');
    process.exit(1); // Exit with code 1 on Discord API errors
  } else {
    console.error('Discord.js error:', error);
  }
});

// Function to load channels data into a structured object
let guildChannels = {};
const loadGuildChannels = () => {
  const stmt = db.prepare(
    `SELECT guild, channelId, mRoleId, lRoleId, cType 
     FROM channels 
     WHERE cType < 4`
  );
  const rows = stmt.all();

  const newGuildChannels = {};
  rows.forEach(row => {
    if (!newGuildChannels[row.guild]) {
      newGuildChannels[row.guild] = {};
    }
    newGuildChannels[row.guild][row.channelId] = {
      mRoleId: row.mRoleId,
      lRoleId: row.lRoleId,
      cType: row.cType
    };
  });

  guildChannels = newGuildChannels; // Replace the old object with the new one
  console.log('Guild channels refreshed');
};

// Initial load of guild channels
loadGuildChannels();

// Refresh guild channels every 10 minutes
setInterval(loadGuildChannels, 10 * 60 * 1000);

// Global object to track last reaction timestamps
const lastReactionTime = {};

client.on('messageCreate', (message) => {
    if (message.author.bot || !message.guild || !message.channel) return;
  
    // Correctly reference guildChannels, which is updated by loadGuildChannels
    const guildChannelsForGuild = guildChannels[message.guild.id]; 
    if (!guildChannelsForGuild || !guildChannelsForGuild[message.channel.id]) return;

    if (message.mentions.members.size > 0) {
          // Ensure the guild/channel keys exist
  if (!lastReactionTime[message.guild.id]) lastReactionTime[message.guild.id] = {};
  if (!lastReactionTime[message.guild.id][message.channel.id]) lastReactionTime[message.guild.id][message.channel.id] = 0;

  const now = Date.now();
  // Check if less than 10 seconds have passed
  if (now - lastReactionTime[message.guild.id][message.channel.id] < 10000) return;
  
  // Update timestamp
  lastReactionTime[message.guild.id][message.channel.id] = now;

        const stmt = db.prepare(
          `SELECT emoji FROM awayTimers WHERE guild = ? AND who = ? AND emoji IN (?, ?, ?, ?) ORDER BY CASE 
            WHEN emoji = '💤' THEN 1
            WHEN emoji = '🚗' THEN 2
            WHEN emoji = '💼' THEN 3
            WHEN emoji = '👁️' THEN 4
            END LIMIT 1`
        );
    
        message.mentions.members.forEach(member => {
          const row = stmt.get(message.guild.id, member.id, '💤', '🚗', '💼', '👁️');
    
          if (row) {
            message.react(row.emoji).catch(console.error);
          }
        });
      }
  });
  


const gracefulShutdown = () => {
  console.log('Bot is being terminated. Closing database connection...');
  awayBoard.db.close(); // Close the database connection
  console.log('Database connection closed.');
  process.exit(0); // Exit the process after the DB connection is closed
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGHUP', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// For the Discord client events
client.on('reconnecting', () => {
  console.log('Bot is attempting to reconnect...');
  gracefulShutdown(); // Using gracefulShutdown for reconnecting event
});

client.on('disconnect', event => {
  console.log(`Bot disconnected: ${event.reason}`);
  gracefulShutdown(); // Using gracefulShutdown for disconnect event
});
setInterval(async () => {
  await client.users.fetch(client.user.id, { force: true });
  console.log('Bot connection verified');
}, 20 * 60 * 1000); // every 20 minutes

client.login(Config.Token).catch(console.error);
