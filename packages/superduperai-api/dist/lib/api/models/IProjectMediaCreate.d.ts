import type { IImageGenerationCreate } from './IImageGenerationCreate';
export type IProjectMediaCreate = {
    config: (IImageGenerationCreate | Record<string, any>);
    thumbnail_url?: (string | null);
    type?: IProjectMediaCreate.type;
    template_name: (string | null);
    style_name?: (string | null);
    music_id?: (string | null);
    file_id?: (string | null);
};
export declare namespace IProjectMediaCreate {
    enum type {
        MEDIA = "media"
    }
}
//# sourceMappingURL=IProjectMediaCreate.d.ts.map