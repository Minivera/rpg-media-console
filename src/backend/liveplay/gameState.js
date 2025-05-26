/**
 * This is a utility class to make managing the JSON game state saved in the DB
 * or received in messages a bit easier. Could be avoided if we used typescript.
 */
export class GameState {
  constructor(stateJSON) {
    if (!stateJSON) {
      this.actor = null;
      this.playing = false;
      this.currentIndex = 0;
      this.currentSeek = 0;
      this.volume = 50;
      this.songs = [];
      return;
    }

    let state = stateJSON;
    if (typeof stateJSON === 'string') {
      state = JSON.parse(stateJSON);
    }

    this.actor = state.actor;
    this.playing = state.playing;
    this.currentIndex = state.currentIndex;
    this.currentSeek = state.currentSeek;
    this.volume = state.volume;
    this.songs = state.songs;
  }

  startPlaying(songs) {
    this.playing = true;
    this.songs = songs;
    this.currentSeek = 0;
    this.currentIndex = 0;
  }

  pausePlaying() {
    this.playing = false;
  }

  resumePlaying() {
    this.playing = true;
  }

  moveTo(direction) {
    this.currentIndex = Math.max(
      0,
      Math.min(this.currentIndex + direction, this.songs.length - 1)
    );
    this.currentSeek = 0;
  }

  seekTo(newSeek) {
    this.currentSeek = Math.max(0, Math.min(newSeek, 1));
  }

  setVolume(newVolume) {
    this.volume = Math.max(0, Math.min(newVolume, 100));
  }

  setActor(actorId) {
    this.actor = actorId;
  }

  toJSON() {
    return JSON.stringify(this.state);
  }

  get state() {
    return {
      actor: this.actor,
      playing: this.playing,
      currentIndex: this.currentIndex,
      currentSeek: this.currentSeek,
      volume: this.volume,
      songs: this.songs,
    };
  }
}

export const gameStateFromState = state => new GameState(JSON.stringify(state));
