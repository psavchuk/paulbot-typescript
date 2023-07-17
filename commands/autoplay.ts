import { AudioPlayerStatus } from "@discordjs/voice";
import { bot } from "..";
import { updateInteraction } from "../common/embed-functions";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("autoplay").setDescription("Toggles autoplaying of songs"),
    async execute(interaction?: ChatInputCommandInteraction, deferReply: boolean = false, guildId?: string) {
        const connection = bot.connections.get(interaction?.guildId || guildId);

        if (!connection) {
            return;
        }

        connection.playerState.autoplayer.enabled = !connection.playerState.autoplayer.enabled;

        if (interaction && connection.playerState.status !== AudioPlayerStatus.Idle) {
            await updateInteraction(connection, interaction);
        }

        // use skip command to jumpstart autoplay if we are currently idle when command is activated
        if(connection.playerState.status === AudioPlayerStatus.Idle && connection.playerState.autoplayer.enabled === true) {
            await interaction.deferReply({ ephemeral: true });
            await bot.commands.get('skip').execute(undefined, false, interaction?.guildId || guildId);
            await interaction.deleteReply();
        }
    }
}