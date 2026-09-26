"use client";

import { useId, useRef, useState } from "react";
import { RichText } from "./RichText";
import type { FormField, FormSection } from "@/lib/content-types";
import { cn } from "@/lib/cn";

export interface ContactFormProps {
  form: FormSection;
  /** From site.json. Empty string switches the form to the mailto: fallback. */
  endpoint: string;
  /** Recipient for the mailto: fallback. */
  fallbackEmail: string;
  optionalLabel: string;
  headingId?: string;
}

type Values = Record<string, string>;
type Errors = Record<string, string>;
type Status = "idle" | "sending" | "sent" | "mailto" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTROL =
  "w-full border border-steel bg-white px-4 py-3 text-base wdth-body text-asphalt " +
  "transition-colors duration-150 placeholder:text-steel-ink";

/**
 * The site is a static export, so there is no server to post to.
 *
 * With `contactFormEndpoint` set, the form POSTs JSON to that third-party
 * endpoint. With it empty, the form composes a mailto: instead, so the page is
 * never a dead end while the endpoint is still being decided.
 */
export function ContactForm({
  form,
  endpoint,
  fallbackEmail,
  optionalLabel,
  headingId,
}: ContactFormProps) {
  const baseId = useId();
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  // Errors appear only after the first submit, so the form does not scold
  // someone who is still filling it in.
  const [submitted, setSubmitted] = useState(false);
  const errorSummary = useRef<HTMLDivElement>(null);

  const usesMailto = endpoint.trim() === "";
  // No endpoint and no confirmed address means there is nowhere to send. Say
  // so rather than opening an empty mail composer and claiming success.
  const canSubmit = !usesMailto || fallbackEmail !== "";

  function validate(next: Values): Errors {
    const found: Errors = {};

    for (const field of form.fields) {
      const value = (next[field.name] ?? "").trim();

      if (field.required && !value) {
        found[field.name] = form.requiredMessage;
        continue;
      }
      if (field.type === "email" && value && !EMAIL_PATTERN.test(value)) {
        found[field.name] = form.emailMessage;
      }
    }

    return found;
  }

  function update(name: string, value: string) {
    const next = { ...values, [name]: value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  }

  function composeMailto(): string {
    const subject = values.subject || form.heading || "";
    const body = form.fields
      .map((field) => `${field.label}: ${values[field.name] ?? ""}`)
      .join("\n");

    return `mailto:${fallbackEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length) {
      errorSummary.current?.focus();
      return;
    }

    if (usesMailto) {
      window.location.href = composeMailto();
      setStatus("mailto");
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(values),
      });

      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent" || status === "mailto") {
    const isMailto = status === "mailto";

    return (
      <div className="border-l-[3px] border-brand bg-white p-6 md:p-8" role="status">
        <h3 className="text-h3 wdth-heading">
          <RichText text={isMailto ? form.mailtoHeading : form.successHeading} />
        </h3>
        <p className="mt-3 max-w-(--container-measure) text-base text-steel-ink wdth-body">
          <RichText text={isMailto ? form.mailtoBody : form.successBody} />
        </p>
      </div>
    );
  }

  if (!canSubmit) {
    return (
      <p className="border-l-[3px] border-brand bg-white p-6 text-base text-asphalt wdth-body md:p-8">
        <RichText text={form.unavailableMessage} />
      </p>
    );
  }

  const errorList = form.fields.filter((field) => errors[field.name]);

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby={headingId}>
      <div
        ref={errorSummary}
        tabIndex={-1}
        aria-live="polite"
        className={cn(errorList.length || status === "error" ? "mb-6" : "sr-only")}
      >
        {status === "error" ? (
          <p className="border-l-[3px] border-error bg-white p-4 text-base text-asphalt wdth-body">
            <RichText text={form.errorMessage} />
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {form.fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            id={`${baseId}-${field.name}`}
            value={values[field.name] ?? ""}
            error={errors[field.name]}
            optionalLabel={optionalLabel}
            onChange={(value) => update(field.name, value)}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className={cn(
            "inline-flex items-center justify-center px-6 py-3 text-base font-semibold wdth-body",
            "bg-brand text-white transition-colors duration-150 hover:bg-brand-deep",
            "disabled:cursor-not-allowed disabled:opacity-70",
          )}
        >
          <RichText text={status === "sending" ? form.sendingLabel : form.submitLabel} />
        </button>

        {usesMailto ? (
          <p className="text-sm text-steel-ink wdth-body">
            <RichText text={form.fallbackNote} />
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  field,
  id,
  value,
  error,
  optionalLabel,
  onChange,
}: {
  field: FormField;
  id: string;
  value: string;
  error?: string;
  optionalLabel: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  const isWide = field.type === "textarea";

  const shared = {
    id,
    name: field.name,
    value,
    required: field.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: cn(CONTROL, error && "border-error"),
  };

  return (
    <div className={cn("flex flex-col gap-2", isWide && "sm:col-span-2")}>
      <label htmlFor={id} className="text-sm font-semibold wdth-body">
        <RichText text={field.label} />
        {field.required ? null : (
          <span className="ml-2 font-normal text-steel-ink">
            <RichText text={optionalLabel} />
          </span>
        )}
      </label>

      {field.type === "textarea" ? (
        <textarea {...shared} rows={6} onChange={(event) => onChange(event.target.value)} />
      ) : field.type === "select" ? (
        <select {...shared} onChange={(event) => onChange(event.target.value)}>
          <option value="" />
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...shared}
          type={field.type}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {error ? (
        <p id={errorId} className="text-sm font-medium text-error wdth-body">
          <RichText text={error} />
        </p>
      ) : null}
    </div>
  );
}
