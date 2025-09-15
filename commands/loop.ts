import { AudioPlayerStatus } from "@discordjs/voice";
import { SlashCommandBuilder } from "discord.js";
import { bot } from "..";
import { updateInteraction } from "../common/embed-functions";
import { playSong } from "../common/play-song-functions";

export default {
    data: new SlashCommandBuilder().setName("loop").setDescription("Toggles looping on the current song"),
    async execute(interaction?: any, deferReply: boolean = false, guildId?: string) {
        const id = interaction?.guildId || guildId;
        const connection = bot.connections.get(id);

        if (!connection) {
            return;
        }

        connection.playerState.isLooping = !connection.playerState.isLooping;

        if (connection.playerState.status === AudioPlayerStatus.Idle && connection.playerState.isLooping === true) {
            await playSong(id, connection.playerState.currentSong);
        }

        if (interaction) {
            await updateInteraction(connection, interaction);
        }

        // if (interaction && deferReply) {
        //     await interaction?.deferReply();
        //     await interaction?.deleteReply();
        // }
    }
}