import type { Segment } from './Segment';
export type AudioMetadata = {
    duration?: (number | null);
    bpm?: (number | null);
    beats?: (Array<number> | null);
    downbeats?: (Array<number> | null);
    beat_positions?: (Array<number> | null);
    segments?: (Array<Segment> | null);
};
//# sourceMappingURL=AudioMetadata.d.ts.map