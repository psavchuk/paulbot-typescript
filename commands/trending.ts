import { bot } from "..";
import { playSong } from "../common/play-song-functions";
import { scrapeTrendingParameters } from "../models/bot.constants";
import { PlaybackType } from "../models/bot.interfaces";
const ytrend = require("@freetube/yt-trending-scraper");

export default {
    name: "trending",
    description: "Fetch and Queue Trending Music",
    async execute(interaction?: any, deferReply: boolean = false) {
        
        const connection = bot.connections.get(interaction.guildId);
        if(!connection) return;

        const trending = await ytrend.scrape_trending_page(scrapeTrendingParameters);

        if(trending) {
            for (let i = 0; i < trending.length; i++) {
                const element = trending[i];

                connection.playerState.autoplayer.queue.push({
                    url: element.videoId, 
                    mode: PlaybackType.ytdl,
                    title: element.title,
                    author: element.author,
                });
            }

            await bot.commands?.get("autoplay").execute(undefined, false, interaction.guildId);

            await playSong(interaction.guildId, connection.playerState.autoplayer.queue.shift());
        }

        if(interaction && deferReply) {
            await interaction?.deferReply();
            await interaction?.deleteReply();
        }
    }
}