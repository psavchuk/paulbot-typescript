import { ButtonStyle } from "discord.js";
import { bot } from "..";
import { updateEmbed, updateMessageRowEmbedButton } from "../common/embed-functions";
import { playSong, queueYoutubePlaylist } from "../common/play-song-functions";
import { autoplayButton, youtubeTrendingMusicPlaylist } from "../models/bot.constants";
import { IQueueResponse, PlaybackType } from "../models/bot.interfaces";
import { AudioPlayerStatus } from "@discordjs/voice";

export default {
    name: "trending",
    description: "Fetch and Queue Trending Music",
    async execute(interaction?: any, deferReply: boolean = false) {
        
        const connection = bot.connections.get(interaction?.guildId);
        if(!connection) return;

        let queueResponse: IQueueResponse;

        queueResponse = await queueYoutubePlaylist(connection, { query: youtubeTrendingMusicPlaylist });;

        // if(trending) {
        //     for (let i = 0; i < trending.length; i++) {
        //         const element = trending[i];

        //         connection.playerState.autoplayer.queue.push({
        //             url: element.videoId, 
        //             mode: PlaybackType.ytdl,
        //             title: element.title,
        //             author: element.author,
        //         });
        //     }

        //     // await bot.commands?.get("autoplay").execute(undefined, false, interaction.guildId);

        //     updateMessageRowEmbedButton(
        //         connection.messageState.messageRows[autoplayButton.row].components[autoplayButton.id],
        //         "Disable Autoplay",
        //         ButtonStyle.Success,
        //         false
        //     );
        //     connection.playerState.autoplayer.enabled = true;

        //     await playSong(interaction.guildId, connection.playerState.autoplayer.queue.shift());
        // }

        if(interaction && deferReply) {
            await interaction?.deferReply();
            await interaction?.deleteReply();
        }

        if (connection.playerState.status === AudioPlayerStatus.Idle) {
            await bot.commands.get('skip').execute(undefined, false, interaction.guildId);
        }
        else {
            if(connection.playerState.currentSong) {
                await updateEmbed(connection);
            }
        }
    }
}