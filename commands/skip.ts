import { bot } from "..";
import { autoplaySong } from "../common/autoplay-functions";
import { playSong } from "../common/play-song-functions";
import { AutoplayType } from "../models/bot.interfaces";

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

        if(playerState.currentSong?.chapters.length > 0) {
            if(++playerState.currentSong.currentChapter < playerState.currentSong.chapters.length) {
                await playSong(id, playerState.currentSong);
                return;
            }
        }

        if(playerState.queue.length === 0) {
            if(playerState.autoplayer.enabled) {
                if(playerState.autoplayer.queue.length <= 1)
                    await autoplaySong(id, playerState.currentSong, AutoplayType.youtubeMix);

                const _song = playerState.autoplayer.queue.shift();
                await playSong(id, _song);
                return;
            }
        }
        else
        {
            const _song = playerState.queue.shift();
            if(_song.chapters?.length > 0)
                _song.currentChapter++;

            await playSong(id, _song);
            return;
        }
    }
}