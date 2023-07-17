const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./deploy-config.json');
const fs = require('node:fs');
const path = require('node:path');
const { defaultCommands } = require('./default-commands.json');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const filesPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(filesPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
    const commandPath = path.join(filesPath, file);
    const command = require(commandPath);
	console.log(commandPath, command);
    if ('data' in command.default && 'execute' in command.default) {
		if (defaultCommands.includes(command.default.data.name)) {
			console.log("JSON", command.default.data.toJSON());
			commands.push(command.default.data.toJSON());
		} else {
			console.log(`[WARNING] The command ${command.default.data.name} is not in the default commands list and will not be deployed.`);
		}
    } else {
        console.log(`[WARNING] The command at ${commandPath} is missing a required "data" or "execute" property.`);
    }
}

console.log(commands);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);		

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
