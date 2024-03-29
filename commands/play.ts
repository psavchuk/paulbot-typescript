import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { bot } from "..";
import { isValidHttpUrl } from "../common/helper-functions";

import { IQueueResponse } from "../models/bot.interfaces";
import { AudioPlayerStatus } from "@discordjs/voice";
import { updateEmbed } from "../common/embed-functions";
import { queueSoundcloudSong, queueYoutubePlaylist, queueYoutubeSongQuery, queueYoutubeSongUrl } from "../common/play-song-functions";

// Also handles playtop
export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays the Requested Song")
        .addStringOption(option => option.setName('song').setDescription('Song or playlist to play (supports SoundCloud and Youtube)').setRequired(true))
        .addBooleanOption(option => option.setName('playtop').setDescription('Play song on top of queue').setRequired(false)),
    async execute(interaction?: ChatInputCommandInteraction, deferReply: boolean = true) {
        console.log("play command started");
        
        if (interaction && deferReply) {
            await interaction.deferReply({ ephemeral: true });
        }

        if (!bot.connections.get(interaction.guildId)) {
            await bot.commands.get('join').execute(interaction, false);
        }

        const connection = bot.connections.get(interaction.guildId);

        if (!connection) {
            if (deferReply && !interaction?.replied) {
                await interaction?.followUp({ content: 'Failed to join voice channel', ephemeral: true });
            }
            return;
        }

        const userNickname = (await interaction.guild.members.fetch(interaction.user.id)).nickname || interaction.user.username;

        let query = interaction?.options.getString('song');
        const putOnTopOfQueue = interaction?.options.getBoolean('playtop') || false;
        let queueResponse: IQueueResponse;

        if (isValidHttpUrl(query)) {
            // it is a url
            // soundcloud
            if (query.includes('soundcloud.com')) // could be better way of checking if it is soundcloud
            {
                queueResponse = await queueSoundcloudSong(connection, {query: query, queuedBy: userNickname});
            }

            // youtube
            if (query.includes('playlist') || query.includes('list'))
            {
                queueResponse = await queueYoutubePlaylist(connection, {query: query, queuedBy: userNickname, playTop: putOnTopOfQueue});
            }
            else {
                // extract id from url
                if(query.includes('youtube.com'))
                {
                    query = query.split('?v=')[1].split('&')[0];
                }

                if(query.includes('youtu.be'))
                {
                    query = query.split('.be/')[1].split('?')[0];
                }
                
                queueResponse = await queueYoutubeSongUrl(connection, {query: query, queuedBy: userNickname,  playTop: putOnTopOfQueue});
            }
        }
        else {
            // not a url
            queueResponse = await queueYoutubeSongQuery(connection, {query: query, queuedBy: userNickname, playTop: putOnTopOfQueue});
        }

        if (deferReply && !interaction?.replied) {
            await interaction?.followUp({ 
                content: queueResponse?.message || 'Failed to queue song', 
                ephemeral: true 
            });
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