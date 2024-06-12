import { assertEquals } from "jsr:@std/assert";
import {
  afterEach,
  describe,
  it,
} from "https://deno.land/std@0.224.0/testing/bdd.ts";
import { Store } from "./lib/store.ts";

const userSym = Symbol("user");

describe("store", () => {
  const store = new Store();

  afterEach(() => {
    store._empty();
  });

  it("stores a new Key-value", () => {
    const userName = "samuel jackson";
    store.save(userSym, userName);
    assertEquals(store.get(userSym), userName);
  });

  it("updates a key-value", () => {
    const userName = "samuel jackson";
    store.save(userSym, userName);
    assertEquals(store.get(userSym), userName);

    const newUserName = "samuel l jackson";
    store.save(userSym, newUserName);
    assertEquals(store.get(userSym), newUserName);
  });

  it("removes a key-value", () => {
    const userName = "samuel jackson";
    store.save(userSym, userName);
    assertEquals(store.get(userSym), userName);

    let isRemoved = false;

    store.remove(userSym, () => (isRemoved = true));
    assertEquals(store.get(userSym), undefined);
    assertEquals(isRemoved, true);
  });

  it("on adding a value, notifies all subscribers", () => {
    let updatedUserName = "";
    store.subscribe(userSym, (v) => {
      updatedUserName = v;
    });

    let helloUserName = "";
    store.subscribe(userSym, (v) => {
      helloUserName = `hello ${v}`;
    });

    const userName = "samuel jackson";
    store.save(userSym, userName);
    assertEquals(store.get(userSym), userName);

    const t = setTimeout(() => {
      assertEquals(updatedUserName, userName);
      assertEquals(helloUserName, `hello ${userName}`);
    }, 200);
    clearTimeout(t);
  });

  it("on updating value, subscribers get update", () => {
    const userName = "samuel jackson";
    store.save(userSym, userName);
    assertEquals(store.get(userSym), userName);

    let updatedUserName = "";
    store.subscribe(userSym, (v) => {
      updatedUserName = v;
    });

    let helloUserName = "";
    store.subscribe(userSym, (v) => {
      helloUserName = `hello ${v}`;
    });

    const newUserName = "samuel l jackson";
    store.save(userSym, newUserName);
    assertEquals(store.get(userSym), newUserName);

    const t = setTimeout(() => {
      assertEquals(updatedUserName, newUserName);
      assertEquals(helloUserName, `hello ${newUserName}`);
    }, 200);
    clearTimeout(t);
  });

  it("on removing a key, notifies removal", () => {
    let removedSubscriber1 = false;
    store.subscribe(
      userSym,
      () => {},
      () => (removedSubscriber1 = true)
    );

    let removedSubscriber2 = false;
    store.subscribe(
      userSym,
      () => {},
      () => (removedSubscriber2 = true)
    );

    const newUserName = "samuel l jackson";
    store.save(userSym, newUserName);
    assertEquals(store.get(userSym), newUserName);

    let isRemoved = false;
    store.remove(userSym, () => (isRemoved = true));
    assertEquals(store.get(userSym), undefined);
    assertEquals(isRemoved, true);

    const t = setTimeout(() => {
      assertEquals(removedSubscriber1, true);
      assertEquals(removedSubscriber2, true);
    }, 200);
    clearTimeout(t);
  });

  it("unsubscribing no longer updates", () => {
    let currentValue = "";
    const unsubscribe = store.subscribe(userSym, (v) => {
      currentValue = v;
    });

    store.save(userSym, "1");
    assertEquals(store.get(userSym), "1");

    const t1 = setTimeout(() => {
      assertEquals(currentValue, "1");
    }, 200);
    clearTimeout(t1);

    unsubscribe();

    store.save(userSym, "2");
    assertEquals(store.get(userSym), "2");

    const t2 = setTimeout(() => {
      assertEquals(currentValue, "1");
    }, 200);
    clearTimeout(t2);
  });
});
