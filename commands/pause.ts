import { AudioPlayerStatus } from "@discordjs/voice";
import { ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import { bot } from "..";
import { updateInteraction, updateMessageRowEmbedButton } from "../common/embed-functions";

export default {
    name: "pause",
    description: "Pauses / Resumes the Current Song",
    async execute(interaction?: ChatInputCommandInteraction, deferReply: boolean = true) {
        const connection = bot.connections.get(interaction.guildId);
        if(!connection) return;

        const playButtonRow = 0;
        const playButtonID = 0;

        if(connection.playerState.status === AudioPlayerStatus.Paused) {
            updateMessageRowEmbedButton(
                connection.messageState.messageRows[playButtonRow].components[playButtonID],
                "Pause",
                ButtonStyle.Secondary
            );

            connection.playerState.player.unpause();
        }
        else {
            updateMessageRowEmbedButton(
                connection.messageState.messageRows[playButtonRow].components[playButtonID],
                "Resume",
                ButtonStyle.Success
            );

            connection.playerState.player.pause();
        }

        await updateInteraction(connection, interaction);

        if(deferReply) {
            await interaction?.deferReply();
            await interaction?.deleteReply();
        }
    }
}