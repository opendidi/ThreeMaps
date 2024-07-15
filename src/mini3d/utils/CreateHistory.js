export class createHistory {
  constructor() {
    this.past = []; // 过去的
    this.future = []; // 未来的
    this.present = undefined; // 当前的
  }
  gotoState(index) {
    const allState = [...this.past, this.present, ...this.future];
    this.present = allState[index];
    this.past = allState.slice(0, index);
    this.future = allState.slice(index + 1, allState.length);
  }
  // 获取当前状态index
  getIndex() {
    return this.past.length;
  }
  // 保存当前状态
  push(currentState) {
    // 将状态都保存，并更新当前状态

    if (this.present) {
      this.past.push(this.present);
    }
    this.present = currentState;
  }
  // 后退
  undo() {
    if (this.past.length !== 0) {
      this.gotoState(this.getIndex() - 1);
    }
  }
  // 前进
  redo() {
    if (this.future.length !== 0) {
      this.gotoState(this.getIndex() + 1);
    }
  }
}
