#include <Stepper.h>

const int stepsPerRevolution = 400;

Stepper s(stepsPerRevolution, 8, 9, 10, 11);

void setup() {
  // put your setup code here, to run once:

}

void loop() {
  // put your main code here, to run repeatedly:
  s.setSpeed(60);
  s.step(6000);
}
