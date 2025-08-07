import type { EntityCharacterConfig } from './EntityCharacterConfig';
import type { EntityLocationConfig } from './EntityLocationConfig';
import type { EntityObjectConfig } from './EntityObjectConfig';
import type { EntityTypeEnum } from './EntityTypeEnum';
import type { IEntityLoraRead } from './IEntityLoraRead';
import type { IFileRead } from './IFileRead';
export type IEntityRead = {
    name: string;
    description?: (string | null);
    config?: (EntityCharacterConfig | EntityLocationConfig | EntityObjectConfig);
    id: string;
    file: (IFileRead | null);
    file_id: (string | null);
    type: EntityTypeEnum;
    image_prompt: string;
    voice_name?: (string | null);
    loras?: Array<IEntityLoraRead>;
};
//# sourceMappingURL=IEntityRead.d.ts.map