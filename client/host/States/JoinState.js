import { GAME_STATES, TEXT_STYLES, SOCKET_EVENTS } from 'constants';
import GameState from './GameState';
import PlayerCardsView from '../Views/PlayerCardsView';

const CORNER_PADDING = 10;

export default class JoinState extends GameState {
    constructor(game, roomId, socket, playerGroup) {
        super(game);
        this.socket = socket;
        this.initializeSocket(socket);
        this.songIndex = 0;
        this.roomId = roomId;
        this.songList = [];
        this.startGameText = null;

        fetch('/api/v0/tracks', { method: 'GET' })
            .then(request => request.json())
            .then(response => { this.songList = response.tracks; });

        this.playerGroup = playerGroup;
    }

    initializeSocket(socket) {
        socket.on(SOCKET_EVENTS.JOIN_GAME, ({ id, name, instrument, calibration }) => {
            if (this.state.current !== GAME_STATES.JOIN) {
                return;
            }
            this.playerGroup.addPlayer(id, name, instrument, calibration);
            this.playerCardsView.onModelChange();
        });

        socket.on(SOCKET_EVENTS.LEFT_GAME, ({ id }) => {
            if (this.state.current !== GAME_STATES.JOIN) {
                return;
            }
            this.playerGroup.removePlayer(id);
            this.playerCardsView.onModelChange();
        });

        socket.on(SOCKET_EVENTS.CALIBRATION_REQUEST, data => {
            if (this.state.current !== GAME_STATES.JOIN) {
                return;
            }
            socket.emit(SOCKET_EVENTS.CALIBRATION_RESPONSE, data);
        });

        socket.on(SOCKET_EVENTS.PLAYER_READY, () => {
            this.broadcastSong();
        });
    }

    create() {
        this.playerCardsView = new PlayerCardsView(this.game, this.playerGroup);
        this.playerCardsView.onModelChange();

        // Scroll through songs
        this.game.input.keyboard.addKey(Phaser.Keyboard.O).onDown.add(this.prevSong, this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.P).onDown.add(this.nextSong, this);

        // Room ID
        this.game.add.text(
            this.game.camera.width - CORNER_PADDING, CORNER_PADDING,
            `Room ID: ${this.roomId}`,
            TEXT_STYLES.SMALL_TEXT_FONT_STYLE
        ).anchor.setTo(1, 0);

        // Select song text
        this.game.add.text(
            this.game.camera.width / 2, 60,
            'Select a Song:',
            TEXT_STYLES.TEXT_FONT_STYLE,
        ).anchor.setTo(0.5, 0.5);

        this.songText = this.game.add.text(
            this.game.camera.width / 2, 120,
            this.songList[this.songIndex].name,
            TEXT_STYLES.CALL_TO_ACTION_FONT_STYLE,
        );
        this.songText.anchor.setTo(0.5, 0.5);

        this.songArtist = this.game.add.text(
            this.game.camera.width / 2, 160,
            this.songList[this.songIndex].artist,
            TEXT_STYLES.SMALL_TEXT_FONT_STYLE,
        );
        this.songArtist.anchor.setTo(0.5, 0.5);

        this.songDifficulty = this.game.add.text(
            this.game.camera.width / 2, 200,
            this.songList[this.songIndex].difficulty,
            TEXT_STYLES.SMALL_TEXT_FONT_STYLE,
        );
        this.songDifficulty.anchor.setTo(0.5, 0.5);

        // Arrow keys to navigate (change song)
        this.game.add.text(
            this.game.camera.width / 4, 120,
            '<',
            TEXT_STYLES.CALL_TO_ACTION_FONT_STYLE,
        ).anchor.setTo(0.5, 0.5);

        this.game.add.text(
            this.game.camera.width / 4, 155,
            '(O)',
            TEXT_STYLES.SMALL_TEXT_FONT_STYLE,
        ).anchor.setTo(0.5, 0.5);

        this.game.add.text(
            (3 * this.game.camera.width) / 4, 120,
            '>',
            TEXT_STYLES.CALL_TO_ACTION_FONT_STYLE,
        ).anchor.setTo(0.5, 0.5);

        this.game.add.text(
            (3 * this.game.camera.width) / 4, 155,
            '(P)',
            TEXT_STYLES.SMALL_TEXT_FONT_STYLE,
        ).anchor.setTo(0.5, 0.5);

        this.startGameText = this.game.add.text(
            this.game.camera.width / 2,
            this.game.camera.height - 50,
            'Press SPACE to start!',
            TEXT_STYLES.CALL_TO_ACTION_FONT_STYLE,
        );
        this.startGameText.anchor.setTo(0.5, 0.5);

        this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
                .onDown.add(this.handleStart, this);

        this.game.input.keyboard.addKey(Phaser.Keyboard.J)
                .onDown.add(this.forceStart, this);
    }

    forceStart() {
        this.playerGroup.addPlayer('000', 'Test Name', 'guitar');
        this.playerGroup.addPlayer('001', 'Test Name 2', 'drums');
        this.handleStart();
    }

    handleStart() {
        if (this.playerGroup.getNumPlayers() > 0) {
            const trackFile = this.songList[this.songIndex].file;
            fetch(`/api/v0/track/${trackFile}`, { method: 'GET' })
                .then(request => request.json())
                .then(response => {
                    const gameInfo = {
                        track: response,
                    };
                    this.game.state.start(GAME_STATES.PLAY,
                        true,
                        false,
                        gameInfo,
                    );
                });
        }
    }

    broadcastSong() {
        this.socket.emit(SOCKET_EVENTS.CHANGE_TRACK, {
            name: this.songList[this.songIndex].name,
            artist: this.songList[this.songIndex].artist,
        });
    }

    changeSong() {
        this.songText.setText(this.songList[this.songIndex].name);
        this.songDifficulty.setText(this.songList[this.songIndex].difficulty);
        this.songArtist.setText(this.songList[this.songIndex].artist);
        this.broadcastSong();
    }

    nextSong() {
        this.songIndex = (this.songIndex + 1) % this.songList.length;
        this.changeSong();
    }

    prevSong() {
        if ((--this.songIndex) < 0) {
            this.songIndex = this.songList.length - 1;
        }
        this.changeSong();
    }

    update() {
        if (this.playerGroup.getNumPlayers() > 0 && !this.startGameText.visible) {
            this.startGameText.visible = true;
        } else if (this.playerGroup.getNumPlayers() < 1 && this.startGameText.visible) {
            this.startGameText.visible = false;
        }
    }
}
