import type { IFileReferenceRead } from './IFileReferenceRead';
import type { ReferenceTypeEnum } from './ReferenceTypeEnum';
export type IImageGenerationReferenceRead = {
    type: ReferenceTypeEnum;
    reference_id: (string | null);
    reference: (IFileReferenceRead | null);
};
//# sourceMappingURL=IImageGenerationReferenceRead.d.ts.map