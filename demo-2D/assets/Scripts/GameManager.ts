import {
  _decorator,
  Component,
  Node,
  Prefab,
  CCInteger,
  instantiate,
} from "cc";
const { ccclass, property } = _decorator;

enum BlockType {
  BT_NONE,
  BT_STONE,
}

const BLOCK_SIZE: number = 40;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Prefab })
  public boxPrefab: Prefab = null;
  @property({ type: CCInteger }) // 注意,这个玩意在编辑器里面是可以修改的,这里设置的数字只是初始默认值
  public roadLength: number = 0;

  private _road: BlockType[] = [];

  start() {
    this.generateRoad();
  }

  update(deltaTime: number) {}

  /**
   * 第一个空格是必须能战力,
   */
  generateRoad() {
    this.node.removeAllChildren();

    this._road = [];
    // startPos
    this._road.push(BlockType.BT_STONE);
    console.log(111,this._road,this.roadLength);
    
    for (let i = 1; i < this.roadLength; i++) {
      // 如果前面一个是空的,那么这个就是石头
      if (this._road[i - 1] === BlockType.BT_NONE) {
        this._road.push(BlockType.BT_STONE);
      } else {
        // 否则随机给空或者石头
        this._road.push(Math.floor(Math.random() * 2));
      }
    }

    console.log(this._road);
    

    for (let j = 0; j < this._road.length; j++) {
      let block: Node | null = this.spawnBlockByType(this._road[j]);
      if (block) {
        this.node.addChild(block);
        block.setPosition(j * BLOCK_SIZE, 0, 0);
      }
    }
  }

  spawnBlockByType(type: BlockType) {
    if (!this.boxPrefab) {
      return null;
    }

    let block: Node | null = null;
    switch (type) {
      case BlockType.BT_STONE:
        // 自带的方法,实例化一个节点
        block = instantiate(this.boxPrefab);
        break;
    }

    return block;
  }
}
