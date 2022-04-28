// tests go here; this will not be compiled when this package is used as an extension.
forever(() => {
    led.toggle(0, 0)
    modules.gameZipScreen.setAll(0x0f0000)
    modules.gameZipVibrationMotor.vibrate(50, 1)
    //music.playTone(400, 200)
    pause(500)
    led.toggle(1, 1)
    modules.gameZipScreen.setAll(0x000f00)
    //music.playTone(600, 200)
    pause(500)
    led.toggle(2, 2)
    modules.gameZipScreen.setAll(0x00000f)
    modules.gameZipVibrationMotor.vibrateMulti([20, 100, 0, 100])
    //music.playTone(800, 200)
    pause(500)
})

control.runInParallel(() => {
    modules.gameZipButtons.onButtonsChanged(() => {
        if (modules.gameZipButtons.isButtonDown(jacdac.GamepadButtons.A))
            led.toggle(2, 2)
    })
})