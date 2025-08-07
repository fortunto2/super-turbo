import type { AudioMetadata } from './AudioMetadata';
import type { IFileRead } from './IFileRead';
export type IMusicRead = {
    title: string;
    artist?: (string | null);
    thumbnail_path?: (string | null);
    id: string;
    file: IFileRead;
    thumbnail_url: (string | null);
    audio_metadata: (AudioMetadata | null);
    readonly duration: (number | null);
};
//# sourceMappingURL=IMusicRead.d.ts.map