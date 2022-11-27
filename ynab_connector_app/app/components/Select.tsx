type Option = { value: any; display: string };

interface Props {
  actionData: any;
  actionDataField: string;
  label: string;
  options: Option[];
}

export default function Select({
  actionData,
  actionDataField,
  label,
  options,
}: Props) {
  return (
    <>
      <label className="flex w-full flex-col gap-1">
        <span>{label} </span>
        <select
          name={actionDataField}
          className="flex-1 rounded-md border-2 border-blue-500 px-3 px-2 py-2 text-lg leading-loose"
          aria-invalid={actionData?.errors[actionDataField] ? true : undefined}
          aria-errormessage={
            actionData?.errors[actionDataField]
              ? `${actionData}-error`
              : undefined
          }
        >
          {options.map((option) => (
            <option key={option.display} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
      </label>
      {actionData?.errors[actionData] && (
        <div className="pt-1 text-red-700" id={`${actionDataField}-error`}>
          {actionData.errors[actionDataField]}
        </div>
      )}
    </>
  );
}
