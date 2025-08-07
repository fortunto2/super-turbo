import type { IProjectFilmConfig_Input } from './IProjectFilmConfig_Input';
export type IProjectFilmCreate = {
    config: IProjectFilmConfig_Input;
    thumbnail_url?: (string | null);
    type?: IProjectFilmCreate.type;
    template_name?: (string | null);
    style_name?: (string | null);
    music_id?: (string | null);
};
export declare namespace IProjectFilmCreate {
    enum type {
        FILM = "film"
    }
}
//# sourceMappingURL=IProjectFilmCreate.d.ts.map