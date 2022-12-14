import { AudioPlayerStatus } from "@discordjs/voice";
import { ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import { bot } from "..";
import { updateEmbed, updateInteraction, updateMessageRowEmbedButton } from "../common/embed-functions";

export default {
    name: "pause",
    description: "Pauses / Resumes the Current Song",
    async execute(interaction?: ChatInputCommandInteraction, deferReply: boolean = true, guildId?: string) {
        const connection = bot.connections.get(interaction?.guildId || guildId);
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

        if(interaction) {
            await updateInteraction(connection, interaction);
        }
        else {
            await updateEmbed(connection);
        }

        if(deferReply) {
            await interaction?.deferReply();
            await interaction?.deleteReply();
        }
    }
}