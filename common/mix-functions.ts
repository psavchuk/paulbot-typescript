const miniget = require('miniget');

export async function getMixPlaylist(videoId: string): Promise<MixPlaylist | null> {
    try {
        let initialHtml = await miniget(`https://www.youtube.com/watch?v=${videoId}&list=RD${videoId}&start_radio=1`).text();
        const playlistString = getPlaylistFromHtml(initialHtml);
    
        if (playlistString) {
            try {
                let result: MixPlaylist | undefined = mapYoutubePlaylistToRegularPlaylist(JSON.parse(playlistString));
                result.playlist.shift();
                
                return result;
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }
    
    return null;
}

function getPlaylistFromHtml(html: string): string | null {
    let position = html.indexOf('"playlist"');

    if (position === -1) {
        return null;
    }

    position += 11;

    let count = 0;

    for(let i = position; i < html.length; i++) {
        if (html[i] === '{') {
            count++;
        }

        if (html[i] === '}') {
            count--;
        }

        if (count === 0) {
            return html.substring(position, i+1);
        }
    }

    return null;
}

function mapYoutubePlaylistToRegularPlaylist(youtubePlaylist: YoutubeMixPlaylist) {
    const result: MixPlaylist = {
        playlist: []
    };

    youtubePlaylist.playlist.contents.forEach(item => {
        result.playlist.push({
            title: item.playlistPanelVideoRenderer.title?.simpleText,
            author: item.playlistPanelVideoRenderer.longBylineText?.runs[0]?.text,
            videoId: item.playlistPanelVideoRenderer.videoId
        });
    });

    return result;
}

export interface YoutubeMixPlaylist {
    playlist: {
        contents: YoutubeMixPlaylistItem[];
    }
}

export interface YoutubeMixPlaylistItem {
    playlistPanelVideoRenderer: {
        title: {
            simpleText: string;
        }
        longBylineText: {
            runs: {
                text: string;
            }[];
        }
        videoId: string;
    }
}

export interface MixPlaylist {
    playlist: MixPlaylistItem[];
}

export interface MixPlaylistItem {
    title: string;
    author: string;
    videoId: string;
}