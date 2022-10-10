import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js";
import { IButton } from "./bot.interfaces";

// color constants
export const embedColor = '#FFFFFF';
export const youtubeColor = '#FF0000';
export const soundcloudColor = '#F26F23';

// queue constants
export const maxAutoplayQueueLength = 50;
export const maxPlayedSongLength = 50;

// regex constants
export const videoIdRegex = new RegExp(/(?<=v=\s*).*?(?=\s*&)/, 'g');

// option constants
export const scrapeTrendingParameters = {
    geoLocation: 'US',
    parseCreatorOnRise: true,
    page: 'music'
};

// button constants
export const autoplayButton: IButton = {
    id: 2,
    row: 0
};

export const loopButton: IButton = {
    id: 0,
    row: 1
};

export const clearButton: IButton = {
    id: 2,
    row: 1
};

// button rows
export let initialRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
        new ButtonBuilder()
            .setCustomId('trending')
            .setEmoji('📈')
            .setLabel('Trending')
            .setStyle(ButtonStyle.Secondary),
    ]);

export let rowOne = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
        new ButtonBuilder()
            .setCustomId('pause')
            .setLabel('Pause')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('skip')
            .setLabel('Skip')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('autoplay')
            .setLabel('Enable Autoplay')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('favorite')
            .setEmoji('❤️')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('more')
            .setLabel('. . .')
            .setStyle(ButtonStyle.Secondary)
]);

export let rowTwo = new ActionRowBuilder<ButtonBuilder>().addComponents([
    new ButtonBuilder()
        .setCustomId('loop')
        .setLabel('Start Loop')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId('shuffle')
        .setLabel('Shuffle Queue')
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId('clear')
        .setLabel('Clear Queue')
        .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
        .setCustomId('more')
        .setLabel('. . .')
        .setStyle(ButtonStyle.Success)
]);