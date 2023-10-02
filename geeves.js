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
      GatewayIntentBits.GuildPresences
  ],
});
const awayBoard = require('./awayBoard.js');

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

client.login(Config.Token).catch(console.error);
