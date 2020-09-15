# 用流的思想重写canvas画笔

## 设计理念

* 纯函数，去掉所有类和`this`
* 一个函数就是一个组件，类似 `react hooks`，只不过输入和输出都是`流`

## 技术选型

* 流式编程采用 `xstream` 库
* 画板用canvas，有做缓存

## 逻辑划分

* 两个画板，下面的画图形，上面的画图形的一些选中、hover状态等，这样可以减少重绘次数
* 上下两个画板同时只能有一个处于绘画状态
* 简单的 `撤销/重做` 功能