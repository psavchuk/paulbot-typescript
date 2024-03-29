import { AudioPlayer, AudioPlayerStatus, VoiceConnection } from "@discordjs/voice";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Message, SlashCommandBuilder, TextChannel, VoiceChannel } from "discord.js";

export interface IGuildConnection {
    session: ISession;
    connection?: VoiceConnection;
    textChannel?: TextChannel;
    voiceChannel?: VoiceChannel;
    messageState: IMessageState;
    playerState: IPlayerState;
}

export interface ISession {
    id: string;
    startTime: Date;
    endTime: Date;
    songsPlayed: number;
}

export interface IMessageState {
    currentMessage?: Message;
    currentMessageRow?: number;
    embed?: EmbedBuilder;
    messageRows?: ActionRowBuilder<ButtonBuilder>[];

    currentMessageId?: string;
    currentMessageChannelId?: string;
}

export interface IPlayerState {
    player: AudioPlayer;
    queue: ISong[]; // songs to be played
    currentSong: ISong;
    playedSongs: ISong[]; // songs already played
    status: AudioPlayerStatus;
    isLooping: boolean;
    autoplayer: IAutoplayerState;
    currentAttempts: number;
}

export interface IAutoplayerState {
    enabled: boolean;
    queue: ISong[];
    originalSong: ISong;
}

export interface ISong {
    url: string;
    mode: PlaybackType;
    title: string;
    author: string;
    queuedBy?: string; // name of user that queued the song
    currentChapter?: number;
    chapters?: ISongChapter[];
}

export interface ISongChapter {
    time: number; // ms
    duration: number; // ms
    title: string;
}

export interface ISongEmbed {
    song: ISong;
    url: string;
    image: string;
    duration: string;
    queuedBy?: string;
    mode: PlaybackType;
}

export interface ICommand {
    data: SlashCommandBuilder;
    execute(...args: any): Promise<void>;
}

export interface IQueueOptions {
    query: string;
    queuedBy?: string;
    playTop?: boolean;
}

export interface IQueueResponse {
    message: string;
}

export interface IButton {
    id: number;
    row: number;
}

export enum PlaybackType {
    ytdl, // youtube
    scdl, // soundcloud
}

export enum AutoplayType {
    youtubeMix,
}