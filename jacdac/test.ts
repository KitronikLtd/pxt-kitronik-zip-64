// tests go here; this will not be compiled when this package is used as an extension.
input.onButtonPressed(Button.A, function() {
    modules.gameZipScreen.setAll(0x0f0000)
})
input.onButtonPressed(Button.B, function () {
    modules.gameZipScreen.setAll(0x0000f0)
})
