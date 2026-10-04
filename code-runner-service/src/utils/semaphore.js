export class Semaphore {
  #available;
  #waiters = [];

  constructor(limit) {
    this.#available = limit;
  }

  async acquire() {
    if (this.#available > 0) {
      this.#available -= 1;
      return this.#releaseOnce();
    }

    return new Promise((resolve) => {
      this.#waiters.push(() => resolve(this.#releaseOnce()));
    });
  }

  #releaseOnce() {
    let released = false;

    return () => {
      if (released) return;
      released = true;

      const next = this.#waiters.shift();
      if (next) {
        next();
      } else {
        this.#available += 1;
      }
    };
  }
}
