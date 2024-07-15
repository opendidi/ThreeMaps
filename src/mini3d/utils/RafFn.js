/**
 * requestAnimationFrame 动画控制函数
 * @param {function} callback 动画回调函数
 * @return {Object} 包含相关控制方法的对象
 */
export function RafFn(callback) {
  let rafId = null; // 当前 requestAnimationFrame 的 ID
  let isActive = false; // 是否处于活跃状态
  let paused = false; // 是否处于暂停状态

  /**
   * 执行动画的函数
   */
  function animate() {
    if (!isActive || paused) return; // 如果不活跃或暂停，不执行回调

    callback(); // 执行回调函数
    rafId = requestAnimationFrame(animate); // 继续请求下一帧
  }

  /**
   * 启动动画的函数
   */
  function start() {
    if (!isActive) {
      isActive = true; // 设置为活跃状态
      animate(); // 开始执行动画
    }
  }

  /**
   * 暂停动画的函数
   */
  function pause() {
    if (isActive) {
      isActive = false; // 设置为不活跃状态
      paused = true; // 标记为暂停
      cancelAnimationFrame(rafId); // 取消当前帧
    }
  }

  /**
   * 恢复动画的函数
   */
  function resume() {
    if (!isActive && paused) {
      isActive = true; // 恢复为活跃状态
      paused = false; // 取消暂停标记
      animate(); // 直接执行动画而不是重新调用 start
    }
  }

  // 返回一个包含控制方法的对象
  return {
    start,
    pause,
    resume,
    isActive: () => isActive, // 使用函数返回状态，因为 isActive 可能在回调中改变
  };
}
