//Test file for the pxt-kitronik-zip-64 package
//Sets up a :GAME ZIP64 display with 64 ZIP LEDs in an 8x8 grid at a brightness of 25
//Controls the screen lighting up with the direction buttons on the :GAME ZIP64
//Buzzer and motor activate on reaching screen edge
//Controls the displayed colour with the Fire buttons
//Shows rainbow on micro:bit button A press
let colours: number[] = []
let display: GAME_ZIP64.ZIP64Display = null
let sprite_colour = 0
let sprite_y = 0
let sprite_x = 0
let showRainbow = false
music.onEvent(MusicEvent.MelodyStarted, () => {
    GAME_ZIP64.runMotor(250)
})
GAME_ZIP64.onButtonPress(GAME_ZIP64.ZIP64ButtonPins.Fire1, GAME_ZIP64.ZIP64ButtonEvents.Click, () => {
    if (colours.indexOf(sprite_colour) - 1 < 0) {
        sprite_colour = colours[0]
    } else {
        sprite_colour = colours[colours.indexOf(sprite_colour) - 1]
    }
    doDisplay()
})
GAME_ZIP64.onButtonPress(GAME_ZIP64.ZIP64ButtonPins.Fire2, GAME_ZIP64.ZIP64ButtonEvents.Click, () => {
    if (colours.indexOf(sprite_colour) + 1 > 5) {
        sprite_colour = colours[5]
    } else {
        sprite_colour = colours[colours.indexOf(sprite_colour) + 1]
    }
    doDisplay()
})
input.onButtonPressed(Button.A, () => {
    showRainbow = true
})
function doDisplay()  {
    display.clear()
    display.setMatrixColor(sprite_x, sprite_y, sprite_colour)
    display.show()
}
GAME_ZIP64.setBuzzerPin()
sprite_x = 3
sprite_x = 3
colours = [GAME_ZIP64.colors(ZipLedColors.Red), GAME_ZIP64.colors(ZipLedColors.Yellow), GAME_ZIP64.colors(ZipLedColors.Green), GAME_ZIP64.colors(ZipLedColors.Blue), GAME_ZIP64.colors(ZipLedColors.Purple), GAME_ZIP64.colors(ZipLedColors.White)]
sprite_colour = colours[2]
showRainbow = false
display = GAME_ZIP64.createZIP64Display()
display.setBrightness(25)
display.setMatrixColor(sprite_x, sprite_y, sprite_colour)
display.show()
basic.forever(() => {
    if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Up) && sprite_y == 0) {
        music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once)
    } else if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Up) && sprite_y != 0) {
        sprite_y += -1
        doDisplay()
    }
    if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Down) && sprite_y == 7) {
        music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once)
    } else if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Down) && sprite_y != 7) {
        sprite_y += 1
        doDisplay()
    }
    if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Left) && sprite_x == 0) {
        music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once)
    } else if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Left) && sprite_x != 0) {
        sprite_x += -1
        doDisplay()
    }
    if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Right) && sprite_x == 7) {
        music.beginMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once)
    } else if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Right) && sprite_x != 7) {
        sprite_x += 1
        doDisplay()
    }
    if (showRainbow) {
        display.showRainbow(1, 360)
        for (let i = 0; i < 25; i++) {
            display.rotate(1)
            display.show()
            basic.pause(100)
        }
        showRainbow = false
    }
})
