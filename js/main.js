/* 2017
 * Tommy Dang (on the Scagnostics project, as Assistant professor, iDVL@TTU)
 *
 * THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED
 * WARRANTY.  IN PARTICULAR, THE AUTHORS MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND CONCERNING THE MERCHANTABILITY
 * OF THIS SOFTWARE OR ITS FITNESS FOR ANY PARTICULAR PURPOSE.
 */

var width = document.body.clientWidth,
    size,
    padding = 0;//size/20;

var x = d3.scale.linear();
var y = d3.scale.linear();

var domainByTrait= ["0.0", "1.0"];
x.domain(domainByTrait);
y.domain(domainByTrait);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(3);
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(3);
var color = d3.scale.category10();

//******************************

var colorRedBlue = d3.scale.linear()
   .domain([0, 0.1, 0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1])
    .range(["#9dbee6","#afcae6","#c8dce6","#e6e6e6","#e6e6d8","#e6d49c","#e6b061","#e6852f","#e6531a","#e61e1a"]);
    //.domain([0, 0.1, 0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1])
    //.range(["#9dbee6","#9dbee6","#afcae6","#c8dce6","#e6e6e6","#e6e6d8","#e6d49c","#e6b061","#e6852f","#e6531a"]);

var leaderList;
var traits;    
var data, dataS;    
var svg;

//var file = "data/Breast";
//var file = "data/Sonar";   // 2
//var file = "data/NRC";      // Default selection. This is also the data for Figure 6 in the paper
//var file = "data/Subway3";    // Good
//var file = "data2/Communities";     // 9
//var file = "data2/MLB2008";     // 8
//var file = "data2/Madelon";     // 2
//var file = "data2/Usmoney";    //1

//var file = "data2/USEmployment";
//var file = "data3/Nonfarm";
//var file = "data3/Construction";
//var file = "data3/Transportation";
//var file = "data3/Leisure";
//var file = "data3/Government";

var file = "data/NRC";

svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", 1800);

  svg.append("rect")
    .attr("class", "background")
    .style("fill", "#fff")
    .attr("x", -10)
    .attr("y", -10)
    .attr("width", width+30)
    .attr("height", 1500);
//var file = "data2/Arcene200";  // too large
//var file = "data2/2016";  // Sample data of 3 variables for Figure 5 in the paper

// START: loader spinner settings ****************************
    var opts = {
      lines: 25, // The number of lines to draw
      length: 35, // The length of each line
      width: 8, // The line thickness
      radius: 35, // The radius of the inner circle
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 2, // Rounds per second
      trail: 50, // Afterglow percentage
      className: 'spinner', // The CSS class to assign to the spinner
    };
    var target = document.getElementById('loadingSpinner');
    var spinner = new Spinner(opts).spin(target);
    // END: loader spinner settings ****************************

d3.tsv(file+"Standardized.csv", function(error, data_) {
  if (error) throw error;

  data = data_;
  traits = d3.keys(data[0]).filter(function(d) { return d !== ""; });
  var n = traits.length;

  var brush = d3.svg.brush()
    .x(x)
    .y(y)
    .on("brushstart", brushstart)
    .on("brush", brushmove)
    .on("brushend", brushend);

  
      
  svg.append("text")
    .attr("class", "textNotification")
    .attr("x", padding)
    .attr("y", 0)
    .text("Finished reading data points");
    svg.call(tip);       

  // Reading Scagnostics data ***********************************************************
  d3.tsv(file+"Output2.csv", function(error, data2) {
    dataS = data2;

    var standard = gaussian(0.5, 0.2);

    function gaussian(mean, stdev) {
        var y2;
        var use_last = false;
        return function() {
            var y1;
            if(use_last) {
               y1 = y2;
               use_last = false;
            }
            else {
                var x1, x2, w;
                do {
                     x1 = 2.0 * Math.random() - 1.0;
                     x2 = 2.0 * Math.random() - 1.0;
                     w  = x1 * x1 + x2 * x2;               
                } while( w >= 1.0);
                w = Math.sqrt((-2.0 * Math.log(w))/w);
                y1 = x1 * w;
                y2 = x2 * w;
                use_last = true;
           }

           var retval = mean + stdev * y1;
           if(retval > 0) 
               return retval;
           return -retval;
       }
    }
    
      
  // drawScagHistogram(0, 200,200, size-50,size-120);
  // drawScagHistogram(1, 200,600, size-50,size-120);
  // drawScagHistogram(2, 600,600, size-50,size-120);
  // drawScagHistogram(getIndex(2,29), 200,200, size-50,size-120);
  // drawScagHistogram(getIndex(2,11), 200,600, size-50,size-120);
  // drawScagHistogram(getIndex(11,29), 600,200, size*4,size*4);

  // drawScagHistogram(getIndex(2,29), 600,200, 200,200);
  
  drawColorLegend();

   svg.select(".textNotification")
    .text("Computing leaders");    

    leaderList = leaderAlgorithm(traits, disSim); // Update the similarity function here


    for (i = 0; i < leaderList.length; i++) {
      var sum = 0;
      for (j = 0; j < leaderList.length; j++) {
        if (j==i) continue;
        var index1 = getIndex(i,j);
        sum += +dataS[index1]["Monotonic"];  
      } 
      leaderList[i].sumM = sum; 
    }  
    leaderList.sort(function(a,b){
     if (a.sumM>b.sumM)
        return -1;
      else
        return 1;
    })    
    
  
    debugger;

    // Swap variable for examples in the paper in video
    //var obj = leaderList
    //var tmp = leaderList[4];
    //leaderList[4] = leaderList[9];
    //leaderList[9] =tmp;

    /*var obj = leaderList
    var tmp = leaderList[14];
    leaderList[14] = leaderList[8];
    leaderList[8] =tmp;*/
    
    for (i = 0; i < leaderList.length; i++) {
      leaderList[i].children.sort(function(a,b){
        var mi = leaderList[i].mi;
        var index1 = getIndex(mi,a);
        var index2 = getIndex(mi,b);
        if (dataS[index1]["Monotonic"]>dataS[index2]["Monotonic"])
          return -1;
        else
          return 1;
      })
    }
    size = 1000/leaderList.length;
    x.range([size*0.9 , size*0.1]);
    y.range([size*0.1 , size*0.9  ])
      

    var pairList = cross();

    splomMain(svg, pairList, leaderList);

//    drawStatemap(id=statesvg, leaderList);//Draw US Map
// findMostDifferent();
    svg.select(".textNotification")
    .text("");  
    function cross() {
      var c = [], n = leaderList.length, i, j;
      for (i = 0; i < n; i++) 
        for (j = i+1; j < n; j++) {
          var miLeader = leaderList[i].mi;
          var mjLeader = leaderList[j].mi;
          c.push({x: traits[miLeader], i: i, y: traits[mjLeader], j: j,
           mi: miLeader, mj: mjLeader, leaderi: leaderList[i], leaderj: leaderList[j]});
        }
      return c;
    }

    function disSimMonotonic(mi, mj){
      if (mi<mj){
         var k = mj*(mj-1)/2+mi; 
         return 1-dataS[k]["Monotonic"];
      }
      else if (mi>mj){
        var k = mi*(mi-1)/2+mj; 
        return 1-dataS[k]["Monotonic"];
      }
      else{
        return 0; // Monotonic==1 if same variable for x and y
      }
    }  

    function disSim(mi, mj){
      var dif=0;
      for (var i=0; i<n; i++){
        if (i==mi || i==mj) continue;
        var indexI = getIndex(i,mi);
        var indexJ = getIndex(i,mj);
        
        dif += Math.abs(dataS[indexI]["Outlying"]-dataS[indexJ]["Outlying"]);
        dif += Math.abs(dataS[indexI]["Skewed"]-dataS[indexJ]["Skewed"]);
        dif += Math.abs(dataS[indexI]["Clumpy"]-dataS[indexJ]["Clumpy"]);
        dif += Math.abs(dataS[indexI]["Sparse"]-dataS[indexJ]["Sparse"]);
        dif += Math.abs(dataS[indexI]["Striated"]-dataS[indexJ]["Striated"]);
        dif += Math.abs(dataS[indexI]["Convex"]-dataS[indexJ]["Convex"]);
        dif += Math.abs(dataS[indexI]["Skinny"]-dataS[indexJ]["Skinny"]);
        dif += Math.abs(dataS[indexI]["Stringy"]-dataS[indexJ]["Stringy"]);
        dif += Math.abs(dataS[indexI]["Monotonic"]-dataS[indexJ]["Monotonic"]);       
      }
      return dif/(n-2);
    }  
    
    // Implementation of leader algorithm
    // arr: input variables
    // sim: similarity funciton
    function leaderAlgorithm(arr, disSim){
      var r = 0.1;
      if (file== "data3/Nonfarm")
          r =0.42;
      else  if (file== "data3/Construction")
          r =.6;
      else  if (file== "data3/Transportation")
          r =0.52;
      else  if (file== "data3/Leisure")
          r =0.4;
      else  if (file== "data3/Government")
          r =0.447;


      var leaderList = [];
      for (var i=0; i< arr.length; i++){
        var minDis = 10000;
        var minIndex = -1;
        // Finding the leader
        for (var l=0; l< leaderList.length; l++){
          var dis = disSim(i,leaderList[l].mi);
          if (dis<minDis){
            minDis=dis;
            minIndex = l;
          }
        }  
        // Checking 
        if (minIndex>=0 && minDis<r){   // If found a leader (with minDis)
          var oldLeader = leaderList[minIndex];
          oldLeader.children.push(i);
        }
        else{
          var newLeader = {};
          newLeader.mi = i;
          newLeader.children = []; 
          leaderList.push(newLeader);
        }  
      }
      // Print out the leader list
        var count = 0;
      for (var i=0;i<leaderList.length;i++){
          if (leaderList[i].children.length>0)
              count++;
      }
      console.log("number of non-singleton clusters:"+count);


      return leaderList;
    }

     // Spinner Stop ********************************************************************
        spinner.stop();

    /*
    // Color var text by states for the Use case
      svg.selectAll(".varText").style("fill", function(d){
          //return "#ccc";
        //  debugger;
          if (stateToColor[traits[d.mi].trim()]== undefined){
              return "#ccc";
          }

          return stateToColor[traits[d.mi].trim()];
      })  // this is for the use case ************************ March 20 2017
    */


  });  
});