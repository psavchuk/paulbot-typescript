import { bot } from "..";
import { deleteSessionFromFile, getSessionFromFile } from "../common/session-functions";
import { cloneDeep } from "lodash";
import { subscribeToPlayerEvents } from "../common/helper-functions";
import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("continuesession").setDescription("Continues a session based on ID"),
    async execute(interaction?: any, deferReply: boolean = true) {
        const interactionEmbed = interaction.message.embeds[0];
        if(!interactionEmbed) {
            return;
        }
        
        if(!bot.connections.get(interaction.guildId)) {
            await bot.commands.get('join').execute(interaction, false, false);
        } else {
            return;
        }

        let connection = bot.connections.get(interaction?.guildId);
        if(!connection) {
            return;
        }

        if(interaction && deferReply) {
            await interaction.deferReply({ ephemeral: true });
        }

        const { value } = interactionEmbed.fields.find(field => field.name === "ID");
        const previousSession = getSessionFromFile(value);

        connection = {
            ...connection,
            session: {
                ...previousSession.session,
                id: connection.session.id,
            },
            messageState: {
                ...connection.messageState,
                currentMessageRow: previousSession.messageState.currentMessageRow
            },
            playerState: {
                ...previousSession.playerState,
                player: connection.playerState.player,
                status: connection.playerState.status
            },
        }

        bot.connections.set(interaction.guildId, connection);
        subscribeToPlayerEvents(interaction.guildId);
        // await updateEmbed(connection);

        if(connection.playerState.currentSong) {
            connection.playerState.queue.unshift(cloneDeep(connection.playerState.currentSong));
            connection.playerState.currentSong = undefined;
        }

        console.log("continuing session", connection.session.id)

        await bot.commands.get('skip').execute(undefined, false, interaction.guildId);

        // delete the session and message after bot is set up
        try {
            deleteSessionFromFile(value);
            await interaction.message.delete();
        } catch (error) {
            console.log(error);
        }

        if(interaction && !interaction.replied && deferReply) {
            // sometimes this code bonks out, so we wrap it in a try catch
            try {
                await interaction?.deleteReply();
            } catch (error) {
                console.log(error);
            }
        }

        // if (connection.playerState.status === AudioPlayerStatus.Idle) {
        //     await bot.commands.get('skip').execute(undefined, false, interaction.guildId);
        // }
        // else {
        //     if(connection.playerState.currentSong) {
        //         await updateEmbed(connection);
        //     }
        // }
    }
}