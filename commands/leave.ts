import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { bot } from "..";
import { putSessionAPI } from "../common/api-functions";
import { millisecondsToMinutes } from "../common/helper-functions";
import { apiEnabled } from '../config.json';

export default {
    name: "leave",
    description: "Leaves the Channel",
    async execute(interaction?: ChatInputCommandInteraction, deferReply: boolean = true, guildId?: string) {
        const connection = bot.connections.get(interaction?.guildId || guildId);
        const session = connection.session;

        session.endTime = new Date();

        if(apiEnabled) {
            console.log(JSON.stringify(session));
            await putSessionAPI(session);
        }

        //@TODO move this to embed function file
        const embed = new EmbedBuilder().setTitle("Session Ended").setFields(
            { name: 'ID', value: session.id },
            // { name: 'Duration', value: millisecondsToMinutes(session.startTime.getUTCMilliseconds() - session.endTime.getUTCMilliseconds()) }
        );

        await connection.messageState.currentMessage.edit(
            {
                embeds: [embed],
                components: []
            }
        );

        connection.connection.destroy();
        bot.connections.delete(interaction?.guildId || guildId);

        console.log("connection deleted");

        if(interaction && deferReply) {
            await interaction?.deferReply();
            await interaction?.deleteReply();
        }
    }
}