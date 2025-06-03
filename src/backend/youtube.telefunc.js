import { shield } from 'telefunc';
import { parse } from 'node-html-parser';
import { Jsonic } from 'jsonic';

const t = shield.type;

export const onGetYoutubePlaylistIDs = shield(
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
            return (
              youtubeContent.contents?.twoColumnWatchNextResults?.playlist?.playlist?.contents?.map(
                content => content?.playlistPanelVideoRenderer?.videoId || null
              ) || []
            );
          }
        }

        return [];
      });
  }
);
