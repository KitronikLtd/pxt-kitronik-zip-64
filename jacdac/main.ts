//% deprecated
namespace GAME_ZIP64 {

}

namespace modules {
    /**
     * The 8x8 LED display
     */
    //% fixedInstance whenUsed block="gamezip screen"
    export const gameZipScreen = new LedClient("gamezip screen?dev=self&num_pixels=64&num_columns=8&variant=Matrix")

    /**
     * The GameZip vibration motor
     */
    //% fixedInstance whenUsed block="gamezip vibration motor"
    export const gameZipVibrationMotor = new VibrationMotorClient("gamezip vibration motor?dev=self")

    /**
     * The GameZip buttons
     */
    //% fixedInstance whenUsed block="gamezip buttons"
    export const gameZipButtons = new GamepadClient("gamezip buttons?dev=self")
}

namespace servers {
    class GamepadServer extends jacdac.SensorServer {
        constructor() {
            super(jacdac.SRV_GAMEPAD)

            const handler = () => {
                const state = this.serializeState()
                const buttons = state[0]
                this.sendEvent(jacdac.GamepadEvent.ButtonsChanged,
                    jacdac.jdpack(jacdac.GamepadEventPack.ButtonsChanged, [buttons]))
            }

            [
                GAME_ZIP64.ZIP64ButtonPins.Left,
                GAME_ZIP64.ZIP64ButtonPins.Right,
                GAME_ZIP64.ZIP64ButtonPins.Up,
                GAME_ZIP64.ZIP64ButtonPins.Down,
                GAME_ZIP64.ZIP64ButtonPins.Fire1,
                GAME_ZIP64.ZIP64ButtonPins.Fire2,
            ].forEach(btn => {
                GAME_ZIP64.onButtonPress(btn, GAME_ZIP64.ZIP64ButtonEvents.Down, handler)
                GAME_ZIP64.onButtonPress(btn, GAME_ZIP64.ZIP64ButtonEvents.Up, handler)
            })
        }

        serializeState() {
            let buttons: jacdac.GamepadButtons = 0
            let x = 0
            let y = 0
            if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Left)) {
                buttons |= jacdac.GamepadButtons.Left
                x = -1
            }
            if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Right)) {
                buttons |= jacdac.GamepadButtons.Right
                x = 1
            }
            if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Up)) {
                buttons |= jacdac.GamepadButtons.Up
                x = 1
            }
            if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Down)) {
                buttons |= jacdac.GamepadButtons.Down
                x = -1
            }
            if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Left)) {
                buttons |= jacdac.GamepadButtons.Left
                x = -1
            }
            if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Fire1)) {
                buttons |= jacdac.GamepadButtons.A
            }
            if (GAME_ZIP64.buttonIsPressed(GAME_ZIP64.ZIP64ButtonPins.Fire2)) {
                buttons |= jacdac.GamepadButtons.B
            }
            return jacdac.jdpack(jacdac.GamepadRegPack.Direction, [buttons, x, y])
        }

        handleCustomCommand(pkt: jacdac.JDPacket) {
            this.handleRegValue(
                pkt,
                jacdac.GamepadReg.ButtonsAvailable,
                jacdac.GamepadRegPack.ButtonsAvailable,
                jacdac.GamepadButtons.Left
                | jacdac.GamepadButtons.Right
                | jacdac.GamepadButtons.Up
                | jacdac.GamepadButtons.Down
                | jacdac.GamepadButtons.A
                | jacdac.GamepadButtons.B
            )
        }
    }

    class VibrationServer extends jacdac.Server {
        private pattern: number[][]

        constructor() {
            super(jacdac.SRV_VIBRATION_MOTOR)
        }

        handlePacket(pkt: jacdac.JDPacket) {
            if (pkt.serviceCommand == jacdac.VibrationMotorCmd.Vibrate) {
                const pattern: number[][] = pkt.jdunpack(jacdac.VibrationMotorCmdPack.Vibrate)[0]
                const started = !!this.pattern
                this.pattern = pattern
                console.log(pattern)
                if (!started)
                    control.runInParallel(() => this.playPattern())
            }
        }

        playPattern() {
            while (this.pattern && this.pattern.length > 0) {
                const [duration, intensity] = this.pattern.shift()
                const ms = duration * 8
                if (intensity > 0)
                    pins.digitalWritePin(DigitalPin.P1, 1)
                basic.pause(ms)
                pins.digitalWritePin(DigitalPin.P1, 0)
            }
            pins.digitalWritePin(DigitalPin.P1, 0)
            this.pattern = undefined
        }
    }

    function start() {
        jacdac.productIdentifier = 0x34ef625e
        jacdac.deviceDescription = "Kitronik :GameZip64"
        jacdac.startSelfServers(() => {
            // p0 neopixels
            // p1 vibration motor
            // p2 buzzer
            const display = GAME_ZIP64.createZIP64Display()
            pins.analogSetPitchPin(AnalogPin.P2)
            const servers: jacdac.Server[] = [
                new jacdac.LedServer(
                    64,
                    jacdac.LedPixelLayout.RgbGrb,
                    (pixels, brightness) => {
                        display.buf = pixels
                        display.brightness = brightness
                        display.show()
                    }, {
                    variant: jacdac.LedVariant.Matrix,
                    numColumns: 8
                }
                ),
                new GamepadServer(),
                new VibrationServer()
            ]
            return servers
        })
    }
    start()
}