import fs from 'fs';
import path from 'path';
import { TRACK_EXTENSION } from '../../shared/constants.js';

const tracksPath = path.resolve(__dirname, '..', '..', 'shared', 'tracks');

export default {
    getTracks(req, res) {
        const trackList = [];

        fs.readdirSync(tracksPath)
            .filter(file => path.extname(file) === TRACK_EXTENSION)
            .forEach(file => {
                const trackPath = path.resolve(tracksPath, file);
                const { name, difficulty } = JSON.parse(fs.readFileSync(trackPath, 'utf8'));
                trackList.push({ file, name, difficulty });
            });

        res.json({ tracks: trackList });
    },

    getTrack(req, res) {
        const trackPath = path.resolve(tracksPath, req.params.trackFile);
        res.json(JSON.parse(fs.readFileSync(trackPath, 'utf8')));
    },
};
