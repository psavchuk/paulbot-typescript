import { SlashCommandBuilder } from "discord.js";
import { bot } from "..";
import { shuffle } from "../common/helper-functions";

export default {
    data: new SlashCommandBuilder().setName("shuffle").setDescription("Shuffles the current queue"),
    async execute(interaction?: any, deferReply: boolean = true) {
        console.log("shuffling queue!", deferReply);

        await interaction.deferReply({ ephemeral: true });

        const connection = bot.connections.get(interaction?.guildId);
        connection.playerState.queue = shuffle(connection.playerState.queue);

        if (interaction && !interaction.replied) {
            await interaction?.followUp({ 
                content: 'Shuffled queue!', 
                ephemeral: true 
            });
        }
    }
}