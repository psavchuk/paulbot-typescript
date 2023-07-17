import { SlashCommandBuilder } from "discord.js";
import { bot } from "..";

export default {
    data: new SlashCommandBuilder().setName("favorite").setDescription("Sends you a copy of the current song"),
    async execute(interaction?: any, deferReply: boolean = false) {
        const connection = bot.connections.get(interaction?.guildId);
        await interaction.user.send({ embeds: [connection.messageState.embed] });
        await interaction.reply({ content: 'finna slide in those DMs', ephemeral: true});
    }
}