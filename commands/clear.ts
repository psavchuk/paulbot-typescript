import { bot } from "..";
import { updateInteraction } from "../common/embed-functions";

export default {
    name: "clear",
    description: "Clears the Queue",
    async execute(interaction?: any, deferReply: boolean = false) {
        const connection = bot.connections.get(interaction?.guildId);
        const userNickname = (await interaction.guild.members.fetch(interaction.user.id)).nickname || interaction.member.displayName;

        if(connection.playerState.queue.length > 0) {
            connection.playerState.queue.length = 0;
            await connection.textChannel.send({content: `Queue cleared by **${userNickname}**!`});
            await updateInteraction(connection, interaction);
        }
    }
}