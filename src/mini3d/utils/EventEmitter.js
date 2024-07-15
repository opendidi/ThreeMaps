export class EventEmitter {
  constructor() {
    // 用一个 map 来存放事件和事件回调
    this.events = new Map();
  }

  // 监听事件
  on(event, callback) {
    let callbacks = this.events.get(event); // 获取事件的回调函数列表
    // 如果不存在该事件的回调函数列表，则新建一个
    if (!callbacks) {
      callbacks = new Set();
      this.events.set(event, callbacks);
    }
    callbacks.add(callback); // 添加回调函数到列表中
  }

  // 取消监听事件
  off(event, callback) {
    const callbacks = this.events.get(event); // 获取事件的回调函数列表
    if (callbacks) {
      if (callback) {
        // 如果提供了回调函数，则删除指定的回调函数
        callbacks.delete(callback);
      } else {
        // 否则，将该事件的所有回调函数都删除
        this.events.delete(event);
      }
    }
  }

  // 触发事件
  emit(event, ...args) {
    const callbacks = this.events.get(event); // 获取事件的回调函数列表
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(...args); // 依次调用回调函数，并传递参数
      });
    }
  }

  // 绑定只执行一次的事件监听方法
  once(event, callback) {
    // 在一个匿名函数中包裹回调函数，用于在回调函数执行完毕后将其删除
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }
}
