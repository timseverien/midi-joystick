export default class EventHandler {
  private eventHandlersMapping = new Map<string, Function[]>();

  protected emit(event: string, ...args: any[]) {
    if (!this.eventHandlersMapping.has(event)) {
      return;
    }

    for (const eventHandler of this.eventHandlersMapping.get(event)) {
      eventHandler(...args);
    }
  }

  public on(event: string, handler: Function): void {
    if (!this.eventHandlersMapping.has(event)) {
      this.eventHandlersMapping.set(event, [handler]);
    } else {
      this.eventHandlersMapping.get(event).push(handler);
    }
  }
}
