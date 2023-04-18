import { bot } from "..";
import { updateInteraction } from "../common/embed-functions";

export default {
    name: "clear",
    description: "Clears the Queue",
    async execute(interaction?: any, deferReply: boolean = false) {
        const connection = bot.connections.get(interaction?.guildId);
        const userNickname = (await interaction.guild.members.fetch(interaction.user.id)).nickname || interaction.member.displayName;

        console.log("Queue cleared by ", userNickname);

        if(connection.playerState.queue.length > 0) {
            connection.playerState.queue.length = 0;

            await updateInteraction(connection, interaction);
            
            if (interaction && !interaction.replied) {
                await interaction.reply({ content: 'Queue cleared!', ephemeral: true });
            }
        }
    }
}