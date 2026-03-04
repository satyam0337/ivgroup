import { mdiChevronDown } from "@mdi/js"
import Icon from "@mdi/react"
import ReactSelect from "react-select"
import { cn } from "../extras"

const Select = <T, >({ options, value, onChange, className, autoFocus, "aria-label": ariaLabel }: {
  options: { value: T, label: string }[],
  value: T | undefined,
  onChange: (value: T | undefined) => void,
  className?: string,
  autoFocus?: boolean,
  "aria-label"?: string
}) => {
  return <ReactSelect
    options={options}
    value={options.find(o => o.value === value)}
    onChange={o => onChange(o?.value)}
    components={{ DropdownIndicator: () => <Icon path={mdiChevronDown} size={1} /> }}
    classNames={{
      control: () => cn("w-[300px] !min-h-0 rounded-md border border-slate-200 p-1", className),
      menu: () => "!w-[300px] bg-white border border-slate-200",
      option: state => cn(
        "py-1 px-2 hover:bg-slate-200",
        state.isFocused && "bg-slate-200",
        state.isSelected && "bg-blue-500 hover:bg-blue-500 text-white"
      )
    }}
    classNamePrefix="react-select"
    unstyled
    autoFocus={autoFocus}
    aria-label={ariaLabel} />
}
export default Select