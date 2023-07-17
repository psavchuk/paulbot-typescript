import { SlashCommandBuilder } from "discord.js";
import { bot } from "..";
import { subscribeToPlayerEvents } from "../common/helper-functions";
import { deleteSessionFromFile, getSessionFromFile } from "../common/session-functions";

export default {
    data: new SlashCommandBuilder().setName("restartsession").setDescription("Restarts a session based on ID"),
    async execute(interaction?: any, deferReply: boolean = true) {
        const interactionEmbed = interaction?.message?.embeds[0];
        if (!interactionEmbed) {
            return;
        }

        if (!bot.connections.get(interaction.guildId)) {
            await bot.commands.get('join').execute(interaction, false, false);
        } else {
            return;
        }

        let connection = bot.connections.get(interaction?.guildId);
        if (!connection) {
            return;
        }

        if (interaction && deferReply) {
            await interaction.deferReply({ ephemeral: true });
        }

        const { value } = interactionEmbed.fields.find(field => field.name === "ID");
        const previousSession = getSessionFromFile(value);

        console.log("restarting session!", value);

        connection = {
            ...connection,
            session: {
                ...previousSession.session,
                id: connection.session.id,
            },
            playerState: {
                ...previousSession.playerState,
                playedSongs: [],
                player: connection.playerState.player,
                status: connection.playerState.status
            },
        }

        console.log(connection.playerState);

        bot.connections.set(interaction.guildId, connection);

        // subscribe to player events on our own terms, after we've set up the connection
        // normally handled in the join command
        subscribeToPlayerEvents(interaction.guildId);

        if (connection.playerState.currentSong) {
            connection.playerState.queue.unshift(...previousSession.playerState.playedSongs);
            connection.playerState.currentSong = undefined;
        }

        console.log("restarting session", connection.session.id);

        // start up first song
        await bot.commands.get('skip').execute(undefined, false, interaction.guildId);
        
        // delete the session file and message after bot is set up to prevent bloating
        try {
            deleteSessionFromFile(value);
            await interaction.message.delete();
        } catch (error) {
            console.log(error);
        }

        if (interaction && !interaction.replied && deferReply) {
            // sometimes this code bonks out, so we wrap it in a try catch
            try {
                await interaction?.deleteReply();
            } catch (error) {
                console.log(error);
            }
        }
    }
}
