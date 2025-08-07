import type { IFileReferenceRead } from './IFileReferenceRead';
import type { ReferenceTypeEnum } from './ReferenceTypeEnum';
export type IVideoGenerationReferenceRead = {
    type: ReferenceTypeEnum;
    reference_id: (string | null);
    reference: (IFileReferenceRead | null);
};
//# sourceMappingURL=IVideoGenerationReferenceRead.d.ts.map