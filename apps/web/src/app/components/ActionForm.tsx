"use client";

import { useActionState, useEffect, useRef } from "react";
import { useToast } from "./Toast";

export type ActionState = { error: string | null };

const initialState: ActionState = { error: null };

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  success?: string;
  children: React.ReactNode;
  className?: string;
};

export default function ActionForm({ action, success, children, className }: Props) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const prevState = useRef(state);

  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    if (state.error) {
      showToast(state.error, "error");
    } else if (success && state !== initialState) {
      showToast(success, "success");
    }
  }, [state, success, showToast]);

  return (
    <form action={formAction} className={className}>
      <fieldset disabled={isPending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
