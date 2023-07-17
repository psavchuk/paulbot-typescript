import { AudioPlayerStatus } from "@discordjs/voice";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel } from "discord.js";
import { autoplayButton, clearButton, embedColor, pauseButton, soundcloudColor, youtubeColor } from "../models/bot.constants";
import { IGuildConnection, ISong, ISongEmbed } from "../models/bot.interfaces";
import { millisecondsToMinutes } from "./helper-functions";

// embed when we join without a song played
// @TODO add a custom row of buttons for this
export const initialEmbed = (iconURL: string) => new EmbedBuilder()
    .setTitle('Welcome to Paulbot')
    .setDescription('Queue a song using **/play** or press the **Trending** button to queue trending music')
    .setColor(embedColor)
    .setThumbnail(iconURL);

export const updateEmbed = async (connection: IGuildConnection, status?: AudioPlayerStatus) => {
    updateAuthorEmbed(connection, status);
    updateMessageRowButtons(connection);
    updateClearQueueButton(connection);

    await connection.messageState.currentMessage.edit({ 
        embeds: [connection.messageState.embed], 
        components: [
            connection.messageState.messageRows[
                connection.messageState.currentMessageRow
            ]
        ] 
    });
}

// used by action buttons
export const updateInteraction = async (connection: IGuildConnection, interaction: any, status?: AudioPlayerStatus) => {
    updateAuthorEmbed(connection, status);
    updateClearQueueButton(connection);
    updateMessageRowButtons(connection);

    if (interaction.isButton()) {
        await interaction.update({ 
            embeds: [connection.messageState.embed], 
            components: [
                connection.messageState.messageRows[
                    connection.messageState.currentMessageRow
                ]
            ] 
        });
    }
}

export const createEmbed = async (connection: IGuildConnection, status?: AudioPlayerStatus) => {
    // get rid of old message
    if(connection.messageState.currentMessage) 
        await connection.messageState.currentMessage.delete();

    updateAuthorEmbed(connection, status);
    updateClearQueueButton(connection);
    updateMessageRowButtons(connection);

    connection.textChannel = connection.messageState.currentMessage.channel as TextChannel;
    const message = await connection.textChannel.send({ 
        embeds: [connection.messageState.embed], 
        components: [
            connection.messageState.messageRows[
                connection.messageState.currentMessageRow
            ]
        ] 
    });

    connection.messageState.currentMessage = message;
}

// evaluates current player state and updates the author accordingly
export const updateAuthorEmbed = (connection: IGuildConnection, status?: AudioPlayerStatus) => {
    const embed = connection.messageState.embed;
    const playerState = connection.playerState;

    let author = "";

    switch (status || playerState.status) {
        case AudioPlayerStatus.Playing:
            author += "Playing ";
            break;

        case AudioPlayerStatus.Paused:
            author += "Paused ";
            break;
    
        default:
            // author += 'Idle ';
            author += "Playing ";
            break;
    }

    if(playerState.isLooping) {
        author += '| Looping Current Song';
    }
    else {
        if(playerState.currentSong.chapters?.length > 0) {
            author += `| Chapters left in Song: ${playerState.currentSong.chapters?.length - playerState.currentSong.currentChapter - 1} `;
        }

        if(playerState.queue.length > 0) {
            author += `| Songs left in Queue: ${playerState.queue.length} `;
        }
        else {
            if(playerState.autoplayer.enabled) {
                author += '| In Autoplay Mode ';
            }
        }
    }    

    embed.setAuthor({name:author});

    // if(connection.messageState.currentMessage)
    //     connection.messageState.currentMessage.edit({ embeds: [embed] });
}

export const updateTitleEmbed = (connection: IGuildConnection, song: ISong) => {
    const embed = connection.messageState.embed;
    if(song.chapters?.length > 0) {
        embed.setTitle(song.chapters[song.currentChapter]?.title);
    }
    else {
        embed.setTitle(song.title);
    }
}

export const updateSongEmbed = (connection: IGuildConnection, embedOptions: ISongEmbed) => {
    const embed = connection.messageState.embed;
    embed.data.description = null;
    updateTitleEmbed(connection, embedOptions.song);

    embed.data.fields = [];
    if (embedOptions.queuedBy)
        embed.addFields({name: "Queued By:", value: embedOptions.queuedBy});
    if (connection.playerState.autoplayer.enabled && connection.playerState.autoplayer.originalSong && !embedOptions.queuedBy)
        embed.addFields({name: "Autoplaying From:", value: connection.playerState.autoplayer.originalSong.title});

    embed.addFields(
        // {name: "Uploader:", value: embedOptions.song.author},
        {name: "Song Duration:", value: embedOptions.duration}
    ); 

    if (embedOptions.song.chapters?.length > 0) {
        // embedOptions.song.chapters[embedOptions.song.currentChapter].duration
        embed.addFields({name: "Chapter From:", value: embedOptions.song.title});
        embed.addFields({name: "Chapter Duration:", value: millisecondsToMinutes(embedOptions.song.chapters[embedOptions.song.currentChapter].duration)});
    }

    embed.setImage(embedOptions.image);
    embed.setURL(embedOptions.url);
    embed.setColor(
        embedOptions.mode === 0 ? youtubeColor : soundcloudColor
    );

    // updateMessageRowButtons(connection);
}

// updates button states based on player state
export const updateMessageRowButtons = (connection: IGuildConnection) => {
    // autoplay
    updateMessageRowEmbedButton(
        connection.messageState.messageRows[autoplayButton.row].components[autoplayButton.id],
        connection.playerState.autoplayer.enabled ? "Disable Autoplay" : "Enable Autoplay",
        connection.playerState.autoplayer.enabled ? ButtonStyle.Success :ButtonStyle.Secondary,
        false
    );

    // pause and resume
    updateMessageRowEmbedButton(
        connection.messageState.messageRows[pauseButton.row].components[pauseButton.id],
        connection.playerState.status === AudioPlayerStatus.Paused ? "Resume" : "Pause",
        connection.playerState.status === AudioPlayerStatus.Paused ? ButtonStyle.Success : ButtonStyle.Secondary,
        false
    );
}

export const updateMessageRowEmbedButton = (button: ButtonBuilder, label: string, style: ButtonStyle, disabled?: boolean) => {
    button.setLabel(label);
    button.setStyle(style);
    button.data.disabled = disabled;
}

// disables clear button if queue is empty
export const updateClearQueueButton = (connection: IGuildConnection) => {
    updateMessageRowEmbedButton(
        connection.messageState.messageRows[clearButton.row].components[clearButton.id],
        "Clear Queue",
        ButtonStyle.Danger,
        connection.playerState.queue.length === 0
    );
}

// gets title of current chapter
// export const evaluateChapter = (duration: number, song: ISong): string => {
//     const chapters = song.chapters;
//     for (let i = 0; i < chapters.length; i++) {
//         if(duration >= chapters[i].time * 1000 && duration < chapters[i+1].time * 1000) {
//             song.currentChapter = i;
//             return chapters[i].title;
//         }
//     }
//     return "";
// }