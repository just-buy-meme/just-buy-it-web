import { env } from "~/env";

import { type Message } from "../messaging";
import { fetchStream } from "../sse";

import { type ChatEvent } from "./types";

export function chatStream(
  userMessage: Message,
  state: { messages: { role: string; content: string }[] },
  options: { abortSignal?: AbortSignal } = {},
) {
  return fetchStream<ChatEvent>(env.NEXT_PUBLIC_API_URL + "/jaehwan/stream", {
    body: JSON.stringify({
      messages: [...state.messages, userMessage],
      debug:
        location.search.includes("debug") &&
        !location.search.includes("debug=false"),
    }),
    signal: options.abortSignal,
  });
}

export function recommendStream(
  userMessage: Message,
  state: { messages: { role: string; content: string }[] },
  options: { abortSignal?: AbortSignal } = {},
) {
  return fetchStream<ChatEvent>(env.NEXT_PUBLIC_API_URL + "/jaehwan/recommend", {
    body: JSON.stringify({
      messages: [...state.messages, userMessage],
      debug:
        location.search.includes("debug") &&
        !location.search.includes("debug=false"),
    }),
    signal: options.abortSignal,
  });
}
