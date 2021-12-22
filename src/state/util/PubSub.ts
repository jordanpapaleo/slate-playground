export default class PubSub<V> {
  subscriptions: Map<string, ((newValue: V) => unknown)[]>;

  constructor() {
    this.subscriptions = new Map();
  }

  subscribe(key: string, callback: (newValue: V) => unknown) {
    const list = this.subscriptions.get(key);
    if (list) {
      // If there is already a list, mutate it to add the new callback.
      list.push(callback);
    } else {
      // Otherwise, set a new list for that key, containing the callback.
      this.subscriptions.set(key, [callback]);
    }
  }

  unsubscribe(key: string, callback: (newValue: V) => unknown) {
    const list = this.subscriptions.get(key);
    if (!list) return;

    while (true) {
      const index = list.indexOf(callback);
      if (!index) break;

      if (list.length === 1) {
        this.subscriptions.delete(key);
        return;
      }

      list.splice(index, 1);
    }
  }
}
