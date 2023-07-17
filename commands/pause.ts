import { AudioPlayerStatus } from "@discordjs/voice";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { bot } from "..";
import { updateEmbed, updateInteraction } from "../common/embed-functions";

export default {
    data: new SlashCommandBuilder().setName("pause").setDescription("Pauses or resumes current song"),
    async execute(interaction?: ChatInputCommandInteraction, deferReply: boolean = true, guildId?: string) {
        const connection = bot.connections.get(interaction?.guildId || guildId);
        if (!connection) {
            return;
        }

        let status: AudioPlayerStatus;

        if (connection.playerState.status === AudioPlayerStatus.Paused) {
            status = AudioPlayerStatus.Playing;

            console.log('Resuming', connection.playerState.player.unpause());
        }
        else {
            status = AudioPlayerStatus.Paused;

            console.log('Pausing', connection.playerState.player.pause());
        }

        // console.log("pause command executed", connection.playerState.player);

        if (interaction && interaction.isButton()) {
            await updateInteraction(connection, interaction, status);
        }
        else {
            await updateEmbed(connection, status);
        }

        if(deferReply && interaction && !interaction.replied) {
            await interaction.deferReply();
            await interaction.deleteReply();
        }
    }
}