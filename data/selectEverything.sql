SELECT
    json_group_array(json_object(
            'id', games.id,
            'name', games.name,
            'scenes', (
                SELECT
                    json_group_array(
                            json_object(
                                    'id', scenes.id,
                                    'name', scenes.name,
                                    'playlists', (
                                        SELECT
                                            json_group_array(
                                                    json_object(
                                                            'id', playlists.id,
                                                            'name', playlists.name,
                                                            'songs', (
                                                                SELECT
                                                                    json_group_array(
                                                                            json_object(
                                                                                    'id', songs.id,
                                                                                    'name', songs.name,
                                                                                    'display_name', songs.display_name,
                                                                                    'author', songs.author,
                                                                                    'image', songs.image,
                                                                                    'url', songs.url,
                                                                                    'duration', songs.duration
                                                                            )
                                                                    )
                                                                FROM songs
                                                                WHERE playlists.id = songs.playlist_id
                                                            )
                                                    )
                                            )
                                        FROM playlists
                                        WHERE scenes.id = playlists.scene_id
                                    )
                            )
                    )
                FROM scenes
                WHERE games.id = scenes.game_id
            )
                     )) as games
FROM games