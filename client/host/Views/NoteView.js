import View from './View';
import { TRACK_LINE_DEPTH } from './TrackView';

const NOTE_DELTA_Y = 4;
const NOTE_SIZE = {
    x: 100,
    y: 20,
};
const CREATE_AFTER = -100;
const HIDE_AFTER = TRACK_LINE_DEPTH;
const DELETE_AFTER = 500;

const EXCELLENT_DELTA = 50;
const GOOD_DELTA = 150;
const BAD_DELTA = 250;

export default class NoteView extends View {
    constructor(game,
            { playAt, lineIndex, lineCount, playerIndex, playerCount,
            bottomBarOffset, globalNoteTrackPositiveOffset }) {
        super(game);
        this.playAt = playAt;
        this.playerAlreadyPlayed = false;
        this.isVisible = true;
        this.isPlayable = true;
        this.lineIndex = lineIndex;
        this.playerIndex = playerIndex;
        this.playerCount = playerCount;
        this.bottomBarOffset = bottomBarOffset;
        this.lineCount = lineCount;
        this.globalNoteTrackPositiveOffset = globalNoteTrackPositiveOffset;

        this.graphics = null;
        this.fadeAnim = null;

        this.initialY = (this.game.world.height - this.bottomBarOffset) -
            ((60 * NOTE_DELTA_Y * this.playAt) / 1000);
        this.y = this.initialY;
    }

    create() {
        const trackWidth = this.game.camera.width / this.lineCount;
        const globalNotePositiveOffset = this.globalNoteTrackPositiveOffset / this.lineCount;
        const noteNegativeOffset = this.lineIndex * globalNotePositiveOffset;
        const globalNoteLocation = (this.playerIndex * this.game.camera.width) / this.playerCount;
        const localNoteOffset =
            (((this.lineIndex * trackWidth) +
                ((trackWidth - NOTE_SIZE.x) / 2)) / this.playerCount) - noteNegativeOffset;

        const x = globalNotePositiveOffset + globalNoteLocation + localNoteOffset;

        this.graphics = this.game.add.graphics(x, this.y);

        this.graphics.beginFill(0xffffff, 1);
        this.graphics.drawRoundedRect(
            0, /* topLeftX */
            0, /* topLeftY */
            NOTE_SIZE.x / this.playerCount, /* width */
            NOTE_SIZE.y, /* height */
            9, /* roundness */
        );
        this.graphics.endFill();
        // Assign color of note based on track
        let noteColor = 0xffffff;
        switch (this.lineIndex) {
        case 0:
            noteColor = 0x008aff;
            break;
        case 1:
            noteColor = 0x00b800;
            break;
        case 2:
            noteColor = 0xffce00;
            break;
        case 3:
            noteColor = 0xff3700;
            break;
        default:
            break;
        }
        // Draw inner note rectangle (filled color of note)
        this.graphics.beginFill(noteColor, 1);
        this.graphics.drawRoundedRect(
            3, /* topLeftX */
            3, /* topLeftY */
            (NOTE_SIZE.x / this.playerCount) - 6, /* width */
            NOTE_SIZE.y - 6, /* height */
            9, /* roundness */
        );
        this.graphics.endFill();
        this.fadeAnim = this.game.add.tween(this.graphics)
                                        .to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, false);
    }

    update(timeElapsed) {
        this.y = this.initialY + (((NOTE_DELTA_Y * 60) / 1000) * timeElapsed);

        // Lazily create the note graphic
        if (!this.graphics && (this.y > CREATE_AFTER)) {
            this.create();
        }

        if (this.isVisible && this.graphics) {
            this.graphics.y = this.y;

            // Start the fade animation once it crosses the bottom bar
            if (this.fadeAnim && !this.fadeAnim.isRunning &&
                    this.graphics.y >= this.game.world.height - this.bottomBarOffset) {
                this.fadeAnim.start();
            }

            if (this.y > (this.game.world.height - this.bottomBarOffset) + HIDE_AFTER) {
                this.graphics.destroy();
                this.isVisible = false;
            }
        }

        if (this.isPlayable &&
                this.y > (this.game.world.height - this.bottomBarOffset) + DELETE_AFTER) {
            this.isPlayable = false;
        }
    }

    hide() {
        if (this.fadeAnim && this.fadeAnim.isRunning) {
            this.fadeAnim.stop();
            this.fadeAnim = null;
        }
        this.isVisible = false;
        this.graphics.destroy();
    }

    isHit(playerPlayedAt) {
        if (this.playerAlreadyPlayed) return 'MISS';

        const delta = Math.abs(playerPlayedAt - this.playAt);

        if (delta <= EXCELLENT_DELTA) {
            this.playerAlreadyPlayed = true;
            return 'EXCELLENT';
        } else if (delta <= GOOD_DELTA) {
            this.playerAlreadyPlayed = true;
            return 'GOOD';
        } else if (delta <= BAD_DELTA) {
            this.playerAlreadyPlayed = true;
            return 'BAD';
        }
        return 'MISS';
    }
}
