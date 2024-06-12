# Reactive store
A key value store with subscription for listening to update on the value

### usage
```ts
    const userStore = new Store();
    userStore.save("user_id_1", "samuel jackson")

    const unsubscribe = userStore.subscribe(
        "user_id_1",
        (value) => {...}, // update function
        () => {} // cleanup function
    )

    userStore.save("user_id_1", "samuel l jackson")
    
    unsubscribe();

    userStore.remove("user_id_1");
```