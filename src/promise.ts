enum PromiseStateType {
    pending = "pending",
    reject = "reject",
    fulfilled = "fulfilled",
  }
  
  type PresolveHandler<T> = (value: T) => any;
  type PrejectHandler = (cause: any) => void;
  type Executor<T> = (res: PresolveHandler<T>, rej: PrejectHandler) => void;
  type PromiseFulfilledHandlerType<T> = (value: T) => any | void;
  type PromiseRejectedHandlerType = (reason: any) => any | void;
  
  export default class CustomPromise<T> {
    private promiseState: PromiseStateType = PromiseStateType.pending; // Tracks the current state of the promise
    private promiseResult!: T | any; // Holds the result of the promise (fulfilled or rejected value)
    private PromiseFulfilledHandler: PromiseFulfilledHandlerType<T> = () => {}; // Default handler for fulfillment
    private PromiseRejectedHandler: PromiseRejectedHandlerType = (reason) => {
      // Default error handler if user doesn't handle rejections
      throw new Error(reason || "Unhandled promise rejection");
    };
    private nextResolve!: PresolveHandler<any>; // For chaining the next resolve
    private nextReject!: PrejectHandler; // For chaining the next reject
  
    constructor(private executor: Executor<T>) {
      // Initialize the executor function and handle errors
      try {
        executor(this.PromiseResolveHandler, this.PromiseRejectHandler);
      } catch (err) {
        this.PromiseRejectHandler(err);
      }
    }
  
    // Function to handle promise resolution and set state to fulfilled
    private PromiseResolveHandler: PresolveHandler<T> = (value) => {
      if (this.promiseState !== PromiseStateType.pending) return; // Ensure state is pending before proceeding
  
      this.promiseState = PromiseStateType.fulfilled; // Update state to fulfilled
      this.promiseResult = value; // Store the resolved value
  
      // Add the fulfillment handler to the microtask queue, making it asynchronous
      queueMicrotask(() => {
        try {
          const result = this.PromiseFulfilledHandler(this.promiseResult); // Call the fulfillment handler with the resolved value
          if (this.nextResolve) this.nextResolve(result); // Pass the result to the next promise in the chain
        } catch (err) {
          if (this.nextReject) this.nextReject(err); // Pass any errors to the next rejection handler
        }
      });
    };
  
    // Function to handle promise rejection and set state to rejected
    private PromiseRejectHandler: PrejectHandler = (reason) => {
      if (this.promiseState !== PromiseStateType.pending) return; // Ensure state is pending before proceeding
  
      this.promiseState = PromiseStateType.reject; // Update state to rejected
      this.promiseResult = reason; // Store the rejection reason
  
      // Add the rejection handler to the microtask queue, making it asynchronous
      queueMicrotask(() => {
        try {
          const result = this.PromiseRejectedHandler(this.promiseResult); // Call the rejection handler with the rejection reason
          if (this.nextResolve) this.nextResolve(result); // Allow continuation if a recovery handler returns a value
        } catch (err) {
          if (this.nextReject) this.nextReject(err); // Pass any errors to the next rejection handler
        }
      });
    };
  
    // Function to handle `then` chaining and set the next fulfillment handler
    then = (onFulfilled: PromiseFulfilledHandlerType<T>): CustomPromise<any> => {
      return new CustomPromise((resolve, reject) => {
        // Set the current promise's fulfillment handler
        this.PromiseFulfilledHandler = (value) => {
          try {
            const result = onFulfilled(value); // Call the user's onFulfilled function
            resolve(result); // Resolve the next promise with the returned value
          } catch (err) {
            reject(err); // Reject the next promise if an error occurs
          }
        };
  
        // Link the next resolve and reject handlers
        this.nextResolve = resolve;
        this.nextReject = reject;
      });
    };
  
    // Function to handle `catch` chaining and set the rejection handler
    catch = (onRejected: PromiseRejectedHandlerType): CustomPromise<any> => {
      return new CustomPromise((resolve, reject) => {
        // Set the current promise's rejection handler
        this.PromiseRejectedHandler = (reason) => {
          try {
            const result = onRejected(reason); // Call the user's onRejected function
            resolve(result); // Resolve the next promise with the returned value
          } catch (err) {
            reject(err); // Reject the next promise if an error occurs
          }
        };
  
        // Link the next resolve and reject handlers
        this.nextResolve = resolve;
        this.nextReject = reject;
      });
    };
  
    // Function to handle `finally` logic, which runs regardless of promise state
    finally = (callback: () => void): CustomPromise<T> => {
      return new CustomPromise((resolve, reject) => {
        // Add the callback to both resolution and rejection paths
        const runCallback = () => {
          callback();
        };
  
        // Chain `then` and `catch` to ensure the callback always runs
        this.then((value) => {
          runCallback();
          resolve(value); // Pass the value through
        }).catch((reason) => {
          runCallback();
          reject(reason); // Pass the reason through
        });
      });
    };
  }
  