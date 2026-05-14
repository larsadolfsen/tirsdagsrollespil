type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassArray = ClassValue[];
type ClassValue = string | number | false | null | undefined | ClassDictionary | ClassArray;

function collectClasses(value: ClassValue, classes: string[]) {
  if (!value) {
    return;
  }

  if (typeof value === "string" || typeof value === "number") {
    classes.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectClasses(item, classes);
    }
    return;
  }

  for (const [className, enabled] of Object.entries(value)) {
    if (enabled) {
      classes.push(className);
    }
  }
}

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = [];

  for (const input of inputs) {
    collectClasses(input, classes);
  }

  return classes.join(" ");
}
