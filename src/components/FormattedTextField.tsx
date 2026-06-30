import { useCallback, useEffect, useRef, useState } from "react";
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
  size?: "sm" | "base";
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

const AUTOSAVE_INTERVAL_MS = 2_000;

export function FormattedTextField({
  ariaLabel,
  className,
  onChange,
  placeholder = "Write…",
  value,
  size = "sm",
}: FormattedTextFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [draftValue, setDraftValue] = useState(value);
  const [savedValue, setSavedValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [lastAutosavedTime, setLastAutosavedTime] = useState<number | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const draftValueRef = useRef(value);
  const savedValueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value);
      setSavedValue(value);
      draftValueRef.current = value;
      savedValueRef.current = value;
    }
  }, [isEditing, value]);

  useEffect(() => {
    const editor = editorRef.current;

    if (isEditing && editor && editor.innerHTML !== draftValue) {
      editor.innerHTML = draftValue;
    }
  }, [isEditing]);

  const persistValue = useCallback((nextValue = draftValueRef.current, isAutosave = false) => {
    if (nextValue === savedValueRef.current) return;

    onChangeRef.current(nextValue);
    savedValueRef.current = nextValue;
    setSavedValue(nextValue);
    if (isAutosave) {
      setLastAutosavedTime(Date.now());
    }
  }, []);

  useEffect(() => {
    if (!isEditing) return;

    const intervalId = window.setInterval(() => {
      persistValue(undefined, true);
    }, AUTOSAVE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [isEditing, persistValue]);

  useEffect(() => {
    return () => {
      if (draftValueRef.current !== savedValueRef.current) {
        onChangeRef.current(draftValueRef.current);
      }
    };
  }, []);

  // Reset lastAutosavedTime when draftValue changes (user edits text)
  useEffect(() => {
    setLastAutosavedTime(null);
  }, [draftValue]);

  // Keep track of how many seconds ago the last autosave occurred
  useEffect(() => {
    if (lastAutosavedTime === null) {
      setSecondsAgo(0);
      return;
    }

    setSecondsAgo(0);

    const intervalId = window.setInterval(() => {
      const elapsed = Math.round((Date.now() - lastAutosavedTime) / 1000);
      setSecondsAgo(elapsed);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [lastAutosavedTime]);

  const emitChange = () => {
    const nextValue = editorRef.current?.innerHTML ?? "";
    draftValueRef.current = nextValue;
    setDraftValue(nextValue);
  };

  const applyFormat = (command: FormatCommand) => {
    editorRef.current?.focus();
    document.execCommand(command);
    emitChange();
  };

  const save = () => {
    persistValue();
    setLastAutosavedTime(null);
    setIsEditing(false);
  };

  const edit = () => {
    setDraftValue(value);
    setSavedValue(value);
    draftValueRef.current = value;
    savedValueRef.current = value;
    setLastAutosavedTime(null);
    setIsEditing(true);
  };

  const handleButtonClick = () => {
    if (lastAutosavedTime !== null) {
      setLastAutosavedTime(null);
      setIsEditing(false);
    } else {
      save();
    }
  };

  const isEmpty = isHtmlEmpty(value);
  const isDirty = draftValue !== savedValue;

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
            "cursor-pointer hover:text-white transition-colors outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 rounded [&_b]:font-bold [&_i]:italic [&_li]:my-1 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5",
            size === "base" ? "text-base font-normal leading-relaxed" : "wfrp-text",
            isEmpty ? "text-wfrp-muted-text/60 italic font-sans" : "text-gray-200"
          )}
          dangerouslySetInnerHTML={{ __html: isEmpty ? placeholder : value }}
        />
      </div>
    );
  }

  return (
    <div ref={fieldRef} className={className}>
      <div
        className={cn(
          "overflow-hidden rounded border bg-black/20 transition-colors focus-within:ring-1 focus-within:ring-wfrp-gold/30",
          isDirty 
            ? "border-wfrp-gold/60 focus-within:border-wfrp-gold/80" 
            : "border-wfrp-border focus-within:border-wfrp-border"
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
            const nextValue = event.currentTarget.textContent?.trim()
              ? event.currentTarget.innerHTML
              : "";
            event.currentTarget.innerHTML = nextValue;
            draftValueRef.current = nextValue;
            setDraftValue(nextValue);

            const nextFocusedElement = event.relatedTarget;
            if (!(nextFocusedElement instanceof Node) || !fieldRef.current?.contains(nextFocusedElement)) {
              persistValue(nextValue);
              setLastAutosavedTime(null);
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
          }}
          className={cn(
            "min-h-32 px-3 py-2.5 text-gray-200 outline-none [&:empty]:before:pointer-events-none [&:empty]:before:text-wfrp-muted-text [&:empty]:before:content-[attr(data-placeholder)] [&_b]:font-bold [&_i]:italic [&_li]:my-1 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5",
            size === "base" ? "text-base font-normal leading-relaxed" : "wfrp-text"
          )}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-wfrp-muted-text text-sm">
          {lastAutosavedTime !== null && `saved ${secondsAgo} second${secondsAgo === 1 ? "" : "s"} ago`}
        </div>
        <Button
          onClick={handleButtonClick}
          onPointerDown={(event) => event.preventDefault()}
          isGolden
          isDeactivated={lastAutosavedTime === null && !isDirty}
        >
          {lastAutosavedTime !== null ? "Close" : isDirty ? "Save" : "Saved"}
        </Button>
      </div>
    </div>
  );
}
