type Option = { value: any; display: string };

interface Props {
    actionData: any;
    actionDataField: string;
    label: string;
    options: Option[];
    onChange?: () => Option,
    selected?: Option
}

export default function Select({actionData, actionDataField, label, options, onChange, selected}: Props) {
    return (
        <>
            <label className="flex w-full flex-col gap-1">
                <span>{label} </span>
                <select
                    name={actionDataField}
                    className="flex-1 rounded-md border-2 border-blue-500 px-3 px-2 py-2 text-lg leading-loose"
                    aria-invalid={actionData?.errors[actionDataField] ? true : undefined}
                    aria-errormessage={actionData?.errors[actionDataField] ? `${actionData}-error` : undefined}
                    onChange={event => onChange(event.target.value)}
                >
                    {options.map((option) => (
                        <option key={option.display} value={option.value} selected={JSON.stringify(option) === JSON.stringify(selected)}>
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
