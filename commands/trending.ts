import { SlashCommandBuilder } from "discord.js";
import { bot } from "..";
import { updateEmbed } from "../common/embed-functions";
import { queueYoutubePlaylist } from "../common/play-song-functions";
import { youtubeTrendingMusicPlaylist } from "../models/bot.constants";
import { IQueueResponse } from "../models/bot.interfaces";
import { AudioPlayerStatus } from "@discordjs/voice";

export default {
    data: new SlashCommandBuilder().setName("trending").setDescription("Fetch and queue a playlist of trending music"),
    async execute(interaction?: any, deferReply: boolean = false) {
        
        const connection = bot.connections.get(interaction?.guildId);
        if (!connection) {
            return;
        }

        let queueResponse: IQueueResponse;

        queueResponse = await queueYoutubePlaylist(connection, { query: youtubeTrendingMusicPlaylist });

        if (interaction && deferReply) {
            await interaction?.deferReply();
            await interaction?.deleteReply();
        }

        if (connection.playerState.status === AudioPlayerStatus.Idle) {
            await bot.commands.get('skip').execute(undefined, false, interaction.guildId);
        }
        else {
            if (connection.playerState.currentSong) {
                await updateEmbed(connection);
            }
        }
    }
}