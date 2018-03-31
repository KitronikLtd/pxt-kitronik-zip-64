# pxt-kitronik-zip-64

Custom blocks for www.kitronik.co.uk/5626 :GAME ZIP64 for micro:bit. 
See website for example code.

## To Use
For the ZIP LED display

```blocks
// Create a variable for the 8x8 display
let display: GAME_ZIP64.ZIP64Display = null
display = GAME_ZIP64.createZIP64Display()

// set a single pixel at 3,3 to Red
display.setMatrixColor(3, 3, GAME_ZIP64.colors(ZipLedColors.Red))
display.show()

```
Use ``||setBrightness||`` to lower the brightness (it's maxed out by default).

Use ``||shift||`` or ``||rotate||`` to shift the lights around.

## For music
To use the micro:bit music functions call ``||setBuzzerPin||`` to set the output to the onboard buzzer

```blocks 
GAME_ZIP64.setBuzzerPin()
```
## Vibration Feedback
For haptic feedback use ``||runMotor||``
```blocks
GAME_ZIP64.runMotor(100)
```

## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)

## License

MIT
