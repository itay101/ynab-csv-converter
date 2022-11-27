import { HTMLInputTypeAttribute } from "react";

interface Props {
  actionData: any;
  actionDataField: string;
  label: string;
  disabled?: boolean;
  type?: HTMLInputTypeAttribute;
}

export default function Input({
  actionData,
  actionDataField,
  label,
  type,
  disabled = false,
}: Props) {
  return (
    <>
      <label className="flex w-full flex-col gap-1">
        <span>{label} </span>
        <input
          name={actionDataField}
          type={type}
          className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          disabled={disabled}
          aria-invalid={actionData?.errors[actionDataField] ? true : undefined}
          aria-errormessage={
            actionData?.errors[actionDataField]
              ? `${actionData}-error`
              : undefined
          }
        />
      </label>
      {actionData?.errors[actionData] && (
        <div className="pt-1 text-red-700" id={`${actionDataField}-error`}>
          {actionData.errors[actionDataField]}
        </div>
      )}
    </>
  );
}
