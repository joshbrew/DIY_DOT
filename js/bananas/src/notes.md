

## Sample rates
1000/250sps = 4ms per sample.
500sps = 2ms per sample
1000sps = 1ms per sample
2000sps = .5ms per sample 

Max is 32000 but that's really high for normal laptops/phones without SAI.

e.g 9 samples (1 ble packet) = 4ms*9 = 36ms


## Bitrates
Max BLE5 is 2Mbits ideal (but probably not that high in practice)

250 * 16 * 3 * 24 = 288,000bits (288kbits/s) which is good
500sps = 576,000bits (576kbits/s) still good
1000sps = 1,152,000bits (576kbits/s) still good
2000 * 16 * 3 * 24 = 2,304,000bits (2.304mbits/s). too high

## Effective sampling rate for a set of 18 LEDs + 1 ambient reading
1000ms / (18 leds + 1 amb) = 
52.63ms for  1sps effective sampling by amount of time each LED is illuminated / ambient is read
26.16ms for  2sps
13.16ms for  4sps
6.58ms for   8sps

60fps would be 
0.88ms for (18 leds + 1 amb)
1.85ms for (9  leds + 1 amb)

30fps would be
1.85ms for (18 leds + 1 amb)
3.70ms for (9  leds + 1 amb)

20fps would be 
2.63ms for (18 leds + 1 amb)
5.26ms for (9  leds + 1 amb)





## Todos

- Need to implement Modified Beer Lambert's Law
- Need to implement sphere model
- Get Rayleigh scattering model working
- swizzle with real data

