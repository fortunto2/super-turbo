import type { EntityCharacterConfig } from './EntityCharacterConfig';
import type { EntityLocationConfig } from './EntityLocationConfig';
import type { EntityObjectConfig } from './EntityObjectConfig';
import type { IEntityLoraUpdate } from './IEntityLoraUpdate';
export type IEntityUpdate = {
    name: string;
    description?: (string | null);
    config?: (EntityCharacterConfig | EntityLocationConfig | EntityObjectConfig);
    id: string;
    file_id: string;
    voice_name?: (string | null);
    loras?: Array<IEntityLoraUpdate>;
};
//# sourceMappingURL=IEntityUpdate.d.ts.map