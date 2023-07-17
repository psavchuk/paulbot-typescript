import { SlashCommandBuilder } from "discord.js";
import { deleteSessionFromFile } from "../common/session-functions";

export default {
    data: new SlashCommandBuilder().setName("deletesession").setDescription("Deletes a session based on ID"),
    async execute(interaction?: any, deferReply: boolean = true) {
        const interactionEmbed = interaction?.message?.embeds[0];
        if(!interactionEmbed) {
            return;
        }

        if(interaction && deferReply) {
            await interaction.deferReply({ ephemeral: true });
        }

        try {         
            const { value } = interactionEmbed.fields.find(field => field.name === "ID");
            deleteSessionFromFile(value);
            await interaction.message.delete();

            if(interaction && deferReply) {
                await interaction?.followUp({ 
                    content: `Session #${value} Deleted`, 
                    ephemeral: true 
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
}