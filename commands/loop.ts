import { AudioPlayerStatus } from "@discordjs/voice";
import { ButtonStyle } from "discord.js";
import { bot } from "..";
import { updateInteraction, updateMessageRowEmbedButton } from "../common/embed-functions";
import { playSong } from "../common/play-song-functions";
import { loopButton } from "../models/bot.constants";

export default {
    name: "loop",
    description: "Loops the current song",
    async execute(interaction?: any, deferReply: boolean = false, guildId?: string) {

        const id = interaction?.guildId || guildId;
        const connection = bot.connections.get(id);

        if(!connection) return;

        if(connection.playerState.isLooping === false) {
            updateMessageRowEmbedButton(
                connection.messageState.messageRows[loopButton.row].components[loopButton.id],
                "End Loop",
                ButtonStyle.Success,
                false
            );
            connection.playerState.isLooping = true;
        }
        else {
            updateMessageRowEmbedButton(
                connection.messageState.messageRows[loopButton.row].components[loopButton.id],
                "Start Loop",
                ButtonStyle.Secondary,
                false
            );
            connection.playerState.isLooping = false;
        }

        if(connection.playerState.status === AudioPlayerStatus.Idle && connection.playerState.isLooping === true) {
            await playSong(id, connection.playerState.currentSong);
        }
        else {
            if(interaction) {
                await updateInteraction(connection, interaction);
            }
        }

        // if(interaction && deferReply) {
        //     await interaction?.deferReply();
        //     await interaction?.deleteReply();
        // }
    }
}