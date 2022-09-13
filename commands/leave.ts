import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { bot } from "..";
import { putSessionAPI } from "../common/api-functions";
import { apiEnabled } from '../config.json';

export default {
    name: "leave",
    description: "Leaves the Channel",
    async execute(interaction?: ChatInputCommandInteraction, deferReply: boolean = true, guildId?: string) {
        const connection = bot.connections.get(interaction?.guildId || guildId);
        const date = new Date();
        const session = connection.session;

        session.endTime = date;

        if(apiEnabled) {
            console.log(JSON.stringify(session));
            await putSessionAPI(session);
        }

        //@TODO move this to embed function file
        const embed = new EmbedBuilder().setTitle("Session Ended").setFields(
            { name: 'Session ID', value: session.id }
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