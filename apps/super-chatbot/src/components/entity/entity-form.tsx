"use client";

import type {
  IEntityCreate,
  IEntityRead,
  IEntityUpdate,
} from "@turbo-super/api";
import { EntityTypeEnum } from "@turbo-super/api";
import type { FieldPath } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import type { FC } from "react";
import { useMemo } from "react";
import { Button, Input, Label, Textarea } from "@turbo-super/ui";

export type EntityData = Pick<
  IEntityCreate | IEntityUpdate,
  "name" | "description" | "config" | "voice_name" | "loras"
>;

type Props = {
  entity?: IEntityRead;
  type?: EntityTypeEnum;
  onSubmit: (data: EntityData) => void;
  isLoading?: boolean;
};

type OptionalField = {
  label: string;
  name: Exclude<
    FieldPath<IEntityUpdate>,
    | "name"
    | "description"
    | "voice_name"
    | "loras"
    | `loras.${number}`
    | "id"
    | "file_id"
    | "config"
  >;
  defaultValue: string | null;
  isInline?: boolean;
};

const FORM_ID = "entity-form";

const EntityForm: FC<Props> & { ID: string } = ({
  entity,
  type,
  onSubmit,
  isLoading = false,
}: Props) => {
  const { control, handleSubmit } = useForm<IEntityUpdate>({
    defaultValues: { ...entity } as IEntityUpdate,
  });

  const optionalFields = useMemo<OptionalField[]>(() => {
    if (type === EntityTypeEnum.CHARACTER) {
      return [
        {
          label: "Age",
          name: "config.age",
          defaultValue: null,
          isInline: true,
        },
        {
          label: "Gender",
          name: "config.gender",
          defaultValue: null,
          isInline: true,
        },
        {
          label: "Appearance",
          name: "config.appearance",
          defaultValue: null,
          isInline: false,
        },
        {
          label: "Clothes",
          name: "config.clothes",
          defaultValue: null,
          isInline: false,
        },
        {
          label: "Race",
          name: "config.race",
          defaultValue: null,
          isInline: true,
        },
        {
          label: "Role",
          name: "config.role",
          defaultValue: null,
          isInline: true,
        },
        {
          label: "Resemblance",
          name: "config.resemblance",
          defaultValue: null,
          isInline: false,
        },
      ];
    }
    if (type === EntityTypeEnum.LOCATION) {
      return [
        {
          label: "Appearance",
          name: "config.appearance",
          defaultValue: null,
        },
        {
          label: "Setting",
          name: "config.setting",
          defaultValue: null,
        },
        {
          label: "Specific Elements",
          name: "config.specific_elements",
          defaultValue: null,
        },
        {
          label: "Historical Period or Setting",
          name: "config.historical_period_or_setting",
          defaultValue: null,
        },
      ];
    }
    if (type === EntityTypeEnum.OBJECT) {
      return [
        {
          label: "Appearance",
          name: "config.appearance",
          defaultValue: null,
        },
        {
          label: "Properties",
          name: "config.properties",
          defaultValue: null,
        },
      ];
    }
    return [];
  }, [type]);

  return (
    <form
      id={FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <Controller
        name="name"
        control={control}
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name*</Label>
              <Input
                id="name"
                {...field}
                placeholder="Enter entity name"
                disabled={isLoading}
              />
            </div>
            {fieldState.error && (
              <span className="text-red-400">Name is required</span>
            )}
          </>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field: { value, ...restField } }) => (
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={value ?? undefined}
              rows={4}
              {...restField}
              disabled={isLoading}
              className="resize-vertical"
            />
          </div>
        )}
        defaultValue={null}
      />

      {optionalFields.map((optionalField, index) => {
        const nextField = optionalFields[index + 1];
        const shouldRenderInline =
          optionalField.isInline && nextField?.isInline;

        if (
          index > 0 &&
          optionalFields[index - 1]?.isInline &&
          optionalField.isInline
        ) {
          return null;
        }

        return (
          <div
            key={optionalField.name}
            className={`flex gap-4 ${shouldRenderInline ? "flex-row" : "flex-col"}`}
          >
            <div className="flex-1">
              <Controller
                name={optionalField.name}
                control={control}
                defaultValue={optionalField.defaultValue}
                render={({ field: { value, ...field } }) => (
                  <div className="space-y-2">
                    <Label htmlFor={optionalField.name}>
                      {optionalField.label}
                    </Label>
                    <Input
                      id={optionalField.name}
                      value={value ?? ""}
                      placeholder={`Enter ${optionalField.label.toLowerCase()}`}
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                )}
              />
            </div>
            {shouldRenderInline && nextField && (
              <div className="flex-1">
                <Controller
                  key={nextField.name}
                  name={nextField.name}
                  control={control}
                  defaultValue={nextField.defaultValue}
                  render={({ field: { value, ...field } }) => (
                    <div className="space-y-2">
                      <Label htmlFor={nextField.name}>{nextField.label}</Label>
                      <Input
                        id={nextField.name}
                        value={value ?? ""}
                        placeholder={`Enter ${nextField.label.toLowerCase()}`}
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        );
      })}

      <Controller
        name="voice_name"
        control={control}
        render={({ field: { value, ...rest } }) => (
          <div className="space-y-2">
            <Label htmlFor="voice_name">Voice Name</Label>
            <Input
              id="voice_name"
              value={value ?? ""}
              placeholder="Enter voice name"
              disabled={isLoading}
              {...rest}
            />
          </div>
        )}
        defaultValue={null}
      />

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[150px]"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

EntityForm.ID = FORM_ID;

export { EntityForm };
