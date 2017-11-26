// https://gist.github.com/beaucharman/e46b8e4d03ef30480d7f4db5a78498ca
export const throttle = (callback, delay) => {
  let isThrottled = false, args, context;

  function wrapper() {
    if (isThrottled) {
      args = arguments;
      context = this;
      return;
    }

    isThrottled = true;
    callback.apply(this, arguments);
    
    setTimeout(() => {
      isThrottled = false;
      if (args) {
          wrapper.apply(context, args);
          args = context = null;
      }
    }, delay);
  }

  return wrapper;
}