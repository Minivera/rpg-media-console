export const getVideoInformation = async videoURL => {
  const videoID = new URL(videoURL).searchParams.get('v');
  const finalURL = `https://www.youtube.com/watch?v=${videoID}`;

  return fetch(`https://www.youtube.com/oembed?url=${finalURL}&format=json`)
    .then(res => {
      if (res.status === 200) {
        return res.json();
      }

      throw new Error('Could not fetch the URL.');
    })
    .then(data => ({
      originalName: data.title,
      name: data.title,
      image: data.thumbnail_url,
      url: finalURL,
      author: data.author_name,
    }));
};
