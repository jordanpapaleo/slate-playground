import { isEqual } from "lodash";

export default class PubSub<V> {
  mostRecentValue: V | undefined;
  subscriptions: ((newValue: V) => unknown)[];

  constructor() {
    this.subscriptions = [];
  }

  publish(value: V) {
    // Don't publish if it's (deeply) the same value as the most recent publish.
    if (isEqual(value, this.mostRecentValue)) return false;

    // Store this value as the most recent publish.
    this.mostRecentValue = value;

    // Send the value to all subscribers.
    this.subscriptions.forEach((callback) => callback(value));

    return true;
  }

  subscribe(callback: (newValue: V) => unknown) {
    // If there is already a list, mutate it to add the new callback.
    this.subscriptions.push(callback);

    // If there has already been a recent value published, send it out now.
    const mostRecentValue = this.mostRecentValue;
    if (mostRecentValue !== undefined) {
      callback(mostRecentValue);
    }
  }

  unsubscribe(callback: (newValue: V) => unknown) {
    const list = this.subscriptions;
    if (!list) return;

    while (true) {
      const index = list.indexOf(callback);
      if (!index) break;

      list.splice(index, 1);
    }
  }
}
