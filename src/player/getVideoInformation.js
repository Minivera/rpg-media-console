export const getVideoInformation = async videoURL => {
  return fetch(`https://www.youtube.com/oembed?url=${videoURL}&format=json`)
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
      url: videoURL,
      author: data.author_name,
    }));
};
