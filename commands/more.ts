import { bot } from "..";
import { updateInteraction } from "../common/embed-functions";

export default {
    name: "more",
    description: "Shows Next Row of Actions",
    async execute(interaction?: any, deferReply: boolean = false) {
        const connection = bot.connections.get(interaction.guildId);
        const messageState = connection.messageState;

        if(messageState.messageRows.length - 1 > messageState.currentMessageRow)
            messageState.currentMessageRow ++;
        else
            messageState.currentMessageRow = 0;

        await updateInteraction(connection, interaction);

        // if(deferReply) {
        //     await interaction?.deferReply();
        //     await interaction?.deleteReply();
        // }
    }
}