var axioms = "";
var rules = {};
var iters = 0;
var gens = [];
var line_length = 1;
var line_width = 1;
var angle = 45;
var slider;
var canvas_width = 1000;
var canvas_height = 1000;
var starting_point = [0,0];
var clicked = false;
var prev_mouse_pos = [0,0];
var showPaths = 0;
var touched = true;

var prev_system = ["","","","","",""];
function setup() {
    var my_canvas = createCanvas(canvas_width, canvas_height);
    slider = createSlider(0, 180, 45, 0.5);
    slider.parent("myslider");
    slider.changed(() => {touched = true;});
    my_canvas.parent("mycanvas");
    frameRate(30);
  }
  
  function draw() {
    updateSlider();
    clear();
    /*
      F - line
      G - another line
      L - leaf
      B - branch
      D - go forward
      + - turn clockwise
      - - turn counter
      [ - push current position and angle
      ] - pop current position and angle
      other - do nothing
    */
    if(iters != 0){
      var temp = gens[gens.length-1];
      var pos = [];
      var angs = [];
      var prev_pos = [canvas_width/2 + starting_point[0],canvas_height+starting_point[1]];
      var prev_ang = parseFloat(document.getElementById("starting-angle").value);
      var prev = 0;
      for (let i = 0; i < temp.length; i++) {
        
        const element = temp[i];
        if (element == "F" || element == "G"){
          strokeWeight(line_width);
          if(showPaths == 1){
            colorMode(HSB);
            stroke(Math.floor(255.0*i/temp.length),255,255);
          }else{
            colorMode(RGB);
            stroke(0,0,0);
          }
          line(prev_pos[0],prev_pos[1],prev_pos[0]+Math.cos(prev_ang*PI/180)*line_length,prev_pos[1]-Math.sin(prev_ang*PI/180)*line_length);
          prev_pos[0] = prev_pos[0]+Math.cos(prev_ang*PI/180)*line_length;
          prev_pos[1] = prev_pos[1]-Math.sin(prev_ang*PI/180)*line_length;
        }
        if (element == "D"){
          strokeWeight(line_width);
          if(showPaths == 1){
            colorMode(HSB);
            stroke(Math.floor(255.0*i/temp.length),255,255);
          }else{
            colorMode(RGB);
            stroke(0,0,0);
          }
          prev_pos[0] = prev_pos[0]+Math.cos(prev_ang*PI/180)*line_length;
          prev_pos[1] = prev_pos[1]-Math.sin(prev_ang*PI/180)*line_length;
        }
        if(element == "["){
          pos.push([prev_pos[0],prev_pos[1]]);
          angs.push(prev_ang);
        }
        if(element == "]"){
          if(pos.length > 0){
            prev_pos = pos.pop();
            prev_ang = angs.pop();
          }
        }
        if(element == "+"){
          prev_ang += angle;
        }
        if(element == "-"){
          prev_ang -= angle;
        }
      }
    }
  }
  function send(){
    if(document.getElementById("iterations").value != prev_system[0] ||
      document.getElementById("axiom").value != prev_system[1] ||
        document.getElementById("rule").value != prev_system[2] ||
          document.getElementById("angle").value != prev_system[3] ||
            document.getElementById("line-length").value != prev_system[4] ||
              document.getElementById("line-width").value != prev_system[5]){
                prev_system = [document.getElementById("iterations").value,document.getElementById("axiom").value,document.getElementById("rule").value,document.getElementById("angle").value,document.getElementById("line-length").value,document.getElementById("line-width").value]
                iters = parseInt(document.getElementById("iterations").value);
                axioms = document.getElementById("axiom").value;
                parseRules(document.getElementById("rule").value);

                angle = parseFloat(document.getElementById("angle").value);
                line_length = parseInt(document.getElementById("line-length").value);
                line_width = parseInt(document.getElementById("line-width").value);
                generate();
                logData();
    }
            
  }
  function parseRules(inp){ // a=ba,b=ab
    rules = {};
    var data = inp.split(",");
    data.forEach(element => {
      let temp = element.split("=");
      rules[temp[0]] = temp[1];
    });

  }
  function parseData(inp){
    var out = "";
    for (let i = 0; i < inp.length; i++) {
      const element = inp[i];
      if(rules.hasOwnProperty(element)){
        out = out + rules[element];
      }else{
        out = out + element;
      }
    }
    return out;
  }
  function generateOne(){
    gens.push(parseData(gens[gens.length-1]));
  }
  function generate(){
    gens = [axioms];
    for (let i = 0; i < iters; i++) {
      generateOne();
    }
  }
  function updateSlider(){
    if(touched){
      document.getElementById("angle").value = slider.value();
      send();
    }
  }
  function logData(){
    document.getElementById("logs").innerHTML = "";
    for (let i = 0; i < gens.length; i++) {
      const element = gens[i];
      document.getElementById("logs").innerHTML = document.getElementById("logs").innerHTML + "<b>iteration:"+(i+1)+"</b><br>"+gens[i]+"<br><br>";
    }
  }
  function touchMoved(){
    if(clicked){
      starting_point[0] += mouseX - prev_mouse_pos[0];
      starting_point[1] += mouseY - prev_mouse_pos[1];
      if(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
        prev_mouse_pos = [mouseX,mouseY];
      }
      //redraw();
    }
  }
  function mousePressed(){
    if(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
      clicked = true;
      prev_mouse_pos = [mouseX,mouseY];
    }
  }
  function mouseReleased(){
    clicked = false;
  }
  function returnBack(){
    starting_point = [0,0];
    //redraw();
  }
  function showPath(){
    showPaths ^= 1;
    //redraw();
  }
  function loadTree(){
    document.getElementById("axiom").value = "G";
    document.getElementById("rule").value = "F=FF,G=F[+G]-G";
    document.getElementById("iterations").value = "4";
    document.getElementById("angle").value = "45";
    document.getElementById("line-length").value = "20";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "90";
    touched = false;
    starting_point = [-200,-500];
    send();
  }
  function loadKochCurve90(){
    document.getElementById("axiom").value = "F";
    document.getElementById("rule").value = "F=F+F-F-F+F";
    document.getElementById("iterations").value = "3";
    document.getElementById("angle").value = "90";
    document.getElementById("line-length").value = "20";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "0";
    touched = false;
    starting_point = [-200,-500];
    send();
  }
  function loadKochCurve60(){
    document.getElementById("axiom").value = "F";
    document.getElementById("rule").value = "F=F+F--F+F";
    document.getElementById("iterations").value = "3";
    document.getElementById("angle").value = "60";
    document.getElementById("line-length").value = "20";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "0";
    touched = false;
    starting_point = [-200,-500];
    send();
  }
  function loadKochSnowflake(){
    document.getElementById("axiom").value = "F--F--F";
    document.getElementById("rule").value = "F=F+F--F+F";
    document.getElementById("iterations").value = "3";
    document.getElementById("angle").value = "60";
    document.getElementById("line-length").value = "20";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "0";
    touched = false;
    starting_point = [-200,-500];
    send();
  }
  function loadSierpinskiTriangle(){
    document.getElementById("axiom").value = "F+G+G";
    document.getElementById("rule").value = "G=GG,F=F+G-F-G+F";
    document.getElementById("iterations").value = "4";
    document.getElementById("angle").value = "120";
    document.getElementById("line-length").value = "20";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "0";
    touched = false;
    starting_point = [-200,-500];
    send();
  }
  function loadSierpinskiArrowhead(){
    document.getElementById("axiom").value = "F";
    document.getElementById("rule").value = "F=G-F-G,G=F+G+F";
    document.getElementById("iterations").value = "4";
    document.getElementById("angle").value = "60";
    document.getElementById("line-length").value = "20";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "0";
    touched = false;
    starting_point = [-200,-500];
    send();
  }
  function loadDragon(){
    document.getElementById("axiom").value = "FX";
    document.getElementById("rule").value = "X=X-YF-,Y=+FX+Y";
    document.getElementById("iterations").value = "10";
    document.getElementById("angle").value = "90";
    document.getElementById("line-length").value = "15";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "90";
    touched = false;
    starting_point = [-200,-500];
    send();
  }
  function loadHilbert(){
    document.getElementById("axiom").value = "A";
    document.getElementById("rule").value = "A=+BF-AFA-FB+,B=-AF+BFB+FA-";
    document.getElementById("iterations").value = "5";
    document.getElementById("angle").value = "90";
    document.getElementById("line-length").value = "15";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "90";
    touched = false;
    starting_point = [200,-300];
    send();
  }
  function loadGosper(){
    document.getElementById("axiom").value = "F";
    document.getElementById("rule").value = "F=F-G--G+F++FF+G-,G=+F-GG--G-F++F+G";
    document.getElementById("iterations").value = "3";
    document.getElementById("angle").value = "60";
    document.getElementById("line-length").value = "15";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "90";
    touched = false;
    starting_point = [-200,-500];
    send();
  }
  function loadSierpinski(){
    document.getElementById("axiom").value = "G++F-FF-F++G++F-FF-F++G++F-FF-F++G++F-FF-F++";
    document.getElementById("rule").value = "G=--F-FF-F++G++F-FF-F++G++F-FF-F++G++F-FF-F--,F=FF";
    document.getElementById("iterations").value = "3";
    document.getElementById("angle").value = "45";
    document.getElementById("line-length").value = "5";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "90";
    touched = false;
    starting_point = [0,-300];
    send();
  }
  function loadPenrose(){
    document.getElementById("axiom").value = "F++F++F++F++F";
    document.getElementById("rule").value = "F=F++F++F+++++F-F++F";
    document.getElementById("iterations").value = "3";
    document.getElementById("angle").value = "36";
    document.getElementById("line-length").value = "15";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "90";
    touched = false;
    starting_point = [200,-300];
    send();
  }
  function loadError(){
    document.getElementById("axiom").value = "F+F+F+F";
    document.getElementById("rule").value = "F=FF+F++F+F";
    document.getElementById("iterations").value = "3";
    document.getElementById("angle").value = "90";
    document.getElementById("line-length").value = "15";
    document.getElementById("line-width").value = "4";
    document.getElementById("starting-angle").value = "90";
    touched = false;
    starting_point = [200,-300];
    send();
  }