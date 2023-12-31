import {
  _decorator,
  Component,
  Node,
  input,
  Vec3,
  Input,
  EventMouse,
  Animation,
  EventTouch,
} from "cc";
const { ccclass, property } = _decorator;

const BLOCK_SIZE: number = 40;

@ccclass("NewComponent")
export class PlayerController extends Component {
  private _startJump: boolean = false;
  private _jumpStep: number = 0;
  private _curJumpTime: number = 0;
  private _jumpTime: number = 0.5;
  private _curJumpSpeed: number = 0;
  private _curPos: Vec3 = new Vec3();
  private _deltaPos: Vec3 = new Vec3(0, 0, 0);
  private _targetPos: Vec3 = new Vec3();

  private _curMoveIndex: number = 0;

  @property(Node)
  leftTouch: Node = null;

  @property(Node)
  rightTouch: Node = null;

  @property(Animation)
  public BodyAnim: Animation = null;

  start() {
    // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
  }

  setInputActive(active: boolean) {
    // if (active) {
    //   input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    // } else {
    //   input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    // }

    if (active) {
      this.leftTouch.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
      this.rightTouch.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    } else {
      this.leftTouch.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
      this.rightTouch.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }
  }

  reset() {
    this._curMoveIndex = 0;
  }

  onTouchStart(event: EventTouch) {
    const target = event.target as Node;
    if (target?.name == "LeftTouch") {
      this.jumpByStep(1);
    } else {
      this.jumpByStep(2);
    }
  }

  update(deltaTime: number) {
    if (this._startJump) {
      this._curJumpTime += deltaTime; // 累计总的跳跃时间
      if (this._curJumpTime > this._jumpTime) {
        // 当跳跃时间是否结束
        // end
        this.node.setPosition(this._targetPos); // 强制位置到终点
        this._startJump = false; // 清理跳跃标记
        this.onOnceJumpEnd();
      }
      // else if (this._curJumpTime > this._jumpTime / 2) {
      //   this.node.getPosition(this._curPos);
      //   this._deltaPos.x = this._curJumpSpeed * deltaTime * BLOCK_SIZE; //每一帧根据速度和时间计算位移
      //   this._deltaPos.y = -this._curJumpSpeed * deltaTime * BLOCK_SIZE; //每一帧根据速度和时间计算位移
      //   Vec3.add(this._curPos, this._curPos, this._deltaPos); // 应用这个位移
      //   this.node.setPosition(this._curPos); // 将位移设置给角色
      // }
      else {
        // tween  不知道意义是什么 但是这个有返回值
        this.node.getPosition(this._curPos);
        // 之所以只控制x轴是因为y轴是动画控制的,动画不可以去控制x,因为x是一直在变化的,目前看起来动画只能控制不变的y
        this._deltaPos.x = this._curJumpSpeed * deltaTime * BLOCK_SIZE; //每一帧根据速度和时间计算位移
        Vec3.add(this._curPos, this._curPos, this._deltaPos); // 应用这个位移
        this.node.setPosition(this._curPos); // 将位移设置给角色
      }
    }
  }

  onMouseUp(event: EventMouse) {
    console.log(event.getButton());

    if (event.getButton() === 0) {
      this.jumpByStep(1);
    } else if (event.getButton() === 2) {
      this.jumpByStep(2);
    }
  }

  jumpByStep(step: number) {
    if (this._startJump) {
      return;
    }
    // 不同的步数的动画时间不同,速度也不同
    const clipName = step === 1 ? "oneStep" : "twoStep";
    const state = this.BodyAnim.getState(clipName); // 获取动画的信息
    this._jumpTime = state.duration; // 获取动画的时间

    this._startJump = true; // 标记开始跳跃
    this._jumpStep = step; // 跳跃的步数 1 或者 2
    this._curJumpSpeed = this._jumpStep / this._jumpTime; // 根据时间计算出速度
    this._curJumpTime = 0; // 重置开始跳跃的时间
    this.node.getPosition(this._curPos); // 获取角色当前的位置
    // Vec3.add，用于计算两个向量相加，并将结果存储在第一个参数 _targetPos 里面
    Vec3.add(
      this._targetPos,
      this._curPos,
      new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0)
    ); // 计算出目标位置

    if (this.BodyAnim) {
      this.BodyAnim.play(clipName);
    }

    this._curMoveIndex += step;
  }

  onOnceJumpEnd() {
    this.node.emit("JumpEnd", this._curMoveIndex);
  }
}
