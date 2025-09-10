import type { WSMessage } from "@turbo-super/api";
import { create } from "zustand";

export type EventHandler = (eventData: WSMessage) => void;

type EventSourceStore = {
  connection: EventSource | null;
  handlers: EventHandler[];
  addHandlers: (handlers: EventHandler[]) => void;
  removeHandlers: (handlers: EventHandler[]) => void;
  initConnection: (url: string, handlers: EventHandler[]) => void;
};

export const createEventSourceStore = (name: string) =>
  create<EventSourceStore>((set, get) => ({
    connection: null,
    handlers: [],
    addHandlers: (newHandlers) => {
      const { handlers } = get();
      set({ handlers: [...handlers, ...newHandlers] });
    },
    removeHandlers: (delHandlers) => {
      const { handlers, connection } = get();

      const filteredHandlers = handlers.filter((h) => !delHandlers.includes(h));

      set({ handlers: filteredHandlers });

      if (filteredHandlers.length === 0 && connection) {
        connection.close();
        set({ connection: null });
      }
    },
    initConnection: (url, handlers) => {
      const { connection, addHandlers, removeHandlers } = get();

      if (connection) {
        if ((connection as any).url === url) return;
        connection.close();
      }

      const eventSource = new EventSource(url);

      const channel = url.split("/").pop();

      eventSource.onopen = () => {
        addHandlers(handlers);
        console.log(`${name} SSE connected. Channel: ${channel}`);
      };

      eventSource.onerror = () => {
        console.log(`${name} SSE error. Channel: ${channel}`);
      };

      eventSource.onmessage = (event) => {
        const { handlers } = get();
        const eventData = JSON.parse(event.data as string) as WSMessage;
        handlers.forEach((h) => {
          h(eventData);
        });
      };

      eventSource.addEventListener("error", () => {
        // reconnect handled automatically by EventSource
        removeHandlers(handlers);
        console.log(`${name} SSE disconnected. Channel: ${channel}`);
      });

      set({ connection: eventSource });
    },
  }));
