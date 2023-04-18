import { bot } from "..";
import { autoplaySong } from "../common/autoplay-functions";
import { playSong } from "../common/play-song-functions";
import { AutoplayType, ISong } from "../models/bot.interfaces";

export default {
    name: "skip",
    description: "Skips the current song",
    async execute(interaction?: any, deferReply: boolean = true, guildId?: string) {
        console.log("skip command started");

        const id = interaction?.guildId || guildId;
        const connection = bot.connections.get(id);

        if (interaction && deferReply && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const playerState = connection.playerState;

        let song: ISong;

        // console.log(playerState.queue.length, playerState.autoplayer.queue.length, playerState.currentSong?.chapters?.length);

        if (playerState.currentSong?.chapters?.length > 0) {
            if (++playerState.currentSong.currentChapter < playerState.currentSong.chapters.length) {
                song = playerState.currentSong;
            }
        }
        else {
            if (playerState.queue.length === 0) {
                if (playerState.autoplayer.enabled) {
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
            // connection.playerState.player.unpause();

            if (interaction && deferReply && !interaction.replied) {
                await interaction?.followUp({ 
                    content: 'Skipped song!', 
                    ephemeral: true 
                });
            }

            await playSong(id, song);
        } else {
            if (interaction && deferReply && !interaction.replied) {
                await interaction?.followUp({
                    content: 'No more songs in queue!',
                    ephemeral: true
                });
            }
        }
    }
}