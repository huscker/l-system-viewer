// todo multiple keycodes

var axioms = "";
var rules = {};
var iters = 0;
var gens = [];
var line_length = 1;
var line_width = 1;
var angle = 45;
var slider;
var starting_point = [0, 0, 0];
var view_width = 0;
var clicked = false;
var view_mode = false;
var prev_mouse_pos = [0, 0];
var showPaths = 0;
var sensitivity = 0.5;
var cam;
var isRotationg = false;
var cam_ang1 = 0;
var cam_ang2 = 0;
var cam_pos = [0,0,100];
var cam_vel = 100;
var infinity = 100000000000;
var key_clicked = false;
var key_keyCode = 0;

var prev_system = ["", "", "", "", "", ""];
function setup() {
  document.getElementById("angle").disabled = true;
  var my_canvas = createCanvas(parseInt(document.getElementById("wrapper").clientWidth - 30), parseInt(document.getElementById("wrapper").clientWidth - 30), WEBGL);
  view_width = parseInt(document.getElementById("wrapper").clientWidth - 30);
  slider = createSlider(0, 180, 45, 0.5);
  slider.parent("myslider");
  slider2 = createSlider(0, 2, 1, 0.05);
  slider2.parent("myslider2");
  my_canvas.parent("mycanvas");
  cam = createCamera();
  cam.setPosition(cam_pos[0],cam_pos[1],cam_pos[2]);
  cam.ortho();
  cam.lookAt(0,0,0);
  setCamera(cam);
  frameRate(30);
}

function draw() {
  /*
  background(204);
//move the camera away from the plane by a sin wave
cam2 = createCamera();
cam2.setPosition(sin(frameCount*0.01)*100, 0, cos(frameCount*0.01)*100);
cam2.lookAt(0, 0, 0);
cam2.perspective(PI/3.0,1.0,0.1,500);
plane(100,100);
setCamera(cam2);*/
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
  if (iters != 0) {
    var temp = gens[gens.length - 1];
    var pos = [];
    var angs = [];
    var prev_pos = [starting_point[0], starting_point[1], starting_point[2]];
    var prev_ang = parseFloat(document.getElementById("starting-angle").value);
    var prev_ang2 = 0;
    var prev = 0;
    for (let i = 0; i < temp.length; i++) {

      const element = temp[i];
      if (element == "F" || element == "G") {
        strokeWeight(line_width);
        if (showPaths == 1) {
          colorMode(HSB);
          stroke(Math.floor(255.0 * i / temp.length), 255, 255);
        } else {
          colorMode(RGB);
          stroke(0, 0, 0);
        }
        if (view_mode) {
          beginShape(LINES);
          vertex(prev_pos[0], prev_pos[1], prev_pos[2]);
          vertex(prev_pos[0] + Math.cos(prev_ang * PI / 180) * line_length, prev_pos[1] - Math.sin(prev_ang * PI / 180) * line_length, prev_pos[2] - Math.sin(prev_ang2 * PI / 180) * line_length);
          endShape();
          //console.log(sensitivity);
        } else {
          line(prev_pos[0], prev_pos[1], prev_pos[0] + Math.cos(prev_ang * PI / 180) * line_length, prev_pos[1] - Math.sin(prev_ang * PI / 180) * line_length);
        }
        prev_pos[0] = prev_pos[0] + Math.cos(prev_ang * PI / 180) * line_length;
        prev_pos[1] = prev_pos[1] - Math.sin(prev_ang * PI / 180) * line_length;
        prev_pos[2] = prev_pos[2] - Math.sin(prev_ang2 * PI / 180) * line_length;
      }
      if (element == "D") {
        strokeWeight(line_width);
        if (showPaths == 1) {
          colorMode(HSB);
          stroke(Math.floor(255.0 * i / temp.length), 255, 255);
        } else {
          colorMode(RGB);
          stroke(0, 0, 0);
        }
        prev_pos[0] = prev_pos[0] + Math.cos(prev_ang * PI / 180) * line_length;
        prev_pos[1] = prev_pos[1] - Math.sin(prev_ang * PI / 180) * line_length;
        prev_pos[2] = prev_pos[2] - Math.sin(prev_ang2 * PI / 180) * line_length;
      }
      if (element == "[") {
        pos.push([prev_pos[0], prev_pos[1], prev_pos[2]]);
        angs.push(prev_ang);
      }
      if (element == "]") {
        if (pos.length > 0) {
          prev_pos = pos.pop();
          prev_ang = angs.pop();
        }
      }
      if (element == "+") {
        prev_ang += angle;
      }
      if (element == "-") {
        prev_ang -= angle;
      }
      if (element == ">") {
        prev_ang2 += angle;
      }
      if (element == "<") {
        prev_ang2 -= angle;
      }
    }
  }
  updateCam();
}
function send() {
  if (document.getElementById("iterations").value != prev_system[0] ||
    document.getElementById("axiom").value != prev_system[1] ||
    document.getElementById("rule").value != prev_system[2] ||
    document.getElementById("angle").value != prev_system[3] ||
    document.getElementById("line-length").value != prev_system[4] ||
    document.getElementById("line-width").value != prev_system[5]) {
    prev_system = [document.getElementById("iterations").value, document.getElementById("axiom").value, document.getElementById("rule").value, document.getElementById("angle").value, document.getElementById("line-length").value, document.getElementById("line-width").value]
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
function parseRules(inp) { // a=ba,b=ab
  rules = {};
  var data = inp.split(",");
  data.forEach(element => {
    let temp = element.split("=");
    rules[temp[0]] = temp[1];
  });

}
function parseData(inp) {
  var out = "";
  for (let i = 0; i < inp.length; i++) {
    const element = inp[i];
    if (rules.hasOwnProperty(element)) {
      out = out + rules[element];
    } else {
      out = out + element;
    }
  }
  return out;
}
function generateOne() {
  gens.push(parseData(gens[gens.length - 1]));
}
function generate() {
  gens = [axioms];
  for (let i = 0; i < iters; i++) {
    generateOne();
  }
}
function updateSlider() {
  document.getElementById("angle").value = slider.value();
  document.getElementById("sensetivity").innerHTML = slider2.value();
  sensitivity = slider2.value();
  send();
}
function updateCam(){
  if(isRotationg){
    cam.setPosition(sin(frameCount*0.01)*100, 0, cos(frameCount*0.01)*100);
    cam.lookAt(0,0,0);
  }
  else{
    if(key_clicked){
      if(key_keyCode == 65){ // a
        cam_pos[0] += sin(cam_ang1+PI/2)*cam_vel/deltaTime;
        //cam_pos[1] += sin(cam_ang2)*cam_vel;
        cam_pos[2] += cos(cam_ang1+PI/2)*cam_vel/deltaTime;
    }
    if(key_keyCode == 87){ //w
        cam_pos[0] += sin(cam_ang1)*cam_vel/deltaTime;
        cam_pos[1] += sin(cam_ang2)*cam_vel/deltaTime;
        cam_pos[2] += cos(cam_ang1)*cam_vel/deltaTime;
    }
    if(key_keyCode == 83){ // s
      cam_pos[0] -= sin(cam_ang1)*cam_vel/deltaTime;
        cam_pos[1] -= sin(cam_ang2)*cam_vel/deltaTime;
        cam_pos[2] -= cos(cam_ang1)*cam_vel/deltaTime;
    }
    if(key_keyCode == 68){ // d
      cam_pos[0] += sin(cam_ang1-PI/2)*cam_vel/deltaTime;
        //cam_pos[1] += sin(cam_ang2)*cam_vel;
        cam_pos[2] += cos(cam_ang1-PI/2)*cam_vel/deltaTime;
    }
    if(key_keyCode == 17){ // ctrl
        cam_pos[1] += sin(min(cam_ang2+PI/2,PI/2))*cam_vel/deltaTime;
    }
    if(key_keyCode == 16){ // shift
        cam_pos[1] += sin(max(cam_ang2-PI/2,-PI/2))*cam_vel/deltaTime;
    }
    cam.setPosition(cam_pos[0],cam_pos[1],cam_pos[2]);
    }
  }
  
}
function changeViewMode() {
  view_mode ^= 1;
  if (view_mode) {
    document.getElementById("changeView").value = "Перейти в 2d режим";
    document.getElementById("sensetivity_thing").style.display = "block";
    cam.perspective(PI/2,1,0.1,6000);
  } else {
    document.getElementById("changeView").value = "Перейти в 3d режим";
    document.getElementById("sensetivity_thing").style.display = "none";
    cam.ortho();
  }
}
function logData() {
  document.getElementById("logs").innerHTML = "";
  for (let i = 0; i < gens.length; i++) {
    const element = gens[i];
    document.getElementById("logs").innerHTML = document.getElementById("logs").innerHTML + "<b>iteration:" + (i + 1) + "</b><br>" + gens[i] + "<br><br>";
  }
}
function touchMoved() {
  if (clicked && !view_mode) {
    starting_point[0] += parseInt((mouseX - prev_mouse_pos[0]));
    starting_point[1] += parseInt((mouseY - prev_mouse_pos[1]));
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      prev_mouse_pos = [mouseX, mouseY];
    }
    //redraw();
  }else if(clicked && view_mode){
    console.log("asdasdasasd");
    //cam.pan(movedX*sensitivity);
    cam.lookAt(sin(cam_ang1)*infinity,sin(cam_ang2)*infinity*2,cos(cam_ang1)*infinity);
    cam_ang1 -= (mouseX-prev_mouse_pos[0])*sensitivity/deltaTime;
    cam_ang2 += (mouseY-prev_mouse_pos[1])*sensitivity/deltaTime;
    cam_ang2 = max(min(cam_ang2,PI/2),-PI/2);
    prev_mouse_pos = [mouseX, mouseY];
  }
}
function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    clicked = true;
    prev_mouse_pos = [mouseX, mouseY];
  }
}
function mouseReleased() {
  clicked = false;
}
function keyPressed(){
  key_clicked = true;
  key_keyCode = keyCode;
}
function keyReleased(){
  key_clicked = false;
}
function showPath() {
  showPaths ^= 1;
  //redraw();
}
function loadTree() {
  document.getElementById("axiom").value = "G";
  document.getElementById("rule").value = "F=FF,G=F[+G]-G";
  document.getElementById("iterations").value = "4";
  document.getElementById("angle").value = "45";
  document.getElementById("myslider").firstChild.value = "45"
  document.getElementById("line-length").value = "20";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "90";

  starting_point = [0, -500, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadKochCurve90() {
  document.getElementById("axiom").value = "F";
  document.getElementById("rule").value = "F=F+F-F-F+F";
  document.getElementById("iterations").value = "3";
  document.getElementById("angle").value = "90";
  document.getElementById("myslider").firstChild.value = "90"
  document.getElementById("line-length").value = "20";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "0";

  starting_point = [0, -500, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadKochCurve60() {
  document.getElementById("axiom").value = "F";
  document.getElementById("rule").value = "F=F+F--F+F";
  document.getElementById("iterations").value = "3";
  document.getElementById("angle").value = "60";
  document.getElementById("myslider").firstChild.value = "60";
  document.getElementById("line-length").value = "20";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "0";

  starting_point = [0, -500, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadKochSnowflake() {
  document.getElementById("axiom").value = "F--F--F";
  document.getElementById("rule").value = "F=F+F--F+F";
  document.getElementById("iterations").value = "3";
  document.getElementById("angle").value = "60";
  document.getElementById("myslider").firstChild.value = "60";
  document.getElementById("line-length").value = "20";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "0";

  starting_point = [0, -500, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadSierpinskiTriangle() {
  document.getElementById("axiom").value = "F+G+G";
  document.getElementById("rule").value = "G=GG,F=F+G-F-G+F";
  document.getElementById("iterations").value = "4";
  document.getElementById("angle").value = "120";
  document.getElementById("myslider").firstChild.value = "120";
  document.getElementById("line-length").value = "20";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "0";

  starting_point = [0, -500, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadSierpinskiArrowhead() {
  document.getElementById("axiom").value = "F";
  document.getElementById("rule").value = "F=G-F-G,G=F+G+F";
  document.getElementById("iterations").value = "4";
  document.getElementById("angle").value = "60";
  document.getElementById("myslider").firstChild.value = "60";
  document.getElementById("line-length").value = "20";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "0";

  starting_point = [0, -500, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadDragon() {
  document.getElementById("axiom").value = "FX";
  document.getElementById("rule").value = "X=X-YF-,Y=+FX+Y";
  document.getElementById("iterations").value = "10";
  document.getElementById("angle").value = "90";
  document.getElementById("myslider").firstChild.value = "90";
  document.getElementById("line-length").value = "15";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "90";

  starting_point = [0, -500, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadHilbert() {
  document.getElementById("axiom").value = "A";
  document.getElementById("rule").value = "A=+BF-AFA-FB+,B=-AF+BFB+FA-";
  document.getElementById("iterations").value = "5";
  document.getElementById("angle").value = "90";
  document.getElementById("myslider").firstChild.value = "90";
  document.getElementById("line-length").value = "15";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "90";

  starting_point = [0, -300, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadGosper() {
  document.getElementById("axiom").value = "F";
  document.getElementById("rule").value = "F=F-G--G+F++FF+G-,G=+F-GG--G-F++F+G";
  document.getElementById("iterations").value = "3";
  document.getElementById("angle").value = "60";
  document.getElementById("myslider").firstChild.value = "60";
  document.getElementById("line-length").value = "15";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "90";

  starting_point = [0, -500, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadSierpinski() {
  document.getElementById("axiom").value = "G++F-FF-F++G++F-FF-F++G++F-FF-F++G++F-FF-F++";
  document.getElementById("rule").value = "G=--F-FF-F++G++F-FF-F++G++F-FF-F++G++F-FF-F--,F=FF";
  document.getElementById("iterations").value = "3";
  document.getElementById("angle").value = "45";
  document.getElementById("myslider").firstChild.value = "45";
  document.getElementById("line-length").value = "5";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "90";

  starting_point = [0, -300, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadPenrose() {
  document.getElementById("axiom").value = "F++F++F++F++F";
  document.getElementById("rule").value = "F=F++F++F+++++F-F++F";
  document.getElementById("iterations").value = "3";
  document.getElementById("angle").value = "36";
  document.getElementById("myslider").firstChild.value = "36";
  document.getElementById("line-length").value = "15";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "90";

  starting_point = [0, -300, 0];
  starting_point[1] += view_width / 2;
  send();
}
function loadError() {
  document.getElementById("axiom").value = "F+F+F+F";
  document.getElementById("rule").value = "F=FF+F++F+F";
  document.getElementById("iterations").value = "3";
  document.getElementById("angle").value = "90";
  document.getElementById("myslider").firstChild.value = "90";
  document.getElementById("line-length").value = "15";
  document.getElementById("line-width").value = "4";
  document.getElementById("starting-angle").value = "90";

  starting_point = [0, -300, 0];
  starting_point[1] += view_width / 2;
  send();
}