import { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel } from "@discordjs/voice";
import { ChatInputCommandInteraction } from "discord.js";
import { Snowflake } from "nodejs-snowflake";
import { bot } from "..";
import { postSessionAPI } from "../common/api-functions";
import { initialEmbed } from "../common/embed-functions";
import { subscribeToPlayerEvents } from "../common/helper-functions";
import { initialRow, rowOne, rowTwo } from "../models/bot.constants";
import { IGuildConnection } from "../models/bot.interfaces";
import { apiEnabled } from '../config.json';

export default {
    name: "join",
    description: "Joins the Voice Channel",
    async execute(interaction?: ChatInputCommandInteraction, deferReply: boolean = true) {
        const voiceChannel = interaction.guild.members.cache.get(interaction.user.id).voice.channel;
        const voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });        

        const date = new Date();
        const uid = new Snowflake();

        const embed = initialEmbed(interaction.guild.iconURL());
        const guildConnection: IGuildConnection = {
            session: {
                id: uid.idFromTimestamp(date.getTime()).toString(),
                startTime: date,
                endTime: undefined
            },
            connection: voiceConnection,
            textChannel: interaction.channel,
            voiceChannel: voiceChannel,
            messageState: {
                currentMessage: await interaction.channel.send({ 
                    embeds: [embed], 
                    components: [initialRow]
                }),
                currentMessageRow: 0,
                embed: embed,
                messageRows: [rowOne, rowTwo]
            },
            playerState: {
                player: createAudioPlayer(),
                queue: [],
                currentSong: undefined,
                playedSongs: [],
                status: AudioPlayerStatus.Idle,
                isLooping: false,
                autoplayer: {
                    enabled: false,
                    queue: [],
                    originalSong: undefined,
                },
                currentAttempts: 0
            }
        };

        bot.connections.set(interaction.guildId, guildConnection);
        subscribeToPlayerEvents(interaction.guildId);

        if(apiEnabled)
            await postSessionAPI(guildConnection.session);

        if(deferReply) {
            await interaction?.deferReply();
            await interaction?.deleteReply();
        }
    }
};