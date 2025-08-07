import type { GenerationSourceEnum } from './GenerationSourceEnum';
import type { GenerationTypeEnum } from './GenerationTypeEnum';
export type IGenerationConfigRead = {
    name: string;
    label?: (string | null);
    type: GenerationTypeEnum;
    source: GenerationSourceEnum;
    params: Record<string, any>;
};
//# sourceMappingURL=IGenerationConfigRead.d.ts.map