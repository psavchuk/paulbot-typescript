import { bot } from "..";
import { autoplaySong } from "../common/autoplay-functions";
import { playSong } from "../common/play-song-functions";
import { AutoplayType, ISong } from "../models/bot.interfaces";

export default {
    name: "skip",
    description: "Skips the current song",
    async execute(interaction?: any, deferReply: boolean = true, guildId?: string) {

        const id = interaction?.guildId || guildId;
        const connection = bot.connections.get(id);

        if(interaction && deferReply) {
            await interaction?.deferReply();
            await interaction?.deleteReply();
        }

        const playerState = connection.playerState;

        let song: ISong;

        if(playerState.currentSong?.chapters?.length > 0) {
            if(++playerState.currentSong.currentChapter < playerState.currentSong.chapters.length) {
                song = playerState.currentSong;
            }
        }
        else {
            if(playerState.queue.length === 0) {
                if(playerState.autoplayer.enabled) {
                    if(playerState.autoplayer.queue.length <= 1) 
                        await autoplaySong(id, playerState.currentSong, AutoplayType.youtubeMix);
    
                    song = playerState.autoplayer.queue.shift();
                }
            }
            else
            {
                song = playerState.queue.shift();
                if(song.chapters?.length > 0)
                    song.currentChapter++;
            }
        }

        if(song) {
            connection.playerState.player.unpause();
            await playSong(id, song);
        }
    }
}