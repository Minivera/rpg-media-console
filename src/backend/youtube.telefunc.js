import { Abort, shield } from 'telefunc';
import { parse } from 'node-html-parser';
import { Jsonic } from 'jsonic';

import { getVideoInformation } from '../player/getVideoInformation.js';
import { getYoutubeVideoURL } from '../player/youtubeIds.js';

const t = shield.type;

const durationTextToSeconds = text => {
  const parts = text.split(':');
  if (!parts.length) {
    return 0;
  } else if (parts.length === 1) {
    return +parts[0];
  } else if (parts.length === 2) {
    return +parts[0] * 60 + +parts[1];
  }

  return +parts[0] * 60 * 60 + +parts[1] * 60 + +parts[2];
};

export const onGetYoutubePlaylistSongs = shield(
  [{ playlistURL: t.string }],
  async ({ playlistURL }) => {
    return fetch(playlistURL)
      .then(res => res.text())
      .then(htmlContent => {
        const playlistHTML = parse(htmlContent);
        const allScripts = playlistHTML.querySelectorAll('script');

        for (const script of allScripts) {
          if (script.innerText.includes('var ytInitialData')) {
            const youtubeContent = Jsonic(
              script.innerText
                .replace('var ytInitialData = ', '')
                .replace('};', '}')
            );

            if (
              !youtubeContent.contents?.twoColumnWatchNextResults?.playlist
                ?.playlist
            ) {
              throw Abort({
                errorMessage: `playlist not found`,
              });
            }

            return {
              title:
                youtubeContent.contents.twoColumnWatchNextResults.playlist
                  .playlist.title,
              videos:
                youtubeContent.contents.twoColumnWatchNextResults.playlist.playlist.contents?.map(
                  content =>
                    content?.playlistPanelVideoRenderer?.videoId
                      ? {
                          videoURL: getYoutubeVideoURL(
                            content?.playlistPanelVideoRenderer?.videoId
                          ),
                          duration: content?.playlistPanelVideoRenderer
                            ?.lengthText?.simpleText
                            ? durationTextToSeconds(
                                content?.playlistPanelVideoRenderer?.lengthText
                                  ?.simpleText
                              )
                            : 0,
                        }
                      : null
                ) || [],
            };
          }
        }

        return undefined;
      })
      .then(async playlistInfo => {
        if (!playlistInfo) {
          return;
        }

        return {
          ...playlistInfo,
          songs: (
            await Promise.all(
              playlistInfo.videos.map(async video => {
                if (!video) {
                  return;
                }

                try {
                  return {
                    ...(await getVideoInformation(video.videoURL)),
                    duration: video.duration,
                  };
                } catch (e) {
                  console.error(
                    `Could not import song from playlist, error: ${e.toString()}`
                  );
                }
              })
            )
          ).filter(info => info),
        };
      })
      .catch(e => {
        console.error(`Could not import playlist, error: ${e.toString()}`);
        throw Abort({
          errorMessage: `playlist not found`,
        });
      });
  }
);
