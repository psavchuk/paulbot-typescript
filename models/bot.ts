import { Client, Collection, InteractionType } from "discord.js";
import { ICommand, IGuildConnection } from "./bot.interfaces";
import { token } from "../token.json";
import fs from "node:fs";
import { AudioPlayerStatus } from "@discordjs/voice";
import { cleanChapterFolder } from "../common/helper-functions";

export class Bot {
    public connections: Collection<string, IGuildConnection> = new Collection();
    public commands: Collection<string, ICommand> = new Collection();

    constructor(
        public client: Client
    ) {
        this._initCommands();
        this._initEvents();

        this.client.login(token);
    }

    private async _initCommands() {
        const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith(".ts"));

        for (const file of commandFiles) {
          const command = await import(`../commands/${file}`);
          this.commands.set(command.default.name, command.default);
        }
    }

    private async _initEvents() {
        // determine if there is anyone left in a channel
        // could be more efficient
        this.client.on('voiceStateUpdate', async (oldState, newState) => {
            const connection = this.connections.get(newState.guild.id);
            if(!connection) return;

            const members = connection.voiceChannel.members;
            let numOfListeners = 0;

            members.forEach((member) => {
                if(!member.user.bot) {
                    numOfListeners ++;
                    return;
                }
            });

            if(numOfListeners === 0) {
                await this.commands?.get("leave").execute(undefined, false, newState.guild.id);
            } else {
                // checks if bot was server muted or not and pauses
                // probably could be better way of checking if the user is Paulbot.
                if(oldState.serverMute !== newState.serverMute) {
                    if(
                        oldState.member.user.username === "PaulBot" && 
                        newState.member.user.username === "PaulBot" && 
                        oldState.member.user.bot && 
                        newState.member.user.bot
                    ) {
                        if(
                            newState.serverMute && connection.playerState.status === AudioPlayerStatus.Playing ||
                            !newState.serverMute && connection.playerState.status === AudioPlayerStatus.Paused
                        )
                            await this.commands?.get("pause").execute(undefined, false, newState.guild.id);
                    }    
                }
            }
        });

        // handle interactions
        this.client.on('interactionCreate', async (interaction: any) => {
            let command: ICommand;

            if(interaction.type === InteractionType.ApplicationCommand)
                command = this.commands?.get(interaction.commandName);
            
            if(interaction.isButton())
                command = this.commands?.get(interaction.customId);

            if (!command) return;
        
            try {
                await command.execute(interaction, true);
            } catch (error) {
                console.error(error);
                
                if (interaction && !interaction.replied) {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        });
    }

    async destroy() {
        console.log("we be destroyin");
        await cleanChapterFolder();
        for (const value of this.connections) {
            await this.commands?.get("leave").execute(undefined, false, value[0]);
        }
        console.log("we been destroyed");
        process.exit(2);
    }
}