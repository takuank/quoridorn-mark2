import {
  WindowDeclareInfo,
  WindowInfo,
  WindowOpenInfo,
  WindowTableInfo
} from "@/@types/window";
import TaskManager from "../../../core/task/TaskManager";
import { calcWindowPosition, createPoint } from "@/app/core/Coordinate";
import { Point } from "@/@types/address";
import { getCssPxNum } from "@/app/core/Css";

type WindowDeclareInfoContainer = {
  [type: string]: WindowDeclareInfo;
};

const windowDeclareInfo: WindowDeclareInfoContainer = require("./window.yaml");

export default class WindowManager {
  // シングルトン
  public static get instance(): WindowManager {
    if (!this._instance) this._instance = new WindowManager();
    return this._instance;
  }
  private static _instance: WindowManager;

  public static createFilter = (status: string) => (
    list: WindowInfo<unknown>[]
  ) => list.filter(info => info.status.indexOf(status) > -1);

  // コンストラクタの隠蔽
  private constructor() {}

  private readonly windowDeclareInfoContainer = Object.seal(windowDeclareInfo);
  private readonly __windowInfoList: WindowInfo<unknown>[] = [];
  private key: number = 0;

  public get windowInfoList() {
    return this.__windowInfoList;
  }

  public getWindowInfo<T>(key: string): WindowInfo<T> {
    return this.__windowInfoList.filter(
      info => info.key === key
    )[0] as WindowInfo<T>;
  }

  private resist<T>(type: string, declare: WindowDeclareInfo, args: T): string {
    const tableInfoList: WindowTableInfo[] = declare.tableInfoList.map(
      tableInfo => ({
        selectLineKey: null,
        hoverLineIndex: null,
        operateDividerIndex: null,
        columnWidthList: tableInfo.initColumnWidthList.concat()
      })
    );

    const windowSize = declare.size;
    const position = declare.position;
    const menuHeight = getCssPxNum("--menu-bar-height");
    const point = calcWindowPosition(position, windowSize, menuHeight);

    const key = `window-${this.key++}`;
    this.__windowInfoList.push({
      key,
      title: declare.title,
      status: "window",
      message: declare.message,
      args,
      type,
      declare,
      ...point,
      ...windowSize,
      order: this.__windowInfoList.length,
      paneOrder: this.__windowInfoList.length,
      paneY: 0,
      isLocked: false,
      isMinimized: false,
      minimizeIndex: 0,
      isMinimizeAnimationEnd: false,
      tableInfoList
    });
    this.arrangePoint(key);
    return key;
  }

  public arrangePoint(targetKey: string) {
    const target = this.__windowInfoList.filter(
      info => info.key === targetKey
    )[0];
    this.__windowInfoList.forEach(info => {
      if (info.key === targetKey) return;
      if (info.isMinimized) return;
      if (info.status !== "window") return;
      if (info.x !== target.x || info.y !== target.y) return;

      const arrangeDistance = getCssPxNum("--window-title-height");
      const arrange: Point = createPoint(arrangeDistance, arrangeDistance);

      const position = target.declare.position;
      if (typeof position === "string") {
        if (position.toString().indexOf("right") > -1) arrange.x *= -1;
        if (position.toString().indexOf("bottom") > -1) arrange.y *= -1;
      }
      target.x += arrange.x;
      target.y += arrange.y;
      this.arrangePoint(targetKey);
    });
  }

  public async open<T>(type: string, args?: T) {
    const key = this.resist(type, this.windowDeclareInfoContainer[type], args);
    await TaskManager.instance.ignition<WindowOpenInfo<T>>({
      type: "window-open",
      owner: "Quoridorn",
      value: { type, key, args }
    });
  }
}
