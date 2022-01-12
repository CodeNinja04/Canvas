import React, { Component } from "react";

import axios from "axios";

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);
    this.handleBg = this.handleBg.bind(this);
    this.handleClr = this.handleClr.bind(this);
    this.handleImg = this.handleImg.bind(this);
    this.state = {
      bg: "#ecf1f5",
      clr: "red",
      image : ""
    };
  }

  isPainting = false;
  // Different stroke styles to be used for user and guest
  //userStrokeStyle = `${this.state.clr}`;
  guestStrokeStyle = "#F0C987";
  line = [];

  prevPos = { offsetX: 0, offsetY: 0 };

  onMouseDown({ nativeEvent }) {
    const { offsetX, offsetY } = nativeEvent;
    this.isPainting = true;
    this.prevPos = { offsetX, offsetY };
  }

  onMouseMove({ nativeEvent }) {
    if (this.isPainting) {
      const { offsetX, offsetY } = nativeEvent;
      const offSetData = { offsetX, offsetY };
      // Set the start and stop position of the paint event.
      const positionData = {
        start: { ...this.prevPos },
        stop: { ...offSetData },
      };
      // Add the position to the line array
      this.line = this.line.concat(positionData);
      this.paint(this.prevPos, offSetData, this.state.clr);
    }
  }
  endPaintEvent() {
    if (this.isPainting) {
      this.isPainting = false;
      this.handleImg();
    }
  }
  paint(prevPos, currPos, strokeStyle) {
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;

    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    // Move the the prevPosition of the mouse
    this.ctx.moveTo(x, y);
    // Draw a line to the current position of the mouse
    this.ctx.lineTo(offsetX, offsetY);
    // Visualize the line using the strokeStyle
    this.ctx.stroke();
    this.prevPos = { offsetX, offsetY };
  }

  async sendPaintData() {
    const body = {
      line: this.line,
    };
    // We use the native fetch API to make requests to the server
    const req = await fetch("http://127.0.0.1:8000/paint", {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
      },
    });
    const res = await req.json();
    this.line = [];
  }
  handleBg = (data) => {
    this.setState({
      bg: data.target.value,
    });
  };

  handleClr = (data) => {
    this.setState({
      clr: data.target.value,
    });
  };

  handleImg =() =>{
    const data = this.canvas.toDataURL('image/png');
    this.setState({image:data})
    // canvasimage = canvas.toDataURL('image/png');
    // data.replace('/^data:image/[^;]/', 'data:application/octet-stream')
    const w = window.open('about:blank', 'image from canvas');
    w.document.write("<img src='"+data+"' alt='from canvas'/>");
    alert(data);
  }
    
    // axios
    //   .post(`http://127.0.0.1:8000/`,{'data' : data})
    //   .then((res) => {
    //     console.log(res.data);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
    //console.log(data);
  

  componentDidMount() {
    // Here we set up the properties of the canvas element.
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = 5;
   
    
  }
  
 
  render() {
    const { selectedbg } = this.state;
    return (
      <>
        <h1 style={{ textAlign: "center" }}>CANVAS</h1>

        <h2 style={{ marginLeft: "15%" }}>
          SELECT COLOR FOR MARKER:
          <input
            type="color"
            id="marker"
            value={this.state.clr}
            onChange={this.handleClr}
          ></input>
          <span style={{ marginLeft: "15%" }}>
            SELECT COLOR FOR BACKGROUND:
            <input
              type="color"
              id="bg"
              value={this.state.bg}
              onChange={this.handleBg}
            ></input>
          </span>
        </h2>
        <div
          style={{
            borderTop: "4px solid black",
          }}
        ></div>
        <canvas
          // We use the ref attribute to get direct access to the canvas element.
          ref={(ref) => (this.canvas = ref)}
          style={{
            background: `${this.state.bg}`,

            marginLeft: "23%",
          }}
          onMouseDown={this.onMouseDown}
          onMouseLeave={this.endPaintEvent}
          onMouseUp={this.endPaintEvent}
          onMouseMove={this.onMouseMove}
        />
        <button onClick={this.handleImg}>DOWNLOAD</button>
        <img src={`data:image/png;base64,${this.state.image}`}/>
      </>
    );
  }
}
export default Canvas;
