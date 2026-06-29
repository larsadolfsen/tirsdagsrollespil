import { useEffect, useRef, useState } from "react";
import { Bold, Italic, List, Pencil } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui";

type FormatCommand = "bold" | "italic" | "insertUnorderedList";

type FormattedTextFieldProps = {
  ariaLabel: string;
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

const formatActions: Array<{
  command: FormatCommand;
  icon: typeof Bold;
  label: string;
}> = [
  { command: "bold", icon: Bold, label: "Bold" },
  { command: "italic", icon: Italic, label: "Italic" },
  { command: "insertUnorderedList", icon: List, label: "Bulleted list" },
];

const isHtmlEmpty = (html: string) => {
  if (!html) return true;
  const clean = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return clean === "";
};

export function FormattedTextField({
  ariaLabel,
  className,
  onChange,
  placeholder = "Write…",
  value,
}: FormattedTextFieldProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [draftValue, setDraftValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value);
    }
  }, [isEditing, value]);

  useEffect(() => {
    const editor = editorRef.current;

    if (isEditing && editor && editor.innerHTML !== draftValue) {
      editor.innerHTML = draftValue;
    }
  }, [isEditing]);

  const emitChange = () => {
    setDraftValue(editorRef.current?.innerHTML ?? "");
  };

  const applyFormat = (command: FormatCommand) => {
    editorRef.current?.focus();
    document.execCommand(command);
    emitChange();
  };

  const save = () => {
    onChange(draftValue);
    setIsEditing(false);
  };

  const edit = () => {
    setDraftValue(value);
    setIsEditing(true);
  };

  const isEmpty = isHtmlEmpty(value);

  if (!isEditing) {
    return (
      <div className={className}>
        <div
          onClick={edit}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              edit();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Edit ${ariaLabel}`}
          title="Click to edit"
          className={cn(
            "wfrp-text cursor-pointer hover:text-white transition-colors outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 rounded [&_b]:font-bold [&_i]:italic [&_li]:my-1 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5",
            isEmpty ? "text-wfrp-muted-text/60 italic font-sans" : "text-gray-200"
          )}
          dangerouslySetInnerHTML={{ __html: isEmpty ? placeholder : value }}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={cn(
          "overflow-hidden rounded border border-wfrp-border bg-black/20 transition-colors focus-within:border-wfrp-gold/60 focus-within:ring-1 focus-within:ring-wfrp-gold/30",
        )}
      >
        <div
          className="flex h-9 items-center gap-1 border-b border-white/10 bg-white/[0.03] px-2"
          role="toolbar"
          aria-label={`${ariaLabel} formatting`}
        >
          {formatActions.map(({ command, icon: Icon, label }) => (
            <button
              key={command}
              type="button"
              aria-label={label}
              title={label}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => applyFormat(command)}
              className="inline-flex size-7 cursor-pointer items-center justify-center rounded text-wfrp-muted-text transition-colors hover:bg-wfrp-gold/10 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/60"
            >
              <Icon size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label={ariaLabel}
          aria-multiline="true"
          data-placeholder={placeholder}
          onInput={emitChange}
          onBlur={(event) => {
            if (!event.currentTarget.textContent?.trim()) {
              event.currentTarget.innerHTML = "";
              setDraftValue("");
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
          }}
          className="min-h-32 px-3 py-2.5 wfrp-text text-gray-200 outline-none [&:empty]:before:pointer-events-none [&:empty]:before:text-wfrp-muted-text [&:empty]:before:content-[attr(data-placeholder)] [&_b]:font-bold [&_i]:italic [&_li]:my-1 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5"
        />
      </div>
      <div className="mt-2 flex justify-end">
        <Button onClick={save} isGolden>
          Save
        </Button>
      </div>
    </div>
  );
}
