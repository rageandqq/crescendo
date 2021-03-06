const SOCKET_EVENTS = {
    PLAY_NOTE: 'PlayNote',
    HANDLE_NOTE: 'Noted',
    JOIN_GAME_REQUEST: 'JoinGameRequest', // Controller -> Server
    JOIN_GAME: 'JoinGame',  // Server -> Host
    LEFT_GAME: 'LeftGame',
    CHANGE_TRACK: 'ChangeTrack',
    CONNECTED: 'Connected', // Server -> Controller
    MISSED_NOTE: 'MissedNote', // Host -> Server -> Controller
    CALIBRATION_REQUEST: 'CalibrationRequest', // Controller -> Server -> Host
    CALIBRATION_RESPONSE: 'CalibrationResponse', // Host -> Server -> Controller,
    PLAYER_READY: 'PlayerReady', // Controller -> Host -> Server
};

const INSTRUMENTS = {
    DRUMS: 'drums',
    GUITAR: 'guitar',
};

const GAME_STATES = {
    LOAD: 'Load',
    MENU: 'Menu',
    PLAY: 'Play',
    JOIN: 'Join',
    SUMMARY: 'Summary',
};

const GAME_DIFFICULTY = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
};

const TEXT_STYLES = {
    TITLE_FONT_STYLE: {
        font: '100px Lato',
        fill: '#ffffff',
    },
    TEXT_FONT_STYLE: {
        font: '40px Lato',
        fill: '#ffffff',
    },
    CALL_TO_ACTION_FONT_STYLE: {
        font: '50px Lato',
        fill: '#ffffff',
    },
    SMALL_TEXT_FONT_STYLE: {
        font: '25px Lato',
        fill: '#ffffff',
    },
    PLAYER_NAME_CARD: {
        font: '25px Lato',
        fill: '#000000',
    },
    TEXT_FEEDBACK: {
        font: '40px Lato',
        fill: '#ffffff',
    },
};

const TRACK_EXTENSION = '.trk';

export {
    SOCKET_EVENTS,
    INSTRUMENTS,
    GAME_STATES,
    GAME_DIFFICULTY,
    TEXT_STYLES,
    TRACK_EXTENSION,
};
