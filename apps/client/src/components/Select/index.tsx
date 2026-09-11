import "./Select.css";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  id: string;
  label: string;
  value: string;
  options: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function Select({
  id,
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: SelectProps) {
  return (
    <div className="select-field">
      <label htmlFor={id}>{label}</label>
      <div className="select-field__control">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          {placeholder === undefined ? null : (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
