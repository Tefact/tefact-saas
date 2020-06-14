import { ImageNodeModel, TextNodeModel, TableNodeModel } from '~/utils/entities/editor/node';

export const BorderStyle = [
  { value: 'solid', label: '直线' },
  { value: 'dotted', label: '短虚线' },
  { value: 'dashed', label: '长虚线' },
  { value: 'double', label: '双层' },
]

export const NodeResoluConfig = {
  text: {
    title: '文字元素配置',
    hasTab: true,
    tabs: [
      {
        title: '基本信息',
        components: [
          { type: 'PositionResolu', params: {} },
          { type: 'BackgroundResolu', params: {} },
          { type: 'BorderResolu', params: {} },
          { type: 'TextResolu', params: {} },
        ],
      }, {
        title: '数据展示',
        components: [],
      },
    ],
  },
  image: {
    title: '文字元素配置',
    hasTab: true,
    tabs: [
      {
        title: '基本信息',
        components: [
          { type: 'PositionResolu', params: {} },
          { type: 'BackgroundResolu', params: {} },
          { type: 'BorderResolu', params: {} },
          { type: 'TextResolu', params: {} },
        ],
      }, {
        title: '数据展示',
        components: [],
      },
    ],
  },
  page: {
    title: '段落配置',
    hasTab: true,
    tabs: [
      {
        title: '基本信息',
        components: [
          { type: 'BackgroundResolu', params: {} },
          { type: 'BorderResolu', params: {} },
        ],
      },
    ],
  },
  section: {
    title: '页面配置',
    hasTab: true,
    tabs: [
      {
        title: '基本信息',
        components: [
          { type: 'BackgroundResolu', params: {} },
          { type: 'BorderResolu', params: {} },
        ],
      },
    ],
  },
  table: {
    title: '数据表配置',
    hasTab: true,
    tabs: [
      {
        title: '基本信息',
        components: [
          { type: 'BackgroundResolu', params: {} },
          { type: 'BorderResolu', params: {} },
        ],
      },
      {
        title: '数据',
        components: [
          { type: 'EntityResolu', params: {} },
        ],
      },
    ],
  },
}

export const NodeTypeToComponent = {
  text: "TextNode",
  image: "ImageNode",
  html: "HtmlNode",
  table: "TableNode",
}

export const BaseNodeStyle = {
  'border-width': 0,
  'font-size': 12,
  'font-color': '#333',
}

export const NodeDefaultData = {
  page: {
    config: {
      style: { ...BaseNodeStyle },
    },
  },
  section: {
    config: {
      style: { ...BaseNodeStyle },
    },
  },
  text: {
    type: 'text',
    config: {
      x: 30,
      y: 30,
      w: 120,
      h: 80,
      style: { ...BaseNodeStyle },
    },
    data: {
      text: '请输入文字',
    },
  } as TextNodeModel,
  image: {
    type: 'image',
    config: {
      x: 30,
      y: 30,
      w: 100,
      h: 100,
      style: { ...BaseNodeStyle },
    },
    data: {
      url: null,
      title: '',
    },
  } as ImageNodeModel,
  table: {
    type: 'table',
    config: {
      x: 30,
      y: 30,
      w: 500,
      h: 150,
      style: { ...BaseNodeStyle },
    },
    data: {
      dataSourceId: null,
      entityId: null,
      url: null,
      title: '',
    },
  } as TableNodeModel,
}

export const NodeListConstants = [
  {
  icon: 'tf-icon-Text',
  type: 'text',
  title: '文字',
  nodeData: NodeDefaultData.text,
}, {
  icon: 'tf-icon-image',
  type: 'image',
  title: '图片',
  nodeData: NodeDefaultData.image,
}, {
  icon: 'tf-icon-iconfonticonbiaoge',
  type: 'table',
  title: '数据表',
  nodeData: NodeDefaultData.table,
}, {
  icon: 'tf-icon-code',
  type: 'html',
  title: 'HTML',
}, {
  icon: 'tf-icon-integral',
  type: 'div',
  title: '层',
}, {
  icon: 'tf-icon-nav-list',
  type: 'list',
  title: '列表',
}, {
  icon: 'tf-icon-mtbutton',
  type: 'button',
  title: '按钮',
}]
