# Babysitter Kata

This kata is designed to implement standard coding practices. It is a test driven project. It largely uses OOP, which a few helper functions. It is based on React to speed up input and output from user

## Desired Result

Kata will feature a babysitter, you.  
Babysitter can only work from 5pm to 4am.  
Babysitter can only work for one family per evening.  
Three families are available, A/B/C.  
Each family has different shift times and shift pay.  
Calculate pay for babysitting shift with no fractional hours

## Normative Assessment of "No Fractional Hours"

Due to the requirement of the pay being based off "no fractional hours," I chose to calculate the total duration and round to the nearest full hour, adding these "missing" minutes to the shift duration that was originally closest to a full hour. This could also be adjusted in the future to add to the highest pay (for babysitter) or lowest pay (for family).

## Installation

Standard npm project:  
```
$ npm install
```

## Available Scripts

There are two main scripts: dev-server and test

### dev-Server

```
$ npm run dev-server  
```
Allows user to view their calculator on localhost:8080  
This is a development server and not "production" ready.

### test

```
$ npm run test
```

Runs the test suite located in src/tests/  
Can be run to watch tests live and continuously.  
```
$ npm run test -- --watch
```

(Must be run with both sets of double dashes)  
## Additional script

```$ npm run build``` and ```$ npm run serve``` allow for a "production" environment