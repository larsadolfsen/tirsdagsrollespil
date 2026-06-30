import { Plus, X } from "lucide-react";
import { Button, Input, Label } from "../ui";

export function StringListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: readonly string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={value}
              placeholder={placeholder}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <Button
              variant="ghost"
              autoHeight
              leadingIcon={<X size={14} />}
              aria-label={`Remove ${label} entry ${index + 1}`}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            />
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        autoHeight
        leadingIcon={<Plus size={14} />}
        name="Add"
        onClick={() => onChange([...values, ""])}
      />
    </div>
  );
}
