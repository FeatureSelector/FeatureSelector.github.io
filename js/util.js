/* 2016 
 * Tommy Dang (on the Scagnostics project, as Assistant professor, iDVL@TTU)
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */


var selectedScag = "Clumpy";
var color10 = d3.scale.category10();

 // *************************BRUSHING **********************************
 var brushCell;
// Clear the previously-active brush, if any.
function brushstart(p) {
  if (brushCell !== this) {
    d3.select(brushCell).call(brush.clear());
    x.domain(domainByTrait);
    y.domain(domainByTrait);
    brushCell = this;
  }
}

// Highlight the selected circles.
function brushmove(p) {
  var e = brush.extent();
  svg.selectAll("circle").classed("hidden", function(d) {
    return e[0][0] > d[p.x] || d[p.x] > e[1][0]
        || e[0][1] > d[p.y] || d[p.y] > e[1][1];
  });
}

// If the brush is empty, select all circles.
function brushend() {
  if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
}

function getIndex(mi, mj){
  if (mi<mj){
    return mj*(mj-1)/2+mi; 
  }
  else if (mi>mj){
    return mi*(mi-1)/2+mj; 
  }
}    

var colorArray = ["#9dbee6","#afcae6","#c8dce6","#e6e6e6","#e6e6d8","#e6d49c","#e6b061","#e6852f","#e6531a","#e61e1a"];
// Scagnostics color legend ****************
function drawColorLegend(){
    //Append a defs (for definition) element to your SVG
    var defs = svg.append("defs");
    //Append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");    
    //Horizontal gradient
    linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");    
    for (var i =0; i<colorArray.length;i++){
        var percent = i*10;
        linearGradient.append("stop") 
            .attr("offset", percent+"%")   
            .attr("stop-color", colorArray[i]); //dark blue  
    }      

    var yScagLegend = 35;
    var xScagLegend = 580;
    var wScagLegend = 160;
    //Draw the rectangle and fill with gradient
    svg.append("rect")
        .attr("x", xScagLegend+11)
        .attr("y", yScagLegend+5)
        .attr("width", wScagLegend)
        .attr("height", 26)
        .style("fill", "url(#linear-gradient)");
    
    if (file.indexOf("NRC")>=0){  
      svg.append("text")
          .attr("x", xScagLegend-130)
          .attr("y", yScagLegend-20)
          .attr("font-family", "Tahoma, Geneva, sans-serif")
          .attr("font-size", "16px")
          .style("text-anchor", "start")
          .style("fill", "#000")
          .text("Data:"); 

        svg.append("text")
          .attr("x", xScagLegend-85)
          .attr("y", yScagLegend-20)
          .attr("font-family", "Impact, Charcoal, sans-serif")
          .attr("font-size", "18px")
          .style("text-anchor", "start")
          .style("fill", "#600")
          .text("NRC university rankings in Mathematics in 2006"); 
    }

    svg.append("text")
        .attr("x", xScagLegend+wScagLegend/2+8)
        .attr("y", yScagLegend)
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("fill", "#000")
        .text("Monotonic measure"); 
    svg.append("text")
        .attr("x", xScagLegend+2)
        .attr("y", yScagLegend+22)
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .style("text-anchor", "left")
        .style("font-weight", "bold")
        .style("fill", "#000")
        .text("0");  
    svg.append("text")
        .attr("x", xScagLegend+wScagLegend+12)
        .attr("y", yScagLegend+22)
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .style("text-anchor", "left")
        .style("font-weight", "bold")
        .style("fill", "#000")
        .text("1");           
}

// Find the most different
function findMostDifferent(){
  var n = traits.length;
  var pairList = [];
  var varList = [];
  for (i = 0; i < n; i++){ 
    for (j = i+1; j < n; j++) {
      var pair1 = getIndex(i,j);
      for (k = 0; k < n; k++) {
        if (k==i || k==j) continue;
        var pair2 = getIndex(k,i);
        var pair3 = getIndex(k,j);
        if (dataS[pair1]["Monotonic"]>0.8){
          var dif = Math.abs(dataS[pair2][selectedScag]-dataS[pair3][selectedScag]);
          if (dif>0.5){
            varList.push(i);
            varList.push(j);
            varList.push(k);  

            console.log(traits[i]+" "+traits[j]+" "+traits[k]);
            pairList.push({x: traits[i], i: varList.length-3, y: traits[j], j: varList.length-2,
           mi: i, mj: j});
            pairList.push({x: traits[i], i: varList.length-3, y: traits[k], j: varList.length-1,
           mi: i, mj: k});
            pairList.push({x: traits[j], i: varList.length-2, y: traits[k], j: varList.length-1,
           mi: j, mj: k});
                     
          }
        }
      }  
    }  
  }   
  var cell = svg.selectAll(".cell")
    .data(pairList).enter()
    .append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (d.i%3 * size) + "," + ((d.j-0.8)*size) + ")"; })
      .each(plot);
  
  svg.selectAll(".varText2") 
    .data(varList).enter()
    .append("text")
      .style("font-size", "20px")
      .attr("class", "varText2")
      .attr("x", function(d,i){ return i%3 * size+25;  })
      .attr("y", function(d,i){ return (i+0.12) * size; })
      .text(function(d,i) { return traits[d]; });
}

// splom function ****************************
function splomMain(svg_, pairList, varList) {
  svg_.selectAll(".cellMain")
    .data(pairList).enter()
    .append("g")
      .attr("class", "cellMain")
      .attr("transform", function(d) { return "translate(" + (10+(d.i) * size) + "," + (50+(d.j-0.8) * size) + ")"; })
      .each(plot)
      .on('mouseover', function(d) {
        if (selectedPlot<-1){
          showTip(d); 
        }
      })
      .on('click', function(d){
        selectedPlot = getIndex(d.mi,d.mj);
        svg_.selectAll(".frame")
          .style("stroke", function(d2) { 
            return (d==d2) ? "#bb0" : "#000"; });

            // Generate the scagnostics for video 
            /*
            if (d.mi<d.mj){
               var k = d.mj*(d.mj-1)/2+d.mi; 
               drawScagHistogram(getIndex(d.mi,d.mj), 600,200, 200,200);
            }
            else if (d.mi>d.mj){
              var k = d.mi*(d.mi-1)/2+d.mj; 
              drawScagHistogram(getIndex(d.mj,d.mi), 600,200, 200,200);
            }            */
          });
  // Titles for the diagonal.
  svg_.
  selectAll(".varText")
    .data(varList).enter()
    .append("text")
      .attr("class", "varText")
      .style("font-size", "12px")
      .attr("x", function(d,i){ return i * size+13; })
      .attr("y", function(d,i){ return 50+ (i==0 ? (i) * size : (i-0.12) * size); })
      .text(function(d,i) { return traits[d.mi]; })
    //  .style("text-shadow", "1px 1px 1px #000000")
      .on('mouseover', function(d) {
        if (selectedPlot<-1)
          showTip(d);

      })
      .on('click', function(d) {
        selectedPlot = -1;
        svg_.selectAll(".varText")
          .style("fill", function(d2) { return d==d2 ? "#000" : "#000"; });
      });
      //cell.call(brush); 
}  

// Plot function *******************************
function plot(p) {
// Compute the max size of leader plots
  var maxClusterSize=0;
  for (var i=0; i< leaderList.length; i++){
    if (leaderList[i].children.length>maxClusterSize)
      maxClusterSize = leaderList[i].children.length;
  }
  var sizeScale = d3.scale.linear().range([size*0.5,size]).domain([1,maxClusterSize]);

  var size2 = size-5;
  var x2 = x;
  var y2 = y;
  var shift=1000;
  if (p.leaderi){
    size2 = sizeScale(Math.max(p.leaderi.children.length,p.leaderj.children.length));
    shift = (size-size2)/2;
    x2 = d3.scale.linear().range([shift+size2*0.1 , shift+size2*0.9])
    y2 = d3.scale.linear().range([shift+size2*0.9 , shift+size2*0.1])
  }
  else{
      x2 = d3.scale.linear().range([shift+size2*0.1 , shift+size2*0.9])
      y2 = d3.scale.linear().range([shift+size2*0.9 , shift+size2*0.1])
  }
   
  var cell = d3.select(this); 
  cell.append("rect")
      .attr("class", "frame")
      .attr("x", shift+padding / 2)
      .attr("y", shift+padding / 2)
      .attr("width", size2 - padding)
      .attr("height", size2 - padding)
      .style("fill", function(d) {
         // return "#ddd";
          if (p.mi<p.mj){
             var k = p.mj*(p.mj-1)/2+p.mi; 
             return colorRedBlue(dataS[k][selectedScag]);
          }
          else if (p.mi>p.mj){
            var k = p.mi*(p.mi-1)/2+p.mj; 
            return colorRedBlue(dataS[k][selectedScag]);
          }
          else{
            return "#fff";
          }
      })
      .style("stroke-width",0.5);

   //var num = Math.floor(data.length/10);  // Limit 20 datapoints in a scatterplto
   //data2 = data.filter(function(d,i){
   //   return i%num==0;
   //})   
  cell.selectAll("circle")
      .data(data)
    .enter().append("circle")
      .attr("cx", function(d) { return x2(d[p.x]); })
      .attr("cy", function(d) { return y2(d[p.y]); })
      .attr("r", size2/30)
      .style("stroke","#fff")
      .style("stroke-width",size2/1000)
      .style("stroke-opacity",0.5)
      .style("fill", "#000");

  // Show score on each plot    
  cell.append("text")
      .attr("class", "scoreCellText")
      .attr("x", 3)
      .attr("y", 14)
      .attr("font-family", "sans-serif")
      .attr("font-size", "12px")
      .style("text-shadow", "1px 1px 0 rgba(0, 0, 0, 0.7")
      .style("fill", "#f6f")
      .text(function(d,i) { 
        var k = -1;  
        if (p.mi<p.mj){
          k = p.mj*(p.mj-1)/2+p.mi; 
        }
        else if (p.mi>p.mj){
           k = p.mi*(p.mi-1)/2+p.mj; 
        }
        return parseFloat(dataS[k][selectedScag]).toFixed(2); 
      })
      .style("fill-opacity", function(){
        return document.getElementById("checkbox1").checked ? 1 : 0;
      });         
} // End plot functiong

function drawScagHistogram(svg, pairId, x_, y_, w, h){
  var a=[];
  for (var key in dataS[pairId]){
    var obj={};
    obj.name=key;
    obj.value=dataS[pairId][key];
    a.push(obj);
  }
  
  var x = d3.scale.ordinal().rangeRoundBands([0, w], .05);
      y = d3.scale.linear().rangeRound([h, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .innerTickSize(-w)
      .ticks(5);

  var g = svg.append("g")
    .attr("transform", "translate(" + x_+ "," + y_+ ")");

  
  x.domain(a.map(function(d) { return d.name; }));
  y.domain([0, 1]);

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-1.5em")
      .attr("dy", "-.55em")
      .style("fill", color10)
      .style("font-size", "14px")
      .attr("transform", "translate(25,0)rotate(-30)" );

  g.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  g.selectAll("bar")
      .data(a)
    .enter().append("rect")
      .style("fill", function(d){ return color10(d.name);})
      .attr("x", function(d,i) { return x(d.name); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return h - y(d.value); });
}

