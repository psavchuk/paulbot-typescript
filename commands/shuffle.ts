import { bot } from "..";
import { shuffle } from "../common/helper-functions";

export default {
    name: "shuffle",
    description: "Shuffles the current queue",
    async execute(interaction?: any, deferReply: boolean = false) {
        const connection = bot.connections.get(interaction?.guildId);
        connection.playerState.queue = shuffle(connection.playerState.queue);

        if(interaction) {
            await interaction?.deferReply();
            await interaction?.deleteReply();
        }
    }
}