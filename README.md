# Babysitter Kata

This kata is designed to implement standard coding practices. It is a test driven project. which a few helper functions.
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

There is no need for an npm based script. To run the script, type
```
node client.js [options]
```

### Options

```--family, -f A/B/C```     Must be A B or C  
```--start, -s "17:00"```     Can be either signed time (am/pm) or military in double quotes  
```--end, -e "10:00pm"```       Can be either signed time (am/pm) or military in double quotes

## Tests

Tests can be found in ./test.js and can be run with
```
npm run test
```