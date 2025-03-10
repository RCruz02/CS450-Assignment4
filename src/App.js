import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from 'd3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[],
      selected_data:[],
      sentimentColors : { positive: "green", negative: "red", neutral: "gray" }
    };
  }
  componentDidMount(){
    this.renderChart();
  }
  componentDidUpdate(){
    this.renderChart();
    this.renderLegend();
  }
  set_data = (csv_data) => {
    this.setState({ data: csv_data });
  }
  renderChart = () => {
    const margin = { left: 50, right: 150, top: 10, bottom: 10 };
    const width = 500, height = 300;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const data = this.state.data;
  
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d["Dimension 1"]), d3.max(data, d => d["Dimension 1"])])
      .range([margin.left, innerWidth]);
  
    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d["Dimension 2"]), d3.max(data, d => d["Dimension 2"])])
      .range([margin.bottom, innerHeight]);
  
    const chartSvg = d3.select("#chart-svg");
    const chartGroup = chartSvg.append("g").attr("class", "chart-points");

    chartGroup.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d["Dimension 1"]))
      .attr("cy", d => yScale(d["Dimension 2"]))
      .attr("r", 4)
      .attr("fill", d => 
        d.PredictedSentiment === "positive" ? "green" :
        d.PredictedSentiment === "negative" ? "red" : "gray"
      );
    var brush = d3.brush().on('start brush', (e) => {
      var filtered_data = data.filter( item =>{
        return xScale(item["Dimension 1"]) >= e.selection[0][0] && xScale(item["Dimension 1"])<=e.selection[1][0] && yScale(item["Dimension 2"])>=e.selection[0][1] && yScale(item["Dimension 2"])<=e.selection[1][1]
      })
      this.setState({selected_data:filtered_data})
    });
    d3.select('svg').call(brush);
  };
  
  renderLegend = () => {
    const sentimentColors = this.state.sentimentColors;
    const chartSvg = d3.select("#chart-svg");
  
    const legendData = Object.keys(sentimentColors);
  
    const legend = chartSvg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(350, 20)");
  
    legend.selectAll("circle")
      .data(legendData)
      .join("circle")
      .attr("cx", 0)
      .attr("cy", (d, i) => i * 25)
      .attr("r", 5)
      .attr("fill", d => sentimentColors[d]);
  
    legend.selectAll("text")
      .data(legendData)
      .join("text")
      .attr("x", 10)
      .attr("y", (d, i) => i * 25 + 5)
      .attr("alignment-baseline", "middle")
      .text(d => d)
      .style("font-size", "12px")
      .style("fill", "black");
  };    
  
  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          <div className="child1 item"> 
          <h2>Projected Tweets</h2> 
          <svg id="chart-svg" width="420" height="300"></svg>
          </div>
          <div className="child2 item">
            <h2>Selected Tweets</h2> 
            <ul>
              {this.state.selected_data.length > 0 ? (
                this.state.selected_data.map((item, index) => (
                  <li key={index} style={{ color: item.PredictedSentiment === "positive" ? "green" : item.PredictedSentiment === "negative" ? "red" : "gray" }}>
                    {item.Tweets}
                  </li>
                ))
              ) : (
                <p>No tweets selected</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
