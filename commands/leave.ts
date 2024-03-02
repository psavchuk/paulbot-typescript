import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { bot } from "..";
import { putSessionAPI } from "../common/api-functions";
import { apiEnabled } from '../config.json';
import { sessionEndedRow } from "../models/bot.constants";
import { storeSessionInFile } from "../common/session-functions";
import { cloneDeep } from "lodash";
import { sessionsEnabled } from "../config.json";

export default {
    data: new SlashCommandBuilder().setName("leave").setDescription("Leaves the current voice channel"),
    async execute(interaction?: ChatInputCommandInteraction, deferReply: boolean = true, guildId?: string) {
        const connection = bot.connections.get(interaction?.guildId || guildId);
        const session = connection.session;

        session.endTime = new Date();

        if(apiEnabled) {
            await putSessionAPI(session);
        }

        //@TODO move this to embed function file
        const embed = new EmbedBuilder().setTitle("Session Ended").setFields(
            { name: 'ID', value: session.id },
            { name: 'Songs Played', value: session.songsPlayed + "" },
            { name: 'Last Song Played', value: connection.playerState.currentSong?.title || connection.playerState.playedSongs?.slice(-1)[0]?.title || "None" }
            // { name: 'Duration', value: millisecondsToMinutes(session.startTime.getUTCMilliseconds() - session.endTime.getUTCMilliseconds()) }
        );

        storeSessionInFile(cloneDeep(connection));

        if (sessionsEnabled) {
            await connection.messageState.currentMessage.edit(
                {
                    embeds: [embed],
                    components: [sessionEndedRow]
                }
            );
        } else {
            await connection.messageState.currentMessage.delete();
        }


        connection.playerState.player.stop();
        connection.connection.destroy();
        bot.connections.delete(interaction?.guildId || guildId);

        console.log("connection deleted");

        if(interaction && deferReply) {
            await interaction?.deferReply();
            await interaction?.deleteReply();
        }
    }
}