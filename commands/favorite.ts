import { bot } from "..";

export default {
    name: "favorite",
    description: "Sends a Copy of the Song",
    async execute(interaction?: any, deferReply: boolean = false) {
        const connection = bot.connections.get(interaction?.guildId);
        await interaction.user.send({ embeds: [connection.messageState.embed] });
        await interaction.reply({ content: 'finna slide in those DMs', ephemeral: true});
    }
}