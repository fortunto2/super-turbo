import type { WSMessage } from '@turbo-super/api';
import { create } from 'zustand';

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

      const channel = url.split('/').pop();

      eventSource.onopen = () => {
        addHandlers(handlers);
        console.log(`✅ ${name} SSE connected. Channel: ${channel}`);
      };

      eventSource.onerror = (error) => {
        console.error(`❌ ${name} SSE error. Channel: ${channel}`, error);
        console.error(`❌ ${name} SSE readyState:`, eventSource.readyState);
      };

      eventSource.onmessage = (event) => {
        const { handlers } = get();
        console.log(`📨 ${name} SSE message received:`, event.data);
        try {
          const eventData = JSON.parse(event.data as string) as WSMessage;
          console.log(`📨 ${name} SSE parsed event:`, eventData);
          handlers.forEach((h) => {
            h(eventData);
          });
        } catch (error) {
          console.error(`❌ ${name} SSE JSON parse error:`, error);
          console.error(`❌ ${name} SSE raw data:`, event.data);
        }
      };

      eventSource.addEventListener('error', () => {
        // reconnect handled automatically by EventSource
        removeHandlers(handlers);
        console.log(`${name} SSE disconnected. Channel: ${channel}`);
      });

      set({ connection: eventSource });
    },
  }));
