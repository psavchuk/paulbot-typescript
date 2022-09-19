import { AudioPlayerStatus } from "@discordjs/voice";
import { ButtonStyle } from "discord.js";
import { bot } from "..";
import { updateInteraction, updateMessageRowEmbedButton } from "../common/embed-functions";

export default {
    name: "autoplay",
    description: "Toggles Autoplay",
    async execute(interaction?: any, deferReply: boolean = false, guildId?: string) {
        
        const connection = bot.connections.get(interaction?.guildId || guildId);

        const autoplayButtonRow = 0;
        const autoplayButtonID = 2; // @TODO MOVE THIS

        if(!connection) return;

        if(connection.playerState.autoplayer.enabled === false) {
            updateMessageRowEmbedButton(
                connection.messageState.messageRows[autoplayButtonRow].components[autoplayButtonID],
                "Disable Autoplay",
                ButtonStyle.Success,
                false
            );
            connection.playerState.autoplayer.enabled = true;
        }
        else {
            updateMessageRowEmbedButton(
                connection.messageState.messageRows[autoplayButtonRow].components[autoplayButtonID],
                "Enable Autoplay",
                ButtonStyle.Secondary,
                false
            );
            connection.playerState.autoplayer.enabled = false;
        }

        if(interaction) {
            await updateInteraction(connection, interaction);
        }

        if(connection.playerState.status === AudioPlayerStatus.Idle && connection.playerState.autoplayer.enabled === true) {
            await bot.commands.get('skip').execute(undefined, false, interaction.guildId);
        }
    }
}