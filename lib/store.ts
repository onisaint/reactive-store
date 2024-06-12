type Key = string | symbol;
type Subscriber = (value: string) => void;

/**
 * save, update and delete a key value pair with support for triggers.
 * with support for running a function (subscribers) every time there is an update to the key
 *
 * NOTE!: read operations doesn't notify subscribers
 *
 * @example
 * ```ts
 *  const userStore = new Store();
 *
 *  userStore.save("user_id_1", "samuel jackson")
 *
 *  const unsubscribe = userStore.subscribe(
 *  "user_id_1",
 *  (value) => {...}, // update function
 *  () => {} // cleanup function
 *  )
 *
 *  userStore.save("user_id_1", "samuel l jackson")
 *
 *  userStore.remove("user_id_1")
 * ```
 */
class Store {
  private objectStore: Map<Key, string> = new Map();
  private subscribers: Record<Key, Map<Subscriber, (() => void) | undefined>> =
    {};

  private updateSubscribers(key: Key, value: string) {
    // push updating subscribers to later until the current call stack is empty
    const t = setTimeout(() => {
      if (this.subscribers[key]) {
        for (const onUpdate of this.subscribers[key].keys()) {
          onUpdate(value);
        }
      }
      clearTimeout(t);
    }, 0);
  }

  /**
   * get a stored value
   *
   * @returns stored value if present or undefined
   */
  get(key: Key): string | undefined {
    return this.objectStore.get(key);
  }

  /**
   * list all the stored keys
   *
   * @returns stored value if present or undefined
   */
  listKeys(): IterableIterator<Key> {
    return this.objectStore.keys();
  }

  /**
   * save a key value to store
   *
   * this triggers subscribers if added before the key is added
   *
   * @param key identifier
   * @param value
   */
  save(key: Key, value: string): void {
    this.objectStore.set(key, value);
    this.updateSubscribers(key, value);
  }

  /**
   * remove the key from store and all the attached subscribers
   *
   * @param key identifier
   * @param onComplete runs when all the operations are complete
   */
  remove(key: Key, onComplete?: () => void): void {
    this.objectStore.delete(key);

    if (this.subscribers[key]) {
      for (const onRemove of this.subscribers[key].values()) {
        if (onRemove) {
          onRemove();
        }
      }

      this.subscribers[key].clear();
      delete this.subscribers[key];
    }

    if (onComplete) {
      onComplete();
    }
  }

  /**
   * @deprecated internal use only
   *
   * clears the entire store and subscribers
   */
  _empty(): void {
    this.objectStore.clear();
    this.subscribers = {};
  }

  /**
   * add a listener to a key, runs every time value for key is updated
   *
   * @param key identifier
   * @param onUpdate function to run after a value for the identifier is updated
   * @param onRemove function to run when the identifier is removed
   * @returns a function to unsubscribe (stop listening for updates)
   */
  subscribe(
    key: Key,
    onUpdate: Subscriber,
    onRemove?: () => void
  ): () => boolean {
    if (!this.subscribers[key]) {
      this.subscribers[key] = new Map();
    }

    this.subscribers[key].set(onUpdate, onRemove || undefined);

    return () => {
      if (this.subscribers[key]) {
        this.subscribers[key].delete(onUpdate);
        return true;
      }

      return false;
    };
  }
}

export { Store };
