require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

// 获取图片相关数据
let imageDatas = require('../data/imageDatas.json');

// 利用自执行函数，将图片信息转成图片URL路径信息
imageDatas = (function(){
  for (let i = 0; i < imageDatas.length; i++) {
    let singleImage = imageDatas[i];
    singleImage.imgUrl = require('../images/' + singleImage.fileName);
    imageDatas[i] = singleImage;
  }
  return imageDatas;
})(imageDatas);


// 获取指定区间的随机数
function getRangRandom(low, high){
  return Math.ceil(Math.random() * (high - low) + low);
}

// 随机获取一个0-30度的角度
function get30DegRandom(){
  return (Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30);
}


// 自定义图片组件 ImgFigure
let ImgFigure = React.createClass({
  handleClick: function(event){
    event.stopPropagation();
    event.preventDefault();

    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
  },

  render: function(){
    let styleObj = null;
    // 图片定位
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }

    // 图片旋转
    if(this.props.arrange.rotate){
      // WebkitTransform MozTransform Otransform
      ['MozTransform', 'msTransform', 'WebkitTransform', 'OTransform', 'transform'].forEach(function(value){
        styleObj[value] = 'rotate('+ this.props.arrange.rotate +'deg)';
      }.bind(this))
    }

    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    }

    let imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

    return  <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
              <img src={this.props.data.imgUrl} alt={this.props.data.title} />
              <figcaption>
                <h2 className="img-title">{this.props.data.title}</h2>
                <div className="img-back" onClick={this.handleClick}>
                  <p>{this.props.data.desc}</p>
                </div>
              </figcaption>
            </figure>
  }
})


// 控制导航
let ControllerUnit = React.createClass({
  handleClick: function(event){
    event.preventDefault();
    event.stopPropagation();

    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }


  },
  render: function(){
    let controllerUnitClass = 'controller-unit';
        controllerUnitClass += this.props.arrange.isCenter ? ' is-center' : '';
        controllerUnitClass += this.props.arrange.isInverse ? ' is-inverse' : '';


    return  <span className={controllerUnitClass} onClick={this.handleClick}></span>
  }
})

// 页面主组件 App
let App = React.createClass({
  // 存储位置
  Constant: {
    centerPos: {  // 中心位置
      left: 0,
      top: 0
    },
    hPosRang: {   // 水平方向位置取值范围
      leftSet: [0, 0],
      rightSet: [0, 0],
      y: [0, 0]
    },
    vPosRang: {   //垂直方向位置取值范围
      x: [0, 0],
      topY: [0, 0]
    }
  },

  getInitialState: function(){
    return {
      imgArrangeArr: []
    }
  },

  // 组件加载后为每张图片计算其位置的范围
  componentDidMount: function(){
    // 获取舞台的大小
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,    // scrollWidht 宽度，clientWidht, offsetWidth
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

    // 获取图片卡片的大小
    let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

    // 计算中心点位置
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    };

    // 水平方向(左侧、右侧部分)区域范围
    this.Constant.hPosRang.leftSet[0] = -halfImgW;
    this.Constant.hPosRang.leftSet[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRang.rightSet[0] = halfStageW + halfImgW;
    this.Constant.hPosRang.rightSet[1] = stageW - halfImgW;
    this.Constant.hPosRang.y[0] =  - halfImgH;
    this.Constant.hPosRang.y[1] = stageH - halfImgH;

    // 顶部区域范围
    this.Constant.vPosRang.topY[0] = - halfImgH;
    this.Constant.vPosRang.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRang.x[0] = halfStageW - imgW;
    this.Constant.vPosRang.x[1] = halfStageW;

    this.rerange(Math.ceil(Math.random() * (this.state.imgArrangeArr.length - 1)));


  },

  // 正反面翻转
  inverse: function(index){
    return function(){
      let imgArrangeArr = this.state.imgArrangeArr;
      imgArrangeArr[index].isInverse = !imgArrangeArr[index].isInverse;

      this.setState({
        imgArrangeArr : imgArrangeArr
      });
    }.bind(this);
  },

  // 居中图片
  center: function(index){
    return function(){
      this.rerange(index);
    }.bind(this);
  },

  /**
   * 重新排布图片
   * @param  {number} centerIndex 中心图片索引
   */
  rerange: function(centerIndex){
    let imgArrangeArr = this.state.imgArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,

        hPosRangLeftSet = Constant.hPosRang.leftSet,
        hPosRangRightSet = Constant.hPosRang.rightSet,
        hPosRangY = Constant.hPosRang.y,

        vPosRangeX = Constant.vPosRang.x,
        vPosRangeTopY = Constant.vPosRang.topY;

    // 居中 centerIndex 的图片, 不需要旋转
    let imgsArrangeCenterArr = imgArrangeArr.splice(centerIndex, 1);
        imgsArrangeCenterArr[0] = {
          pos: centerPos,
          rotate: 0,
          isCenter: true
        };

    // 布局上方区域的图片, 需要旋转
    let imgsArrangeTopArr = [],
        topImgNumer = Math.ceil(Math.random() * 2),  // 取出0个或1个图片
        topImgSliceIndex = Math.ceil(Math.random() * (imgsArrangeCenterArr.length - topImgNumer));

    imgsArrangeTopArr = imgArrangeArr.splice(topImgSliceIndex, topImgNumer);
    imgsArrangeTopArr.forEach(function(value, index){
      imgsArrangeTopArr[index] = {
        pos: {
          left: getRangRandom(vPosRangeX[0], vPosRangeX[1]),
          top: getRangRandom(vPosRangeTopY[0], vPosRangeTopY[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      }
    })

    // 布局两侧的图片
    for (var i = 0, j = imgArrangeArr.length, k = j / 2; i < j; i++) {
      var hPosRangeLOR = null;

      if(i < k){
        hPosRangeLOR = hPosRangLeftSet;
      }else{
        hPosRangeLOR = hPosRangRightSet;
      }

      imgArrangeArr[i] = {
        pos: {
          left: getRangRandom(hPosRangeLOR[0], hPosRangeLOR[1]),
          top: getRangRandom(hPosRangY[0], hPosRangY[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      }
    }

    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
      imgArrangeArr.splice(topImgSliceIndex, 0, imgsArrangeTopArr[0]);
    }

    imgArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

    this.setState({
      imgArrangeArr: imgArrangeArr
    })
  },

  render: function(){
    let controllerUnits = [],
        imageFigures = [];

    // 遍历图片 ImgFigure
    imageDatas.forEach(function(value, index){
      if(!this.state.imgArrangeArr[index]){
        this.state.imgArrangeArr[index] = {
          pos: {
            left: '0',
            top: '0'
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        }
      }

      imageFigures.push(<ImgFigure data={value}
          ref={'imgFigure' + index}
          arrange={this.state.imgArrangeArr[index]}
          inverse={this.inverse(index)}
          center={this.center(index)} />);

      controllerUnits.push(<ControllerUnit
          ref={'controllerUnit' + index}
          arrange={this.state.imgArrangeArr[index]}
          inverse={this.inverse(index)}
          center={this.center(index)} />);
    }.bind(this));

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imageFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
})


export default App;
