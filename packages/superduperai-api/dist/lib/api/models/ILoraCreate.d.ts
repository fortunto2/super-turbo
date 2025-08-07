import type { EntityTypeEnum } from './EntityTypeEnum';
import type { ILoraReferenceCreate } from './ILoraReferenceCreate';
export type ILoraCreate = {
    name: string;
    trigger: string;
    references: Array<ILoraReferenceCreate>;
    entity_type?: (EntityTypeEnum | null);
};
//# sourceMappingURL=ILoraCreate.d.ts.map