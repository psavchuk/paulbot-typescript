import { ButtonStyle, SlashCommandBuilder } from "discord.js";
import { favoriteSession } from "../common/session-functions";
import { favoriteSessionButton, sessionEndedRow } from "../models/bot.constants";
import { cloneDeep } from "lodash";

export default {
    data: new SlashCommandBuilder().setName("favoritesession").setDescription("Favorites (prevents auto-cleanup for) a session based on ID"),
    async execute(interaction?: any, deferReply: boolean = true) {
        const interactionEmbed = interaction?.message?.embeds[0];
        if (!interactionEmbed) {
            return;
        }

        if (deferReply) {
            await interaction.deferReply({ ephemeral: true });
        }

        try {
            // find session ID
            const { value } = interactionEmbed.fields.find(field => field.name === "ID");
            // favorite session
            favoriteSession(value);
            // update button style
            const buttonRow = cloneDeep(sessionEndedRow);
            buttonRow.components[favoriteSessionButton.id].setStyle(ButtonStyle.Success);
            await interaction.message.edit({
                components: [buttonRow]
            });

            if (deferReply) {
                await interaction?.followUp({ 
                    content: `Session #${value} Favorited`, 
                    ephemeral: true 
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
}