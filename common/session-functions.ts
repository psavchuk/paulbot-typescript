// store session data

import fs from "fs";
import { IGuildConnection } from "../models/bot.interfaces"
import { sessionExpiration } from "../config.json";
import { ChannelManager, TextChannel } from "discord.js";

export const storeSessionInFile = (connection: IGuildConnection) => {
    try {
        fs.writeFileSync(
            `./sessions/${connection.session.id}.json`, 
            JSON.stringify({
                session: connection.session,
                messageState: {
                    ...connection.messageState,
                    currentMessageId: connection.messageState.currentMessage.id,
                    currentMessageChannelId: connection.messageState.currentMessage.channelId,
                    currentMessage: undefined
                },
                playerState: {
                    ...connection.playerState,
                    player: undefined
                }
            }), 
        );
    } catch (error) {
        console.error(error);
    }
}

export const getSessionFromFile = (sessionId: string): IGuildConnection => {
    const data = fs.readFileSync(`./sessions/${sessionId}.json`, 'utf8');
    return JSON.parse(data);
}

export const deleteSessionFromFile = (sessionId: string): boolean => {
    try {
        fs.unlinkSync(`./sessions/${sessionId}.json`);
        return true;
    } catch (error) {
        return false;
    }
}

export const deleteMessageForSession = async (id: string, channelId: string, channelManager: ChannelManager): Promise<boolean> => {
    try {
        await (channelManager.cache.get(channelId) as TextChannel).messages.delete(id);
        return true;
    } catch (error) {
        return false;
    }
}

export const cleanSessions = (channelManager: ChannelManager) => {
    const files = fs.readdirSync('./sessions');
    files.forEach(file => {
        const data = fs.readFileSync(`./sessions/${file}`, 'utf8');
        const connection: IGuildConnection = JSON.parse(data);

        if(new Date(connection?.session.endTime).getTime() < new Date().getTime() - sessionExpiration) {
            console.log(`Deleting session ${connection.session.id}`);
            console.log(connection.messageState);

            const deletedMessage = deleteMessageForSession(connection.messageState.currentMessageId, connection.messageState.currentMessageChannelId, channelManager);

            if(deletedMessage) {
                console.log(`Deleted message for session ${connection.session.id}`);
                deleteSessionFromFile(connection.session.id);
            }
        }
    });
}