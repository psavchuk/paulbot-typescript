import { AudioPlayerStatus } from "@discordjs/voice";
import { ButtonBuilder, ButtonStyle, EmbedBuilder, UserFlags } from "discord.js";
import { clearButton, embedColor, soundcloudColor, youtubeColor } from "../models/bot.constants";
import { IGuildConnection, ISong, ISongChapter, ISongEmbed } from "../models/bot.interfaces";
import { millisecondsToMinutes } from "./helper-functions";

// embed when we join without a song played
// @TODO add a custom row of buttons for this
export const initialEmbed = (iconURL: string) => new EmbedBuilder()
    .setTitle('Welcome to Paulbot')
    .setDescription('Queue a song using **/play** or press the **Trending** button to queue trending music')
    .setColor(embedColor)
    .setThumbnail(iconURL);

// evaluates current player state and updates the author accordingly
export const updateAuthorEmbed = (connection: IGuildConnection) => {
    const embed = connection.messageState.embed;
    const playerState = connection.playerState;

    if(playerState.status === AudioPlayerStatus.Paused) {
        embed.setAuthor({name:'Paused'});
    }
    else {
        if(playerState.isLooping) {
            embed.setAuthor({name:'Looping'});
        }
        else {
            if(playerState.queue.length > 0) {
                embed.setAuthor({name:`Songs left in Queue: ${playerState.queue.length}`});
            }
            else {
                if(playerState.autoplayer.enabled) {
                    embed.setAuthor({name:'In Autoplay Mode'});
                }
                else {
                    embed.setAuthor({name:null});
                }
            }
        }    
    }

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

export const updateEmbed = async (connection: IGuildConnection) => {
    await updateAuthorEmbed(connection);
    await updateClearQueueButton(connection);
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
export const updateInteraction = async (connection: IGuildConnection, interaction: any) => {
    await updateAuthorEmbed(connection);
    await updateClearQueueButton(connection);
    await interaction.update({ 
        embeds: [connection.messageState.embed], 
        components: [
            connection.messageState.messageRows[
                connection.messageState.currentMessageRow
            ]
        ] 
    });
}

export const createEmbed = async (connection: IGuildConnection) => {
    // get rid of old message
    if(connection.messageState.currentMessage) 
        await connection.messageState.currentMessage.delete();

    await updateAuthorEmbed(connection);
    await updateClearQueueButton(connection);
    connection.textChannel = connection.messageState.currentMessage.channel;
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

// gets title of current chapter
export const evaluateChapter = (duration: number, song: ISong): string => {
    const chapters = song.chapters;
    for (let i = 0; i < chapters.length; i++) {
        if(duration => chapters[i].time * 1000 && duration < chapters[i+1].time * 1000) {
            song.currentChapter = i;
            return chapters[i].title;
        }
    }
    return "";
}