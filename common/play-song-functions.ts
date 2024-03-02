import { AudioPlayerStatus, AudioResource, createAudioResource, StreamType } from "@discordjs/voice";
import { SoundCloud } from "scdl-core";
import YouTube from "youtube-sr";
import { getInfo } from "ytdl-core-discord";
import ytpl from "ytpl";
import { bot } from "..";
import { maxPlayedSongLength, videoIdRegex } from "../models/bot.constants";
import { IGuildConnection, IQueueOptions, IQueueResponse, ISong, ISongChapter, PlaybackType } from "../models/bot.interfaces";
import { postPlayedSongAPI, postSongAPI } from "./api-functions";
import { updateEmbed, updateSongEmbed } from "./embed-functions";
import { millisecondsToMinutes, secondsToMinutes } from "./helper-functions";
import { apiEnabled, chaptersEnabled } from "../config.json";
import ytdl from 'ytdl-core-discord';
import fs from "fs";
import { spawn } from 'node:child_process';
import pathToFfmpeg from 'ffmpeg-static';
import ytdlCore = require("ytdl-core");


export const playSong = async (guildId: string, song: ISong) => {
    const connection = bot.connections.get(guildId);
    if(!connection) return;
    if(!song) return;

    let resource: AudioResource;

    // pause while we fetch resource
    connection.playerState.player.pause(true);

    switch (song.mode) {
        case PlaybackType.ytdl:
            resource = await createYoutubeResource(song);
            break;
        case PlaybackType.scdl:
            resource = await createSoundcloudResource(song);
            break;
        default:
            break;
    }
        
    // catch the elusive "resource has ended" error
    try {
        //play the music
        if(resource) {
            connection.playerState.player.play(resource);
            connection.connection.subscribe(connection.playerState.player);
            connection.playerState.currentAttempts = 0;
        }
        else { //try again if failed for whatever reason
            setTimeout(playSong, 500, guildId, song);
            return false;
        }
    } catch (error) {
        if(connection.playerState.currentAttempts < 5)
        {
            connection.playerState.currentAttempts ++;
            setTimeout(playSong, 500, guildId, song);
            return false;
        }
        else {
            connection.playerState.currentAttempts = 0;
            return false;
        }
    }

    // if we got here then we have successfully played the song

    const datePlayed = new Date();
    connection.session.songsPlayed++;

    // if queued by a person
    if(song.queuedBy) {
        // clear the autoplay queue so we can base our future songs off this one
        connection.playerState.autoplayer.queue.length = 0;
    }

    switch (song.mode) {
        case PlaybackType.ytdl:
            const ytSongInfo = await getInfo(song.url);
            updateSongEmbed(
                connection, 
                {
                    song: song,
                    url: ytSongInfo.videoDetails.video_url,
                    duration: secondsToMinutes(ytSongInfo.videoDetails.lengthSeconds),
                    image: ytSongInfo.videoDetails.thumbnails[ytSongInfo.videoDetails.thumbnails.length - 1].url,
                    mode: PlaybackType.ytdl,
                    queuedBy: song.queuedBy
                }
            );
            break;
    
        case PlaybackType.scdl:
            const scSongInfo = await SoundCloud.tracks.getTrack(song.url);
            updateSongEmbed(
                connection,
                {
                    song: song,
                    url: scSongInfo.permalink_url,
                    duration: millisecondsToMinutes(scSongInfo.duration),
                    image: scSongInfo.artwork_url,
                    mode: PlaybackType.scdl,
                    queuedBy: song.queuedBy
                }
            )
            break;
        default:
            break;
    }

    // update current song
    connection.playerState.currentSong = song;
    // add song to list of played songs
    addPlayedSong(guildId, song);

    // update our embed
    await updateEmbed(connection, AudioPlayerStatus.Playing);

    // api calls
    if(apiEnabled) {
        await postSongAPI(song);
        await postPlayedSongAPI(connection.session, song, datePlayed);
    }
}

export const queueYoutubeSongUrl = async (connection: IGuildConnection, options: IQueueOptions): Promise<IQueueResponse> => {
    try {
        const ytdlQuery = await getInfo(options.query);

        const song = {
            url: ytdlQuery.videoDetails.videoId,
            title: ytdlQuery.videoDetails.title,
            author: ytdlQuery.videoDetails.ownerChannelName,
            mode: PlaybackType.ytdl,
            queuedBy: options.queuedBy,
            chapters: chaptersEnabled ? getChaptersFromDescription(ytdlQuery.videoDetails.description, parseInt(ytdlQuery.videoDetails.lengthSeconds)) : [],
            currentChapter: -1
        };
    
        if(song.chapters?.length > 0) {
            await createChapterResources(song);
        }
        
        if (options.playTop) {
            connection.playerState.queue.unshift(song);
        } else {
            connection.playerState.queue.push(song);
        }
    
        return {
            message: `Added **${song.title}** to queue!`
        };
    } catch (error) {
        console.log(error);
        return {
            message: `Failed to add song to queue.`
        };
    }
}

export const queueYoutubeSongQuery = async (connection: IGuildConnection, options: IQueueOptions): Promise<IQueueResponse> => {
    const ytsrQuery = await YouTube.searchOne(options.query);
    const song: ISong = {
        url: ytsrQuery.id,
        title: ytsrQuery.title,
        author: ytsrQuery.channel.name,
        mode: PlaybackType.ytdl,
        queuedBy: options.queuedBy
    };

    if (options.playTop) {
        connection.playerState.queue.unshift(song);
    } else {
        connection.playerState.queue.push(song);
    }

    return {
        message: `Added **${ytsrQuery.title}** to queue!`
    };
}

export const queueYoutubePlaylist = async (connection: IGuildConnection, options: IQueueOptions): Promise<IQueueResponse> => {
    const isValid =  await ytpl.validateID(options.query);

    if(isValid) {
        try {
            const playlistInfo = await ytpl(options.query);
            const playlistTemporaryQueue: ISong[] = [];

            if(playlistInfo) {
                if(connection) {
                    for (let i = 0; i < playlistInfo.items.length; i++) {
                        const element = playlistInfo.items[i];
    
                        playlistTemporaryQueue.push
                        ({
                            url: element.id,
                            mode: PlaybackType.ytdl,
                            title: element.title,
                            author: element.author.name,
                            queuedBy: options.queuedBy
                        });
                    }
                }

                if (options.playTop) {
                    connection.playerState.queue.unshift(...playlistTemporaryQueue);
                } else {
                    connection.playerState.queue.push(...playlistTemporaryQueue);
                }
    
                return {
                    message: `Added **${playlistTemporaryQueue.length}** songs to queue!`
                };
            }
        } catch (error) {
            console.warn(error);
        }
    }
    
    // if we get this far it must be a mix, right??
    return queueYoutubeMixSong(connection, options);
}

export const queueYoutubeMixSong = async (connection: IGuildConnection, options: IQueueOptions): Promise<IQueueResponse> => {
    try {
        const id = options.query.match(videoIdRegex)[0];
        const message = (await queueYoutubeSongUrl(connection, { query: id })).message.split(' ');

        // really ugly code to remove "added queue to" from the message
        message.shift(); // remove "added"
        message.pop(); // remove "queue"
        message.pop(); // remove "to"
    
        return {
            message: `Added ${message.join(' ')} to queue! This bot does not currently support playing mixes directly.`
        }
    } catch (error) {
        console.warn(error);
    }
}

export const queueSoundcloudSong = async (connection: IGuildConnection, options: IQueueOptions): Promise<IQueueResponse> => {
    await SoundCloud.connect();
    const track = await SoundCloud.tracks.getTrack(options.query);

    if(!track) return;

    connection.playerState.queue.push({
        url: track.permalink_url,
        title: track.title,
        author: track.user.username,
        mode: PlaybackType.scdl,
        queuedBy: options.queuedBy
    });

    return {
        message: `Added **${track.title}** to queue!`
    };
}

// reads youtube description and checks for timestamps
export const getChaptersFromDescription = (description: string, songDuration: number): ISongChapter[]  => {
    if (!description || description.length === 0) {
        return [];
    }

    const descriptionArray = description.split(/\r?\n/);
    const chapters: ISongChapter[] = [];
    let songDurationMS = songDuration * 1000;

    for (let i = descriptionArray.length - 1; i >= 0; i--) {
        const element = descriptionArray[i];
        // regex that matches for 00:00:00 or 00:00
        const matches = element.match(/\d+[:]\d+[:]?\d+/gm);
        if(matches?.length > 0) { 
            let time = 0;
            let multiplier = 1000;
            let splitted = matches[0].split(":");

            for(let b = splitted.length - 1; b >= 0; b--) {
                time += parseInt(splitted[b]) * multiplier;
                multiplier *= 60;
            }

            const duration = songDurationMS - time;
            songDurationMS -= duration;  

            chapters.unshift({
                time: time,
                duration: duration,
                title: element.replace(/\d+[:]\d+[:]?\d+/gm, '')
            });
        }
    }
    return chapters;
}

// loops through chapters in a youtube video and splits it up based on the time stamps
// stored locally in ./chapters folder, deleted when bot is turned off (@TODO look for better implementation, ie after resource is finished being used)
// currently redownloads even if chapter already exists in folder, could cause many bugs
export const createChapterResources = async (song: ISong) => {
    if(song.chapters?.length > 0 && chaptersEnabled) {
        // create directory to store chapters if doesn't exist
        fs.mkdir(`./chapters/${song.url}`, { recursive: true}, err => {
            if(err) console.log(err);
        });

        // download full youtube video locally (faster than pulling the full video from youtube every time)
        const stream = await ytdlCore(song.url, { filter: "audioonly", highWaterMark: 1<<25 });
        const outStream = fs.createWriteStream(`./chapters/${song.url}/${song.url}.webm`);
        stream.pipe(outStream);
        await new Promise(fulfill => outStream.on('close', fulfill)); // wait for write pipe to finish

        try {
            for (let i = 0; i < song.chapters.length; i++) {
                // read the local full youtube video we downloaded
                const readStream = fs.createReadStream(`./chapters/${song.url}/${song.url}.webm`);
                const chapter = song.chapters[i];

                console.time(chapter.title);
                console.log(chapter.duration);

                // use ffmpeg to split the video, starting at chapter.time
                const command = spawn(
                    `${pathToFfmpeg}`, ['-i', 'pipe:0', '-ss', `${chapter.time}ms`, '-t', `${chapter.duration}ms`, '-f', 'webm', '-c', 'copy', 'pipe:1'], 
                    { stdio: ['pipe', 'pipe', 'ignore'] }
                );

                // pipe the ffmpeg query to the read stream we created for the main file
                // this currently outputs error every time but downloads just fine, need to investigate
                readStream.pipe(command.stdin).on("error", (e) => {
                    console.log(e)
                });

                // write the output stream we get from the command / ffmpeg query to a local file
                const writeStream = fs.createWriteStream(`./chapters/${song.url}/${chapter.title}.webm`);
                command.stdout.pipe(writeStream);
                
                // await all pipes to close
                await Promise.all([
                    new Promise(fulfill => writeStream.on('close', fulfill)),
                    new Promise(fulfill => command.stdin.on('close', fulfill)),
                    new Promise(fulfill => command.stdout.on('close', fulfill))
                ]);

                readStream.close();
                writeStream.end();
                command.kill();

                console.timeEnd(chapter.title);
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export const createYoutubeResource = async (song: ISong): Promise<AudioResource> => {
    if(song.chapters?.length > 0 && chaptersEnabled) {
        const stream = fs.createReadStream(`./chapters/${song.url}/${song.chapters[song.currentChapter].title}.webm`);
        const resource = createAudioResource(stream);
        return resource;
    }

    const stream = await ytdl(song.url, { filter: "audioonly", highWaterMark: 1<<25 });
    return createAudioResource(stream, { inputType: StreamType.Opus });
}

export const createSoundcloudResource = async (song: ISong): Promise<AudioResource> => {
    const stream = await SoundCloud.download(song.url, { highWaterMark: 1<<25 });
    return createAudioResource(stream, { inputType: StreamType.Arbitrary });
}

export const addPlayedSong = (guildId: string, song: ISong) => {
    const connection = bot.connections.get(guildId);
    if(!connection) return;

    const playedSongs = connection.playerState.playedSongs
    if(playedSongs.length > maxPlayedSongLength)
        playedSongs.shift();
    playedSongs.push(song);
}
