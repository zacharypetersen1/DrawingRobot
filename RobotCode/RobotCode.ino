#include <Stepper.h>

typedef struct Vector2{
  float x, y;
} Vector2;

const int stepsPerRevolution = 400;
Stepper x(stepsPerRevolution, 8, 9, 10, 11);
Stepper y(stepsPerRevolution, 4, 5, 6, 7);

Vector2 curPos = {0, 0};

Vector2 vSubtr(Vector2 a, Vector2 b){
  return (Vector2){a.x - b.x, a.y - b.y};
}

Vector2 vNorm(Vector2 v){
  float sum = v.x + v.y;
  return (Vector2){v.x / sum, v.y / sum};
}

float vMag(Vector2 v){
  return sqrt(v.x * v.x + v.y * v.y);
}

float vDot(Vector2 a, Vector2 b){
  Vector2 aNorm = vNorm(a);
  Vector2 bNorm = vNorm(b);
  return (aNorm.x * bNorm.x) + (aNorm.y * bNorm.y);
}

void lineTo(Vector2 dest){
  Vector2 v = vSubtr(dest, curPos);
  Vector2 buf = {0, 0);
  for(int i = 0; i < vMag(v); i += 1){
    
  }
  curPos = dest;
}

void setup() {
  // put your setup code here, to run once:
  
}

void loop() {
  // put your main code here, to run repeatedly:
  x.setSpeed(60);
  x.step(6000);
}
