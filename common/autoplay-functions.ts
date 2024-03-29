import { bot } from "..";
import { maxAutoplayQueueLength } from "../models/bot.constants";
import { AutoplayType, ISong, PlaybackType } from "../models/bot.interfaces";
import { clearTitle } from "./helper-functions";
import { getMixPlaylist } from "./mix-functions";
const ytmix = require('yt-mix-playlist');

export const autoplaySong = async (guildId: string, song: ISong, mode: AutoplayType) => {
    const connection = bot.connections.get(guildId);

    if (!connection) {
        return;
    }
    
    if (!connection.playerState.autoplayer.enabled) {
        return;
    }

    connection.playerState.autoplayer.originalSong = song;

    if (mode === AutoplayType.youtubeMix) {
        let mixPlaylist = await ytmix(song.url, { hl: 'en', gl: 'US' });

        console.log("ytmix Playlist from:", song, "Playlist Length:", mixPlaylist?.items?.length);

        if (mixPlaylist) {
            for (let i = 0; i < mixPlaylist.items.length; i++) {
                const element = mixPlaylist.items[i];
            
                if (checkForPlayedSong(guildId, element.title)) {
                    continue;
                }

                // check if the list is too long
                if (connection.playerState.autoplayer.queue.length >= maxAutoplayQueueLength) {
                    connection.playerState.autoplayer.queue.shift();
                }

                // adds song to autoplay list
                connection.playerState.autoplayer.queue.push({
                    url: element.id, 
                    mode: PlaybackType.ytdl,
                    title: element.title,
                    author: element.author.name,
                });
            }

            return;
        }

        // backup method for fetching a mix
        mixPlaylist = await getMixPlaylist(song.url);

        console.log("Custom Mix Playlist from:", song, "Playlist Length:", mixPlaylist?.playlist?.length);

        if (mixPlaylist) {
            for (let i = 0; i < mixPlaylist.playlist.length; i++) {
                const element = mixPlaylist.playlist[i];
            
                if (checkForPlayedSong(guildId, element.title)) {
                    continue;
                }
    
                // check if the list is too long
                if (connection.playerState.autoplayer.queue.length >= maxAutoplayQueueLength) {
                    connection.playerState.autoplayer.queue.shift();
                }
                    
                // adds song to autoplay list
                connection.playerState.autoplayer.queue.push({
                    url: element.videoId, 
                    mode: PlaybackType.ytdl,
                    title: element.title,
                    author: element.author,
                });
            }

            return;
        }
    }
}

export const checkForPlayedSong = (guildId: string, name: string) => {
    try {
        const connection = bot.connections.get(guildId);
        if (!connection) {
            return;
        }

        const playedSongs = connection.playerState.playedSongs
        name = clearTitle(name);

        for (let i = 0; i < playedSongs.length; i++) {
            const element = clearTitle(playedSongs[i].title.toLowerCase());

            const _regExp1 = new RegExp(`(${element})`, 'g');
            const _regExp2 = new RegExp(`(${name})`, 'g');
    
            if (name === element) {
                return true;
            }

            if (_regExp1.test(name)) {
                return true;
            }
            if (_regExp2.test(element)) {
                return true;
            }
        }
    } catch (error) {
        console.log(error);
    }

    return false;
}